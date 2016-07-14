var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/analyse', function(req, res, next) {
  res.render('perf01');
});

module.exports = router;