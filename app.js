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
// START THE PERFORMANCE:


  // socket.on("start_test_broadcast", function(socket){
  //   console.log("Server received START_TEST message from the remote. Broadcasting ...");
    
  //   // This is just here in case we need to send a message, it might work without:
  //   // io.emit("start_broadcast", message);
  //   io.emit("start_test_broadcast", communication);
  // });

    socket.on("start_test_broadcast", function(socket){
    // console.log("TWO Server received START_TEST message from the remote. Broadcasting ...");
    var communication = {
      'name': 'start_test',
      'status': 1
    }
    console.log('STARTING OMG');
    // This is just here in case we need to send a message, it might work without:
    // io.emit("start_broadcast", message);
    io.emit("start_test_broadcast", communication);
  });

  socket.on("testing_testing_broadcast", function(socket){
    // This is just here in case we need to send a message, it might work without:
    console.log("App.js reporting in. Server received TEST message from the remote. Broadcasting ...");
    // io.emit("start_broadcast", message);
    io.emit("testing_testing_broadcast");
  });


  // END THE PERFORMANCE:
  socket.on("end_broadcast", function(socket) {
    console.log("Server received END message from the remote. Broadcasting ...");
    io.emit("end_broadcast");
  });

  // START THE TEST:
  socket.on("start_test_broadcast", function(socket){
    // This is just here in case we need to send a message, it might work without:
    console.log("Server received START_TEST message from the remote. Broadcasting ...");
    // io.emit("start_broadcast", message);
    io.emit("start_test_broadcast");
  });

// END THE TEST:
  socket.on("end_test_broadcast", function(socket){
    // This is just here in case we need to send a message, it might work without:
    console.log("Server received END_TEST message from the remote. Broadcasting ...");
    // io.emit("start_broadcast", message);
    io.emit("end_test_broadcast");
  });

// START PERFORMANCE 1:
  socket.on("performance_1_broadcast", function(socket){
    console.log("Server received START P1 message from the remote. Broadcasting ...");
    io.emit("start_p1_broadcast");
  });

// START PERFORMANCE 2:
  socket.on("performance_2_broadcast", function(socket){
    console.log("Server received START_P2 message from the remote. Broadcasting ...");
    io.emit("start_p2_broadcast");
  });

// START PERFORMANCE 3:
  socket.on("start_p3_broadcast", function(socket){
    console.log("Server received START_P3 message from the remote. Broadcasting ...");
    io.emit("start_p3_broadcast");
  });

// MAKE UI ACTIVE AGAIN AFTER PAUSE:
  socket.on("resume_broadcast", function(socket) {
    console.log("Server received RESUME message from the remote. Broadcasting ...");
    io.emit("resume_broadcast");
  });




}); // end socket broadcasting

// listening on port 3000:
// app.listen(8080);


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
