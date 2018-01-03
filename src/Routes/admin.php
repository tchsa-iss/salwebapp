<?php
$app->get('/admin', 'SAL\Controller\AdminHomeController:homepage')->setName('iss.admin.homepage');
$app->get('/admin/logs/{type}', 'SAL\Controller\AdminHomeController:getLogs')->setName('iss.admin.logs');
$app->get('/admin/employees/{option}', 'SAL\Controller\AdminHomeController:getEmployees');
$app->get('/admin/database/service/units', 'SAL\Controller\AdminHomeController:getServiceUnits');
$app->get('/admin/database/user/roles', 'SAL\Controller\AdminHomeController:getUserRoles');
$app->get('/admin/database/user/roles/{id}', 'SAL\Controller\AdminHomeController:getUserRoles');
$app->get('/admin/database/user/reporting/units', 'SAL\Controller\AdminHomeController:getUserReportingUnits');
