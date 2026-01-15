<?php
define('APP', true);
require_once __DIR__ . '/bootstrap.php';
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$uri = rtrim($uri, '/');

if ($uri === '') {
    require './app/view/login.php';
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
    require './app/view/vendor/editor/editor.php';
    exit;
}

http_response_code(404);
echo 'Página não encontrada';
