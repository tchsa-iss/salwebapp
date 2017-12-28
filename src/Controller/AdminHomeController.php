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
        $user = $this->getDomainUserName();
        $this->logger->info("user: $user accessed admin pannel");

        $body = $this->view->fetch('admin/pages/homepage.twig', [
            'title' => 'Admin Homepage',
        ]);

        return $response->write($body);
    }
    public function getLogs(Request $request, Response $response, $args) 
    {
        $logType = $args['type'];
        $file = $this->getLogFile($logType);
        
        if (!$file) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Geting Log File, Please Try Again or Contact Your IT Department'])
                    ->withStatus(404);
        }

        $json = $this->processLogFile($file);
        if (!$json) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Parsing Log File, Please Try Again or Contact Your IT Department'])
                    ->withStatus(500);
        }
        return $response->withStatus(200)
                ->withHeader('Content-Type', 'application/json')
                ->write($json);
        // $response = $this->getLogFile($logType, function($error, $file) use ($response) {
        //     if ($error) {
        //         return $response->withJson(['status' => 'error', 'error' =>'Error Geting Log File, Please Try Again or Contact Your IT Department'])
        //             ->withStatus(404);
        //     }
        //     // get json parsed logfile
        //     $json = $this->processLogFile($file);
        //     if (!$json) {
        //         return $response->withJson(['status' => 'error', 'error' =>'Error Parsing Log File, Please Try Again or Contact Your IT Department'])
        //             ->withStatus(500);
        //     }
        //     return $response->withStatus(200)
        //         ->withHeader('Content-Type', 'application/json')
        //         ->write($json);
        // });
    }
    private function processLogFile($file) {
        $jsonString = '[';
        $handle = fopen($file, "r");
        if ($handle) {
            while (($line = fgets($handle)) !== false) {
                $jsonString + $line + ',';
            }
            fclose($handle);
        } else {
            return null;
        }
        return $jsonString + ']';
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
                $fileName = "Unknow Log File";
                break;
        }
        $foundFile = file_exists($fileName);
        if (!$foundFile) {
            // respond 404
            $this->logger->error("Log file: $type not found");
            return false;
            //$callback(true, $fileName);
        }
        //$callback(false, $fileName);
        return $fileName;
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

