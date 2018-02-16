<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-05 08:27:46
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-16 09:09:19
 */

namespace SAL\Api;

use SAL\Api\TimeIpsApi as TimeIpsApi;
use SAL\Api\SalDBApi as SalApi;
use SAL\Api\SalFormApi as FormApi;

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
    public function callSalApi($methodName, $args)
    {
        if (method_exists($this->salApi, $methodName)) {
            return $this->salApi->{$methodName} ($args);
        }
        return false;
    }
    public function getUserWith($username)
    {
        $user = $this->salApi->getUser($username);
        if (!$user) {
            return null;
        }
        $roles = $this->salApi->getUserRoles($user->UserID);
        if (!$roles) {
            // something went wrong with query give them default role
            $user->roles =  array(2);
        }
        else {
            $user->roles = $roles;
        }
        return $user;

    }
    
    public function getCurrentUser($user)
    {

    }

    public function getTimeIpsUserSalTime($timeIpsUserId, $date) {
        $nextday = date('Y-m-d', strtotime($date . ' +1 day')); // Add one day to current day
        
        $start = strtotime($date); //Get begging day
        $end = strtotime($nextday); //Get Ending day
        
        // $startTime = 0;
        // $endTime = 0;

        $normalTime = $this->timeIpsApi->getEventLogTime($timeIpsUserId, $start, $end);
        if (!$normalTime) {
            return false;
        }

        $benefitTime = $this->timeIpsApi->getBenifitUsedTime($timeIpsUserId, $start, $end);
        if (!$benefitTime) {
            return false;
        }

        $holidayTime = $this->timeIpsApi->getHolidayTimeObserved($timeIpsUserId, $start, $end);
        if (!$holidayTime) {
            return false;
        }
        return array($normalTime, $benefitTime, $holidayTime); 
    }

    public function getSalEntryFormData($entryType)
    {
        $formData = new class{};
        $formApi = new FormApi();

        $status = $formApi->getSalEntryStatus();
        if (!$status) {
            return 1;
        }
        $reportingUnits = $formApi->getSalEntryReportingUnits();
        if (!$reportingUnits) {
            return 1;
        }
        $subReportingUnits = $formApi->getSalEntrySubReportingUnits();
        if (!$subReportingUnits) {
            return 1;
        }
        $locationCodes = $formApi->getSalEntryLocationCodes();
        if (!$locationCodes) {
            return 1;
        }
        $accountCodes = $formApi->getSalEntryAccountCodes($entryType);
        if (!$accountCodes) {
            return 1;
        }
        $projects = $formApi->getSalEntryProjects();
        if (!$projects) {
            //return 1;
        }
        $groups = $formApi->getSalEntryGroups();
        if (!$groups) {
            //return 1;
        }

        $formData->status = $status;
        $formData->reportingUnits = $reportingUnits;
        $formData->subReportingUnits = $subReportingUnits;
        $formData->locationCodes = $locationCodes;
        $formData->accountCodes = $accountCodes;
        $formData->projects = $projects;
        $formData->groups = $groups;

        return $formData;
    }
    public function createNewUser($user)
    {
        $salUser = $this->salApi->getUser($user->username);

        if ($salUser) {
            // the user is trying to re-registere
            return 1;
        }

        return $this->salApi->createNewUser($user);

        // if (!isset($insertObj) && !$insertObj->id) {
        //     if (!isset($insertObj->id)) {
        //         return 2;
        //     }
        // }
        // return $this->salApi->addReportingUnitToUser($insertObj->id, $user->serviceUnit);
    }

    public function getUserSals($fromDate, $toDate, $userId, $status)
    {
        $sals = $this->salApi->getUserSalsFromDateRange($fromDate, $toDate, $userId, $status);
        return $sals;
    }

    public function createSupervisor($userId)
    {
        $id = (int)$userId;
        $reportingUnitId = $this->salApi->getUserReportingUnit($id);
        return $this->salApi->createSupervisor($id, $reportingUnitId);
    }

    public function assignEmployeeTo($supervisorId, $employeeId)
    {
        $success = $this->salApi->assignEmployee($employeeId, $supervisorId);

        if(!$success) {
            return 1;
        }
        // $updated = $this->salApi->updateUserSpervisor($employeeId, $supervisorId);

        // if(!$updated) {
        //     return 2;
        // }
        return 0;
    }

    public function getAllSupervisorsForUser($userId)
    {
        return $this->salApi->getUsersSupervisors($userId);
    }

    public function deleteSupervisorFrom($employeeId, $supervisorId)
    {
        // $updated = $this->salApi->updateUserSpervisor($employeeId, 0);

        // if(!$updated) {
        //     return 1;
        // }

        $deleted = $this->salApi->deleteSupervisorFrom($employeeId, $supervisorId);

        if(!$deleted) {
            return 2;
        }

        return 0;
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
   
    public function getUserProfile($user) 
    {
        $userRoles = $this->salApi->getUserRoles($user->UserID);
        $jobTitle = $this->salApi->getEmployeeTitleForID($user->JobTitle);
        $user->userRoles = $userRoles;
        $user->jobTitle = $jobTitle;
        $user->supervisors = 1;
        $user->supervising = 0;
        return $user;
    }

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

    public function rejectUserSal($sal)
    {
        $entryId = (int)$sal->SalEntryID;
        $message = $sal->errorMessage;

        $updated = $this->salApi->updateUserSalEntryError($entryId, $message);
        if(!$updated) {
            return 1;
        }

        $statusId = (int)$sal->statusChange;
        $id = (int)$sal->userSalId;
        
        $updateSal = $this->salApi->updateUserSalState($id, $statusId);
        if(!$updateSal) {
            return 1;
        }
        return true;
    }

    public function closeUserSal($userSalId)
    {
        $statusId = 4;
        $id = (int)$userSalId;
        
        $updateSal = $this->salApi->updateUserSalState($id, $statusId);
        if(!$updateSal) {
            return 1;
        }
        return true;
    }

    public function reopenUserSal($sal, $formState)
    {
        $id = $sal->ID;
        $result = $this->salApi->updateUserSalState($id, $formState);
        return $result;
    }

    /*
    **  Helper methods
    **
    */
   
   // here just for a example if needed
   private function connectToLDAP()
   {
        $ldaphost = getenv("LDAP_HOST");  // your ldap servers
        $ldapport = getenv("LDAP_PORT");                 // your ldap server's port number
        // Connecting to LDAP
        $ldapconn = ldap_connect($ldaphost, $ldapport)
          or die("Could not connect to $ldaphost");

        $ldapbind = ldap_bind($ldapconn, $username, $pass);
        $dn = "OU=FD, DC=internal,DC=tchsa,DC=net";
        $attributes = array("cn");
        $filter = "(manager=Daniel Roach)";
        $result = ldap_search($ldapconn, $dn, $filter, $attributes);
        $info = ldap_get_entries($ldapconn, $result);
        return $result;
   }

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