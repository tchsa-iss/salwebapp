<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 15:42:05
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-01-22 16:18:44
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

    public function createSupervisor($userId, $reportingUnitId)
    {
        $sqlCheck = "SELECT UserID
                FROM Supervisors
                WHERE Supervisors.UserID = ? AND Supervisors.ReportingUnitID = ?";

        $sqlInsert = "INSERT INTO Supervisors (UserID, ReportingUnitID)
                        VALUES(?, ?)";

        $params = array($userId, $reportingUnitId);

        $stmt = sqlsrv_query($this->salDB, $sqlCheck, $params);

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
        return true;
    }

    public function deleteSupervisor($supervisorId)
    {
        $query = "DELETE FROM Supervisors
                    WHERE ID = ?";

        $params = array($supervisorId);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

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
        $this->logger->info("Deleted SupervisorID $supervisorId");
        return true;
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
     
        $tsqlCallNewUserInsert = "{call [Users.insertNewUser](?,?,?,?,?,?,?,?,?,?)}";

        $jobTitle = (int)$user->jobTitle;

        $params = array(array($user->username, SQLSRV_PARAM_IN),
            array($user->timeIpsID,SQLSRV_PARAM_IN),
            array($user->firstName,SQLSRV_PARAM_IN),
            array($user->middleName,SQLSRV_PARAM_IN),
            array($user->lastName,SQLSRV_PARAM_IN),
            array($user->number,SQLSRV_PARAM_IN),
            array($user->cell,SQLSRV_PARAM_IN), 
            array($jobTitle,SQLSRV_PARAM_IN), 
            array($user->email,SQLSRV_PARAM_IN), 
            array($user->serviceUnit,SQLSRV_PARAM_IN));

        $stmt = sqlsrv_query($this->salDB, $tsqlCallNewUserInsert, $params);

        if ($stmt === false) {
            $this->logger->error("error creating user: $user->username");
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->logger->error($error[ 'SQLSTATE']);
                    $this->logger->error($error[ 'code']);
                    $this->logger->error($error[ 'message']);
                }
            }
            return 2;
        }
        return true;
    }

		// $sql = "INSERT INTO Users(Username, TimeIpsID, FirstName, MiddleName, LastName, PhoneNumber, CellPhoneNumber, JobTitle, Email, LastLoginDate)
		// 			VALUES(?,?,?,?,?,?,?,?,?,(GETDATE()))";

  //       $jobTitle = (int)$user->jobTitle;
  //       //$stmt = sqlsrv_prepare($this->salDB, $sql, array($user->user))
  //       $params = array($user->username, $user->timeIpsID, $user->firstName,$user->middleName, $user->lastName, $user->number, $user->cell, $jobTitle, $user->email);
  //       $stmt = sqlsrv_query($this->salDB, $sql, $params);

  //       if ($stmt === false) {
  //           $this->logger->error("error creating user: $user->username");
  //           if( ($errors = sqlsrv_errors() ) != null) {
  //               foreach( $errors as $error ) {
  //                   $this->logger->error($error[ 'SQLSTATE']);
  //                   $this->logger->error($error[ 'code']);
  //                   $this->logger->error($error[ 'message']);
  //               }
  //           }
  //           return false;
  //       }
  //       $this->logger->info("successful create of new user: $user->username");
  //       $lastInsertQuery = "SELECT TOP 1 UserID as id FROM Users ORDER BY UserID DESC";

  //       $stmt2 = sqlsrv_query($this->salDB, $lastInsertQuery);
  //       if(!$stmt2) {
  //           $this->logger->error("error getting last user: $user->username");
  //           if( ($errors = sqlsrv_errors() ) != null) {
  //               foreach( $errors as $error ) {
  //                   $this->logger->error($error[ 'SQLSTATE']);
  //                   $this->logger->error($error[ 'code']);
  //                   $this->logger->error($error[ 'message']);
  //               }
  //           }
  //       }
  //       $obj = sqlsrv_fetch_object($stmt2);
  //       return $obj;
