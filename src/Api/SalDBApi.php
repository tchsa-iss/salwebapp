<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 15:42:05
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-01-08 14:07:45
 */

namespace SAL\Api;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use Monolog\Processor\UidProcessor;
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
        $uId = new UidProcessor();

    	$stream->setFormatter($jsonFormatter);

   		$this->logger = new Logger("SalApiLog");
    	$this->logger->pushHandler($stream);
        $this->logger->pushProcessor($uId);
        $this->logger->pushProcessor(function($record) {
            $record['extra']['user'] = $_SERVER['AUTH_USER'] ?: "AUTH_USER_EMPTY";
            return $record;
        });

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

    public function createNewUserRole($role)
    {
        $sql = "SELECT UserRole.RoleID
                FROM UserRole 
                WHERE UserRole.UserID = ? AND UserRole.RoleID = ?";

        $sqlInsert = "INSERT INTO UserRole (UserID, RoleID) VALUES (?, ?)";

        $userId = (int)$role->userId;
        $userRole = (int)$role->userRoleId;
        $params = array($userId, $userRole);

        $stmt = sqlsrv_query($this->salDB, $sql, $params);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->logger->error($error[ 'SQLSTATE']);
                    $this->logger->error($error[ 'code']);
                    $this->logger->error($error[ 'message']);
                }
            }
            return 2; 
        }
        $rows = sqlsrv_has_rows($stmt);
        if ($rows) {
            return 1;
        }
        $insert = sqlsrv_query($this->salDB, $sqlInsert, $params);
        return $insert;
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
        $id = "SELECT LAST_INSERT_ID()";
        $success = $this->addReportingUnitToUser($id, $user->serviceUnit);
        if (!$success) {
            //handle error
            $this->logger->error("error creating user: $user->username");
        }
        $this->logger->info("successful create of new user: $user->username");
        return true;
	}

    public function getSalAccountCodeTypes()
    {
        $sql = "SELECT *
                FROM CodeType";

        $stmt =  sqlsrv_query($this->salDB, $sql);
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
        $types = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($types, $row);
        }
        return $types;
    }

    public function getSalAccountCodes($id)
    {
        $sql = "SELECT Codes.Code, CodeType.Name as 'Group', CodeType.Description as 'GroupDesc', Codes.Billable, Codes.Name, Codes.Description, Codes.Active
                FROM Codes
                JOIN CodeType
                ON CodeType.CodeTypeID = Codes.CodeTypeID 
                WHERE Codes.CodeTypeID = ?";

        $params = array($id);

        $stmt =  sqlsrv_query($this->salDB, $sql, $params);
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
        $codes = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($codes, $row);
        }
        return $codes;
    }

    public function getSalActivityCodes()
    {
        return false;
    }

    public function getUserReportingUnits()
    {
        $sql = "SELECT Users.FirstName, Users.LastName, RU.Name AS ReportingUnits
                FROM UserReportingUnits as UserRU
                JOIN Users ON Users.UserID = UserRU.UserID
                JOIN ReportingUnits AS RU ON RU.ReportingUnitID = UserRU.ReportingUnitID";

        $stmt =  sqlsrv_query($this->salDB, $sql);
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
        $users = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($users, $row);
        }
        return $users;
    }
    public function addReportingUnitToUser($id, $unitID)
    {
        $sql = "INSERT INTO UserReportingUnits(UserID, ReportingUnitID)
                    VALUES(?,?)";

        $params = array($id, $unitID);

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

    public function getAllEmployees() 
    {
        $query = "SELECT Users.UserID, Username, FirstName, MiddleName, LastName, PhoneNumber, CellPhoneNumber, JobTitles.Name as 'Job Title', ReportingUnits.Name as 'Reporting Unit', Email, SupervisorID, LastLoginDate, Users.IsActive
                    FROM Users
                    JOIN UserReportingUnits
                    ON UserReportingUnits.UserID = Users.UserID
                    JOIN ReportingUnits
                    ON ReportingUnits.ReportingUnitID = UserReportingUnits.ReportingUnitID
                    JOIN JobTitles
                    ON JobTitles.TitleID = Users.JobTitle";

        $stmt = sqlsrv_query($this->salDB, $query);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("Could not get all Employees: ");
            return false;
        }
        $employees = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            if ($row["IsActive"] === 1) {
                $row["IsActive"] = "Yes";
            }
            if ($row["IsActive"] === 0) {
                $row["IsActive"] = "No";
            }
            array_push($employees, $row);
        }
        //$user = sqlsrv_fetch_array($stmt);

        return array_reverse($employees);
    }
    public function getRoles()
    {
        $query = "SELECT *
                    FROM Roles";

        $stmt = sqlsrv_query($this->salDB, $query);
        if (!$stmt) {
            //handle error
        }
        $userRoles = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($userRoles, $row);
        }
        return $userRoles;
    }
    public function getAllUserRoles()
    {
        $query = "SELECT Users.Username, Users.FirstName, Users.LastName, Roles.DisplayName
                    FROM UserRole
                    JOIN Users ON UserRole.UserID = Users.UserID
                    JOIN Roles ON UserRole.RoleID = Roles.ID";

        $stmt = sqlsrv_query($this->salDB, $query);

        if(!$stmt) {
            // handle error
            return false;
        }
        $roles = [];
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($roles, $row);
        }
        return $roles;
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

    	$query = "SELECT TitleID as id, Name as name, Description
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
    	$query = "SELECT ReportingUnitID as id, Name as name, UnitAbbrev, Code, IsActive, Description
    			FROM ReportingUnits";

    	$result = sqlsrv_query($this->salDB, $query);
    	$units = array();
    	while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC) ) {
      		array_push($units, $row);
		}
		return $units;
    }
}