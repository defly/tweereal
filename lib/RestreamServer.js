var Server = require('net').Server;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var RestreamServer = function(port, host) {
  var self = this;
  var server = new Server();

  this.write = function(str) {
    self.emit("data", str);
    console.log(str);
  }

  server.listen(port, host);

  server.on("error",function(error) {
    console.log("ERROR at restreaming server:", error);
    setTimeout(function() {
      server.close();
      server.listen(port, host);
    }, 1000);
  });

  server.on("listening",function() {
    console.log("Server started at " + host + ":" + port);
  });

  server.on("connection", function(socket) {
    console.log("Socket init", (new Date()).toUTCString());

    socket.setKeepAlive(true);
    socket.setNoDelay(true);
    socket.setTimeout(1000);

    var write = function(data) {
      socket.write(data);
    };

    socket.on("timeout", function() {
      socket.end();
    });

    socket.on("end", function() {
      console.log("Socket ended", (new Date()).toUTCString());
    });

    socket.on("error", function(error) {
      console.log("Socket error:", error);
    });

    socket.on("close", function() {
      self.removeListener("data", write);
    });

    self.on("data", write);
  });

  server.on("close", function() {
    console.log("Server closed");
  });
}

util.inherits(RestreamServer, EventEmitter);

exports.RestreamServer = RestreamServer;