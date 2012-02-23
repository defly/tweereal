var Socket = require('net').Socket;
var EventEmitter = require('events').EventEmitter;
var parser = require("./parser.js").parser;
var util = require('util');

var Client = function(port, host) {
	var self = this;
	var buffer = "";
	var socket = new Socket();
	var strHandler = function(str) {
		self.emit("str", str);
	}

	self.setMaxListeners(0);

	socket.setEncoding('utf8');
	socket.connect(port, host);

	socket.on("data", function(chunk) {
		parser(chunk, buffer, strHandler);
	});

	socket.on("error", function(error) {
		console.log("Error", error);
	});

	socket.on("close", function() {
		console.log("Reconnect:", (new Date()).toUTCString());
		setTimeout(function() {
			socket.connect(port, host);
		}, 1000);
	});
}

util.inherits(Client, EventEmitter);

exports.Client = Client;
