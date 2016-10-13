var util = require('util'), oauth = require('oauth-client');
var EventEmitter = require('events').EventEmitter;
var parser = require("./parser.js").parser;

//REMEMBER ABOUT CLOCK TIMESTAMP

var Streamer = function(authConf, reqConf) {
  var self = this;
  var signer = oauth.createHmac(oauth.createConsumer(authConf.consumerKey, authConf.consumerSecret), oauth.createToken(authConf.tokenKey, authConf.tokenSecret));
  reqConf["oauth_signature"] = signer;
  var buffer = "";

  var socketTimeout = 1000;
  var networkTimeoutStart = 250;
  var networkTimeoutEnd = 16000;
  var httpTimeoutStart = 10000;
  var httpTimeoutEnd = 240000;

  var blockReconnection = false;
  var lastInterval = networkTimeoutStart;

  var reconnect = function(code) {
    if (blockReconnection) return false;
    blockReconnection = true;
    if (code) {
      if (lastInterval > httpTimeoutEnd) {
        lastInterval = httpTimeoutStart;
      } else {
        lastInterval *= 2;
      }
    } else {
      if (lastInterval > networkTimeoutEnd) {
        lastInterval = networkTimeoutStart;
      } else {
        lastInterval += networkTimeoutStart;
      }
    }

    setTimeout(function() {
      blockReconnection = false;
      self.stream()

    }, lastInterval);

  }

  var emitment = function(req, code, err) {
    return {
      "request":req,
      "wrongCode":code,
      "error":err
    }
  }

  var jsonHandler = function(json) {
    try {
      self.emit("tweet", JSON.parse(json));
    } catch (error) {
      console.log("Error in Streamer parser:", error);
    }
  }

  self.on("reconnect", function(opt) {
    console.log("Reconnect:", (new Date()).toUTCString());
    if (opt.error) {
      console.log("Error:", opt.error);
    }
    opt.request.abort();
    reconnect(opt.wrongCode);
  });

  self.stream = function() {
    var request = oauth.request(reqConf, function(response) {
      response.setEncoding('utf8');
      console.log("STATUS:", response.statusCode);

      if (response.statusCode !== 200) {
        self.emit("reconnect", emitment(request, true));
      }

      response.on("data", function(chunk) {
        // console.log(chunk);
        parser(chunk, buffer, jsonHandler);
      });

      response.on("end", function() {
        self.emit("reconnect", emitment(request, false));
      });

      response.on("close", function() {
        self.emit("reconnect", emitment(request, false));
      });

      response.on("error", function(err) {
        self.emit("reconnect", emitment(request, false, err));
      });

    });

    request.write(reqConf.body);
    request.end();

    request.on("error", function(err) {
      self.emit("reconnect", emitment(request, false, err));
    });

    request.on("socket", function(socket) {
      var socket = socket.socket;
      socket.setTimeout(socketTimeout);
      socket.setKeepAlive(true);
      socket.on("timeout", function() {
        self.emit("reconnect", emitment(request, false));
      });
    });
  }
}

util.inherits(Streamer, EventEmitter);

exports.Streamer = Streamer;