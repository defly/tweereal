var authConf = require('./apiConf.js').authConf;

var reqConf = {
	port: 443,
	host: 'stream.twitter.com',
	https: true,
	path: '/1/statuses/filter.json',
	oauth_signature: "",
	method: 'POST',
	body: {
		locations: '-180,-90,180,90'
	}
};

var streamer = new(require("./lib/Streamer.js").Streamer)(authConf, reqConf);
var restreamer = new(require("./lib/RestreamServer.js").RestreamServer)(8090, "127.0.0.1");

var roundWithDepth = function(x, depthNum) {
		return Math.round(x * depthNum) / depthNum;
	};

var boundingToCoordinates = function(bounding, /*maximal long*/ max) {
		var deltaLat = bounding[2][1] - bounding[0][1];
		var deltaLng = bounding[2][0] - bounding[0][0];

		if ((deltaLat > max) || (deltaLng > max)) return false;

		var lat = bounding[0][1] + deltaLat * Math.random();
		var lng = bounding[0][0] + deltaLng * Math.random();
		var precision = Math.max(deltaLat, deltaLng);

		var depthNum = 100000;

		return [
		roundWithDepth(lat, depthNum), roundWithDepth(lng, depthNum), roundWithDepth(precision, depthNum) //accuracy
		];
	};

var Quality = function() {
		var lastTrack = 0;
		var tweets = 0;
		this.getQuality = function(track) {
			var delta = track - lastTrack;
			if (delta < 0) {
				delta = track;
			}
			var quality = tweets / (tweets + delta);
			lastTrack = track;
			tweets = 0;
			return roundWithDepth(quality, 1000);
		};
		this.upTweets = function() {
			tweets++;
		};
	};

var q = new Quality();

var customFilter = function(tweet) {
		if (tweet.coordinates) {
			filters.exact(tweet);
			q.upTweets();
		} else if (tweet.place) {
			filters.notExact(tweet);
			q.upTweets();
		} else if (typeof tweet.limit !== "undefined") {
			filters.limit(tweet);
		} else {
			console.log("else", tweet);
			return false;
		}
	};

var filters = {};

filters.exact = function(tweet) {
	var coordinates = tweet.coordinates.coordinates.reverse();
	if (!(coordinates[0] === 0 && coordinates[1] === 0)) {
		restreamer.write("0 " + coordinates[0] + " " + coordinates[1] + "\r\n");
	}
};

filters.notExact = function(tweet) {
	var boundCoordinates = boundingToCoordinates(tweet.place.bounding_box.coordinates[0], 2);
	if (boundCoordinates !== false) {
		restreamer.write("1 " + boundCoordinates[0] + " " + boundCoordinates[1] + " " + boundCoordinates[2] + "\r\n");
	}
};

filters.limit = function(tweet) {
	var quality = q.getQuality(tweet.limit.track);
	restreamer.write("2 " + quality + "\r\n");
};

streamer.stream();
streamer.on("tweet", function(tweet) {
	customFilter(tweet);
});
