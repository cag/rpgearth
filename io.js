var cookie = require('cookie'),
    cookieParser = require('cookie-parser');

module.exports = function(http, app) {

var io = require('socket.io')(http);

io.set('authorization', function(handshakeData, accept) {
    if(handshakeData.headers.cookie) {
        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
        console.log("handshake cookie: " + JSON.stringify(handshakeData.cookie));
        console.log(app.get('session secret'));
        handshakeData.sessionID = cookieParser.signedCookie(handshakeData.cookie['connect.sid'], app.get('session secret'));
        console.log("handshake sesh ID: " + handshakeData.sessionID);
        if(handshakeData.cookie['connect.sid'] == handshakeData.sessionID) {
            console.log("should think is invalid wtf");
            return accept('Cookie is invalid.', false);
        }
    } else {
        return accept('No cookie transmitted.', false);
    }
    accept(null, true);
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
    });
});

};