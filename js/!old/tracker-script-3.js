var is_inited = false;


var track_points_line    = [];
var track_points_div     = [];
var track_points_div_sub = [];
var track_points_last;

var track_line;
var track_markers_last;
var track_markers_div = [];


var UPDATE_INTERVAL_POINTS = 60000;

var obj_google_map = undefined;
var el_google_map;

var infowindow;

var is_waiting_last_point = false;
var current_session_id    = 0;

var param_user_id       = 222;
var param_user_password = 222;


//--------------------------------------------------------------------
$( document ).ready( function(){
  Init();
} );
//on start------------------------------------------------------------

//--------------------------------------------------------------------
function Init(){
  
  event_helper.SubscribeOn(
    Data.EVENTS.OnRequestSuccess_GetPoints,
    { callback: OnGetPointsSuccess } );
  
  event_helper.SubscribeOn(
    Data.EVENTS.OnRequestSuccess_GetLastPoint,
    { callback: OnGetLastPointSuccess } );
  
  event_helper.SubscribeOn(
    Data.EVENTS.OnRequestSuccess_GetSessionPoints,
    { callback: OnGetSessionPointsSuccess } );
  
  
  Navigation.Home.Init();
  
  GetPoints();
  
  setInterval( function(){
    if( current_session_id != 0 ){
      return;
    }//if
    UpdateRequired();
  }, UPDATE_INTERVAL_POINTS );
}
//Init----------------------------------------------------------------


//--------------------------------------------------------------------
function GetPoints(){
  
  var request_data = {
    'user_id'      : param_user_id,
    'user_password': param_user_password,
    request        : Transport.REQUESTS.GET_POINTS_100
  };
  
  Transport.Request(
    request_data,
    Data.EVENTS.OnRequestSuccess_GetPoints );
}
//GetPoints-----------------------------------------------------------
function OnGetPointsSuccess( obj_reply ){
  
  if( obj_reply["data"] == undefined ){
    console.log( "Reply has no data" );
    return;
  }//if
  
  var data = obj_reply["data"];
  
  if( data["points"] == undefined ){
    console.log( "Reply has no trac data" );
    return;
  }//if
  
  InitTrack( data["points"] );
}
//OnGetPointsSuccess--------------------------------------------------
function GetLastPoint(){
  
  if( is_waiting_last_point ){
    return;
  }//if
  
  var request_data = {
    'user_id'      : param_user_id,
    'user_password': param_user_password,
    request        : Transport.REQUESTS.GET_LAST_POINT
  };
  
  is_waiting_last_point = true;
  
  Transport.Request(
    request_data,
    Data.EVENTS.OnRequestSuccess_GetLastPoint );
}
//GetLastPoint--------------------------------------------------------
function OnGetLastPointSuccess( obj_reply ){
  
  is_waiting_last_point = false;
  
  if( obj_reply["data"] == undefined ){
    console.log( "Reply has no data" );
    return;
  }//if
  
  var data = obj_reply["data"];
  
  if( data["user_last_point"] == undefined ){
    console.log( "Reply has no user_last_point data" );
    return;
  }//if
  
  var user_last_point = data["user_last_point"];
  
  //checking if the last point is equals to old one
  if( track_points_last.timestamp != user_last_point.timestamp ){
    GetPoints();
  }//if
  
}
//OnGetLastPointSuccess-----------------------------------------------
function GetSessionPoints( session_id ){
  
  if( session_id == 0 ){
    GetPoints();
    return;
  }//if
  
  var request_data = {
    'user_id'   : param_user_id,
    'session_id': session_id,
    request     : Transport.REQUESTS.GET_SESSION_POINTS
  };
  
  Transport.Request(
    request_data,
    Data.EVENTS.OnRequestSuccess_GetSessionPoints );
}
//GetPoints-----------------------------------------------------------
function OnGetSessionPointsSuccess( obj_reply ){
  
  if( obj_reply["data"] == undefined ){
    console.log( "Reply has no data" );
    return;
  }//if
  
  var data = obj_reply["data"];
  
  if( data["points"] == undefined ){
    console.log( "Reply has no trac data" );
    return;
  }//if
  
  var points = data["points"];
  
  if( points == null || points.length <= 1 ){
    return;
  }//if
  
  InitTrack( points );
}
//OnGetSessionPointsSuccess-------------------------------------------


