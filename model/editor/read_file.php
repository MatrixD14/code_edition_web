<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../bootstrap.php';

$file = $_GET['file'] ?? '';
$base = realpath(HTDOC);
$path = realpath($base . '/' . ltrim($file, '/'));

if (!$path || !is_file($path) || strpos($path, realpath(HTDOC)) !== 0) {
    http_response_code(403);
    exit;
}

if (ob_get_level()) ob_end_clean();

header('Content-Type: text/plain; charset=utf-8');
readfile($path);
exit;