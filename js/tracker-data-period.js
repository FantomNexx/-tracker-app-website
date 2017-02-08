var TrackerDataPeriod = function(){
  
  var self = {};
  
  var tracker_period = new TrackerPeriod();
  
  var track_points            = undefined;
  var track_points_count      = 0;
  var track_points_limit      = 100;
  var track_points_limit_from = 0;
  
  var Func_InitTrack = undefined;
  
  var el_toolbar_btn_update = undefined;
  
  var state_request = TrackerDataPeriod.STATES.STATE_IDLE;
  
  
  /**
   * @constructor Init
   */
  self.Init = function(){
    
    if( InitElements() == false ){
      console.log( "TrackerDataPeriod: Init failed, essential elements not found" );
      return;
    }
    
    InitEvents();
    
    tracker_period.Init();
  };
  /**
   * @constructor SetFunc_InitTrack
   */
  self.SetFunc_InitTrack = function( func ){
    Func_InitTrack = func;
  };
  
  /**
   * @returns {boolean}
   */
  function InitElements(){
    
    el_toolbar_btn_update = $( "#id-btn-update-period" );
    
    if( el_toolbar_btn_update.length == 0
    ){
      return false;
    }//if
    
    el_toolbar_btn_update.on( "click", GetPoints );
    
    return true;
  }
  
  function InitEvents(){
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod,
      { callback: OnSuccess_GetPoints_ByPeriod } );
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count,
      { callback: OnSuccess_GetPoints_ByPeriod_Count } );
  }
  
  
  function GetPoints(){
    
    if( state_request != TrackerDataPeriod.STATES.STATE_IDLE ){
      console.log( "TrackerDataPeriod: cannot get points, points request already started." );
      return;
    }
    
    state_request = TrackerDataPeriod.STATES.STATE_REQUESTING;
    
    track_points = [];
    
    GetPoints_ByPeriod_Count();
  }
  
  function GetPoints_ByPeriod(){
    
    var request_data = {
      user_id      : param_user_id,
      user_password: param_user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD,
      stamp_from   : tracker_period.GetPeriodFromStamp(),
      stamp_to     : tracker_period.GetPeriodToStamp(),
      limit_from   : track_points_limit_from,
      limit        : track_points_limit
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod );
  }
  
  function OnSuccess_GetPoints_ByPeriod( obj_reply ){
    
    if( obj_reply["data"] == undefined ){
      console.log( "TrackerDataPeriod: Reply has no data" );
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
      return;
    }//if
    
    var data = obj_reply["data"];
    
    if( data["points"] == undefined ){
      console.log( "TrackerDataPeriod: Reply has no points data" );
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
      return;
    }//if
    
    if( data["points"].length == 0 ){
      console.log( "TrackerDataPeriod:  Reply has no points" );
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
      return;
    }//if
    
    track_points = track_points.concat( data["points"] );
    
    track_points_limit_from += track_points_limit;
    
    if( track_points.length < track_points_count ){
      GetPoints_ByPeriod();
    }else{
      
      if( track_points.length == 0 ){
        return;
      }
      
      Func_InitTrack( track_points );
    }
  }
  
  function GetPoints_ByPeriod_Count(){
    
    var request_data = {
      user_id      : param_user_id,
      user_password: param_user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD_COUNT,
      stamp_from   : tracker_period.GetPeriodFromStamp(),
      stamp_to     : tracker_period.GetPeriodToStamp()
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count );
  }
  
  function OnSuccess_GetPoints_ByPeriod_Count( obj_reply ){
    
    if( obj_reply["data"] == undefined ){
      console.log( "Reply has no data" );
      return;
    }//if
    
    var data = obj_reply["data"];
    
    if( data["count"] == undefined ){
      console.log( "TrackerDataPeriod: Reply has no count data" );
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
      return;
    }//if
    
    if( data["count"] == 0 ){
      console.log( "TrackerDataPeriod: Points count is 0" );
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
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