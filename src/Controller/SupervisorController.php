<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-01-22 11:55:44
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-01-22 14:29:36
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
}