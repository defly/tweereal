Activity.Overlay = function(map) {
  this.map = map;
  this.div = null;
  this.setMap(map);
  this.divStyle = window.getComputedStyle(this.map.getDiv());
  this.socketListener = function(){

  };
};

Activity.Overlay.prototype = new google.maps.OverlayView();

Activity.Overlay.prototype.onAdd = function() {
  var overlay = this;
  var panes = overlay.getPanes();
  var overlayProjection = overlay.getProjection();
  var div = document.createElement('div');
  var overlayStyles = {
    width     : Activity.width + "px",
    height    : Activity.height + "px",
    position  : "relative",
    overflow  : "hidden"
  };

  overlay.div = div;
  div.id = "bubles";
  Activity.utils.extender(div.style, overlayStyles);
  panes.overlayLayer.appendChild(div);

  overlay.emitter = new Activity.CanvasEmitter(div);
  overlay.emitter.setProjection(overlayProjection);
  overlay.emitter.stop();
  overlay.emitter.start();

  google.maps.event.addListener(overlay.map, 'bounds_changed', function(event) {
    overlay.emitter.stop();
  });

  google.maps.event.addListener(overlay.map, 'idle', function(event) {
    overlay.emitter.updateSize(overlay.map.getZoom());
    overlay.draw();
    overlay.emitter.start();
  });

  overlay.socketListener = function(event) {
    var message = event.split(" ");
    // if (message[0] === "2") console.log(message);
    overlay.emitter.emit([message[1], message[2]],message[0]); 
  };

  Activity.socket.on('message', overlay.socketListener);

};

Activity.Overlay.prototype.draw = function() {
  var overlay = this;
  var overlayProjection = overlay.getProjection();
  var bounds = overlay.map.getBounds();
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  var top = overlayProjection.fromLatLngToDivPixel(ne).y;
  var left = overlayProjection.fromLatLngToDivPixel(sw).x;
  var overlayStyles = {
    top : Math.round(top) + "px",
    left : Math.round(left) + "px"
  };

  Activity.utils.extender(overlay.div.style, overlayStyles);
};

Activity.Overlay.prototype.onRemove = function() {
  var overlay = this;
  overlay.div.parentNode.removeChild(overlay.div);
  overlay.div = null;
};