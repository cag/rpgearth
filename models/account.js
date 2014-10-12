var bcrypt = require('bcryptjs');

module.exports = function(bookshelf) {

    var Account = bookshelf.Model.extend({
        tableName: 'accounts',
        
        validatePassword: function(password, callback) {
            bcrypt.compare(password, this.get('password_hash'), callback);
        }

    }, {

        register: function(username, password, callback) {
            bcrypt.hash(password, 10, function(err, hash) {
                new Account({ username: username, password_hash: hash })
                    .save()
                    .then(function(account) {
                        if(callback) callback(null, account);
                    });
            });
        }

    });

    return Account;

};