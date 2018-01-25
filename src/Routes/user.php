<?php
$app->get('/', 'SAL\Controller\HomepageController:homepage')->setName('sal.website.homepage');
$app->get('/profile', 'SAL\Controller\HomepageController:profile')->setName('sal.website.profile');
$app->get('/settings', 'SAL\Controller\HomepageController:settings')->setName('sal.website.settings');
$app->get('/help', 'SAL\Controller\HomepageController:help')->setName('sal.website.help');
$app->get('/messages', 'SAL\Controller\HomepageController:messages')->setName('sal.website.messages');

$app->group('/user', function(){
	$this->get('/team/members/{id}', 'SAL\Controller\HomepageController:getTeamMembers');
	
	$this->group('/supervisor', function() {
		$this->get('/team/members/{supervisorId}', 'SAL\Controller\SupervisorController:getSupervisorTeamMembers');
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