//--------------------------------------------------------------------
function UpdateRequired(){
  GetLastPoint();
}
//UpdateRequired------------------------------------------------------


//--------------------------------------------------------------------
function InitTrack( points ){
  
  track_points_last        = points[0];
  track_points_last.coords = GetGoogleCoords( track_points_last );
  InitGoogleMap( track_points_last.coords );
  
  CleanMarkers( track_markers_div );
  
  InitPoints( points );
  InitTrackLineSmoothed();
  
  DrawTrackMarkers(
    track_points_div, track_markers_div, image_track_point );
  
  DrawTrackLine( track_points_line );
  
  
  DrawTrackMarkerLast( track_points_last );
}
//InitTrack-----------------------------------------------------------
function GetBCSubLine( points ){
  
  var points_inner             = [];
  var points_outer             = [];
  var result_google_map_coords = [];
  
  var i;
  
  if( points.length < 3 ){
    for( i = 0; i < points.length; i++ ){
      result_google_map_coords.push( points[i].coords );
    }//for
    return result_google_map_coords;
  }//if
  
  
  for( i = 0; i < points.length; i++ ){
    points_outer.push(
      [parseFloat( points[i].latitude ),
        parseFloat( points[i].longitude )]
    );
  }
  
  var shift = 0;
  var step  = 5;
  
  for( i = 0; i < 100; i++ ){
    
    if( shift > 100 ){
      shift = 100;
    }//if
    
    points_inner.push(
      formula.getPointOnCurve( shift, points_outer )
    );
    
    if( shift <= 100 ){
      shift += step;
    }else{
      break;
    }
  }//for i
  
  
  for( i = 0; i < points_inner.length; i++ ){
    result_google_map_coords.push( new google.maps.LatLng(
      points_inner[i][0], points_inner[i][1] ) );
    //DrawTrackMarker(result_google_map_coords[i], "", image_track_point_minor);
  }//for
  
  return result_google_map_coords;
}
//GetBCSubLine--------------------------------------------------------
function InitPoints( points ){
  
  var chk_time_diff_long = 600000;//10min
  var chk_time_diff      = 60000;//1min
  var chk_shift          = 0.00001;//10 meters
  
  var time_diff;
  var point_curr;
  var point_prev;
  var shift_lat;
  var shift_lng;
  
  
  point_curr        = points[0];
  point_curr.coords = GetGoogleCoords( point_curr );
  
  track_points_div     = [];
  track_points_div_sub = [];
  
  var track_points_div_sub_arr = [];
  
  track_points_div_sub_arr.push( point_curr );
  
  point_prev = point_curr;
  
  
  for( var i = 1; i < points.length; i++ ){
    
    shift_lat = Math.abs(
      Number( points[i].latitude ) - Number( points[i - 1].latitude ) );
    
    shift_lng = Math.abs(
      Number( points[i].longitude ) - Number( points[i - 1].longitude ) );
    
    if( shift_lat < chk_shift && shift_lng < chk_shift ){
      continue;
    }//if points are too close
    
    
    point_curr        = points[i];
    point_curr.coords = GetGoogleCoords( point_curr );
    
    
    time_diff = GetTimeDiff( point_curr, point_prev );
    
    if( time_diff > chk_time_diff_long ){
      //if difference more than 10 min
      break;
    }//if
    
    track_points_div_sub_arr.push( point_curr );
    
    if( time_diff > chk_time_diff ){
      //if difference more than 1 min
      point_prev.speed = GetSpeed( point_curr, point_prev );
      
      track_points_div.push( point_curr );
      track_points_div_sub.push( track_points_div_sub_arr );
      
      track_points_div_sub_arr = [];
      track_points_div_sub_arr.push( point_curr );
      
      point_prev = point_curr;
    }//if passed period
    
  }//for
  
  //track_points_div_sub_arr.push( point_curr );
  track_points_div_sub.push( track_points_div_sub_arr );
  
}
//InitPoints----------------------------------------------------------
function InitTrackLineSmoothed(){
  
  track_points_line         = [];
  var track_points_line_sub = [];
  var i, j;
  
  for( i = 0; i < track_points_div_sub.length; i++ ){
    track_points_line_sub = GetBCSubLine( track_points_div_sub[i] );
    
    for( j = 0; j < track_points_line_sub.length; j++ ){
      track_points_line.push( track_points_line_sub[j] );
    }//for
  }//for
  
}
//InitTrackLineSmoothed-----------------------------------------------


