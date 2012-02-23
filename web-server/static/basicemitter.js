Activity.BasicEmitter = function(div, options) {
  this.projection = null;
  this.div = div;
  this.allowed = false;
  this.map = map;
  this.options = this.options || {size:10, time:600};

  this.updateBounds = function() {
    var mapBounds = this.map.getBounds();
    var sw = mapBounds.getSouthWest();
    var ne = mapBounds.getNorthEast();
    this.bounds = {
      top: ne.lat(),
      right: ne.lng(),
      bottom: sw.lat(),
      left: sw.lng()
    }
  }
  this.setProjection = function(projection) {
    this.projection = projection;
  }
  this.setCurrentOptions = function(opt) {
    this.options = opt;
  }
  this.start = function() {
    this.allowed = true;
  }
  this.stop = function() {
    this.allowed = false;
  }
  this.clear = function() {

  }
}

