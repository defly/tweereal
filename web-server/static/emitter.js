window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
             function(/* function */ callback, /* DOMElement */ element){
               window.setTimeout(callback, 1000 / 60);
             };
    })();

Activity.GaussEmitter = function(div,options) {
  Activity.BasicEmitter.call(this, div, options);
  var self = this;

}

Activity.Bubble = function(center, exact) {
  this.time = Date.now();
  this.color = Activity.utils.randomColorArray();
  this.center = center;
  this.exact = exact;
}

Activity.CanvasEmitter = function(div,options) {
  var self = this;
  var canvas = document.createElement("canvas");
  var bubbles = [];
  var allowed = true;
  Activity.BasicEmitter.call(this, div, options);

  this.width = Activity.width;
  this.height = Activity.height;

  canvas.width = this.width;
  canvas.height = this.height;
  
  div.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  
  var notInProjection = function(center) {
    return (center[0] < -self.options.size || center[0] > self.width + self.options.size ||
     center[1] < -self.options.size || center[1] > self.height + self.options.size);
  }

  this.emit = function(crd,exact) {
    var center = Activity.utils.latLngToPx(crd, this.projection);
    
    if (!notInProjection(center)) {
        bubbles.push(new Activity.Bubble(center,exact));
    }

  }

  var makeRGBA = function(r,g,b,a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  var exact1Options = function(phase) {
    return {
      "size": self.options.size*(phase),
      // "size": self.options.size,
      "fillOpacity": 0.4*(1-phase),
      "strokeOpacity": 0.6*Math.sin((1-phase)*Math.PI)
    }
  }

  var exact0Options = function(phase) {
    return {
      "size": self.options.size*(phase),
      // "size": self.options.size,
      "fillOpacity": 0.8*(1-phase),
      "strokeOpacity": 1*Math.sin((1-phase)*Math.PI)
    }
  }

  var renderBubble = function(set, phase) {
    var exactOptions = set.exact === "1" ? exact1Options(phase) : exact0Options(phase);

    ctx.beginPath();

    ctx.arc(set.center[0],set.center[1],exactOptions.size,0,2*Math.PI);
    ctx.fillStyle = makeRGBA(set.color[0],set.color[1],set.color[2],exactOptions.fillOpacity);
    ctx.fill();
    ctx.strokeStyle = makeRGBA(set.color[0],set.color[1],set.color[2],exactOptions.strokeOpacity);

    ctx.stroke();
    ctx.closePath();
  }

  this.start = function() {
    allowed = true;
    window.requestAnimFrame(animation);
  }

  this.stop = function() {
    allowed = false;
    this.clear();
  }

  this.clear = function() {
    bubbles = [];
    ctx.clearRect(0,0,self.width,self.height);
  }


  // var globalDate = Date.now();

  var tweetPhase = function(start, live) {
        return (Date.now() - start) / live;
  }

  var filterHandler = function(el) {    
    if ((el.time + self.options.time) < Date.now()) {
      return false;
    }

    renderBubble(el, tweetPhase(el.time, self.options.time));
    return true;
  }

  var animation = function() {
    ctx.clearRect(0,0,self.width,self.height);

    if (!allowed) {
      return false;
    }

    bubbles = bubbles.filter(filterHandler);

    window.requestAnimFrame(animation);
  }
}