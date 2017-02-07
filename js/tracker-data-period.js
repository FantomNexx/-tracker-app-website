var TrackerDataPeriod = function(){
  //------------------------------------------------------------------
  var self = {};
  
  var tracker_period = new TrackerPeriod();
  
  var track_points       = undefined;
  var track_points_count = 0;
  
  var Func_InitTrack = undefined;
  
  var state = TrackerDataPeriod.STATES.STATE_IDLE;
  
  var LIMIT      = 100;
  var limit_from = 0;
  //------------------------------------------------------------------
  
  self.Init = function(){
    
    tracker_period.Init();
    
    InitBtnUpdate();
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod,
      { callback: OnSuccess_GetPoints_ByPeriod } );
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count,
      { callback: OnSuccess_GetPoints_ByPeriod_Count } );
  };
  
  //------------------------------------------------------------------
  self.SetFunc_InitTrack = function( func ){
    Func_InitTrack = func;
  };
  
  
  //------------------------------------------------------------------
  function InitBtnUpdate(){
    
    var btn_el = $( "#id-btn-update-period" );
    
    if( btn_el.length == 0 ){
      return;
    }
    
    btn_el.on( "click", function( e ){
      
      track_points = [];
      GetPoints_ByPeriod_Count();
      
    } );
  }
  
  //------------------------------------------------------------------
  function GetPoints_ByPeriod(){
    
    var request_data = {
      user_id      : param_user_id,
      user_password: param_user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD,
      stamp_from   : tracker_period.GeoPeriodFromStamp(),
      stamp_to     : tracker_period.GeoPeriodToStamp(),
      limit_from   : limit_from,
      limit        : LIMIT
      
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod );
  }
  
  //------------------------------------------------------------------
  function OnSuccess_GetPoints_ByPeriod( obj_reply ){
    
    if( obj_reply["data"] == undefined ){
      console.log( "Reply has no data" );
      return;
    }//if
    
    var data = obj_reply["data"];
    
    if( data["points"] == undefined ){
      console.log( "Reply has no trac data" );
      return;
    }//if
    
    track_points = track_points.concat( data["points"] );
    
    limit_from += LIMIT;
    
    if( track_points.length < track_points_count ){
      GetPoints_ByPeriod();
    }else{
      
      if( track_points.length == 0 ){
        return;
      }
      
      Func_InitTrack( track_points );
    }
  }
  
  //------------------------------------------------------------------
  function GetPoints_ByPeriod_Count(){
    
    var request_data = {
      user_id      : param_user_id,
      user_password: param_user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD_COUNT,
      stamp_from   : tracker_period.GeoPeriodFromStamp(),
      stamp_to     : tracker_period.GeoPeriodToStamp()
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count );
  }
  
  //------------------------------------------------------------------
  function OnSuccess_GetPoints_ByPeriod_Count( obj_reply ){
    
    if( obj_reply["data"] == undefined ){
      console.log( "Reply has no data" );
      return;
    }//if
    
    var data = obj_reply["data"];
    
    if( data["count"] == undefined ){
      console.log( "Reply has no count data" );
      return;
    }//if
    
    track_points_count = data["count"];
    
    GetPoints_ByPeriod();
  }
  
  
  return self;
};

TrackerDataPeriod.STATES = {
  STATE_IDLE      : "STATE_IDLE",
  STATE_REQUESTING: "STATE_REQUESTING",
  STATE_STOPPING  : "STATE_STOPPING"
};

TrackerDataPeriod.COMMANDS = {
  REQUEST: "REQUEST",
  STOP   : "STOP"
};