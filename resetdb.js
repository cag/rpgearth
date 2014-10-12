var bcrypt = require('bcryptjs');

module.exports = function(knex, Account) {

    knex.schema.dropTableIfExists('accounts').then(function() {
        knex.schema.createTable('accounts', function(t) {
            t.increments();
            t.string('username');
            t.string('password_hash');
            t.timestamps();
        }).then(function() {
            bcrypt.hash('bacon', 10, function(err, hash) {
                new Account({ username: 'alan', password_hash: hash }).save();
            });
        });
    });

}