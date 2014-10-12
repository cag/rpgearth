module.exports = function(passport) {

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/',
                                     failureFlash: true }));

return router;

};