// This is all copied from the index page.

var express = require('express');
var router = express.Router();

/* GET study page. */
router.get('/', function(req, res, next) {
  res.render('study');
});


module.exports = router;