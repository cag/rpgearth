module.exports = function(passport) {

var express = require('express');
var router = express.Router();

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
})

return router;

};