var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('remote');
});


router.post('/logButton', function(req, res) {
    var identifier = req.body.ident;
    var name = req.body.button_name;
    var value = Date.now();
    var query = {};
    query[name] = value;
    //collection.findOne(query, function (err, item) { ... });
    var db = req.db;
    var collection = db.get('testcol');    
    console.log("posted a button log for " + name + "!");
    collection.update({'ident': identifier}, {$push: query}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_end', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'stop_button': Date(), 'stop_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_test_start', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'test_start_button': Date(), 'test_start_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_test_end', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'test_stop_button': Date(), 'test_stop_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_pause1', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'pause_1_button': Date(), 'pause_1_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_pause2', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'pause_2_button': Date(), 'pause_2_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_pause3', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'pause_3_button': Date(), 'pause_3_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/remote_resume', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'resume_button': Date(), 'resume_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;