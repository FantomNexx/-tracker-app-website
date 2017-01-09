//TrackerEvents///////////////////////////////////////////////////////
var TrackerEvents = function(){
  //------------------------------------------------------------------
  var self = {};

  var subscribers            = {};
  var is_inited_mouse_events = false;
  //------------------------------------------------------------------


  /**
   * @constructor InitMouseEventHandlers
   */
  self.InitMouseEventHandlers = function(){

    if( is_inited_mouse_events == true ) return;


    var html = $( 'html' );

    html.on( 'mousemove', OnEvent )
    html.on( 'mouseleave', OnEvent );
    html.on( 'mousedown', OnEvent );
    html.on( 'mouseup', OnEvent );

    is_inited_mouse_events = true;
  };

  /**
   * @constructor InitKeyboardHandlers
   */
  self.InitKeyboardHandlers = function(){
    $( document ).on( 'keyup', OnEvent );
  };

  /**
   * @param _event
   * @param _subscriber
   * @returns {*}
   * @constructor
   */
  self.SubscribeOn = function( _event, _subscriber ){

    if( subscribers[_event] == undefined ){
      subscribers[_event] = [];
    }

    if( _subscriber['callback'] == undefined ){
      return EventResults.CallbackNotFound;
    }

    RemoveSimilarSubscribers( _event, _subscriber );
    subscribers[_event].push( _subscriber );

    return EventResults.Success;
  };

  /**
   * @param _event
   * @param _subscriber
   * @returns {*}
   * @constructor
   */
  self.UnSubscribeFrom = function( _event, _subscriber ){

    if( subscribers[_event] == undefined )
      return EventResults.EventNotFound;

    RemoveSimilarSubscribers( _event, _subscriber );

    return EventResults.Success;
  };


  /**
   * @param _event_name
   * @param _data
   * @constructor
   */
  self.Trigger = function( _event_name, _data ){

    if( _event_name == undefined ) return;
    if( subscribers[_event_name] == undefined ) return;

    if( _data == undefined ){
      _data = null;
    }

    $.each( subscribers[_event_name], function( i, subscriber ){
      Call( self, subscriber['callback'], _data );
    } );
  };//Trigger

  /**
   * @param _sender
   * @param _callback
   * @param _args
   * @constructor
   */
  function Call( _sender, _callback, _args ){
    if( _callback != null || _callback != undefined ){
      _callback.call( _sender, _args );
    }
  }//Call

  /**
   * @param _e
   * @constructor
   */
  function OnEvent( _e ){

    if( subscribers[_e.type] == undefined ) return;

    $.each( subscribers[_e.type], function( i, subscriber ){
      _e.data = subscriber;
      subscriber['callback'].call( self, _e );
    } );
  }//OnEvent

  /**
   * @param _event
   * @param _subscriber
   * @returns {number}
   * @constructor
   */
  function RemoveSimilarSubscribers( _event, _subscriber ){

    var event_subscribers = subscribers[_event];

    for( var i in event_subscribers ){
      if( event_subscribers[i] === _subscriber ){
        event_subscribers = RemoveSubscriber( event_subscribers, i );
      }//if subscriver found
    }//for

    return EventResults.Success;
  }

  /**
   * @param array
   * @param from
   * @param to
   * @returns {*}
   * @constructor
   */
  var RemoveSubscriber = function( array, from, to ){

    var rest = array.slice( (to || from) + 1 || array.length );

    array.length = from < 0 ? array.length + from : from;

    return array.push.apply( array, rest );
  };

  return self;
};


//EventResults////////////////////////////////////////////////////////
var EventResults                = {};
EventResults.Success            = 1;
EventResults.CallbackNotFound   = -100;
EventResults.EventNotFound      = -200;
EventResults.SubscriberNotFound = -300;