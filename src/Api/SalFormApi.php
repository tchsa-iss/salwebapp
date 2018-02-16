<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-02-01 16:33:08
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-15 13:18:33
 */

namespace SAL\Api;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use Monolog\Processor\UidProcessor;

class SalFormApi extends SalDBApi
{
	private $formLogger;

	// public function __construct()
	// {
	// 	$jsonFormatter = new JsonFormatter();
	// 	$stream = new StreamHandler( __DIR__ . getenv("SAL_FORM_API_LOG"), Logger::DEBUG);
 //        $uId = new UidProcessor();

 //    	$stream->setFormatter($jsonFormatter);

 //   		$this->formLogger = new Logger("SalFormApiLog");
 //    	$this->formLogger->pushHandler($stream);
 //        $this->formLogger->pushProcessor($uId);
 //        $this->formLogger->pushProcessor(function($record) {
 //            $record['extra']['user'] = $_SERVER['AUTH_USER'] ?: "AUTH_USER_EMPTY";
 //            return $record;
 //        });
	// }
	public function getSalEntryStatus()
	{
		$sql = "SELECT *
				FROM SalEntryStatus";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $status = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($status, $row);
        }
        return $status;
	}

	public function getSalEntryReportingUnits()
	{
		$sql = "SELECT *
				FROM ReportingUnits";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $reportingUnits = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($reportingUnits, $row);
        }
        return $reportingUnits;
	}

    public function getSalEntrySubReportingUnits()
    {
        $sql = "SELECT *
                FROM SubReportingUnits";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $subReportingUnits = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($subReportingUnits, $row);
        }
        return $subReportingUnits;
    }

	public function getSalEntryLocationCodes()
	{
		$sql = "SELECT *
				FROM SalLocationCodes";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $locationCodes = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($locationCodes, $row);
        }
        return $locationCodes;
	}

	public function getSalEntryAccountCodes($codeTypes)
	{
		$sql = "SELECT Code, CodeTypeID, Name, Description, Active
				FROM AccountCodes
				WHERE CodeTypeID = ?";

		$params = array($codeTypes);

        $stmt =  sqlsrv_query($this->salDB, $sql, $params);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        //return $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC);
        $accountCodes = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($accountCodes, $row);
        }
        return $accountCodes;
	}

	public function getSalEntryProjects()
	{
		$sql = "SELECT *
				FROM Projects";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $projects = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($projects, $row);
        }
        return $projects;
	}

	public function getSalEntryGroups()
	{
		$sql = "SELECT *
				FROM Groups";

        $stmt =  sqlsrv_query($this->salDB, $sql);
        if ($stmt === false) {
            if( ($errors = sqlsrv_errors() ) != null) {
                foreach( $errors as $error ) {
                    $this->formLogger->error($error[ 'SQLSTATE']);
                    $this->formLogger->error($error[ 'code']);
                    $this->formLogger->error($error[ 'message']);
                }
            }
            return false;
        }
        $groups = array();
        while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
            array_push($groups, $row);
        }
        return $groups;
	}
}