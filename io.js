var cookie = require('cookie'),
    cookieParser = require('cookie-parser');

module.exports = function(http, app) {

var io = require('socket.io')(http),
    Session = require('express-session').Session,
    sessionStore = app.get('session store');
    User = app.get('User');

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

        new User({ id: session.passport.user }).fetch().then(function(user) {
            if(user) {
                var username = user.get('username')
                console.log(username + ' connected');

                socket.on('disconnect', function() {
                    console.log(username + ' disconnected');
                });
                socket.on('chat message', function(msg_body) {
                    console.log(username + ': ' + msg_body);
                    io.emit('chat message', { username: username, body: msg_body });
                });
                socket.on('geolocation', function(position) {
                    if(position && position.coords) {
                        var latitude = position.coords.latitude,
                            longitude = position.coords.longitude,
                            last_latitude = user.get('latitude'),
                            last_longitude = user.get('longitude'),
                            latitude_bucket = Math.floor((latitude + 360) * 111),
                            longitude_bucket = Math.floor((longitude + 360) * 111),
                            last_latitude_bucket = user.get('latitude_bucket'),
                            last_longitude_bucket = user.get('longitude_bucket');

                        console.log(username +
                            ' (' + last_latitude + ',' + last_longitude +
                            ') -> (' + latitude + ',' + longitude + ')' +
                            ' (' + last_latitude_bucket + ',' + last_longitude_bucket +
                            ') -> (' + latitude_bucket + ',' + longitude_bucket + ')');

                        user.set('latitude', latitude);
                        user.set('longitude', longitude);
                        user.set('latitude_bucket', latitude_bucket);
                        user.set('longitude_bucket', longitude_bucket);
                        user.save();
                    }
                });
            } else console.error("Could not find user " + session.passport.user);
        });

    });
});

};