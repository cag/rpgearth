var bcrypt = require('bcryptjs');

module.exports = function(knex, User) {

    knex.schema.dropTableIfExists('users').then(function() {
        knex.schema.createTable('users', function(t) {
            t.increments();
            t.string('username').unique();
            t.string('password_hash');
            t.float('latitude');
            t.float('longitude');
            t.integer('latitude_bucket').index();
            t.integer('longitude_bucket').index();
            t.timestamps();
        }).then(function() {
            User.register('alan', 'bacon');
        });
    });

}