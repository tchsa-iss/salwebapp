<?php

namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;
/**
 * Class RegistrationController
 * @package SAL\Controller
 */
class RegistrationController extends BaseController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    public function landingPage(Request $request, Response $response, $args)
    {
        $username = $this->getCurrentUser();
        $userProfile = $this->api->getTimeIpsUserInfo($username);
        $userTitles = $this->api->getEmployeeTitles();
        $serviceUnits = $this->api->getServiceUnits();
        $userData = array("profile" => $userProfile, "titles" => $userTitles, "units" => $serviceUnits);
        
        $this->view->render($response, 'website/pages/registration.twig', [
            "userData" => $userData
        ]);
    }
}
