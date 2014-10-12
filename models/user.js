var bcrypt = require('bcryptjs');

module.exports = function(bookshelf) {

    var User = bookshelf.Model.extend({
        tableName: 'users',
        
        validatePassword: function(password, callback) {
            bcrypt.compare(password, this.get('password_hash'), callback);
        }

    }, {

        register: function(username, password, callback) {
            bcrypt.hash(password, 10, function(err, hash) {
                new User({ username: username, password_hash: hash })
                    .save()
                    .then(function(user) {
                        if(callback) callback(null, user);
                    });
            });
        }

    });

    return User;

};