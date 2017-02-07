<?php
//--------------------------------------------------------------------
logger( "----------------------------------------------------------" );
logger( "IP: " . GetUserIp() . " | POST: " . $_POST['request'] );

//var_error_log( $_POST );

$out = new Out();
$engine = new Engine();

$engine->DoAction();
//--------------------------------------------------------------------


//--------------------------------------------------------------------
abstract class Requests{
	const CONNECT_DB = "CONNECT_DB";
	const LOGIN = "LOGIN";

	const GET_LAST_POINT = "GET_LAST_POINT";
	const GET_SESSIONS = "GET_SESSIONS";
	const GET_SESSION_POINTS = "GET_SESSION_POINTS";
	const GET_POINTS = "GET_POINTS";
	const GET_POINTS_100 = "GET_POINTS_100";
	const GET_POINTS_LAST = "GET_POINTS_LAST";
	const GET_POINTS_BY_PERIOD = "GET_POINTS_BY_PERIOD";
	const GET_POINTS_BY_PERIOD_COUNT = "GET_POINTS_BY_PERIOD_COUNT";

	const SYNC_POINTS = "SYNC_POINTS";
}//Requests
//--------------------------------------------------------------------
abstract class ReplyCodes{
	const SUCCESS = "SUCCESS";
	const FAIL = "FAIL";
	const FAIL_PARAMS = "FAIL_PARAMS";
	const FAIL_DATA = "FAIL_DATA";

	const IDENTITY_NFOUND = "IDENTITY_NFOUND";
	const HOST_NFOUND = "HOST_NFOUND";
	const LAST_POINT_NFOUND = "LAST_POINT_NFOUND";

	const USER_EMAIL_NFOUND = "USER_EMAIL_NFOUND";
	const USER_PASSWORD_NMATCH = "USER_PASSWORD_NMATCH";
}//Replies
//--------------------------------------------------------------------


//--------------------------------------------------------------------
class Engine{
	private $request;
	private $db = null;
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function Engine(){

		$this->request = $_POST['request'];

		if( $this->request == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if

		$this->db = new DataBase();

	}//Engine
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function DoAction(){

		switch( $this->request ){

			case Requests::LOGIN:
				$this->Login();
				break;

			case Requests::GET_LAST_POINT:
				$user_id = $_POST['user_id'];
				$this->GetLastPoint( $user_id );
				break;

			case Requests::GET_SESSIONS:
				$user_id = $_POST['user_id'];
				$this->GetSessions( $user_id );
				break;

			case Requests::GET_SESSION_POINTS:
				$user_id = $_POST['user_id'];
				$session_id = $_POST['session_id'];
				$this->GetSessionPoints( $user_id, $session_id );
				break;

			case Requests::GET_POINTS:
				$this->GetPoints();
				break;

			case Requests::GET_POINTS_100:
				$this->GetPoints_100();
				break;

			case Requests::GET_POINTS_LAST:
				$this->GetPointsLast();
				break;

			case Requests::GET_POINTS_BY_PERIOD:
				$this->GetPointsByPeriod();
				break;

			case Requests::GET_POINTS_BY_PERIOD_COUNT:
				$this->GetPointsByPeriodCount();
				break;

			case Requests::SYNC_POINTS:
				$this->SyncPoints();
				break;
		}//switch

	}//DoAction
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	private function Login(){

		$user_email = $_POST['user_email'];
		$user_password = $_POST['user_password'];


		if( $user_email == null ){
			Out::Finish_JSON( $this->request, ReplyCodes::FAIL_DATA,
				"Login failed", "User email was not provided"
			);//Out
		}//if no user email was provided


		if( $user_password == null ){
			Out::Finish_JSON( $this->request, ReplyCodes::FAIL_DATA,
				"Login failed", "User password was not provided"
			);//Out

		}//if no user password was provided


		$result = $this->db->GetUserByEmail( $user_email );

		$user_data = null;


		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$user_data = $row;
			break;
		}//whilte


		$result->free();


		//is user exists?
		if( $user_data == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::USER_EMAIL_NFOUND,
				"", ""
			);//Out
		}//user was not found


