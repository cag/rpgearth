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

var GEOLOCATION_DEGREE_BUCKET_DILATION = 11100;//111; // Works out to about 1 sq km near the equator

io.on('connection', function(socket) {
    var hs = socket.handshake;
    console.log('handshake: ' + JSON.stringify(hs));

    sessionFromCookie(hs.headers.cookie, function(err, s) {
        session = new Session(hs, s);

        new User({ id: session.passport.user }).fetch().then(function(user) {
            if(user) {
                var username = user.get('username'),
                    last_latitude = user.get('latitude'),
                    last_longitude = user.get('longitude'),
                    last_latitude_bucket = user.get('latitude_bucket'),
                    last_longitude_bucket = user.get('longitude_bucket'),
                    latitude = last_latitude,
                    longitude = last_longitude,
                    latitude_bucket = last_latitude_bucket,
                    longitude_bucket = last_longitude_bucket;

                function fixLatitudeBucket(v) { return v % (180 * GEOLOCATION_DEGREE_BUCKET_DILATION); }
                function fixLongitudeBucket(v) { return v % (360 * GEOLOCATION_DEGREE_BUCKET_DILATION); }
                
                function forEachBucketInVicinity(lat_b, long_b, callback) {
                    if(lat_b !== null && long_b !== null)
                        for(var i = -1; i < 2; i++) {
                            for(var j = -1; j < 2; j++) {
                                var lat_i = lat_b + i,
                                    long_j = long_b + j,
                                    bucket = fixLatitudeBucket(lat_i) + ',' + fixLongitudeBucket(long_j);
                                callback(bucket, lat_i, long_j);
                            }
                        }
                    else
                        callback(lat_b + ',' + long_b, lat_b, long_b);
                }

                function emitGeolocationBuckets(ev, obj) {
                    forEachBucketInVicinity(latitude_bucket, longitude_bucket, function(bucket) {
                        io.to(bucket).emit(ev, obj);
                    });
                }

                function joinGeolocationBuckets() {
                    console.log('joining at ' + latitude_bucket + ',' + longitude_bucket +
                        '(' + latitude + ',' + longitude + ')');
                    forEachBucketInVicinity(latitude_bucket, longitude_bucket, function(bucket) {
                        socket.join(bucket);
                    });
                }

                function shiftGeolocationBuckets() {
                    console.log('shifting from ' + last_latitude_bucket + ',' + last_longitude_bucket);
                    forEachBucketInVicinity(last_latitude_bucket, last_longitude_bucket, function(bucket, lat_i, long_j) {
                        if(Math.abs(latitude_bucket - lat_i) > 1 || Math.abs(longitude_bucket - long_j) > 1) {
                            console.log('leaving ' + bucket);
                            io.to(bucket).emit('leave room', username);
                            socket.leave(bucket);
                        }
                    });
                    forEachBucketInVicinity(latitude_bucket, longitude_bucket, function(bucket) {
                        if(Math.abs(lat_i - last_latitude_bucket) > 1 || Math.abs(long_j - last_longitude_bucket) > 1) {
                            console.log('joining ' + bucket);
                            socket.join(bucket);
                            io.to(bucket).emit('join room', username);
                        }
                    });
                    last_latitude_bucket = latitude_bucket;
                    last_longitude_bucket = longitude_bucket;                    
                }

                joinGeolocationBuckets();
                emitGeolocationBuckets('join room', username);

                console.log(username + ' connected');

                socket.on('disconnect', function() {
                    console.log(username + ' disconnected');
                    emitGeolocationBuckets('join room', username);
                });
                socket.on('chat message', function(msg_body) {
                    console.log(username + ': ' + msg_body);
                    emitGeolocationBuckets('chat message', { username: username, body: msg_body });
                });
                socket.on('geolocation', function(position) {
                    if(position && position.coords) {
                        latitude = position.coords.latitude;
                        longitude = position.coords.longitude;
                        latitude_bucket = Math.floor((latitude + 90) * GEOLOCATION_DEGREE_BUCKET_DILATION);
                        longitude_bucket = Math.floor((longitude + 180) * GEOLOCATION_DEGREE_BUCKET_DILATION);

                        if(last_latitude_bucket !== latitude_bucket || last_longitude_bucket !== longitude_bucket)
                            shiftGeolocationBuckets();

                        console.log(username +
                            ' (' + last_latitude + ',' + last_longitude +
                            ') -> (' + latitude + ',' + longitude + ')');

                        last_latitude = latitude;
                        last_longitude = longitude;

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