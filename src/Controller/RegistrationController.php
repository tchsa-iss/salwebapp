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
        $username = $this->getDomainUserName();
        $userData = $this->api->getRegistrationFormData($username);

        $this->view->render($response, 'website/pages/registration.twig', [
            "title" => "Registration",
            "userData" => $userData
        ]);
    }
    public function registerUser(Request $request, Response $response, $args) 
    {
        $data = $request->getBody();
        $user = json_decode($data);
        $user->username = $this->getDomainUserName();
        // insert new user into sal dd
        $result = $this->api->createNewUser($user);
        if ($result === 1) {
            $this->logger->error("Error duplicate new user $user->username");

            return $response->withJson(['status' => 'error', 'error' =>'Error: User Already Exists'])
                ->withStatus(409);
        }
        if ($result === 2) {
            $this->logger->error("Error creating new user $user->username");

            return $response->withJson(['status' => 'error', 'error' =>'Error Creating Your Account, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "User has been created")));
    }
}
