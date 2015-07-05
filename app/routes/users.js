var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('studyData');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.post('/adduser', function(req, res) {
    var db = req.db;
    var collection = db.get('studyData'); //someData is the name of the collection!!
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;