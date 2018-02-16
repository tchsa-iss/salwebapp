<?php

/**
 * @Author: Daniel Roach
 * @Date:   2018-01-30 10:47:39
 * @Last Modified by:   Daniel Roach
 * @Last Modified time: 2018-02-16 09:09:37
 */

namespace SAL\Controller;

use Slim\Http\Request;
use Slim\Http\Response;
use SAL\Excel\ExcelBuilder as ExcelBuilder;
/**
 * Class UserController
 * @package SAL\Controller
 */
class UserController extends BaseController
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $args
     * @return Response
     */
    
    public function getTimeIpsTime(Request $request, Response $response, $args)
    {
        $data = $request->getQueryParams();
        $date = $data['date'];
        $user = $this->getCurrentUser();
        $time = $this->api->getTimeIpsUserSalTime((int)$user->TimeIpsID, $date);
        if ($time === false) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($time));
    }
    public function getUserSalsByDateRange(Request $request, Response $response, $args)
    {
        $data = $request->getQueryParams();
       	$fromDate = $data["fromDate"];
       	$toDate = $data["toDate"];
        $status = $data["status"];

       	$user = $this->getCurrentUser();

        $sals = $this->api->getUserSals($fromDate, $toDate, $user->UserID, $status);

        if ($sals === false) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($sals));
    }

    public function getUserSalsByStatus(Request $request, Response $response, $args)
    {
        $userId = $args['userId'];
        $status = $args['status'];

        $data = new class{};
        $data->userId = $userId;
        $data->status = $status;

        $sals = $this->api->callSalApi('getUserSalsByStatus', $data);

        if ($sals === false) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }        

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($sals));
    }

    public function getUserSalEntries(Request $request, Response $response, $args)
    {
        // $data = $request->getQueryParams();
        // $sal = (object)$data;
        $id = $args['id'];
        $entries = $this->api->callSalApi('getUserSalEntries', (int)$id);
        //var_dump($entries);
        if ($entries === false) {
            return $response->withJson(['status' => 'error', 'error' =>"There was a error getting sals"])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($entries));
    }

    public function getSalEntryData(Request $request, Response $response)
    {
        $data = $request->getQueryParams();
        $entryType = $data['entryType'];

        $formData = $this->api->getSalEntryFormData((int)$entryType);

        if ($formData === 1) {
            return $response->withJson(['status' => 'error', 'error' =>'Error Getting Form Data, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        if ($formData === 2) {

        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($formData));
    }
    public function createUserSalEntry(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $createSalEntryData = json_decode($data);

        $result = $this->api->callSalApi('createUserSalEntry', $createSalEntryData);

        if ($result === 2) {
            $this->logger->error("Error creating new sal entry");

            return $response->withJson(['status' => 'error', 'error' =>'Error Creating Your New Sal Entry, Please Try Again or Contact Your IT Department'])
                ->withStatus(500);
        }
        $entry = $this->api->callSalApi('getUserSalEntry', (int)$result);
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($entry));
    }
    public function deleteUserSalEntry(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $deleteRequestData = json_decode($data);

        $result = $this->api->callSalApi('deleteUserSalEntry', $deleteRequestData);

         if ($result === 1) {
            $this->logger->error("Error deleting sal entry: $deleteRequestData->ID");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Could Not Delete Your Sal Entry'])
                ->withStatus(500);
        }
        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "Entry Was Deleted")));
    }
    public function editUserSalEntry(Request $request, Response $response, $args) 
    {
        $data = $request->getBody();
        $editRequestData = json_decode($data);

        $result = $this->api->callSalApi('editUserSalEntry', $editRequestData);

         if ($result === 1) {
            $this->logger->error("Error editing sal entry: $editRequestData->ID");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Could Not Edit Your Sal Entry'])
                ->withStatus(500);
        }
        $entry = $this->api->callSalApi('getUserSalEntry', (int)$editRequestData->entry->SalEntryID);

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($entry));
    }

    public function reopenUserSal(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $openData = json_decode($data);

        $result = $this->api->reopenUserSal($openData, $openData->EntryStatusID);

         if ($result === 1) {
            $this->logger->error("Error re-opening sal entry: $openData->ID");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Could not re-open SAL'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "SAL Was Re-Opened")));
    }

    public function submitUserSal(Request $request, Response $response, $args)
    {
        $data = $request->getBody();
        $submitSalData = json_decode($data);

        $result = $this->api->callSalApi('submitUserSal', $submitSalData);

        if ($result === 1) {
            $this->logger->error("Error submitting sal: $submitSalData->ID");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Could Not Commit Sal Submit Request'])
                ->withStatus(500);
        }
        //$entry = $this->api->callSalApi('getUserSalEntry', (int)$editRequestData->entry->SalEntryID);

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "SAL Was Submitted For Approval")));
    }

    public function closeUserSal(Request $request, Response $response, $args)
    {
        $userSalId = $args['id'];

        if (!$userSalId) {
            return $response->withJson(['status' => 'error', 'error' =>'Error: No User Sal Was Sent'])
                ->withStatus(500);
        }

        $result = $this->api->closeUserSal($userSalId);

        if ($result === 1) {
            $this->logger->error("Error closing sal: $userSalId");

            return $response->withJson(['status' => 'error', 'error' =>'Error: Could Not Close Sal Request'])
                ->withStatus(500);
        }

        return $response->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode(array('message' => "SAL Was Closed Successfully")));
    }

    public function exportUserSalEntries(Request $request, Response $response, $args)
    {
        $userSalId = $args['userSalId'];

        $entries = $this->api->callSalApi('getUserSalEntries', (int)$userSalId);
        $excelBuilder = new ExcelBuilder();
        $writer = $excelBuilder->insertEntries($entries);
        //var_dump(file_exists(__DIR__ . '/../Excel/temp'));
        $excelFileName = __DIR__ . '/../Excel/temp/sal.xlsx';
        $writer->save($excelFileName);

        $newResponse = $response->withHeader('Content-Description', 'File Transfer')
       ->withHeader('Content-Type', 'application/vnd.ms-excel')
        ->withHeader('Content-Disposition', 'attachment;filename="'.basename($excelFileName).'"')
       ->withHeader('Expires', '0')
       ->withHeader('Cache-Control', 'must-revalidate')
       ->withHeader('Pragma', 'public')
       ->withHeader('Content-Length', filesize($excelFileName));

        readfile($excelFileName);
        return $newResponse;

        // return $response->withStatus(200)
        //     ->withHeader('Content-Type', 'application/vnd.ms-excel', 'Content-Disposition', 'attachment;filename="sal.xls"')
        //     ->write(json_encode(basename($excelFileName)));
    }
}