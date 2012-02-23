var express = require('express');
var app = express.createServer()
  , io = require('socket.io').listen(app);

app.listen(8001);

io.configure(function(){
	io.enable('browser client minification');  // send minified client
  // io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 2);                    // reduce logging
  io.set('transports', [                     // enable all transports (optional if you want flashsocket)
      'websocket'
    // , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});

var client = new (require('./lib/Client.js').Client)(8090, "127.0.0.1");
console.log("Started");
app.configure(function(){
  // app.use(express.bodyParser());
//  app.use(express.static(__dirname ));
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
  app.set('views', __dirname + '/views');
  // app.disable('view cache');
  app.set('view options', {
  	layout: false
  });
  // console.log(app.set('views'));
});

app.get('/', function (req, res) {
  res.render('index.ejs');
  // console.log("closed");
});

app.get('/pres', function (req, res) {
  res.render('pres.ejs');
  // console.log("closed");
});


io.sockets.on('connection', function(socket) {
	var id = Math.random()*1000;
	console.log("Connect:"+id, (new Date()).toUTCString());
	var handler = function(str) {
		socket.send(str);
	}
	client.on('str',handler);
	socket.on('disconnect', function() {
		console.log("disConnect:"+id, (new Date()).toUTCString());
		client.removeListener("str", handler);
	});
});
