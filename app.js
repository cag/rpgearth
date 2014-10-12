var bcrypt = require('bcryptjs');

var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL
});
var bookshelf = require('bookshelf')(knex);

var Account = require('./models/account')(bookshelf);

require('./resetdb')(knex, Account);

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        new Account({ username: username }).fetch().then(function(account) {
            if (!account) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            account.validatePassword(password, function(err, res) {
                if(err) {
                    console.error(err);
                    return done(null, false, { message: err });
                }
                if(res) {
                    return done(null, account);
                }
                return done(null, false, { message: 'Incorrect password.' });
            });
        });
    }
));

passport.serializeUser(function(account, done) {
    done(null, account.get('id'));
});

passport.deserializeUser(function(id, done) {
    new Account({ id: id }).fetch().then(function(account) {
        done(null, account);
    });
});

var flash = require('connect-flash');

var routes = require('./routes/index')(passport);
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('session secret', 'keyboard cat');

app.use(session({ name: 'connect.sid', secret: app.get('session secret') }));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
