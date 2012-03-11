var authConf = require('./apiConf.js').authConf;
// commit2
var reqConf = {
	port:443,
	host:'stream.twitter.com',
	https:true,
	path:'/1/statuses/filter.json',
	oauth_signature:"",
	method:'POST',
	body:{
		locations:'-180,-90,180,90'
	}
};

var streamer = new (require("./lib/Streamer.js").Streamer)(authConf, reqConf);
var restreamer = new (require("./lib/RestreamServer.js").RestreamServer)(8090, "127.0.0.1");

var roundWithDepth = function(x,depthNum) {
	return Math.round(x*depthNum) / depthNum;
};

var boundingToCoordinates = function(bounding, /*maximal long*/max) {
	var deltaLat = bounding[2][1] - bounding[0][1];
	var deltaLng = bounding[2][0] - bounding[0][0];

	if ((deltaLat > max) || (deltaLng > max)) return false;

	var lat = bounding[0][1] + deltaLat * Math.random();
	var lng = bounding[0][0] + deltaLng * Math.random();
	var precision = Math.max(deltaLat, deltaLng);

	var depthNum = 100000;

	return	[
		roundWithDepth(lat,depthNum), roundWithDepth(lng, depthNum), roundWithDepth(precision, depthNum) //accuracy
	];
};

var protocolCodes = {
	"exact": 0, //tweete with exact coordinates
	"bounding": 1, //with bounding box locations
	"limit": 2 //
};

// var analyze = require('Sentimental').analyze;

var filter = function(tweet) {
	var coordinates;
	var code;

	if (tweet.limit !== undefined) {
		return false;
	}
	// console.log(analyze(tweet.text).score,tweet.text); //sentiment
	if (tweet.coordinates) {
		if ((tweet.coordinates.coordinates[0] === 0 && tweet.coordinates.coordinates[1] === 0)) {
			return false;
		}
		coordinates = tweet.coordinates.coordinates.reverse();
		code = protocolCodes["exact"];
	} else if (tweet.place) {
		var boundCoordinates = boundingToCoordinates(tweet.place.bounding_box.coordinates[0], 2);
		if (boundCoordinates !== false) {
			coordinates = boundCoordinates;
			code = protocolCodes["bounding"];
		} else {
			return false;
		}
	} else if (tweet.limit) {
		console.log(tweet);
		code = protocolCodes["limit"];
		restreamer.write(code + " " + tweet.limit.track + "\r\n");
		return false;
	} else {
		console.log("else",tweet);
		return false;
	}

	restreamer.write(code + " " + coordinates.join(" ") + "\r\n");
}

streamer.stream();
streamer.on("tweet", function(tweet) {
	filter(tweet);
});
