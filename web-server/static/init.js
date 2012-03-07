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
  Activity.socket = io.connect('http://ctweereal');
};

window.onload = function() {
  Activity.initialize();
  $(function() {
    $("#all-sliders").slider({
      step: 0.01,
      animate: true,
      value: 7.5,
      slide: function(event, ui) {
        Activity.Bubble.prototype.options.live = Math.round(ui.value*100);
      }
    });
    $("#all-sliders-size").slider({
      step: 0.01,
      animate: true,
      value: 20,
      slide: function(event, ui) {
        // Activity.Bubble.prototype.options.size = Activity.Bubble.prototype.options.baseSize * ui.value;
        Activity.Bubble.prototype.options.size =  ui.value*0.5;
      }
    });
    $("#exact-sliders").slider({
      step: 0.01,
      animate: true,
      value: 100,
      slide: function(event, ui) {
        console.log(0.01*ui.value);
        Activity.Bubble.prototype.options.neatFillOpacity = Activity.Bubble.prototype.options.baseFillOpacity*(0.01*Math.round(ui.value));
        Activity.Bubble.prototype.options.neatStrokeOpacity = Activity.Bubble.prototype.options.baseStrokeOpacity*(0.01*Math.round(ui.value));
      }
    });
    $("#places-sliders").slider({
      step: 0.01,
      animate: true,
      value: 50,
      slide: function(event, ui) {
        console.log(0.01*ui.value);
        Activity.Bubble.prototype.options.blurFillOpacity = Activity.Bubble.prototype.options.baseFillOpacity*(0.01*Math.round(ui.value));
        Activity.Bubble.prototype.options.blurStrokeOpacity = Activity.Bubble.prototype.options.baseStrokeOpacity*(0.01*Math.round(ui.value));
      }
    });
  });
};