		//Does password match?
		if( strcmp( $user_password, $user_data["password"] ) !== 0 ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::USER_PASSWORD_NMATCH,
				"", ""
			);//Out
		}//user was not found


		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			"", ""
		);//Out

	}//Login
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	private function GetLastPoint( $user_id ){


		if( $user_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id was provided

		$result = $this->db->GetLastPoint( $user_id );


		$user_last_point = null;

		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$user_last_point = $row;
			break;
		}//whilte

		$result->free();

		if( $user_last_point == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::LAST_POINT_NFOUND,
				"", ""
			);//Out
		}//user was not found

		$response_data = array( "user_last_point" => $user_last_point );


		Out::Finish_JSON(
			$this->request,
			ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out

	}//GetLastPoint
	//------------------------------------------------------------------
	private function GetSessions( $user_id ){


		if( $user_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id was provided


		$result = $this->db->GetSessions( $user_id );


		if( $result == false ){
			Out::Finish_JSON( $this->request, ReplyCodes::FAIL_DATA,
				"failed to get data", ""
			);//Out
		}//if failed to get data


		$sessions = array();

		$counter = 0;


		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$sessions[$counter++] = $row;
		}//whilte


		$result->free();

		$response_data = array( "sessions" => $sessions );


		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out


	}//GetSessions
	//------------------------------------------------------------------
	private function GetSessionPoints( $user_id, $session_id ){

		if( $user_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id was provided

		if( $session_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id was provided


		$result = $this->db->GetSessionPoints( $user_id, $session_id );

		if( $result == false ){
			Out::Finish_JSON( $this->request, ReplyCodes::FAIL_DATA,
				"failed to get data", ""
			);//Out
		}//if failed to get data


		$points = array();

		$counter = 0;

		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$points[$counter++] = $row;
		}//whilte

		$result->free();

		$response_data = array( "points" => $points );


		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out

	}//GetSessions
	//------------------------------------------------------------------
	private function GetPoints(){

		$user_id = $_POST['user_id'];

		if( $user_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);

		}//if no user id was provided


		$result = $this->db->GetPoints( $user_id );


		if( $result == false ){
			Out::Finish_JSON( $this->request, ReplyCodes::FAIL_DATA,
				"failed to get data", ""
			);//Out
		}//if failed to get data


		$points = array();
		$counter = 0;


		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$points[$counter++] = $row;
		}//whilte


		$result->free();

		$response_data = array( "points" => $points );


		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out

	}
	//------------------------------------------------------------------
	private function GetPoints_100(){

		$user_id = $_POST['user_id'];

		if( $user_id == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id or timestamp last was provided

		$result = $this->db->GetPoints_100( $user_id );

		if( $result == false ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", "failed to get data"
			);//Out
		}//if failed to get data

		$points = array();
		$counter = 0;

		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$points[$counter++] = $row;
		}//whilte

		$result->free();
		$response_data = array( "points" => $points );

		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out
	}
	//------------------------------------------------------------------
	private function GetPointsLast(){

		$user_id = $_POST['user_id'];
		$timestamp_first = $_POST['timestamp_first'];

		if( $user_id == null || $timestamp_first == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id or timestamp last was provided

		$result = $this->db->GetPointsLast( $user_id, $timestamp_first );

		if( $result == false ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", "failed to get data"
			);//Out
		}//if failed to get data

		$points = array();
		$counter = 0;

		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$points[$counter++] = $row;
		}//whilte

		$result->free();
		$response_data = array( "points" => $points );

		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out
	}
	//------------------------------------------------------------------
	private function GetPointsByPeriod(){

		$user_id = $_POST['user_id'];
		$stamp_from = $_POST['stamp_from'];
		$stamp_to = $_POST['stamp_to'];
		$limit_from = $_POST['limit_from'];
		$limit = $_POST['limit'];

		if( $user_id == null ||
			$stamp_from == null ||
			$stamp_to == null ||
			$limit_from == null ||
			$limit == null
		){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_PARAMS,
				"", ""
			);
		}//if wrong params were provided

		$result = $this->db->GetPointsByPeriod(
			$user_id, $stamp_from, $stamp_to, $limit_from, $limit );

		if( $result == false ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", "failed to get data"
			);//Out
		}//if failed to get data

		$points = array();
		$counter = 0;

		while( $row = $result->fetch_array( MYSQLI_ASSOC ) ){
			$points[$counter++] = $row;
		}//whilte

		$result->free();
		$response_data = array( "points" => $points );

		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out
	}
	//------------------------------------------------------------------
	private function GetPointsByPeriodCount(){

		$user_id = $_POST['user_id'];
		$stamp_from = $_POST['stamp_from'];
		$stamp_to = $_POST['stamp_to'];

		if( $user_id == null || $stamp_from == null || $stamp_to == null ){
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id or timestamp last was provided

		$count = $this->db->GetPointsByPeriodCount(
			$user_id, $stamp_from, $stamp_to );

		$response_data = array( "count" => $count );

		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out
	}
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	private function SyncPoints(){

		//logger( "SyncPoints()" );
		$points_to_sync = json_decode( $_POST['points_to_sync'], true );

		if( $points_to_sync == null ){
			//logger( "ReplyCodes::FAIL_DATA 1" );
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", ""
			);
		}//if no user id was provided

		$points_synced = array();
		$result = true;

		//logger( "foreach started" );
		foreach( $points_to_sync as $point_to_sync ){

			$result = $this->db->SyncPoints( $point_to_sync );

			if( $result == true ){

				$points_synced[] = array(
					"id" => $point_to_sync["id"],
					"id_user" => $point_to_sync["id_user"] );

			}else{
				break;
			}//if

		}//foreach
		//logger( "foreach ended" );

		if( $result == false ){
			//logger( "ReplyCodes::FAIL_DATA 2" );
			Out::Finish_JSON(
				$this->request, ReplyCodes::FAIL_DATA,
				"", "failed to sync data"
			);//Out

		}//if failed to sync data


		$response_data = array( "points_synced" => $points_synced );

		//logger( "Out::Finish_JSON SUCCESS" );
		Out::Finish_JSON(
			$this->request, ReplyCodes::SUCCESS,
			$response_data, ""
		);//Out
	}//GetPoints
	//------------------------------------------------------------------
}
//--------------------------------------------------------------------