//	}

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

    public function getUserReportingUnit($userId)
    {
        $query = "SELECT ru.ReportingUnitID
                    FROM UserReportingUnits ru
                    WHERE ru.UserID = ?";

        $params = array($userId);
        
         $stmt = sqlsrv_query($this->salDB, $query, $params);

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
        $obj = sqlsrv_fetch_object($stmt);  
        return $obj->ReportingUnitID;       
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

    public function getAllSupervisors()
    {
        $query = "SELECT sup.ID, sup.UserID, u.FirstName, u.LastName, ReportingUnits.Name as 'ReportingUnit', ReportingUnits.Code, sup.CreateDate, sup.IsActive
                    FROM Supervisors as sup
                    JOIN ReportingUnits
                    ON ReportingUnits.ReportingUnitID = sup.ReportingUnitID
                    JOIN Users as u
                    ON u.UserID = sup.UserID";

        $stmt = sqlsrv_query($this->salDB, $query);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("Could not get all Supervisors: ");
            return false;
        }
        $supervisors = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            if ($row["IsActive"] === 1) {
                $row["IsActive"] = "Yes";
            }
            if ($row["IsActive"] === 0) {
                $row["IsActive"] = "No";
            }
            array_push($supervisors, $row);
        }
        return $supervisors;
    }

    public function getSupervisorWith($id)
    {
        $query = "SELECT sup.ID, sup.UserID, u.FirstName, u.LastName, ReportingUnits.Name as 'ReportingUnit', ReportingUnits.Code, sup.CreateDate, sup.IsActive
                    FROM Supervisors as sup
                    JOIN ReportingUnits
                    ON ReportingUnits.ReportingUnitID = sup.ReportingUnitID
                    JOIN Users as u
                    ON u.UserID = sup.UserID
                    WHERE sup.ID = ?";

        $params = array($id);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("Could not find user: " + $userId + "May need to register");
            return false;
        }
        $supervisor = sqlsrv_fetch_object($stmt);

        return $supervisor;
    }

    public function getSupervisor($userId)
    {
        $query = "SELECT sup.ID, sup.UserID, u.FirstName, u.LastName, ReportingUnits.Name as 'ReportingUnit', ReportingUnits.Code, sup.CreateDate, sup.IsActive
                    FROM Supervisors as sup
                    JOIN ReportingUnits
                    ON ReportingUnits.ReportingUnitID = sup.ReportingUnitID
                    JOIN Users as u
                    ON u.UserID = sup.UserID
                    WHERE sup.UserID = ?";

        $params = array($userId);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("Could not find user: " + $userId + "May need to register");
            return false;
        }
        $supervisor = sqlsrv_fetch_object($stmt);

        return $supervisor;
    }

    public function getSupervisorTeamMembers($supervisorId)
    {
        $query = "SELECT u.UserID, u.Username, u.FirstName, u.MiddleName, u.LastName, u.PhoneNumber, u.CellPhoneNumber, JobTitles.Name as 'Job Title', ReportingUnits.Name as 'Reporting Unit', Email, u.SupervisorID, LastLoginDate, u.IsActive
                    FROM Supervising
                    JOIN Users as u
                    ON
                    u.UserID = Supervising.UserID
                    JOIN UserReportingUnits
                    ON UserReportingUnits.UserID = u.UserID
                    JOIN ReportingUnits
                    ON ReportingUnits.ReportingUnitID = UserReportingUnits.ReportingUnitID
                    JOIN JobTitles
                    ON JobTitles.TitleID = u.JobTitle
                    WHERE Supervising.SupervisorID = ?";

        $params = array($supervisorId);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("no supervisors for: $supervisorId");
            return false;
        }
        $supervisors = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            if ($row["IsActive"] === 1) {
                $row["IsActive"] = "Yes";
            }
            if ($row["IsActive"] === 0) {
                $row["IsActive"] = "No";
            }
            array_push($supervisors, $row);
        }
        return $supervisors;
    }

    public function getUsersSupervisors($userId)
    {
        $query = "SELECT sv.SupervisorID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.IsActive
                    FROM Supervising sv
                    JOIN Supervisors sup
                    ON sup.ID = sv.SupervisorID
                    JOIN Users u
                    ON u.UserID = sup.UserID
                    WHERE sv.UserID = ?";

        $params = array($userId);

        $stmt = sqlsrv_query($this->salDB, $query, $params);

        if (!$stmt) {
            // no user returned; they need to be redirected to register with esal db
            $this->logger->error("no supervisors for: $userId");
            return 1;
        }
        $supervisors = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            if ($row["IsActive"] === 1) {
                $row["IsActive"] = "Yes";
            }
            if ($row["IsActive"] === 0) {
                $row["IsActive"] = "No";
            }
            array_push($supervisors, $row);
        }
        if (count($supervisors) === 0) {
            return 2;
        }
        return $supervisors;
    }

    public function getSupervisorTeam($id) {

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
        $query = "SELECT Roles.ID, Roles.Name, Roles.DisplayName, Roles.Description
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

    public function assignEmployee($employeeId, $supervisorId)
    {
        $sql = "INSERT INTO Supervising (SupervisorID, UserID)
                VALUES(?, ?)";

        $params = array($supervisorId, $employeeId);
        
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

    public function updateUserSpervisor($employeeId, $supervisorId)
    {
        $sql = "UPDATE Users
                SET SupervisorID = ?
                WHERE Users.UserID = ?";

        $params = array($supervisorId, $employeeId);
        
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

    public function deleteSupervisorFrom($employeeId, $supervisorId)
    {
        $sql = "DELETE FROM Supervising
                WHERE Supervising.SupervisorID = ? AND Supervising.UserID = ?";

        $params = array($supervisorId, $employeeId);
        
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
}