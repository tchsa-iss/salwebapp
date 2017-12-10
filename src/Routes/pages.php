<?php
$app->get('/', 'SAL\Controller\HomepageController:homepage')->setName('sal.website.homepage');
$app->get('/profile', 'SAL\Controller\HomepageController:profile')->setName('sal.website.profile');