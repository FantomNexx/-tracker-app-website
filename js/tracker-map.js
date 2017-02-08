var TrackerMap = function(){
  
  var self = {};
  
  var obj_google_map = undefined;
  var el_google_map  = undefined;
  
  var is_google_map_inited = false;
  
  var image_track_point = {
    url   : 'http://fantomsoftware.com/fantom_tracker/css/ic_track_point.png',
    size  : new google.maps.Size( 26, 26 ),
    origin: new google.maps.Point( 0, 0 ),
    anchor: new google.maps.Point( 13, 13 )
  };
  
  
  var image_track_point_minor = {
    url   : 'http://fantomsoftware.com/fantom_tracker/css/ic_track_point_minor.png',
    size  : new google.maps.Size( 26, 26 ),
    origin: new google.maps.Point( 0, 0 ),
    anchor: new google.maps.Point( 13, 13 )
  };
  
  var DEFAULT_MAP_ZOOM = 10;
  
  /**
   * @returns {boolean}
   */
  self.Init = function(){
    
    if( InitMap() == false ){
      console.log( "TrackerMap: Init failed, essential elements not found" );
      return false;
    }//if
    
    return true;
  };//Init
  
  /**
   * @returns {boolean}
   */
  function InitMap(){
    
    el_google_map = $( "#id_google_map" );
    if( el_google_map.length == 0 ){
      return false;
    }//if
    
    FitGoogleMapToScreen();
    window.addEventListener( "resize", FitGoogleMapToScreen );
    
    var point       = {};
    point.latitude  = 48.989809;
    point.longitude = 22.808030;
    
    var center_coords = GetGoogleCoords( point );
    
    var map_properties = GetMapProperites(
      center_coords, DEFAULT_MAP_ZOOM );
    
    obj_google_map = new google.maps.Map(
      el_google_map[0], map_properties );
    
    is_google_map_inited = true;
    
    return true;
  }//InitMap
  
  function FitGoogleMapToScreen(){
    
    var header_height = 0;
    /*
     var el_header     = $( ".mdl-layout__header-row" );
     if( el_header.length != 0 ){
     header_height = $( el_header[0] ).height();
     }//if
     */
    
    el_google_map.width( window.innerWidth );
    el_google_map.height( window.innerHeight - header_height );
  }

//FitGoogleMapToScre
  
  function GetMapProperites( point, map_zoom ){
    return {
      center        : point,
      mapTypeControl: false,//hides Satelite / Schema switcher
      zoom          : map_zoom//,
      //styles      : GOOGLE_MAP_STYLES
    };
  }//GetMapProperites
  
  function GetGoogleCoords( point ){
    return new google.maps.LatLng(
      parseFloat( point.latitude ),
      parseFloat( point.longitude ) );
  }//GetGoogleCoords
  
  return self;
};


var GOOGLE_MAP_STYLES = [{
  "featureType": "landscape",
  "stylers"    : [
    { "saturation": 0 },
    { "lightness": 0 },
    { "visibility": "on" }]
}, {
  "featureType": "poi",
  "stylers"    : [
    { "saturation": 50 },
    { "lightness": 0 },
    { "visibility": "all" }]
}, {
  "featureType": "road.highway",
  "stylers"    : [
    { "saturation": -100 },
    { "lightness": 20 },
    { "visibility": "all" }]
}, {
  "featureType": "road.arterial",
  "stylers"    : [
    { "saturation": -100 },
    { "lightness": 30 },
    { "visibility": "on" }]
}, {
  "featureType": "road.local",
  "stylers"    : [
    { "saturation": -100 },
    { "lightness": 40 },
    { "visibility": "on" }]
}, {
  "featureType": "transit",
  "stylers"    : [
    { "saturation": -100 },
    { "visibility": "all" }]
}, {
  "featureType": "administrative.province",
  "stylers"    : [
    { "visibility": "on" }]
}, {
  "featureType": "water",
  "elementType": "labels",
  "stylers"    : [
    { "visibility": "on" },
    { "lightness": -25 },
    { "saturation": -100 }]
}, {
  "featureType": "water",
  "elementType": "geometry",
  "stylers"    : [
    { "color": "#6fbbdf" },
    { "visibility": "on" }]
}, {
  "featureType": "water",
  "elementType": "labels.text.fill",
  "stylers"    : [
    { "color": "#ffffff" },
    { "visibility": "on" }]
}];