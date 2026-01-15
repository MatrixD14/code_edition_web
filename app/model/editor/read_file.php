<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../../bootstrap.php';

$file = $_GET['file'] ?? '';
if (!$file) {
    http_response_code(400);
    exit('Arquivo não informado');
}
$base = realpath(HTDOC);
if (str_starts_with($file, '/')) $path = realpath($file);
 else  $path = realpath($base . '/' . $file);

if (!$path || !is_file($path) || strpos($path, $base) !== 0) {
    http_response_code(403);
    exit;
}

if (ob_get_level()) ob_end_clean();

header('Content-Type: text/plain; charset=utf-8');
readfile($path);
exit;