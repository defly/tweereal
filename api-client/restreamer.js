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
}

var streamer = new (require("./lib/Streamer.js").Streamer)(authConf, reqConf);
var restreamer = new (require("./lib/RestreamServer.js").RestreamServer)(8090, "127.0.0.1");

var boundingToCoordinates = function(bounding, /*maximal long*/max) {
	var deltaLat = bounding[2][1] - bounding[0][1];
	var deltaLng = bounding[2][0] - bounding[0][0];

	if ((deltaLat > max) || (deltaLng > max)) return false;

	return	[
		bounding[0][1] + deltaLat * Math.random(), bounding[0][0] + deltaLng * Math.random()
	]
}

var filter = function(tweet) {
	var coordinates;
	var code;

	if (tweet.limit !== undefined) {
		return false;
	}

	if (tweet.coordinates) {
		if ((tweet.coordinates.coordinates[0] == 0 && tweet.coordinates.coordinates[1] == 0)) return false;
		coordinates = tweet.coordinates.coordinates.reverse();
		code = 0;
	} else if (tweet.place) {
		var boundCoordinates = boundingToCoordinates(tweet.place.bounding_box.coordinates[0], 0.5);
		if (boundCoordinates !== false) {
			coordinates = boundCoordinates;
			code = 1;
		} else {
			return false;
		}
	} else {
		return false;
	}

	restreamer.write(code + " " + coordinates.join(" ") + "\r\n");
}

streamer.stream();
streamer.on("tweet", function(tweet) {
	filter(tweet);
});
