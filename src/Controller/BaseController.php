<?php
namespace SAL\Controller;

use Slim\Container;
use Slim\Views\Twig as TwigViews;
use SAL\ApiController as Api;
use SAL\Api\WebAppApi as WebApi;
use SAL\User\User as User;

/**
 * Class BaseController
 * @package SAL\Controller
 */
abstract class BaseController
{
    /** @var TwigViews view */
    protected $view;
    protected $logger;
    protected $logFilePath;
    protected $api;
    protected $user;
    protected $timeIpsID;
    protected $container;
    /**
     * BaseController constructor.
     * @param Container $c
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
        $this->view = $container->view;
        $this->logger = $container->logger;

        //$this->logFilePath = $c->get('settings')['logger']['path'];
        $this->api = new WebApi();
    }
    public function getDomainUserName()
    {
        list($domain, $username) = explode("\\", $_SERVER['AUTH_USER']);
        if (is_null($username)) {
             $this->logger->error("No AUTH_USER Found");
        }
        return $username;
        // if (filter_has_var(INPUT_SERVER, "SERVER_NAME")) {
        //     $servername = filter_input(INPUT_SERVER, "SERVER_NAME", FILTER_UNSAFE_RAW, FILTER_NULL_ON_FAILURE);
        // } 
        // else {
        //     if (isset($_SERVER["SERVER_NAME"])) {
        //         $servername = filter_var($_SERVER["SERVER_NAME"], FILTER_UNSAFE_RAW, FILTER_NULL_ON_FAILURE);
        //     }
        //     else {
        //         $servername = null;
        //     }
        // }
    }
    public function getCurrentUser()
    {
        if (!isset($_SESSION['user'])) {
            return false;
        }
        if (!isset($this->user)) {
            $this->user = $_SESSION['user'];    
        }
        return $this->user;
    }
    public function setCurrentUser($user) {
        $_SESSION['user'] = $user;
        $this->user = $user;
    }
}
