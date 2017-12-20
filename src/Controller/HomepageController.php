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
            if (is_null($user)) {
                return $response->withRedirect($this->container->router->pathFor('sal.registration'), 302);
            }
        }
        $this->setCurrentUser($user);
        $this->view->render($response, 'website/pages/homepage.twig', [
            "title" => "Homepage",
            "user" => $user
        ]);
    }
    public function settings(Request $request, Response $response, $args) 
    {
        $this->view->render($response, 'website/pages/settings.twig', [
            "title" => "settings"
        ]);
    }
    public function profile(Request $request, Response $response, $args) 
    {
        $profile = array("name" => "Daniel Roach",
            "email" => "daniel.roach@tchsa.net",
            "unit" => "Fiscal Support Services",
            "role" => "User",
            "job" => "IIS II",
            "phone" => "530-222-2222 ext 3088"
        );
        $this->view->render($response, 'website/pages/profile.twig', [
            "title" => "Profile",
            "user" => $profile
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
        $this->view->render($response, 'website/pages/help.twig', [
            "title" => "help"
        ]);
    }
}

