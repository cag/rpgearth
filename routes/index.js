var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

var pg = require('pg');

router.get('/dbtest', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            console.error(err);
            response.send(err);
        } else {
            client.query('SELECT * FROM test_table', function(err, result) {
            done();
            if (err)
            { console.error(err); response.send(err); }
            else
            { response.send(result.rows); }
            });
        }
    });
})

module.exports = router;
