<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-01-22 11:55:44
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-16 09:32:24
 */

namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Class SupervisorController
 * @package SAL\Controller
 */
class SupervisorController extends BaseController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    public function getSupervisorTeamMembers(Request $request, Response $response, $args)
    {
        $supervisorId = $args['supervisorId'];
        $teamMembers = $this->api->callSalApi('getSupervisorTeamMembers', $supervisorId);

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($teamMembers));
    }

    public function getUserTimeIpsTime(Request $request, Response $response, $args)
    {
        $data = $request->getQueryParams();
        $date = $data['date'];
        $userId = $data['userId'];
        $user = $this->api->callSalApi('getUserWithId', $userId);
        if (!$user) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }
        $time = $this->api->getTimeIpsUserSalTime((int)$user->TimeIpsID, $date);
        if ($time === false) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($time));
    }

    public function createNewUserSal(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $createRequestData = json_decode($data);

        $result = $this->api->callSalApi('createUserSal', $createRequestData);

        if ($result === 1) {
            $this->logger->error("Error duplicate new user sal");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Sal Already Exists: $createRequestData->date'])
                ->withStatus(409);
        }
        if ($result === 2) {
            $this->logger->error("Error creating new sal $createRequestData->date");

            return $response->withJson(['status' => 'error', 'error' =>'Error Creating Your New Sal, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "New Sal Has Been Created")));
    }

    public function approveUserSal(Request $request, Response $response, $args)
    {
        // $data = $request->getBody();
        // $approvalData = json_decode($data);
        
        $userSalId = $args['userSalId'];

        if (!$userSalId) {
            return $response->withJson(['status' => 'error', 'error' =>'Error: No User Sal Was Sent'])
                ->withStatus(500);
        }

        $approvalData =  new class{};
        $approvalData->userSalId = $userSalId;
        $user = $this->getCurrentUser();

        if (!isset($user)) {
            $approvalData->UserID = 0;
        }
        else {
            $approvalData->UserID = $user->UserID;
        }

        $result = $this->api->callSalApi('approveUserSal', $approvalData);

        if ($result === 1) {
            $this->logger->error("Error approval failed user sal: $approvalData->userSalId");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Approval failled to post'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "Sal Has Been Approved")));
    }

    public function rejectUserSal(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $rejectData = json_decode($data);

        $result = $this->api->rejectUserSal($rejectData);

        if ($result === 1) {
            $this->logger->error("Error rejecting user sal: $rejectData->SalEntryID");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Attempted to reject sal but sql request has error'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "Sal Has Been Sent Back To Member")));
    }
}