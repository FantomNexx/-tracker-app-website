var TrackerDataPeriod = function(){
  
  var self = {};
  
  var tracker_period = new TrackerPeriod();
  
  var tracks_points           = undefined;
  var track_points_count      = 0;
  var track_points_limit      = 1000;
  var track_points_limit_from = 0;
  
  var state_request = TrackerDataPeriod.STATES.STATE_IDLE;
  
  
  /**
   * @constructor Init
   */
  self.Init = function(){
    
    if( InitElements() == false ){
      console.log( "TrackerDataPeriod: Init failed, essential elements not found" );
      return;
    }//if
    
    InitEvents();
    
    tracker_period.Init();
  };//Init
  
  /**
   * @returns {boolean}
   */
  function InitElements(){
    
    var el_toolbar_btn_update = $( "#id-btn-update-period" );
    
    if( el_toolbar_btn_update.length == 0 ){
      return false;
    }//if
    
    el_toolbar_btn_update.on( "click", GetPoints );
    
    return true;
  }//InitElements
  
  function InitEvents(){
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod,
      { callback: OnSuccess_GetPoints_ByPeriod } );
    
    event_helper.SubscribeOn(
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count,
      { callback: OnSuccess_GetPoints_ByPeriod_Count } );
  }//InitEvents
  
  
  function GetPoints(){
    
    if( state_request != TrackerDataPeriod.STATES.STATE_IDLE ){
      console.log( "TrackerDataPeriod: cannot get points, points request already started." );
      return;
    }
    
    state_request = TrackerDataPeriod.STATES.STATE_REQUESTING;
    
    tracks_points = [];
    
    GetPoints_ByPeriod_Count();
  }//GetPoints
  
  function GetPoints_ByPeriod(){
    
    var request_data = {
      user_id      : Data.user_id,
      user_password: Data.user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD,
      stamp_from   : tracker_period.GetPeriodFromStamp(),
      stamp_to     : tracker_period.GetPeriodToStamp(),
      limit_from   : track_points_limit_from,
      limit        : track_points_limit
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod );
  }//GetPoints_ByPeriod
  
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
    
    if( data["points"].length == 0 ){
      state_request = TrackerDataPeriod.STATES.STATE_IDLE;
      return;
    }//if
    
    tracks_points = tracks_points.concat( data["points"] );
    
    track_points_limit_from += track_points_limit;
    
    if( tracks_points.length < track_points_count ){
      GetPoints_ByPeriod();
      return
    }//if
    
    Data.tracks_points = tracks_points;
    event_helper.Trigger( Data.EVENTS.OnTracksPointsLoaded );
  }//OnSuccess_GetPoints_ByPeriod
  
  function GetPoints_ByPeriod_Count(){
    
    var request_data = {
      user_id      : Data.user_id,
      user_password: Data.user_password,
      request      : Transport.REQUESTS.GET_POINTS_BY_PERIOD_COUNT,
      stamp_from   : tracker_period.GetPeriodFromStamp(),
      stamp_to     : tracker_period.GetPeriodToStamp()
    };
    
    Transport.Request(
      request_data,
      Data.EVENTS.OnRequestSuccess_GetPoints_ByPeriod_Count );
  }//GetPoints_ByPeriod_Count
  
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
  }//OnSuccess_GetPoints_ByPeriod_Count
  
  
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