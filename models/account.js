var bcrypt = require('bcryptjs');

module.exports = function(bookshelf) {

    var Account = bookshelf.Model.extend({
        tableName: 'accounts',
        validatePassword: function(password, callback) {
            // console.log("calling bcrypt compare with " + password + " and " + this.get('password_hash'));
            bcrypt.compare(password, this.get('password_hash'), callback);
        }
    });

    return Account;

};