<?php
// Configuration for Slim Dependency Injection Container
$container = $app->getContainer();

// Flash messages
$container['flash'] = function () {
    return new \Slim\Flash\Messages();
};

// Monolog
$container['logger'] = function ($container) {
    $settings = $container->get('settings')['logger'];
    $jsonFormatter = new Monolog\Formatter\JsonFormatter();
    $uId = new Monolog\Processor\UidProcessor();


    $stream = new Monolog\Handler\StreamHandler($settings['path'], Monolog\Logger::DEBUG);
    $stream->setFormatter($jsonFormatter);

    $logger = new Monolog\Logger($settings['path']);
    $logger->pushHandler($stream);
    $logger->pushProcessor($uId);
    $logger->pushProcessor(function($record) {
        $record['extra']['user'] = $_SERVER['AUTH_USER'] ?: "AUTH_USER_EMPTY";
        return $record;
    });
    return $logger;
};

// Using Twig as template engine
$container['view'] = function ($container) {
    $render = $container->get('settings')['renderer'];
    $view = new \Slim\Views\Twig($render['template_path'], [
        'cache' => false //'cache'
    ]);
    $view->addExtension(new \Slim\Views\TwigExtension(
        $container['router'],
        $container['request']->getUri()
    ));

    return $view;
};

// Homepage Controller
$container['SAL\Controller\HomepageController'] = function ($container) {
    return new SAL\Controller\HomepageController($container);
};

// Registation controller re-route for new users
$container['SAL\Controller\RegistrationController'] = function($container) {
    return new SAL\Controller\RegistrationController($container);
};

// Admin Homepage Controller AdminHomeController
$container['SAL\Controller\AdminHomeController'] = function ($container) {
    return new SAL\Controller\AdminHomeController($container);
};

// API Controller
$container['SAL\Controller\ApiController'] = function ($container) {
    return new SAL\Controller\ApiController($container);
};