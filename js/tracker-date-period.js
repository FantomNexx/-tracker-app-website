var TrackerPeriod = function(){
  
  var period_from = {
    str   : "",
    date  : undefined,
    stamp : 0,
    el    : undefined
  };
  var period_to   = {
    str   : "",
    date  : undefined,
    stamp : 0,
    el    : undefined
  };
  
  var default_track_period = 12;//in hours
  
  
  self.Init = function(){
    Init_DateTimePickers();
    Init_DateTimeFileds();
  };//Init
  
  
  self.SetDatePeriod = function( date_from, date_to ){
    
    SetDate( period_from, date_from.getTime() );
    SetDate( period_to, date_to.getTime() );
    
    period_from.el.val(
      FormatTStamp_Short( period_from.date ) );
    
    period_to.el.val(
      FormatTStamp_Short( period_to.date ) );
    
  };//SetDatePeriod
  
  
  /**
   * @returns {number}
   */
  self.GetPeriodFromStamp = function(){
    return period_from.stamp;
  };//GetPeriodFromStamp
  
  /**
   * @returns {number}
   */
  self.GetPeriodToStamp = function(){
    return period_to.stamp;
  };//GetPeriodToStamp
  
  
  function Init_DateTimePickers(){
    
    var date_picker_options = {
      format    : 'DD/MM/YYYY HH:mm',
      lang      : 'ru',
      weekStart : 1
    };
    
    period_from.el = $( '#id_input_date_from' );
    period_to.el   = $( '#id_input_date_to' );
    
    period_from.el.bootstrapMaterialDatePicker(
      date_picker_options ).on(
      'change', OnDatePickerChange_From );
    
    period_to.el.bootstrapMaterialDatePicker(
      date_picker_options ).on(
      'change', OnDatePickerChange_To );

    
    $( ".dtp-select-year-before" ).text( "◄" );
    $( ".dtp-select-year-after" ).text( "►" );
    
    $( ".dtp-select-month-before" ).text( "◄" );
    $( ".dtp-select-month-after" ).text( "►" );
    
    $( ".dtp-close" ).empty();
    $( ".dtp-btn-cancel" ).text( "ОТМЕНА" );
  }//Init_DateTimePickers
  
  
  function Init_DateTimeFileds(){
    var tmp_date = new Date();
    SetDate( period_to, tmp_date.getTime() );
    
    tmp_date.setHours(
      tmp_date.getHours() - default_track_period );
    
    SetDate( period_from, tmp_date.getTime() );
  }//Init_DateTimeFileds
  
  
  function SetDate( date_obj, date_stamp ){
    date_obj.stamp = date_stamp;
    date_obj.date  = new Date( date_obj.stamp );
    date_obj.str   = FormatTStamp_Long( date_obj.stamp );
    date_obj.el.val( FormatTStamp_Short( date_obj.date ) );
  }//SetDate
  
  
  function OnDatePickerChange_From( e, date ){
    period_to.el.bootstrapMaterialDatePicker( 'setMinDate', date );
    console.log( "OnDatePickerChange_From" );
    SetDate( period_from, date._d.getTime() );
  }//OnDatePickerChange_From
  
  
  function OnDatePickerChange_To( e, date ){
    console.log( "OnDatePickerChange_To" );
    SetDate( period_to, date._d.getTime() );
  }//OnDatePickerChange_To
  
  
  return self;
};//TrackerPeriod