//--------------------------------------------------------------------
function OnMapLoaded(){
}
//OnMapLoaded---------------------------------------------------------
function InitGoogleMap( center_coords ){
  
  /*
   if( is_inited ){
   obj_google_map.setCenter( center_coords );
   return;
   }//if
   */
  
  
  el_google_map = $( "#id_google_map" );
  if( el_google_map.length == 0 ){
    return;
  }//if
  
  FitGoogleMapToScreen();
  window.addEventListener( "resize", FitGoogleMapToScreen );
  
  
  var map_properties = GetMapProperites(
    center_coords, DEFAULT_MAP_ZOOM );
  
  obj_google_map = new google.maps.Map(
    el_google_map[0], map_properties );
  
  
  is_inited = true;
}
//InitGoogleMap-------------------------------------------------------
function FitGoogleMapToScreen(){
  
  var header_height = 0;
  var el_header     = $( ".mdl-layout__header-row" );
  if( el_header.length != 0 ){
    header_height = $(el_header[0]).height();
  }//if
  
  el_google_map.width( window.innerWidth );
  el_google_map.height( window.innerHeight - header_height );
}
//FitGoogleMapToScren-------------------------------------------------
function GetMapProperites( point, map_zoom ){
  return {
    center        : point,
    mapTypeControl: false,//hides Satelite / Schema switcher
    zoom          : map_zoom,
    styles        : GOOGLE_MAP_STYLES
  };
}
//GetMapProperites----------------------------------------------------

//--------------------------------------------------------------------
function CleanMarkers( markers ){
  
  if( markers != undefined ){
    for( var i = 0; i < markers.length; i++ ){
      markers[i].setMap( null );
    }//for
  }//if
}
//CleanMarkers--------------------------------------------------------


