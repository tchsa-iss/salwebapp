<?php
$app->get('/admin', 'SAL\Controller\AdminHomeController:homepage')->setName('iss.admin.homepage');
$app->get('/admin/logs/{type}', 'SAL\Controller\AdminHomeController:getLogs')->setName('iss.admin.logs');
$app->get('/admin/employees/{option}', 'SAL\Controller\AdminHomeController:getEmployees');