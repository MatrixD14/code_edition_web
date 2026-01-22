<?php

define('APP', true);
if (session_status() === PHP_SESSION_NONE)
    session_start();
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$staticDirs = ['css', 'js', 'img', 'fonts'];

foreach ($staticDirs as $dir) {
    if (strpos($path, "/$dir/") === 0) {
        $base = realpath(__DIR__ . '/app/view');

        $file = realpath($base . $path);

        if ($file && str_starts_with($file, $base) && is_file($file)) {
            $ext = pathinfo($file, PATHINFO_EXTENSION);
            $mime = [
                'css'  => 'text/css',
                'js'   => 'application/javascript',
                'png'  => 'image/png',
                'jpg'  => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif'  => 'image/gif',
                'svg'  => 'image/svg+xml',
            ];

            header('Content-Type: ' . ($mime[$ext] ?? 'application/octet-stream'));
            readfile($file);
            exit;
        }
    }
}
require_once __DIR__ . '/bootstrap.php';

$uri = rtrim($path, '/');
if ($uri === '') $uri = '/';
if ($uri === '/') {
    require __DIR__ . '/app/view/login.php';
    exit;
}
if ($uri === '/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    AuthLogin::login();
    exit;
}

if ($uri === '/logout') {
    AuthLogin::logout();
    exit;
}

if ($uri === '/editor') {
    AuthLogin::check();
    require __DIR__ . '/app/view/vendor/editor/editor.php';
    exit;
}

http_response_code(404);
echo 'Página não encontrada';
