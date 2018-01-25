<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-01-22 12:18:09
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-01-24 15:29:18
 */

namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Class SuperUserController
 * @package SAL\Controller
 */
class SuperUserController extends BaseController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    public function getAllSupervisorsForUser(Request $request, Response $response, $args)
    {
        $userId = $args['userId'];
        $result = $this->api->getAllSupervisorsForUser((int)$userId);

        if ($result === 1) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting supervisors for user"])
                ->withStatus(500);
        }
        if ($result === 2) {
            return $response->withJson([])
                ->withStatus(200);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode($result));
    }

    public function getAllSupervisors(Request $request, Response $response, $args)
    {
        $supervisors = $this->api->callSalApi('getAllSupervisors', null);
        if (!$supervisors) {
            return $response->withJson(['status' => 'error', 'error' =>'There was a error get all the employees'])
                ->withStatus(404);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode($supervisors));
    }

    public function getSupervisorWithId(Request $request, Response $response, $args)
    {
        $supervisorId = $args['id'];
        $supervisor = $this->api->callSalApi('getSupervisorWith', (int)$supervisorId);
        if (!$supervisor) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting supervisor with $supervisorId"])
                ->withStatus(404);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode($supervisor));
    }

    public function removeSupervisorFromEmployee(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $json = json_decode($data);

        $result = $this->api->deleteSupervisorFrom((int)$json->userId, (int)$json->supervisorId);

        if ($result === 1 || $result === 2) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Assigning Superviser, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('value' => 0, 'message' => "Supervisor has been removed from Employee")));
    }
    public function getAllEmployees(Request $request, Response $response, $args)
    {
        $employees = $this->api->callSalApi('getAllEmployees', null);
        if (!$employees) {
            return $response->withJson(['status' => 'error', 'error' =>'There was a error get all the employees'])
                ->withStatus(404);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode($employees));
    }

    public function createSupervisor(Request $request, Response $response, $args)
    {
        $userId = $args['id'];
        $result = $this->api->createSupervisor($userId);

        if ($result === 1) {
            $this->logger->error("Error duplicate new user $userId");

            return $response->withJson(['status' => 'error', 'error' =>'Error: User Already Exists'])
                ->withStatus(409);
        }
        if ($result === 2) {
            $this->logger->error("Error creating new user $user->username");

            return $response->withJson(['status' => 'error', 'error' =>'Error Creating Your Account, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        $supervisor = $this->api->callSalApi('getSupervisor', $userId);
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($supervisor));
    }

    public function deleteSupervisor(Request $request, Response $response, $args)
    {
        $supervisorId = $args['id'];
        $success = $this->api->callSalApi('deleteSupervisor', $supervisorId);
        if (!$success) {
            return $success->withJson(['status' => 'error', 'error' =>'There was a error deleting Supervisor'])
                ->withStatus(404);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write(json_encode(array('message' => "Supervisor has been deleted")));
    }

    public function assignEmployeeToSupervisor(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $json = json_decode($data);

        $result = $this->api->assignEmployeeTo((int)$json->supervisorId, (int)$json->userId);

        if ($result === 1 || $result === 2) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Assigning Superviser, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "Employee has been Assigned")));
    }
}