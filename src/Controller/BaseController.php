<?php
namespace SAL\Controller;

use Slim\Container;
use Slim\Views\Twig as TwigViews;
use SAL\ApiController as Api;
use SAL\Api\WebAppApi as WebApi;

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
    /**
     * BaseController constructor.
     * @param Container $c
     */
    public function __construct(Container $c)
    {
        $this->view = $c->get('view');
        $this->logger = $c->get('logger');
        $this->logFilePath = $c->get('settings')['logger']['path'];
        $this->api = new WebApi($this->logger);
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
}
