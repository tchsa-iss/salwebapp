<?php
namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Class AdminHpController
 * @package SAL\Controller
 */
class AdminHomeController extends ISSAdminController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    private $LOG_TYPES = [
        "ALL" => 1,
        "INFO" => 2,
        "WARNING" => 3,
        "ERROR" => 4,
        "USERS" => 5
    ];
    public function homepage(Request $request, Response $response, $args)
    {
        $user = $this->getCurrentUser();
        $body = $this->view->fetch('admin/pages/homepage.twig', [
            'title' => 'Admin Homepage',
            'user' => $user
        ]);

        return $response->write($body);
    }
    public function getEmployees(Request $request, Response $response, $args)
    {
        $option = $args['option'];
        $validOptoins = array("all", "fiscal", "behaviorHealth", "substanceAbuse", "clinic");
        $valid = in_array($option, $validOptoins);

        if (!$valid) {
            return $response->withJson(['status' => 'error', 'error' =>'Invalid'])
                    ->withStatus(500);
        }
        
        $employeeArray = $this->api->callSalApi('getAllEmployees', null);
        if (!$employeeArray) {
            return $response->withJson(['status' => 'error', 'error' =>'There was a error get all the employees'])
                ->withStatus(404);
        }
        $json = json_encode($employeeArray);
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write($json);
    }
    public function getJobTitles(Request $request, Response $response, $args)
    {
        $jobTitles = $this->api->callSalApi('getEmployeeTitles', null);
        if (!$jobTitles) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Job Titles, check logs'])
                    ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($jobTitles));
    }
    public function getServiceUnits(Request $request, Response $response, $args)
    {
        $serviceUnits = $this->api->callSalApi('getServiceUnits', null);

        if (!$serviceUnits) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Service Units, check logs'])
                    ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($serviceUnits));
    }
    public function createUserRole(Request $request, Response $response, $args) {
        $data = $request->getBody();
        $role = json_decode($data);

        $status = $this->api->callSalApi('createNewUserRole', $role);
        if ($status === 1) {
            return $response->withJson(['status' => 'error', 'error' =>'Error: Role Already Exists'])
                ->withStatus(409);
        }
        if ($status === 2) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Creating Role, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        $roles = $this->api->callSalApi('getAllUserRoles', null);
        $addedRole = end($roles);
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "User Role Has Been Created", 'add' => $addedRole)));
    }
    public function getRoles(Request $request, Response $response)
    {
        $roles = $this->api->callSalApi('getRoles', null);
        if (!$roles) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting roless, check logs'])
                    ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($roles));
    }
    public function getUserRoles(Request $request, Response $response, $args)
    {
        $userID = null;
        $roles = null;
        if (array_key_exists('id', $args)) {
            $userID = $args['id'];
        }
        if ($userID) {
            $roles = $this->api->callSalApi('getUserRoles', $userID);
        }
        else {
            $roles = $this->api->callSalApi('getAllUserRoles', null);            
        }
        if (!$roles) {
            // handle errors
            return $response->withJson(['status' => 'error', 'error' =>'No Roles Found'])
                    ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($roles));
    }

    public function getUserReportingUnits(Request $request, Response $response, $args)
    {
        $allUsers = $this->api->callSalApi('getUserReportingUnits', null);
        if (!$allUsers) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Gettin all Users and Reporting Units, Please Try Again or Contact Your IT Department'])
                ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($allUsers));
    }

    public function getSalActivityCodes(Request $request, Response $response, $args)
    {
        $allActivityCodes = $this->api->callSalApi('getSalActivityCodes', null);
        if (!$allActivityCodes) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Codes, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($allActivityCodes));
    }

    public function getAccountCodeGroup(Request $request, Response $response, $args)
    {
        $groupId = (int)$args['id'];
        if ($groupId === 6) {
            // this is all groups different query
        }
        $accountCodes = $this->api->callSalApi('getSalAccountCodes', $groupId);
        if (!$accountCodes) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Account Codes, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($accountCodes));
    }

    public function getAccountCodeTypes(Request $request, Response $response)
    {
        $allAccountCodeTypes = $this->api->callSalApi('getSalAccountCodeTypes', null);
        if (!$allAccountCodeTypes) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Account Code Types, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($allAccountCodeTypes));
    }

    public function getLogs(Request $request, Response $response, $args) 
    {
        $logType = $args['type'];
        $file = $this->getLogFile($logType);
        
        if (!$file) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Geting Log File, Please Try Again or Contact Your IT Department'])
                    ->withStatus(404);
        }

        $logs = $this->processLogFile($file);
        if (!$logs) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Parsing Log File, Please Try Again or Contact Your IT Department'])
                    ->withStatus(500);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode($logs));
    }
    private function processLogFile($file) {
        $logArray = array();
        $handle = fopen($file, "r");
        if ($handle) {
            while (($line = fgets($handle)) !== false) {
                $jsonLine = json_decode($line);
                array_push($logArray, $jsonLine);
            }
            fclose($handle);
        } else {
            return null;
        }
        return $logArray;
    }
    private function getLogFile($type) {
        $fileName = null;
        switch ($type) {
            case 'app-logs':
                $fileName = __DIR__ . '/../../logs/app.log';
                break;
            case 'sal-api-logs':
                $fileName = __DIR__ . '/../../logs/salapi.log';
                break;
            case 'timeips-api-logs':
                $fileName = __DIR__ . '/../../logs/timeips.log';
                break;
            default:
                $fileName = "Unknow Log File";
                break;
        }
        $foundFile = file_exists($fileName);
        if (!$foundFile) {
            // respond 404
            $this->logger->error("Log file: $type not found");
            return false;
            //$callback(true, $fileName);
        }
        //$callback(false, $fileName);
        return $fileName;
    }
}

