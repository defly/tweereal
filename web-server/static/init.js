// var map;
Activity.initialize = function() {
  var latlng = new google.maps.LatLng(30, 10);
  var myOptions = {
    zoom: 2,
    minZoom: 2,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },

    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map_canvas = document.getElementById("map_canvas");
  Activity.map = new google.maps.Map(map_canvas, myOptions);

  Activity.overlay = new Activity.Overlay(Activity.map);
  Activity.socket = io.connect('http://ctweereal/');
};

Activity.dispatcher = function(msg) {
  var message = msg.split(" ");
  if (message[0] === "0") {
    Activity.overlay.emitter.emit([message[1], message[2]], message[0]);
  } else if (message[0] === "1") {
    Activity.overlay.emitter.emit([message[1], message[2]], message[0], message[3]);
  }
};

window.onload = function() {
  Activity.initialize();
  new Activity.Interface();
  Activity.socket.on("message", Activity.dispatcher);
};