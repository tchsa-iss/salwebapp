<?php
/** @var \Dotenv\Dotenv $dotenv */
$dotenv = new Dotenv\Dotenv(__DIR__ . "/../", ".env.sal");
$dotenv->load();

return [
    'settings' => [
        // If you put HelloSlim3 in production, change it to false
        'displayErrorDetails' => true,

        // Renderer settins: where are the templates???
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Monolog settings: where the logs are saved
        'logger' => [
            'path' => __DIR__ . getenv('APP_LOG_PATH'),
        ],
        'timeipsConnection' => [
            'host'     => getenv('TIMEIPS_DB_HOST'),
            'user'     => getenv('TIMEIPS_DB_USER'),
            'password' => getenv('TIMEIPS_DB_PASS'),
        ],
        'admin_users' => [
            getenv('ADMIN_USER') => getenv('ADMIN_PASS')
        ],
    ],
];
