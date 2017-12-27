<?php
$app->get('/admin', 'SAL\Controller\AdminHomeController:homepage')->setName('iss.admin.homepage');
$app->get('/admin/logs/{type}', 'SAL\Controller\AdminHomeController:getLogs')->setName('iss.admin.logs');