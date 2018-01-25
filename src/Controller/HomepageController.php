<?php
namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Class HomepageController
 * @package SAL\Controller
 */
class HomepageController extends BaseController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    public function homepage(Request $request, Response $response, $args)
    {
        $user = $this->getCurrentUser();
       
        if (empty($user)) {
            // get user
            $username = $this->getDomainUserName();
            $user = $this->api->getUserWith($username);
            if (!isset($user)) {
                return $response->withRedirect($this->container->router->pathFor('sal.registration'), 302);
            }
        }
        $this->setCurrentUser($user);
        $teamMembers = $this->api->callSalApi('getSupervisorTeamMembers', $user->SupervisorID);

        $this->view->render($response, 'website/pages/homepage.twig', [
            "title" => "E-Sal Homepage",
            "user" => $user,
            "team" => $teamMembers
        ]);
    }
    public function settings(Request $request, Response $response, $args) 
    {
        $this->view->render($response, 'website/pages/settings.twig', [
            "title" => "Settings"
        ]);
    }
    public function profile(Request $request, Response $response, $args) 
    {
        $user = $this->getCurrentUser();
        $profile = $this->api->getUserProfile($user);
        // fix this in registration
        $user->ReportingUnit = "Fiscal Support Services";

        $this->view->render($response, 'website/pages/profile.twig', [
            "title" => "Profile",
            "user" => $user
        ]);
    }
    public function messages(Request $request, Response $response, $args)
    {
        $this->view->render($response, 'website/pages/messages.twig', [
            "title" => "Messages"
        ]);
    }
    public function help(Request $request, Response $response, $args)
    {
        $user = $this->getCurrentUser();
        $this->view->render($response, 'website/pages/help.twig', [
            "title" => "help",
            "user" => $user
        ]);
    }

    public function getTeamMembers(Request $request, Response $response, $args)
    {
        $userId = $args['id'];
        $employees = $this->api->getUsersEmployees($userId);

        if (!$employees) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Service Units, check logs'])
                    ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($employees));
    }
}

