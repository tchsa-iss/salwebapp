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
    protected $username;
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
    public function getCurrentUser()
    {
        if (isset($this->username)) {
            return $this->username;
        }
        list($domain, $username) = explode("\\", $_SERVER['AUTH_USER']);
        $this->username = $username;
        return $this->username;
    }
    public function setCurrentUser($user) {
        $this->user = $user;
    }
}
