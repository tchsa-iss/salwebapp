<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-05 08:27:46
 * @Last Modified by:   iss_roachd
 * @Last Modified time: 2017-12-15 17:28:49
 */

namespace SAL\Api;

use SAL\Api\TimeIpsApi as TimeIpsApi;
use SAL\Api\SalDBApi as SalApi;

class WebAppApi 
{
    const SalDB = 1;
    const TimeIpsDB = 2;
	private $salDBConnection;
	private $logger;
    private $salApi;
    private $timeIpsApi;

	public function __construct()
    {
        $this->salApi = new SalApi();
        $this->timeIpsApi = new TimeIpsApi();
    }

    /*
    ** Sal DB API Methods
    **
    */
    public function getUserWith($username)
    {
        return $this->salApi->getUser($username);
    }
    public function getCurrentUser($user)
    {

    }
    public function createNewUser($user)
    {
        return $this->salApi->createNewUser($user);
    }

    /*
    ** Time Ips API Methods
    **
    */
    public function getTimeIpsUserInfo($username)
    {
        return $this->timeIpsApi->getUser($username);
    }

    /*
    **  HELPER FORM METHODS
    **
    */

    public function getRegistrationFormData($username)
    {
        $timeIpsUserData = $this->getTimeIpsUserInfo($username);
        $employeeJobTitles = $this->salApi->getEmployeeTitles();
        $serviceUnits = $this->salApi->getServiceUnits();
        return [
            "profile" => $timeIpsUserData,
            "titles" => $employeeJobTitles,
            "units" => $serviceUnits
        ];
    }

    /*
    **  Helper methods
    **
    */

    private function checkDBConnection($connection, $type) {
        switch ($type) {
            case 1:
                if (!$connection) {
                    // try to connect again
                    return false;
                }
                break;

            case 2:
                if (!$connection) {
                    //try to connect again
                    return false;
                }
                break;
            
            default:
                # code...
                break;
        }
        return true;
    }
}