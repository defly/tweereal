var map;

var initialize = function() {
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
  map = new google.maps.Map(map_canvas, myOptions);

  var overlay = new Activity.Overlay(map);

}
window.onload = function() {
  // console.log(io);
  socket = io.connect('http://ctweereal');
  // socket.on('connect', function(){
    // console.log("connect");
  // })
  // console.log(socket);
  initialize();
    
};
