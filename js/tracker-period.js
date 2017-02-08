//TrackerPeriod///////////////////////////////////////////////////////
var TrackerPeriod = function(){
  
  var date_from = {
    str  : "",
    date : undefined,
    stamp: 0,
    el   : undefined
  };
  var date_to = {
    str  : "",
    date : undefined,
    stamp: 0,
    el   : undefined
  };
  
  var default_track_period = 12;//in hours
  
  
  self.Init = function(){
    Init_DateTimeFileds();
    Init_DateTimePickers();
  };
  
  /**
   * @returns {number}
   */
  self.GetPeriodFromStamp = function(){
    return date_from.stamp;
  };
  /**
   * @returns {number}
   */
  self.GetPeriodToStamp = function(){
    return date_to.stamp;
  };
  
  
  function Init_DateTimePickers(){
    
    var date_picker_options = {
      format   : 'DD/MM/YYYY HH:mm',
      lang     : 'ru',
      weekStart: 1
    };
    
    date_from.el = $( '#id_input_date_from' );
    date_to.el   = $( '#id_input_date_to' );
    
    date_from.el.bootstrapMaterialDatePicker(
      date_picker_options ).on( 'change', OnDatePickerChange_From );
    
    date_to.el.bootstrapMaterialDatePicker(
      date_picker_options ).on( 'change', OnDatePickerChange_To );
    
    
    date_from.el.val( FormatTimeStamp_DatePicker( date_from.date ) );
    date_to.el.val( FormatTimeStamp_DatePicker( date_to.date ) );
    
    
    $( ".dtp-select-year-before" ).text( "◄" );
    $( ".dtp-select-year-after" ).text( "►" );
    
    $( ".dtp-select-month-before" ).text( "◄" );
    $( ".dtp-select-month-after" ).text( "►" );
    
    $( ".dtp-close" ).empty();
    $( ".dtp-btn-cancel" ).text( "ОТМЕНА" );
  }
  
  function Init_DateTimeFileds(){
    var tmp_date = new Date();
    SetDate( date_to, tmp_date.getTime() );
    tmp_date.setHours( tmp_date.getHours() - default_track_period );
    SetDate( date_from, tmp_date.getTime() );
  }
  
  function SetDate( date_obj, date_stamp ){
    date_obj.stamp = date_stamp;
    date_obj.date  = new Date( date_obj.stamp );
    date_obj.str   = FormatTimeStamp( date_obj.stamp );
  }
  
  function OnDatePickerChange_From( e, date ){
    date_to.el.bootstrapMaterialDatePicker( 'setMinDate', date );
    console.log( "OnDatePickerChange_From" );
    SetDate( date_from, date._d.getTime() );
  }
  
  function OnDatePickerChange_To( e, date ){
    console.log( "OnDatePickerChange_To" );
    SetDate( date_to, date._d.getTime() );
  }
  
  
  return self;
};