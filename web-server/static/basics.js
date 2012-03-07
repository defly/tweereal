var Activity = {
  "map": null
};

Activity.options = {
  "width": 960,
  "height": 540
}

Activity.utils = {
  extender: function(obj, properties) {
    for (var key in properties) obj[key] = properties[key];
  },
  removeAllChilds: function(div) {
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  },
  randomBgHex: function() {
    return "#" + (Math.floor(Math.random() * 255)).toString(16) + (Math.floor(Math.random() * 255)).toString(16) + (Math.floor(Math.random() * 255)).toString(16);
  },
  latLngToPx: function(latLng, projection) {
    var glt = new google.maps.LatLng(latLng[0], latLng[1]);
    var point = projection.fromLatLngToContainerPixel(glt);
    return [point.x, point.y];
  },
  filter: function(w, h, projection) {
    var lat = [];
    var lng = [];
    var points = [
    new google.maps.Point(0, 0), new google.maps.Point(w, 0), new google.maps.Point(w, h), new google.maps.Point(0, h)];
    var latLng = points.map(function(point) {
      var ll = projection.fromContainerPixelToLatLng(point);
      lat.push(ll.lat());
      lng.push(ll.lng());
    });
    return [[Math.min.apply(null, lat), Math.max.apply(null, lat)], [Math.min.apply(null, lng), Math.max.apply(null, lng)]];
  },
  randomColorArray: function() {
    return [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)];
  },
  tweetPhase: function(start, live) {
    return (Date.now() - start) / live;
  },
  makeRGBA: function(r, g, b, a) {
    // return "rgba(" + Array.prototype.join.call(arguments,",") + ")";
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  },
  cachedRGB: function(c) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",";
  },
  addRGBAlpha: function(str, alpha) {
    return str + alpha + ")";
  }
}