//--------------------------------------------------------------------
function DrawTrackMarkerLast( point ){
  
  if( obj_google_map == undefined ){
    return
  }//if
  
  //clean old marker
  if( track_markers_last != undefined ){
    track_markers_last.setMap( null );
  }//if
  
  
  track_markers_last = new google.maps.Marker( {
    map      : obj_google_map,
    title    : '',
    position : point.coords,
    animation: google.maps.Animation.DROP
  } );
  
  
  var time = FormatTimeStamp( point.timestamp );
  
  var content = "" +
    "<div style='text-align: center; '>" +
    "<div style='font-size: 16px;'>" + time + "</div></div>";
  
  
  var infowindow = new google.maps.InfoWindow( {
    content: content
  } );
  
  
  track_markers_last.addListener( 'click', function(){
    infowindow.open( obj_google_map, track_markers_last );
  } );
  
}
//DrawTrackMarkerLast-------------------------------------------------
function DrawTrackMarkers( points, markers, marker_image ){
  
  if( obj_google_map == undefined ){
    return
  }//if
  
  var i;
  
  markers = [];
  
  for( i = 0; i < points.length; i++ ){
    
    var content_data = FormatTimeStamp( points[i].timestamp );
    if( points[i].speed != undefined ){
      content_data += " (" + points[i].speed + " км/ч )";
    }//if
    
    var marker = DrawTrackMarker(
      points[i].coords,
      content_data,
      marker_image );
    
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
            content: marker["content_data_html"]
          } );
          
          infowindow.setContent( marker["content_data_html"] );
          infowindow.open( obj_google_map, markers[i] );
        }
      })( markers[i], i ) );
  }//for
  
}
//DrawTrackMarkers----------------------------------------------------
function DrawTrackMarker( coords, title, image ){
  
  if( obj_google_map == undefined ){
    return
  }//if
  
  return new google.maps.Marker( {
    map     : obj_google_map,
    position: coords,
    title   : title,
    icon    : image
  } );
  
}
//DrawTrackMarker-----------------------------------------------------
function DrawTrackLine( track_points_line_coords ){
  
  if( obj_google_map == undefined ){
    return
  }//if
  
  //lean old line
  if( track_line != undefined ){
    track_line.setMap( null );
  }//if
  
  
  track_line = new google.maps.Polyline( {
    path         : track_points_line_coords,
    geodesic     : true,
    strokeColor  : "#cc0000",
    strokeOpacity: 0.7,
    strokeWeight : 5
  } );
  
  
  track_line.setMap( obj_google_map );
  
}
//DrawTrackLine-------------------------------------------------------


//--------------------------------------------------------------------
function GetGoogleCoords( point ){
  return new google.maps.LatLng(
    parseFloat( point.latitude ),
    parseFloat( point.longitude ) );
}
//GetGoogleCoords-----------------------------------------------------
function GetTimeDiff( point_curr, point_prev ){
  var time_curr = Number( point_curr.timestamp );
  var time_prev = Number( point_prev.timestamp );
  
  return Math.abs( time_curr - time_prev );
}
//GetTimeDiff---------------------------------------------------------
function GetSpeed( point_curr, point_prev ){
  
  //in milisecons
  var time = GetTimeDiff( point_curr, point_prev );
  
  //in meters
  var distance = GetDistance( point_curr.coords, point_prev.coords );
  
  var time_diff_hours = (time / 1000) / 3600;
  var distance_km     = (distance / 1000);
  
  return (distance_km / time_diff_hours).toFixed( 2 );
}
//GetSpeed------------------------------------------------------------
function DegreesToRads( x ){
  return x * Math.PI / 180;
}
//DegreesToRads-------------------------------------------------------
function GetDistance( p1, p2 ){
  
  var R = 6378137; // Earth’s mean radius in meter
  
  var dLat  = DegreesToRads( p2.lat() - p1.lat() );
  var dLong = DegreesToRads( p2.lng() - p1.lng() );
  
  var a =
        Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
        Math.cos( DegreesToRads( p1.lat() ) ) *
        Math.cos( DegreesToRads( p2.lat() ) ) *
        Math.sin( dLong / 2 ) * Math.sin( dLong / 2 );
  
  var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
  var d = R * c;
  
  return d; // returns the distance in meters
}
//GetDistance---------------------------------------------------------


//BEZIER CURVES-------------------------------------------------------
var formula             = {};
formula.getPointOnLine  = function( shift, points ){
  return [
    (points[1][0] - points[0][0]) * (shift / 100) + points[0][0],
    (points[1][1] - points[0][1]) * (shift / 100) + points[0][1]
  ];
};
//getPointOnLine------------------------------------------------------
formula.getPointOnCurve = function( shift, points ){
  if( points.length == 2 ){
    return this.getPointOnLine( shift, points );
  }
  var pointsPP = [];
  for( var i = 1; i < points.length; i++ ){
    pointsPP.push( this.getPointOnLine( shift, [
      points[i - 1],
      points[i]
    ] ) );
  }
  return this.getPointOnCurve( shift, pointsPP );
};
//getPointOnCurve-----------------------------------------------------
