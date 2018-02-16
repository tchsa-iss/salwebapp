<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 15:42:31
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-15 18:10:32
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
		$stream = new StreamHandler( __DIR__ . getenv("TIME_IPS_LOG"), Logger::DEBUG);
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

    public function getEventLogTime($timeIpsUserId, $startTime, $endTime)
    {
        $totalTime = 0;
        $sql = "SELECT adjTimeIn,adjTimeOut 
                FROM eventLog 
                WHERE usersID = ?
                AND 0 
                BETWEEN 'flagIn' 
                AND 'flagOut'
                AND timeIN >= ? 
                AND timeOut <= ?
                ORDER BY eventLogID";

        $params = array($timeIpsUserId, $startTime, $endTime);

        $stmt = odbc_prepare($this->timeIpsDB, $sql);

        $success = odbc_execute($stmt, $params);

        if(!$success) {
            $this->logger->error("Error trying to get eventlog time for user: $timeIpsUserId");
            return false;
        }
        $timeInStart = 0;
        $timeOutEnd = 0;
        while(odbc_fetch_row($stmt)) {
            $timeIn = odbc_result($stmt, 1);
            $timeOut = odbc_result($stmt, 2);
            
            $timeInStart += $timeIn;
            $timeOutEnd += $timeOut;     
        }
        return array("totalTimeIn" => $timeInStart, "totalTimeOut" => $timeOutEnd);
    }
    public function getBenifitUsedTime($timeIpsUserId, $startTime, $endTime)
    {
        $sql = "SELECT approvedAmount FROM benefitRequests 
                LEFT OUTER JOIN benefitApprovals 
                ON benefitRequests.benefitRequestID = benefitApprovals.benefitRequestID 
                WHERE usageDate >= ? 
                AND usageDate <= ?
                AND usersID = ? 
                AND approvedAmount IS NOT NULL
                AND benefitApprovals.unapprovalID IS NULL";

        $params = array($startTime, $endTime, $timeIpsUserId);

        $stmt = odbc_prepare($this->timeIpsDB, $sql);

        $success = odbc_execute($stmt, $params);

        if(!$success) {
            $this->logger->error("Error trying to get eventlog time for user: $timeIpsUserId");
            return false;
        }
        $benifitTime = 0;
        while(odbc_fetch_row($stmt)) {
                $time = odbc_result($stmt, 1);
                $benifitTime += $time;
        }
        return array("totalBenifitTime" => $benifitTime);
    }
    public function getHolidayTimeObserved($timeIpsUserId, $startTime, $endTime)
    {
        $sql = "SELECT adjacentDayMinimumTime 
                FROM holidayGroupObservance
                WHERE obsStart >= ? 
                AND obsEnd <= ?";

        $params = array($startTime, $endTime);

        $stmt = odbc_prepare($this->timeIpsDB, $sql);

        $success = odbc_execute($stmt, $params);

        if(!$success) {
            $this->logger->error("Error trying to get eventlog time for user: $timeIpsUserId");
            return false;
        }
         $holidayTime = 0;
        while(odbc_fetch_row($stmt)) {
                $time = odbc_result($stmt, 1);
                $holidayTime += $time;
        }
        return array("totalHolidayTimeTime" => $holidayTime);
    }
}