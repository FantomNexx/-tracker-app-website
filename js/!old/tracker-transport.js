var Transport = {

  REQUESTS: {
    LOGIN: "LOGIN",

    GET_LAST_POINT    : "GET_LAST_POINT",
    GET_SESSIONS      : "GET_SESSIONS",
    GET_SESSION_POINTS: "GET_SESSION_POINTS",
    GET_POINTS_100    : "GET_POINTS_100"
  },

  REPLIES: {
    SUCCESS          : "SUCCESS",
    FAIL             : "FAIL",
    FAIL_DATA        : "FAIL_DATA",
    IDENTITY_NFOUND  : "IDENTITY_NFOUND",
    HOST_NFOUND      : "HOST_NFOUND",
    LAST_POINT_NFOUND: "LAST_POINT_NFOUND",

    USER_EMAIL_NFOUND   : "USER_EMAIL_NFOUND",
    USER_PASSWORD_NMATCH: "USER_PASSWORD_NMATCH"
  }
};//Transport


Transport.Request = function( request_data, OnRequestSuccess ){

  var ajax_request = $.ajax( {
    url     : "tracker-server.php",
    method  : "POST",
    data    : request_data,
    dataType: "html"
  } );


  if( ajax_request['done'] != undefined ){
    ajax_request['done']( function( reply ){

      if( reply == undefined ){
        console.log( "Returned reply is invalid" );
        return;
      }//if

      var obj_reply;

      try{
        obj_reply = JSON.parse( reply );
      }catch( e ){
        console.log( "Reply parse failed" );
        return
      }//try to parse a reply

      var reply_data = obj_reply["reply"];

      if( reply_data == undefined ){
        console.log( "Returned reply data is invalid" );
        return;
      }//if


      switch( obj_reply.reply ){

        //if request was not successful
        case Transport.REPLIES.FAIL:
        case Transport.REPLIES.FAIL_DATA:
        case Transport.REPLIES.IDENTITY_NFOUND:
        case Transport.REPLIES.HOST_NFOUND:

          console.log( "Request reply was unsuccessful" );

          if( obj_reply["descr"] != undefined ){
            console.log( obj_reply["descr"] );
          }//if
          break;


        case Transport.REPLIES.SUCCESS:
          OnRequestSuccess( obj_reply );
          break;
      }//switch


    } );
  }//if done function exists

  if( ajax_request['fail'] != undefined ){
    ajax_request['fail']( function( jqXHR, status ){
      console.log( "Request failed: " + status );
    } );
  }//if done function exists
};

