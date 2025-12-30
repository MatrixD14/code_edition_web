<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../bootstrap.php';

$file = $_GET['file'] ?? '';
$base = realpath(HTDOC);
$path = realpath($base . '/' . ltrim($file, '/'));

if (!$path || !is_file($path) || strpos($path, $base) !== 0) {
    http_response_code(403);
    exit;
}

$mime = mime_content_type($path);
if (!str_starts_with($mime, 'image/')) {
    http_response_code(415);
    exit;
}

if (ob_get_level()) ob_end_clean();

header("Content-Type: $mime");
header("Content-Length: " . filesize($path));
header("Cache-Control: public, max-age=86400");

readfile($path);
exit;
