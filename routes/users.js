// This file doesn't have a view - all it does is route the data I/O.

var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
 // /dbData is where we can see the contents of our database!
router.get('/dbData', function(req, res) {
    var db = req.db;
    var collection = db.get('testcol'); // name of the collection
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
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

/* 
 * update mongo doc with error button hits
 */

router.post('/errors', function(req, res) {
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

/* 
 * update mongo doc with isgood button hits
 */

router.post('/isgood', function(req, res) {
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

// THINGS FOR UPDATING REMOTE DOCUMENT




module.exports = router;