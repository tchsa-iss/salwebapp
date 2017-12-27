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
    public function getLogs(Request $request, Response $response, $args) 
    {
        $logType = $args[0];
        $this->getLogFile(function($error, $json){

        });
        $file = $this->getLogFile($logType);
        $jsonResponse = $this->processLogFile($file);

        if (!$jsonResponse) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Geting Log File, Please Try Again or Contact Your IT Department'])
                ->withStatus(404);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write($jsonResponse);
        //$json = $this->getMonoLogs();
        //return $response->write($json);
    }
    private function processLogFile($file) {

    }
    private function getLogFile($type) {
        $fileName = null;
        switch ($type) {
            case 'app-logs':
                $fileName = __DIR__ . '/../../logs/app.log';
                break;
            case 'sal-api-logs':
                $fileName = __DIR__ . '/../../logs/salapi.log';

            default:
                return null;
                break;
        }
        $foundFile = file_exists($fileName);
        if (!$foundFile) {
            // respond 404
            return  null;
        }
        return $this->processLogFile($foundFile);
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

