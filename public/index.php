<?php

require __DIR__ . '/../vendor/autoload.php';

session_start();
error_reporting(E_ALL);
ini_set("display_errors", 1);
// Instantiate the app
$settings = require __DIR__ . '/../src/settings.php';
$app = new \Slim\App($settings);

// Set up dependencies
require __DIR__ . '/../src/dependencies.php';

// Register middleware
require __DIR__ . '/../src/middleware.php';

// Register routes
$routes = scandir(__DIR__ . '/../src/Routes/');
foreach ($routes as $route) {
    if (strpos($route, '.php')) {
        require __DIR__ . '/../src/Routes/' . $route;
    }
}
// Run app
$app->run();
