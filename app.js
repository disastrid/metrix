var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// random words
var randomWords = require('random-words');
// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test');

// our express routes
var routes = require('./routes/index');
var users = require('./routes/users');
var study = require('./routes/study');
var remote = require('./routes/remote');



// BEGIN SOCKETS.IO
var server = require("http").Server(app);
var io = require("socket.io")(server);

var app = express();

// Set up sockets business, with a connection module. Right now it just console logs when a user connects.

io.on("connection", function (socket) {
    console.log("a user has connected!");
    // var tweet = {user: "nodesource", text: "Hello, world!"};

    // to make things interesting, have it send every second
    // var interval = setInterval(function () {
    //     socket.emit("tweet", tweet);
    // }, 1000);

    socket.on("disconnect", function () {
        clearInterval(interval);
    });
});

// Now, we set up messages for the Start, Pause, Resume and Stop actions from the remote control page.

io.on("start", function(data){
  // This is just here in case we need to send a message, it might work without:
  // var message = {message: 1};
  // io.emit("start_broadcast", message);
  io.emit("start_broadcast");
});

io.on("pause", function(data){
  var message = {message: 1};
  io.emit("pause_broadcast", message);
});

io.on("resume", function(data) {
  var message = {message: 1};
  io.emit("resume_broadcast", message);
});

io.on("stop", function(data) {
  var message = {message: 1};
  io.emit("stop_broadcast", message);
});

// listening on port 3000:
app.listen(8080);


// END SOCKETS.IO

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/study', study);
app.use('/remote', remote);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
