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



var app = express();

// BEGIN SOCKETS.IO
var server = app.listen(8080);
var io = require('socket.io')(server);

// Set up sockets business, with a connection module. Right now it just console logs when a user connects.
// io.set('origins', '*:*');



io.on("connection", function (socket) {
    console.log("aw hell no what up dawg");
    // var tweet = {user: "nodesource", text: "Hello, world!"};

    // to make things interesting, have it send every second
    // var interval = setInterval(function () {
    //     socket.emit("tweet", tweet);
    // }, 1000);

    socket.on("disconnect", function () {
        console.log("bye felicia");
    });


// Now, we set up messages for the Start, Pause, Resume and Stop actions from the remote control page.
// On start_broadcast, do this:
  socket.on("start_broadcast", function(socket){
    // This is just here in case we need to send a message, it might work without:
    console.log("Server received start message. Broadcasting ...");
    // io.emit("start_broadcast", message);
    io.emit("start_broadcast");
  });

// When I click the pause button, do this:
  socket.on("pause_broadcast", function(socket){
    console.log("Server received PAUSE message. Broadcasting ...");
    io.emit("pause_broadcast");
  });

// when I click the resume button, do this:
  socket.on("resume_broadcast", function(socket) {
    console.log("Server received RESUME message. Broadcasting ...");
    io.emit("resume_broadcast");
  });

// When I click the stop button, do this:
  socket.on("end_broadcast", function(socket) {
    console.log("Server received END message. Broadcasting ...");
    io.emit("end_broadcast");
  });


}); // end socket broadcasting

// listening on port 3000:
// app.listen(8080);


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
