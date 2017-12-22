<?php
namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Class AdminHpController
 * @package SAL\Controller
 */
class AdminHomeController extends ISSAdminController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    private $LOG_TYPES = [
        "ALL" => 1,
        "INFO" => 2,
        "WARNING" => 3,
        "ERROR" => 4,
        "USERS" => 5
    ];
    public function homepage(Request $request, Response $response, $args)
    {
        $body = $this->view->fetch('admin/pages/homepage.twig', [
            'title' => 'Admin Homepage',
        ]);

        return $response->write($body);
    }
     public function logs(Request $request, Response $response, $args) 
    {
        //$logType = $args[0];
        $json = $this->getMonoLogs();
        return $response->write($json);
    }
    private function getMonoLogs() 
    {
        //$loggerSettings = $app->getContainer()->get('settings')['logger'];
        $found = file_exists(__DIR__ . '/../../logs/app.log');
        if (!$found) {
            return json_encode(array("log_file" => "not found"));
        }
        $jsonLogString = file_get_contents(__DIR__ . '/../../logs/app.log');
        if (!$jsonLogString) {
            return json_encode(array("log" => "empty"));
        }
        return $jsonLogString;
    }
}

