<?php
$app->get('/', 'SAL\Controller\HomepageController:homepage')->setName('sal.website.homepage');
$app->get('/profile', 'SAL\Controller\HomepageController:profile')->setName('sal.website.profile');
$app->get('/settings', 'SAL\Controller\HomepageController:settings')->setName('sal.website.settings');
$app->get('/help', 'SAL\Controller\HomepageController:help')->setName('sal.website.help');