//--------------------------------------------------------------------
class DataBase{
	//------------------------------------------------------------------
	private $db_connect_host = 'localhost';
	private $db_connect_database = 'tracker';
	private $db_connect_user = 'tracker_user';
	private $db_connect_password = 'Afs928kfh';

	private $mysqli = null;
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function ConnectToDB(){

		$this->mysqli = new mysqli(
			$this->db_connect_host,
			$this->db_connect_user,
			$this->db_connect_password,
			$this->db_connect_database
		);//new


		if( $this->mysqli->connect_errno ){

			$error_descr = $this->mysqli->connect_error .
				" (" . $this->mysqli->connect_errno . ")";

			Out::Finish_JSON(
				Requests::CONNECT_DB,
				ReplyCodes::FAIL,
				null,
				$error_descr
			);

			$this->DisconnectFromDB();
		}//if connection to db failes

	}//ConnectToDB
	//------------------------------------------------------------------
	public function DisconnectFromDB(){

		if( $this->mysqli != null ){
			$this->mysqli->close();
		}//if

		$this->mysqli = null;
	}//DisconnectFromDB
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function GetUserByEmail( $user_email ){

		$this->ConnectToDB();

		$email = $this->mysqli->real_escape_string( $user_email );

		$query =
			"SELECT id_user, password " .
			"FROM tracker_users " .
			"WHERE email = '" . $email . "'";

		$result = $this->mysqli->query( $query );

		$this->DisconnectFromDB();

		return $result;
	}//GetUserByEmail
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function GetLastPoint( $id_user ){

		$this->ConnectToDB();

		$user = $this->mysqli->real_escape_string( $id_user );

		$query = "CALL GetUserLastPoint_v1(" . $user . ")";

		$result = $this->mysqli->query( $query );

		$this->DisconnectFromDB();

		return $result;
	}//GetLastPoint
	//------------------------------------------------------------------
	public function GetSessions( $id_user ){

		$this->ConnectToDB();

		$user = $this->mysqli->real_escape_string( $id_user );

		$query = "CALL GetSessions_v1(" . $user . ", 15)";

		$result = $this->mysqli->query( $query );

		$this->DisconnectFromDB();

		return $result;
	}//GetSessions
	//------------------------------------------------------------------
	public function GetSessionPoints( $id_user, $id_session ){

		$this->ConnectToDB();

		$session = $this->mysqli->real_escape_string( $id_session );
		$user = $this->mysqli->real_escape_string( $id_user );


		$query = "CALL GetSessionPoints_v1("
			. $session . "," . $user . ", 10000)";

		$result = $this->mysqli->query( $query );

		$this->DisconnectFromDB();

		return $result;
	}
	//------------------------------------------------------------------
	public function GetPoints( $id_user ){

		$query =
			"SELECT accuracy, timestamp, longitude, latitude  " .
			"FROM tracker_track_points " .
			"WHERE id_user = '" . $id_user . "'";

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		return $result;
	}
	//------------------------------------------------------------------
	public function GetPoints_100( $id_user ){

		$query = "SELECT accuracy, timestamp, longitude, latitude " .
			" FROM tracker_track_points " .
			" WHERE id_user = '" . $id_user . "'" .
			" ORDER BY timestamp DESC" .
			" LIMIT 3000";

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		return $result;
	}
	//------------------------------------------------------------------
	public function GetPointsLast( $id_user, $timestamp_first ){

		$query = "SELECT accuracy, timestamp, longitude, latitude " .
			" FROM tracker_track_points " .
			" WHERE id_user = '" . $id_user . "' AND timestamp >= '" . $timestamp_first . "'" .
			" ORDER BY timestamp DESC" .
			" LIMIT 3000";

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		return $result;
	}
	//------------------------------------------------------------------
	public function GetPointsByPeriod( $id_user, $stamp_from, $stamp_to, $limit_from, $limit ){

		$query = "SELECT accuracy, timestamp, longitude, latitude " .
			" FROM tracker_track_points " .
			" WHERE id_user = '" . $id_user .
			"' AND timestamp >= '" . $stamp_from .
			"' AND timestamp <= '" . $stamp_to . "'" .
			" ORDER BY timestamp DESC" .
			" LIMIT " . $limit_from . ", " . $limit;

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		return $result;
	}
	//------------------------------------------------------------------


