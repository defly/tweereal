var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var redis = require("redis");
var redisClient = redis.createClient();
var EventEmitter = require('events').EventEmitter;

var messageProxy = new EventEmitter();
messageProxy.setMaxListeners(0);

redisClient.subscribe("T");
redisClient.on("message", function(channel, message) {
  if (channel === "T") {
    messageProxy.emit("message", message);
  }
});


app.listen(8001);

io.configure(function() {
  io.enable('browser client minification'); // send minified client
  // io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip'); // gzip the file
  io.set('log level', 1); // reduce logging
  io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

// var client = new(require('./lib/Client.js').Client)(8090, "127.0.0.1");
console.log("Started");
app.configure(function() {
  app.use(express.errorHandler({
    showStack: true,
    dumpExceptions: true
  }));
  app.set('views', __dirname + '/views');
  app.disable('view cache');
  app.set('view options', {
    layout: false
  });
});

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/pres', function(req, res) {
  res.render('pres.ejs');
});

io.sockets.on('connection', function(socket) {
  var handler = function(str) {
      socket.send(str);
    };
  messageProxy.on('message', handler);

  socket.on('disconnect', function() {
    messageProxy.removeListener("message", handler);
  });

  socket.on("reconnect_failed", function() {
    messageProxy.removeListener("message", handler);
  });
});
