var bcrypt = require('bcryptjs');

module.exports = function(knex, Account) {

    knex.schema.dropTableIfExists('accounts').then(function() {
        knex.schema.createTable('accounts', function(t) {
            t.increments();
            t.string('username').unique();
            t.string('password_hash');
            t.timestamps();
        }).then(function() {
            Account.register('alan', 'bacon');
        });
    });

}