	//------------------------------------------------------------------
	public function SyncPoints( $point_to_sync ){

		/*
	if( $this->IsExists( $point_to_sync ) ){
		return true;
	}//if
		*/


		/*
		$point = array(
			"id_user" => 111,
			"timestamp" => 1462814332691,
			"accuracy" => 20,
			"latitude" => 50.4885346,
			"longitude" => 30.5855137
		);
		*/


		$query =
			"INSERT IGNORE INTO  `tracker_track_points` (" .
			"`id_user`," .
			"`timestamp`," .
			"`accuracy`," .
			"`latitude`," .
			"`longitude`" .
			")" .
			" VALUES (" .
			"'" . $point_to_sync["id_user"] . "', " .
			"'" . $point_to_sync["timestamp"] . "', " .
			"'" . $point_to_sync["accuracy"] . "', " .
			"'" . $point_to_sync["latitude"] . "', " .
			"'" . $point_to_sync["longitude"] . "')";


		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		return $result;
	}//GetPoints
	//------------------------------------------------------------------

	//------------------------------------------------------------------
	public function GetPointsByPeriodCount( $id_user, $stamp_from, $stamp_to ){

		$query = "SELECT COUNT(*) AS count " .
			" FROM tracker_track_points " .
			" WHERE id_user = '" . $id_user .
			"' AND timestamp >= '" . $stamp_from .
			"' AND timestamp <= '" . $stamp_to . "'";

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();

		$count_data = $result->fetch_array( MYSQLI_ASSOC );

		$result->free();

		return $count_data["count"];
	}
	//------------------------------------------------------------------
	public function IsExists( $point ){

		/*
		$point = array(

			"id" => 3,
			"id_user" => 1111,
			"timestamp" => 1462814332691,
			"accuracy" => 20,
			"latitude" => 50.4885346,
			"longitude" => 30.5855137
		);
		*/

		$query =
			"SELECT id_user, timestamp " .
			"FROM tracker_track_points " .
			"WHERE id_user = '" . $point["id_user"] . "' AND " .
			"timestamp = '" . $point["timestamp"] . "'";

		$this->ConnectToDB();
		$result = $this->mysqli->query( $query );
		$this->DisconnectFromDB();


		$row = $result->fetch_array( MYSQLI_ASSOC );

		if( $row == null ){
			return false;
		}//if

		return true;
	}
	//------------------------------------------------------------------

}//DataBase
//DataBase------------------------------------------------------------


//--------------------------------------------------------------------
class Out{
	//------------------------------------------------------------------
	public static function Finish_JSON( $request, $reply, $data, $descr ){

		$msg_arr = array(
			'request' => $request,
			'reply' => $reply,
			'data' => $data,
			'descr' => $descr,
		);

		$msg = json_encode( $msg_arr );
		//logger( "Finish_JSON" . $msg );

		Out::Finish( $msg );
	}
	//------------------------------------------------------------------
	public static function Finish( $msg ){
		echo $msg;
		exit;
	}
	//Finish------------------------------------------------------------
}
//Out-----------------------------------------------------------------


//--------------------------------------------------------------------
function GetUserIp(){

	if( !empty( $_SERVER['HTTP_CLIENT_IP'] ) ){
		$ip = $_SERVER['HTTP_CLIENT_IP'];
	}elseif( !empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ){
		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	}else{
		$ip = $_SERVER['REMOTE_ADDR'];
	}
	return $ip;
}

//GetUserIp-----------------------------------------------------------

//--------------------------------------------------------------------
function var_error_log( $object = null ){
	ob_start();                   // start buffer capture
	var_dump( $object );            // dump the values
	$contents = ob_get_contents();// put the buffer into a variable
	ob_end_clean();               // end capture
	logger( $contents );            // log contents of the result of var_dump( $object )

}//var_error_log
//var_error_log-------------------------------------------------------
function logger( $msg ){
	error_log( date( "Y-m-d H:i:s" ) . " " . $msg . "\n", 3, "errors.log" );
	//error_log("eric", 3, "errors.log");
	//error_log("eric", 3, "/errors.log");
	//error_log("eric", 3, "/var/www/admin/data/www/fantomsoftware.com/frontend/web/fantom_tracker/errors.log");
}//log
//logger--------------------------------------------------------------