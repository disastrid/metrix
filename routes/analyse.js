var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('analyse');
});

router.post('/analyse_addUser', function(req, res) {
    var db = req.db;
    var collection = db.get('testcol');
    collection.insert(req.body, function (error, doc) {
        if (error) {
          res.send("Could not create new user.");
        } else {
            res.send({msg:''});
            console.log('user.js responding ...');
        }
    });
});

router.post('/analyse_start', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'start_button': Date(), 'start_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.post('/analyse_end', function(req, res) {
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


router.post('/analyse_resume', function(req, res) {
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


router.post('/analyse_errors', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'error_button': Date(), 'error_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


router.post('/analyse_isGood', function(req, res) {
    console.log(req.body);
    var identifier = req.body.ident;
    var db = req.db;
    var collection = db.get('testcol');
    collection.update({'ident': identifier}, {$push: {'is_good_button': Date(), 'is_good_button_millis': Date.now()}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;