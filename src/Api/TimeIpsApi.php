<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 15:42:31
 * @Last Modified by:   iss_roachd
 * @Last Modified time: 2017-12-15 16:48:37
 */
namespace SAL\Api;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;

/**
* Time Ips interface
*/
class TimeIpsApi
{
	
	private $logger;
	private $timeIpsDB;

	public function __construct()
	{
		$jsonFormatter = new JsonFormatter();
		$stream = new StreamHandler( __DIR__ . getenv("SAL_API_LOG_PATH"), Logger::DEBUG);
    	$stream->setFormatter($jsonFormatter);

   		$this->logger = new Logger("TimeIpsLog");
    	$this->logger->pushHandler($stream);

    	$serverName = getenv('TIMEIPS_DB_HOST');
    	$ipsUserName = getenv('TIMEIPS_DB_USER');
    	$ipsPassword = getenv('TIMEIPS_DB_PASS');
    	try {
    		$ipsConnection = odbc_connect($serverName, $ipsUserName, $ipsPassword);
	    	if ($ipsConnection) {
	    		$this->timeIpsDB = $ipsConnection;
	    	}
	    	else {
	    		//die( print_r( sqlsrv_errors(), true));
                $this->logger->error("Could not connect to: " . $serverName);
	    	}
    	}
    	catch (Exception $error) {
    		$this->logger->error("connection Error", array($serverHost => $error->getMessage() ));
    	}
	}
	public function getUser($username)
	{
		$sql = "SELECT usersID, HID as badgeNumber, nameFirst as firstName, nameMid as nameMiddle, nameLast as lastName, phoneExt, homePhone, email1 as email, addr1, homePhone, cellPhone
    			FROM users
    			WHERE username = ?";
    	$query = odbc_prepare($this->timeIpsDB, $sql);

    	$result = odbc_execute($query, array($username));
    	if ($result) {
    		$resultArray = odbc_fetch_array($query);
    		return $resultArray;
    	}
	}
}