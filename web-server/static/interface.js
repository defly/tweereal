Activity.Interface = function() {
	var options = Activity.Bubble.prototype.options;

	var sliders = [{
		"id": "all-sliders-size",
		"value": options.baseSize * 2,
		"handler": function(x) {
			options.baseSize = x;
			options.size = Math.round(Math.sqrt(options.zoom) * x);
		},
		"transform": function(y) {
			// return Math.round(Math.sqrt(options.zoom) * y * 0.5);
			return y * 0.5;
		}
	}, {
		"id": "all-sliders-live",
		"value": options.live / 100,
		"handler": function(x) {
			options.live = x;
		},
		"transform": function(y) {
			return Math.round(y * 100);
		}
	}, {
		"id": "exact-opacity",
		"value": 100,
		"handler": function(x) {
			options.neatFillOpacity = options.baseFillOpacity * x;
			options.neatStrokeOpacity = options.baseStrokeOpacity * x;
		},
		"transform": function(y) {
			return 0.01 * Math.round(y);
		}
	}, {
		"id": "places-opacity",
		"value": 50,
		"handler": function(x) {
			options.blurFillOpacity = options.baseFillOpacity * x;
			options.blurStrokeOpacity = options.baseStrokeOpacity * x;
		},
		"transform": function(y) {
			return 0.01 * Math.round(y);
		}
	}, {
		"id": "places-precision",
		"value": 50,
		"handler": function(x) {},
		"transform": function(y) {
			// return 0.01 * Math.round(y);
		}
	}];

	for (var i = sliders.length - 1; i >= 0; i--) {
		sliders[i]["slider"] = new Activity.Interface.Slider(sliders[i]["id"], sliders[i]["value"], sliders[i]["handler"], sliders[i]["transform"]);
	};


	var switcherExact = new Activity.Interface.Switcher("exact-switcher", function() {
		Activity.Bubble.prototype.renderNeat = Activity.Bubble.prototype.renderNeatOn;
	}, function() {
		Activity.Bubble.prototype.renderNeat = function() {};
	});

	var switcherPlaces = new Activity.Interface.Switcher("places-switcher", function() {
		Activity.Bubble.prototype.renderBlur = Activity.Bubble.prototype.renderBlurOn;
	}, function() {
		Activity.Bubble.prototype.renderBlur = function() {};
	});


	$("#switch-defaults").on("click", function() {
		for (var i = sliders.length - 1; i >= 0; i--) {
			sliders[i]["slider"].toDefault();
		};
		switcherExact.on();
		switcherPlaces.on();
	});

};

Activity.Interface.Slider = function(id, value, handler, transform) {
	var self = this;
	this.defaults = value;
	this.handler = handler;
	this.transform = transform;
	this.slider = $("#" + id).slider({
		step: 0.01,
		animate: true,
		value: value,
		slide: function(event, ui) {
			self.handler(self.transform(ui.value));
		}
	});
};

Activity.Interface.Slider.prototype.toDefault = function() {
	this.slider.slider("value", this.defaults);
	this.handler(this.transform(this.defaults));
	console.log(this.transform(this.defaults));
};

Activity.Interface.Switcher = function(id, switchOn, switchOff) {
	var self = this;
	self.$el = $("#" + id);
	self.state = true;
	self.switchOn = switchOn;
	self.switchOff = switchOff;

	self.$el.on("click", function(event) {
		event.preventDefault();
		if (self.state) {
			self.off();
		} else {
			self.on();
		}
		return false;
	});

};

Activity.Interface.Switcher.prototype.on = function() {
	this.switchOn();
	this.$el.removeClass("off").addClass("on").text("on");
	this.state = true;
}

Activity.Interface.Switcher.prototype.off = function() {
	this.switchOff();
	this.$el.removeClass("on").addClass("off").text("off");
	this.state = false;
}
