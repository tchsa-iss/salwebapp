<?php
// Configuration for Slim Dependency Injection Container
$container = $app->getContainer();

// Flash messages
$container['flash'] = function () {
    return new \Slim\Flash\Messages();
};

// Monolog
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $jsonFormatter = new Monolog\Formatter\JsonFormatter();
    $uId = new Monolog\Processor\UidProcessor();


    $stream = new Monolog\Handler\StreamHandler($settings['path'], Monolog\Logger::DEBUG);
    $stream->setFormatter($jsonFormatter);

    $logger = new Monolog\Logger($settings['name']);
    $logger->pushHandler($stream);
    $logger->pushProcessor($uId);
    $logger->pushProcessor(function($record) {
        $record['extra']['user'] = $_SERVER['AUTH_USER'] ?: "AUTH_USER_EMPTY";
        return $record;
    });
    // $logger->pushProcessor(new Monolog\Processor\UidProcessor());
    // $logger->pushHandler(new Monolog\Handler\StreamHandler($settings['path'], Monolog\Logger::DEBUG));
    return $logger;
};

// Using Twig as template engine
$container['view'] = function ($c) {
    $render = $c->get('settings')['renderer'];
    $view = new \Slim\Views\Twig($render['template_path'], [
        'cache' => false //'cache'
    ]);
    $view->addExtension(new \Slim\Views\TwigExtension(
        $c['router'],
        $c['request']->getUri()
    ));

    return $view;
};

// Doctrine configuration
// $container['em'] = function ($c) {
//     $settings = $c->get('settings');
//     $config = \Doctrine\ORM\Tools\Setup::createAnnotationMetadataConfiguration(
//         $settings['doctrine']['meta']['entity_path'],
//         $settings['doctrine']['meta']['auto_generate_proxies'],
//         $settings['doctrine']['meta']['proxy_dir'],
//         $settings['doctrine']['meta']['cache'],
//         false
//     );
//     return \Doctrine\ORM\EntityManager::create($settings['doctrine']['connection'], $config);
// };

// Customized Resources Here!

// Homepage Controller
$container['SAL\Controller\HomepageController'] = function ($c) {
    return new SAL\Controller\HomepageController($c);
};

// Registation controller re-route for new users
$container['SAL\Controller\RegistrationController'] = function($c) {
    return new SAL\Controller\RegistrationController($c);
};

// Admin Homepage Controller AdminHomeController
$container['SAL\Controller\AdminHomeController'] = function ($c) {
    $log =  $c->get('logger')->info("attempt to access admin page");
    return new SAL\Controller\AdminHomeController($c);
};

// API Controller
$container['SAL\Controller\ApiController'] = function ($c) {
    return new SAL\Controller\ApiController($c);
};