<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-05 08:27:46
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2017-12-21 18:02:00
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
    public function callSalApi($methodName, $args)
    {
        if (method_exists($this->salApi, $methodName)) {
            return $this->salApi->{$methodName} ($args);
        }
        return false;
    }
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
   
    public function getUserProfile($user) 
    {
        $userRoles = $this->salApi->getUserRoles($user->UserID);
        $jobTitle = $this->salApi->getEmployeeTitleForID($user->JobTitle);
        $user->userRoles = $userRoles;
        $user->jobTitle = $jobTitle;

        $ldaphost = "TCHSADC02.internal.tchsa.net";  // your ldap servers
        $ldapport = 389;                 // your ldap server's port number

        // Connecting to LDAP
        $ldapconn = ldap_connect($ldaphost, $ldapport)
          or die("Could not connect to $ldaphost");


        $ldapbind = ldap_bind($ldapconn, $username, $pass);
        var_dump($ldapbind);
        $dn = "OU=FD, DC=internal,DC=tchsa,DC=net";
        //$dn = "o=Tehama County Health Services Agency,c=US"; //the object itself instead of the top search level as in ldap_search
        //$filter = array("ou");
        $attributes = array("cn");
        $filter = "(manager=Daniel Roach)";
        $result = ldap_search($ldapconn, $dn, $filter, $attributes);
        //$ldapUser = ldap_list($ldapconn, $dn, "ou=*", $filter);
        echo $result;
        $info = ldap_get_entries($ldapconn, $result);
        var_dump($info);
        //for ($i=0; $i < $info["count"]; $i++) {
            //var_dump($info[$i]);
        //}
        return $result;
        //return $user;
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