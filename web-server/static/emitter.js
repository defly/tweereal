window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function( /* function */ callback, /* DOMElement */ element) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

Activity.dispatcher = function(msg) {
  var params = msg.split(" ");
  if (params[0] === "0") {

  }
};

Activity.Bubble = function(center, exact) {
  var color = Activity.utils.randomColorArray();
  this.time = Date.now();
  this.cachedRGB = Activity.utils.cachedRGB(color);
  this.center = center;
  // this.size = this.options.size;
  this.render = (exact === "1") ? this.renderBlur : this.renderNeat;
};

Activity.Bubble.prototype.renderNeat = function(phase, ctx) {
  ctx.beginPath();
  ctx.arc(this.center[0], this.center[1], this.options.size * phase, 0, 2 * Math.PI);
  ctx.fillStyle = Activity.utils.addRGBAlpha(this.cachedRGB, this.options.neatFillOpacity * (1 - phase));
  ctx.fill();
  ctx.strokeStyle = Activity.utils.addRGBAlpha(this.cachedRGB, this.options.neatStrokeOpacity * Math.sin((1 - phase) * Math.PI));
  ctx.stroke();
  ctx.closePath();
};

Activity.Bubble.prototype.renderBlur = function(phase, ctx) {
  ctx.beginPath();
  ctx.arc(this.center[0], this.center[1], this.options.size * phase, 0, 2 * Math.PI);
  ctx.fillStyle = Activity.utils.addRGBAlpha(this.cachedRGB, this.options.blurFillOpacity * (1 - phase));
  ctx.fill();
  ctx.strokeStyle = Activity.utils.addRGBAlpha(this.cachedRGB, this.options.blurStrokeOpacity * Math.sin((1 - phase) * Math.PI));
  ctx.stroke();
  ctx.closePath();
};

Activity.Bubble.prototype.options = {
  "size": 10,
  "baseSize": 10,
  "baseFillOpacity": 0.8,
  "baseStrokeOpacity": 1,
  // "maxSize": 10,
  "live": 750,
  "neatFillOpacity": 0.8,
  "neatStrokeOpacity": 1,
  "blurFillOpacity": 0.4,
  "blurStrokeOpacity": 0.5
};

Activity.CanvasEmitter = function(div, options) {
  var self = this;
  var canvas = document.createElement("canvas");
  var bubbles = [];
  var allowed = true;
  var bubbleOptions = Activity.Bubble.prototype.options;
  var ctx = canvas.getContext("2d");

  var notInProjection = function(center) {
      return (center[0] < -bubbleOptions.size || center[0] > self.width + bubbleOptions.size || center[1] < -bubbleOptions.size || center[1] > self.height + bubbleOptions.size);
      };
  
  var tweetPhase = function(start, live) {
      return (Date.now() - start) / live;
      };      
  
  var filterHandler = function(el) {
      var phase = tweetPhase(el.time, bubbleOptions .live);
      if (phase < 1) {
        el.render(phase, ctx);
        return true;
      } else {
        return false;
      }
      };
      
  var animation = function() {
      ctx.clearRect(0, 0, self.width, self.height);

      if (!allowed) {
        return false;
      }

      bubbles = bubbles.filter(filterHandler);

      window.requestAnimFrame(animation);
      };

  Activity.BasicEmitter.call(this, div, options);

  this.width = Activity.options.width;
  this.height = Activity.options.height;

  canvas.width = this.width;
  canvas.height = this.height;

  div.appendChild(canvas);
      
  this.emit = function(crd, exact) {
    var center = Activity.utils.latLngToPx(crd, this.projection);

    if (!notInProjection(center)) {
      // console.log("o");
      bubbles.push(new Activity.Bubble(center, exact));
    }

  };

  this.start = function() {
    allowed = true;
    window.requestAnimFrame(animation);
  };

  this.stop = function() {
    allowed = false;
    this.clear();
  };

  this.clear = function() {
    bubbles = [];
    ctx.clearRect(0, 0, self.width, self.height);
  };

  this.updateSize = function(zoom) {
    bubbleOptions.size = Math.round(Math.sqrt(zoom) * bubbleOptions.baseSize);
  };

};