var TrackerMap = function(){
  
  var self = {};
  
  var obj_google_map = undefined;
  var el_google_map  = undefined;
  
  var is_google_map_inited = false;
  
  var polylines = [];
  
  var image_track_point       = {
    url    : 'https://fantomsoftware.com/fantom_tracker/css/ic_track_point.png',
    size   : new google.maps.Size( 26, 26 ),
    origin : new google.maps.Point( 0, 0 ),
    anchor : new google.maps.Point( 13, 13 )
  };
  var image_track_point_minor = {
    url    : 'https://fantomsoftware.com/fantom_tracker/css/ic_track_point_minor.png',
    size   : new google.maps.Size( 26, 26 ),
    origin : new google.maps.Point( 0, 0 ),
    anchor : new google.maps.Point( 13, 13 )
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
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnReady_Tracks,
      { callback : OnReady_Tracks } );
    
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
    el_google_map.width( window.innerWidth );
    el_google_map.height( window.innerHeight );
  }//FitGoogleMapToScreen
  
  
  function GetMapProperites( point, map_zoom ){
    return {
      center         : point,
      mapTypeControl : false,//hides Satelite / Schema switcher
      zoom           : map_zoom//,
      //styles      : GOOGLE_MAP_STYLES
    };
  }//GetMapProperites
  
  
  function OnReady_Tracks(){
    
    if( Data.tracks.length == 0 ){
      return;
    }//if
    
    for( var i = 0; i < Data.tracks.length; i++ ){
      ProcessAndDrawTrack( Data.tracks[i] );
    }//for
    
  }//OnReady_Tracks
  
  
  function ProcessAndDrawTrack( track ){
    
    var points_google_map = [];
    
    for( var i = 0; i < track.length; i++ ){
      points_google_map.push( track[i].coords );
    }//for
    
    DrawTrackLine( points_google_map );
  }//ProcessAndDrawTrack
  
  
  function DrawTrackMarkerLast( point ){
    
    if( obj_google_map == undefined ){
      return
    }//if
    
    //clean old marker
    if( track_markers_last != undefined ){
      track_markers_last.setMap( null );
    }//if
    
    
    track_markers_last = new google.maps.Marker( {
      map       : obj_google_map,
      title     : 'Алексей Верзун',
      position  : point.coords,
      animation : google.maps.Animation.DROP
    } );
    
    
    var time = FormatTStamp_Long( point.timestamp );
    
    var content = "" +
      "<div style='text-align: center; '>" +
      "<div style='font-weight: bold; font-size: 18px;'>Алексей Верзун</div>" +
      "<div style='font-size: 16px;'>" + time + "</div></div>";
    
    
    var infowindow = new google.maps.InfoWindow( {
      content : content
    } );
    
    
    track_markers_last.addListener( 'click', function(){
      infowindow.open( obj_google_map, track_markers_last );
    } );
  }//DrawTrackMarkerLast
  
  
  function DrawTrackMarkers( points, markers, marker_image ){
    
    if( obj_google_map == undefined ){
      return
    }//if
    
    var i;
    
    markers = [];
    
    for( i = 0; i < points.length; i++ ){
      
      var content_data = FormatTStamp_Long( points[i].timestamp );
      if( points[i].speed != undefined ){
        content_data += " (" + points[i].speed + " км/ч )";
      }//if
      
      var marker = DrawTrackMarker(
        points[i].coords, content_data, marker_image );
      
      var content_info_window =
            "<div style='text-align: center; padding: 0; font-size: 16px;'>" +
            content_data + "</div>";
      
      marker["content_data_html"] = content_info_window;
      
      markers.push( marker );
    }//for
    
    for( i = 0; i < points.length; i++ ){
      
      google.maps.event.addListener(
        markers[i], 'click', (function( marker, i ){
          return function(){
            
            if( infowindow != undefined ){
              infowindow.close();
            }//if
            
            infowindow = new google.maps.InfoWindow( {
              content : marker["content_data_html"]
            } );
            
            infowindow.setContent( marker["content_data_html"] );
            infowindow.open( obj_google_map, markers[i] );
          }
        })( markers[i], i ) );
    }//for
    
  }//DrawTrackMarkers
  
  
  function DrawTrackMarker( point_google_map, title, image ){
    
    if( obj_google_map == undefined ){
      return
    }//if
    
    return new google.maps.Marker( {
      map      : obj_google_map,
      position : point_google_map,
      title    : title,
      icon     : image
    } );
  }//DrawTrackMarker
  
  
  function DrawTrackLine( points_google_map ){
    
    if( obj_google_map == undefined ){
      return
    }//if
    
    //clean old line
    /*
     if( track_line != undefined ){
     track_line.setMap( null );
     }//if
     */
    
    var poly_line = new google.maps.Polyline( {
      path          : points_google_map,
      geodesic      : true,
      strokeColor   : "#cc0000",
      strokeOpacity : 0.7,
      strokeWeight  : 5
    } );
    
    poly_line.setMap( obj_google_map );
    
    polylines.push( poly_line );
    
  }//DrawTrackLine
  
  
  return self;
};

var GOOGLE_MAP_STYLES = [{
  "featureType" : "landscape",
  "stylers"     : [
    { "saturation" : 0 },
    { "lightness" : 0 },
    { "visibility" : "on" }]
}, {
  "featureType" : "poi",
  "stylers"     : [
    { "saturation" : 50 },
    { "lightness" : 0 },
    { "visibility" : "all" }]
}, {
  "featureType" : "road.highway",
  "stylers"     : [
    { "saturation" : -100 },
    { "lightness" : 20 },
    { "visibility" : "all" }]
}, {
  "featureType" : "road.arterial",
  "stylers"     : [
    { "saturation" : -100 },
    { "lightness" : 30 },
    { "visibility" : "on" }]
}, {
  "featureType" : "road.local",
  "stylers"     : [
    { "saturation" : -100 },
    { "lightness" : 40 },
    { "visibility" : "on" }]
}, {
  "featureType" : "transit",
  "stylers"     : [
    { "saturation" : -100 },
    { "visibility" : "all" }]
}, {
  "featureType" : "administrative.province",
  "stylers"     : [
    { "visibility" : "on" }]
}, {
  "featureType" : "water",
  "elementType" : "labels",
  "stylers"     : [
    { "visibility" : "on" },
    { "lightness" : -25 },
    { "saturation" : -100 }]
}, {
  "featureType" : "water",
  "elementType" : "geometry",
  "stylers"     : [
    { "color" : "#6fbbdf" },
    { "visibility" : "on" }]
}, {
  "featureType" : "water",
  "elementType" : "labels.text.fill",
  "stylers"     : [
    { "color" : "#ffffff" },
    { "visibility" : "on" }]
}];