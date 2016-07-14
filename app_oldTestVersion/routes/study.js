// This is all copied from the index page.

var express = require('express');
var router = express.Router();

/* GET study page. */
router.get('/', function(req, res, next) {
  res.render('study');
});

// 11. Add the post function: 

/*
 * POST to adduser.
 This basically just says “we're going to post some data (req.body), and you're going to insert it into our ‘userlist' 
 collection in the database. If that goes well, return an empty string. If it goes poorly, return the error message that 
 the database gives us.” 
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


module.exports = router;