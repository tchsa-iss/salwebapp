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

    private $role = 1; // user
    private $active = 1; //default active with registered

    public function landingPage(Request $request, Response $response, $args)
    {
        $username = $this->getCurrentUser();
        $userData = $this->api->getRegistrationFormData($username);

        $timeIpsID = $userData['profile']['usersID'];
        $this->view->render($response, 'website/pages/registration.twig', [
            "title" => "Registration",
            "userData" => $userData
        ]);
    }
    public function registerUser(Request $request, Response $response, $args) 
    {
        $data = $request->getBody();
        $user = json_decode($data);
        $user->username = $this->getCurrentUser();
        // insert new user into sal dd
        $result = $this->api->createNewUser($user);
        if ($result === false) {
            $this->logger->error("Error creating new user $user->username");
            $response->write(false);
        }
        $response->withRedirect($this->container->router->pathFor('sal.website.homepage'), 302);
    }
}
