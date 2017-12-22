<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 15:42:05
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2017-12-21 15:11:04
 */

namespace SAL\Api;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;

/**
* Sal database api
*/
class SalDBApi
{

	private $salDB;
	private $logger;

	public function __construct()
	{
		$jsonFormatter = new JsonFormatter();
		$stream = new StreamHandler( __DIR__ . getenv("SAL_API_LOG"), Logger::DEBUG);
    	$stream->setFormatter($jsonFormatter);

   		$this->logger = new Logger("SalApiLog");
    	$this->logger->pushHandler($stream);

		$serverHost = getenv("TCHSA_DB01_HOST");
        $connectionInfo = array(
        	"Database" => getenv("TCHSA_DB01_SAL"),
        	"ReturnDatesAsStrings" => true
        );
        try {
             $salDBConnection = sqlsrv_connect($serverHost, $connectionInfo);
             if ($salDBConnection) {
                $this->salDB = $salDBConnection;
            }
            else {
                //die( print_r( sqlsrv_errors(), true));
                $this->logger->error("Could not connect to: " . $serverHost);
            }
        } catch(Exception $error) {
            $this->logger->error("connection Error", array($serverHost => $error->getMessage() ));
        }
	}

	public function createNewUser($user)
	{
		// [UserID],[Username],[TimeIpsID],[FirstName],[MiddleName],[LastName],[PhoneNumber] ,[CellPhoneNumber],[JobTittle],[Email],[CreateDate],[LastLoginDate],[IsActive]
		$sql = "INSERT INTO Users(Username, TimeIpsID, FirstName, MiddleName, LastName, PhoneNumber, CellPhoneNumber, JobTitle, Email, LastLoginDate)
					VALUES(?,?,?,?,?,?,?,?,?,(GETDATE()))";

        $jobTitle = (int)$user->jobTitle;
        //$stmt = sqlsrv_prepare($this->salDB, $sql, array($user->user))
        $params = array($user->username, $user->timeIpsID, $user->firstName,$user->middleName, $user->lastName, $user->number, $user->cell, $jobTitle, $user->email);
        $stmt = sqlsrv_query($this->salDB, $sql, $params);

        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->logger->error($error[ 'SQLSTATE']);
                    $this->logger->error($error[ 'code']);
                    $this->logger->error($error[ 'message']);
                }
            }
            return false;
        }
        return true;
	}

	public function getUser($username)
	{
		$query = "SELECT *
                    FROM Users
                    WHERE Username = ?";

        $params = array($username);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("Could not find user: " + $username + "May need to register");
            return false;
        }
        $user = sqlsrv_fetch_object($stmt);

        return $user;
	}

    public function getUserRoles($userID)
    {
        $query = "SELECT Roles.Name, Roles.DisplayName, Roles.Description
            FROM Roles
            JOIN UserRole ON UserRole.UserID = ? AND UserRole.RoleID = Roles.ID
        ";
        $params = array($userID);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // bad request log this
        }
        $roles = [];
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($roles, $row);
        }
        return $roles;
    }

	public function getEmployeeTitles()
    {
        // if (Env::get('DEBUG')) {
        //     return array("Name" => "this is a title");
        // }

    	$query = "SELECT TitleID as id, Name as name
    			FROM JobTitles";

    	$result = sqlsrv_query($this->salDB, $query);
    	$titles = array();
    	while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC) ) {
      		array_push($titles, $row);
		}
		return $titles;
    }

    public function getEmployeeTitleForID($id)
    {
        $query = "SELECT Name, Description
            FROM JobTitles
            WHERE JobTitles.TitleID = ?
        ";

        $params = array($id);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // handle error
        }

        return sqlsrv_fetch_object($stmt);
    }

    public function getServiceUnits() {
    	$query = "SELECT ReportingUnitID as id, Name as name
    			FROM ReportingUnits";

    	$result = sqlsrv_query($this->salDB, $query);
    	$units = array();
    	while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC) ) {
      		array_push($units, $row);
		}
		return $units;
    }
}