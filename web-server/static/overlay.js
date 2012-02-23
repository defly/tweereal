Activity.Overlay = function(map) {
  this.map = map;
  this.div = null;
  this.setMap(map);
  this.divStyle = window.getComputedStyle(this.map.getDiv());
}

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
    overflow  : "hidden",
//    backgroundColor:"black",
//    opacity: 0.2
  };
  overlay.div = div;
  div.id = "bubles";
  Activity.utils.extender(div.style, overlayStyles);
  panes.overlayLayer.appendChild(div);

  var emitter = new Activity.CanvasEmitter(div);
  emitter.setProjection(overlayProjection);
  emitter.updateBounds();
  emitter.stop();
  emitter.clear();
  emitter.start();

  google.maps.event.addListener(overlay.map, 'bounds_changed', function(event) {
    emitter.updateBounds();
    emitter.stop();
    emitter.clear();
  });

  google.maps.event.addListener(overlay.map, 'idle', function(event) {
    var size = Math.round(Math.sqrt(overlay.map.getZoom()) * Activity.size);
    // if ((size % 2) !== 0) size++;
    emitter.updateBounds();
    emitter.setCurrentOptions({size:size, time:Activity.basicTime});
    overlay.draw();
    emitter.start();
  });

  socket.on('message', function(event) {
    var message = event.split(" ");
    emitter.emit([message[1], message[2]],message[0]); 
  });
}

Activity.Overlay.prototype.draw = function() {
  var overlay = this;
  var overlayProjection = overlay.getProjection();
  var bounds = this.map.getBounds();
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  var top = overlayProjection.fromLatLngToDivPixel(ne).y;
  var left = overlayProjection.fromLatLngToDivPixel(sw).x;
  var overlayStyles = {
    top : Math.round(top) + "px",
    left : Math.round(left) + "px"
  };

  Activity.utils.extender(overlay.div.style, overlayStyles);
}

Activity.Overlay.prototype.onRemove = function() {
  var overlay = this;
  overlay.div.parentNode.removeChild(overlay.div);
  overlay.div = null;
}