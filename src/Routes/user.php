<?php
$app->get('/', 'SAL\Controller\HomepageController:homepage')->setName('sal.website.homepage');
$app->get('/profile', 'SAL\Controller\HomepageController:profile')->setName('sal.website.profile');
$app->get('/settings', 'SAL\Controller\HomepageController:settings')->setName('sal.website.settings');
$app->get('/help', 'SAL\Controller\HomepageController:help')->setName('sal.website.help');
$app->get('/messages', 'SAL\Controller\HomepageController:messages')->setName('sal.website.messages');

$app->group('/user', function(){
	$this->get('/sals', 'SAL\Controller\UserController:getUserSalsByDateRange');
	$this->get('/sal/timeips/time', 'SAL\Controller\UserController:getTimeIpsTime');
	$this->get('/sal/form/entry/data', 'SAL\Controller\UserController:getSalEntryData');
	$this->get('/sal/entries/{id}', 'SAL\Controller\UserController:getUserSalEntries');
	$this->get('/sals/by/status[/{userId}[/{status}]]', 'SAL\Controller\UserController:getUserSalsByStatus');
	$this->get('/export/sal/entries/{userSalId}', 'SAL\Controller\UserController:exportUserSalEntries');

	$this->post('/create/sal/entry', 'SAL\Controller\UserController:createUserSalEntry');
	$this->post('/edit/sal/entry', 'SAL\Controller\UserController:editUserSalEntry');
	$this->post('/reopen/sal/entry', 'SAL\Controller\UserController:reopenUserSal');
	$this->post('/delete/sal/entry', 'SAL\Controller\UserController:deleteUserSalEntry');
	$this->post('/submit/sal', 'SAL\Controller\UserController:submitUserSal');
	$this->post('/close/sal/{id}', 'SAL\Controller\UserController:closeUserSal');

	$this->get('/team/members/{id}', 'SAL\Controller\HomepageController:getTeamMembers');
	
	$this->group('/supervisor', function() {
		$this->get('/team/members/{supervisorId}', 'SAL\Controller\SupervisorController:getSupervisorTeamMembers');
		$this->get('/team/member/timeips/time', 'SAL\Controller\SupervisorController:getUserTimeIpsTime');

		$this->post('/create/team/member/sal', 'SAL\Controller\SupervisorController:createNewUserSal');
		$this->post('/team/member/sal/approved/{userSalId}', 'SAL\Controller\SupervisorController:approveUserSal');
		$this->post('/team/member/sal/error', 'SAL\Controller\SupervisorController:rejectUserSal');
	});

	$this->group('/super', function() {
		$this->get('/employees/all', 'SAL\Controller\SuperUserController:getAllEmployees');
		$this->get('/supervisors/all', 'SAL\Controller\SuperUserController:getAllSupervisors');
		$this->get('/supervisor/{id}', 'SAL\Controller\SuperUserController:getSupervisorWithId');
		$this->get('/supervisors/{userId}', 'SAL\Controller\SuperUserController:getAllSupervisorsForUser');


		$this->post('/add/supervisors/{id}', 'SAL\Controller\SuperUserController:createSupervisor');
		$this->post('/delete/supervisor/{id}', 'SAL\Controller\SuperUserController:deleteSupervisor');
		$this->post('/assign/employee/supervisor', 'SAL\Controller\SuperUserController:assignEmployeeToSupervisor');
		$this->post('/remove/employee/supervisor', 'SAL\Controller\SuperUserController:removeSupervisorFromEmployee');
	});
});