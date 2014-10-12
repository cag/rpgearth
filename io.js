var cookie = require('cookie'),
    cookieParser = require('cookie-parser');

module.exports = function(http, app) {

var io = require('socket.io')(http),
    Session = require('express-session').Session,
    sessionStore = app.get('session store');
    Account = app.get('Account');

function sessionFromCookie(ck, callback) {
    var sessionID;
    if(ck) {
        var unsignedSessionID = cookie.parse(ck)['connect.sid'];
        sessionID = cookieParser.signedCookie(unsignedSessionID, app.get('session secret'));
        if(unsignedSessionID == sessionID) {
            return accept('Cookie is invalid.', false);
        }
    } else {
        return accept('No cookie transmitted.', false);
    }

    sessionStore.get(sessionID, callback);
}

io.set('authorization', function(data, accept) {
    sessionFromCookie(data.headers.cookie, function(err, session) {
        if(err) {
            accept(err, false);
        } else if(!session) {
            accept("Could not find session", false);
        } else {
            accept(null, true);
        }
    });
});

io.on('connection', function(socket) {
    var hs = socket.handshake;
    console.log('handshake: ' + JSON.stringify(hs));

    sessionFromCookie(hs.headers.cookie, function(err, s) {
        session = new Session(hs, s);

        new Account({ id: session.passport.user }).fetch().then(function(account) {
            if(account) {
                console.log(account.get('username') + ' connected');

                socket.on('disconnect', function() {
                    console.log(account.get('username') + ' disconnected');
                });
                socket.on('chat message', function(msg) {
                    console.log(account.get('username') + ': ' + msg);
                });
                socket.on('geolocation', function(position) {
                    console.log(account.get('username') + ' @ ' + position);
                });


            } else console.error("Could not find user " + session.passport.user);
        });

    });
});

};