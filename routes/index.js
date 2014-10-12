module.exports = function(app, passport) {

var router = require('express').Router(),
    User = app.get('User');

function renderHomePage(req, res) {
    console.log('render home page');
    res.render('home', { title: 'Home' });
}

router.get('/', function(req, res) {
    if(req.user) {
        renderHomePage(req, res);
    }
    else {
        res.render('index', { title: 'rpgearth' });
    }
});

router.post('/',
    passport.authenticate('local', { failureRedirect: '/' }),
    renderHomePage);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/register', function(req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        confirm_password = req.body.confirm_password;

    if(password === confirm_password) {
        User.register(username, password, function(err, user) {
            if(err) {
                return next(err);
            } else if(!user) {
                return res.redirect('/');
            } else {
                req.login(user, function(err) {
                    if(err) { return next(err); }
                    return res.redirect('/');
                });
            }
        })
    } else {
        res.redirect('/');
    }
});

return router;

};