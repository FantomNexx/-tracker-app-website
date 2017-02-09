var TrackerToolbar = function(){
  
  var self = {};
  
  var el_toolbar_period_cntr      = undefined;
  var el_toolbar_icon_auto_center = undefined;
  var el_toolbar_icon_auto_update = undefined;
  var el_toolbar_icon_calendar    = undefined;
  
  var css_icon_enbled   = "rgba(255, 255, 255, 0.2)";
  var css_icon_disabled = "transparent";
  
  
  /**
   * @returns {boolean}
   */
  self.Init = function(){
    
    if( InitElements() == false ){
      console.log( "TrackerToolbar: Init failed, essential elements not found" );
      return false;
    }//if
    
    return true;
  };//Init
  
  
  /**
   * @returns {boolean}
   */
  function InitElements(){
    
    el_toolbar_period_cntr      = $( "#id-nav-bar-dateperiod" );
    el_toolbar_icon_auto_update = $( "#id-icon-auto-update" );
    el_toolbar_icon_auto_center = $( "#id-icon-auto-center" );
    el_toolbar_icon_calendar    = $( "#id-icon-calendar" );
    
    if( el_toolbar_period_cntr.length == 0 ||
      el_toolbar_icon_auto_center.length == 0 ||
      el_toolbar_icon_auto_update.length == 0 ||
      el_toolbar_icon_calendar.length == 0 ){
      return false;
    }//if
    
    el_toolbar_icon_auto_update.on( "click", OnClick_IconAutoUpdate );
    el_toolbar_icon_auto_center.on( "click", OnClick_IconAutoCenter );
    el_toolbar_icon_calendar.on( "click", OnClick_IconCalendar );
  
    SetIconEnabledState(
      el_toolbar_icon_auto_update, Data.is_enabled_auto_update);
    
    SetIconEnabledState(
      el_toolbar_icon_auto_center, Data.is_enabled_auto_center);
    
    return true;
  }//InitElements
  
  
  function OnClick_IconAutoUpdate(){
    Data.is_enabled_auto_update = !Data.is_enabled_auto_update;
    SetIconEnabledState(
      el_toolbar_icon_auto_update, Data.is_enabled_auto_update);
  }//OnClick_IconAutoUpdate
  
  
  function OnClick_IconAutoCenter(){
    Data.is_enabled_auto_center = !Data.is_enabled_auto_center;
    SetIconEnabledState(
      el_toolbar_icon_auto_center, Data.is_enabled_auto_center);
  }//OnClick_IconAutoUpdate
  
  
  function OnClick_IconCalendar(){
    Data.is_visible_toolbar_period = !Data.is_visible_toolbar_period;
    SetIconEnabledState(
      el_toolbar_icon_calendar, Data.is_visible_toolbar_period);
    
    if( Data.is_visible_toolbar_period ){
      el_toolbar_period_cntr.css( "display", "inherit" );
    }else{
      el_toolbar_period_cntr.css( "display", "none" );
    }//if toolbar visible
    
  }//OnClick_IconCalendar
  
  
  function SetIconEnabledState( el, state ){
    if( state ){
      el.css( "background-color", css_icon_enbled );
    }else{
      el.css( "background-color", css_icon_disabled );
    }//if toolbar visible
  }
  
  return self;
};