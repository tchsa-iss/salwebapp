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
        
        $body = $this->view->fetch('website/pages/homepage.twig');
        return $response->write($body);
    }
}

