<?php
$app->get('/registration', 'SAL\Controller\RegistrationController:landingPage')->setName('sal.registration');
$app->post('/register', 'SAL\Controller\RegistrationController:registerUser');
