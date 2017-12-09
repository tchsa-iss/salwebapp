<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-05 08:27:46
 * @Last Modified by:   iss_roachd
 * @Last Modified time: 2017-12-06 16:40:53
 */

namespace SAL\Api;

class WebAppApi {
	private $salDBConnection;
	private $logger;

	public function __construct($logger)
    {
        $this->logger = $logger;
        $serverHost = getenv("TCHSA_DB01_HOST");
        $connectionInfo = array(
        	"Database" => getenv("TCHSA_DB_SAL"),
        	"ReturnDatesAsStrings" => true

        );
        $serverName = "TCHSADB01\MSSQLESALSERVER"; // I put the string in just to make sure I didn't mess it up
        $infoData = array( "Database"=>"eSalDev", 'ReturnDatesAsStrings'=> true); 
        $salDBConnection = sqlsrv_connect($serverName, $infoData);
        if ($salDBConnection) {
        	$this->salDBConnection = $salDBConnection;
        }
        else {
        	echo "connection refused";
        	 die( print_r( sqlsrv_errors(), true));
        	$this->logger->error("Could not connect to: " . $serverName);
        }
    }

    public function getTimeIpsUserInfo($username)
    {
    	$serverName = getenv('TIMEIPS_DB_HOST');
    	$ipsUserName = getenv('TIMEIPS_DB_USER');
    	$ipsPassword = getenv('TIMEIPS_DB_PASS');

    	$connect = odbc_connect($serverName, $ipsUserName, $ipsPassword);
    	if (!$connect) {
    		return false;
    	}
    	$sql = "SELECT usersID, HID as badgeNumber, nameFirst as firstName, nameMid as nameMiddle, nameLast as lastName, phoneExt as phoneNumber, email1 as email, addr1, homePhone, cellPhone
    			FROM users
    			WHERE username = ?";
    	$result = odbc_prepare($connect, $sql);

    	$success = odbc_execute($result, array($username));
    	if ($success) {
    		$resultArray = odbc_fetch_array($result);
    		return $resultArray;
    	}
    }
    public function getCurrentUser($user)
    {

    }
    public function getEmployeeTitles()
    {
    	$query = "SELECT Name
    			FROM UserTitle";

    	$result = sqlsrv_query($this->salDBConnection, $query);
    	$titles = array();
    	while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC) ) {
      		array_push($titles, $row['Name']);
		}
		return $titles;
    }
    public function getServiceUnits() {
    	$query = "SELECT Name
    			FROM Unit";

    	$result = sqlsrv_query($this->salDBConnection, $query);
    	$units = array();
    	while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC) ) {
      		array_push($units, $row['Name']);
		}
		return $units;
    }
    private function connectToSalDatabase() {
    	if (!$this->salDBConnection) {

    	}
    }
}