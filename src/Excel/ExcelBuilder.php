<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-02-13 11:02:52
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-14 13:46:48
 */

namespace SAL\Excel;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use Monolog\Processor\UidProcessor;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Class ExcelBuilder
 * @package SAL\ExcelBuilder
 */
class ExcelBuilder
{
	private $excelSpreadsheet;
	private $logger;

	public function __construct()
    {
    	$jsonFormatter = new JsonFormatter();
		$stream = new StreamHandler( __DIR__ . getenv("EXCEL_BUILDER_LOG"), Logger::DEBUG);
        $uId = new UidProcessor();

    	$stream->setFormatter($jsonFormatter);

   		$this->logger = new Logger("Excel_Log");
    	$this->logger->pushHandler($stream);
        $this->logger->pushProcessor($uId);
        $this->logger->pushProcessor(function($record) {
            $record['extra']['user'] = $_SERVER['AUTH_USER'] ?: "AUTH_USER_EMPTY";
            return $record;
        });

        $templatePath =  __DIR__ . getenv("SAL_TEMPLATE");
        if (file_exists($templatePath)) {
        	$this->excelSpreadsheet = $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($templatePath);
        }
        else {
        	$this->logger->error("Could not find template for path: " . $templatePath);
        }
    }

    public function insertEntries($entries) 
    {
    	// 'SELECT sub.SalEntryID, Forms.Name as "FormName", sub.EntryStatusCode, ReportingUnits.Code as "ReportingUnitCode", ReportingUnits.UnitAbbrev as "ReportingUnitAbbrev", SalLocationCodes.Description as "Location", sub.SubReportingUnitID, AccountCodes.Code as "ActivityCode", AccountCodes.Name as "ActivityName", sub.ProjectNumberID, sub.GroupNumber, sub.TimeSpent, sub.PrepTime, sub.ActivityStartTime, sub.ClientName, sub.CreateDate, sub.Description'
    	
    	$column = 'A';
    	$row = 3;
    	$totalMin = 0;

     	$spreadsheet = $this->excelSpreadsheet->getSheetByName('Sheet1');
    	for ($i = 0; $i < count($entries); $i++) {
    		$entry = $entries[$i];
    		$cellData = array($entry['EntryStatusCode'], $entry['ReportingUnitCode'], $entry['LocationCode'], $entry['ActivityCode'], 0, 0, 0, 0, 0, $entry['Description']);
    		$spreadsheet->fromArray($cellData, NULL, $column . $row);
    		$totalMin += $entry['TimeSpent'];
    		$row++;
    	}

    	$timeString = $this->convertToHoursMins($totalMin);
    	$spreadsheet->setCellValue('K1', $timeString);
		$writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($this->excelSpreadsheet, "Xlsx");
		return $writer;
    }

    private function convertToHoursMins($time) 
    {
	    if ($time < 1) {
	        return;
	    }
	    $hours = floor($time / 60);
	    $minutes = ($time % 60);
	    if ($minutes == 0) {
	    	return "$hours".":"."00";
	    }
	    return "$hours".":"."$minutes";
	}
}