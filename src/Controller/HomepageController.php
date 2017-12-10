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
        // get user
        $this->view->render($response, 'website/pages/homepage.twig', [
            "title" => "Homepage"
        ]);
        //$body = $this->view->fetch('website/pages/homepage.twig');
        //return $response->write($body);
    }
    public function profile(Request $request, Response $response, $args) {
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
}

