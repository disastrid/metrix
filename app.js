var express = require('express');
var app = express();
var http = require('http');
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
var winston = require('winston');

// our express routes
var routes = require('./routes/index');
var users = require('./routes/users');
var study = require('./routes/study');
var remote = require('./routes/remote');





// BEGIN SOCKETS.IO
var server = http.createServer(app);
var io = require('socket.io').listen(server);


 server.listen(8080);

 console.log("server started");
 console.log("i'm alive");

// listening on port 3000:
  //app.listen(8080);
// Set up sockets business, with a connection module. Right now it just console logs when a user connects.
// io.set('origins', '*:*');



io.sockets.on("connection", function (socket) {
    console.log("aw hell no what up dawg");
    // var tweet = {user: "nodesource", text: "Hello, world!"};

    // to make things interesting, have it send every second
    // var interval = setInterval(function () {
    //     socket.emit("tweet", tweet);
    // }, 1000);

    socket.on("disconnect", function () {
        console.log("bye felicia");
    });

    // START THE TEST:
    socket.on("start_test_broadcast", function(){
      io.emit("start_test_broadcast");
    });

    socket.on("another_start_broadcast", function(){
      io.emit("another_start_broadcast");
    });

    // END THE TEST:
    socket.on("end_test_broadcast", function(){
      // This is just here in case we need to send a message, it might work without:
      console.log("Server received END_TEST message from the remote. Broadcasting ...");
      // io.emit("start_broadcast", message);
      io.emit("end_test_broadcast");
    });
  
}); // end socket broadcasting

// END SOCKETS.IO

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
