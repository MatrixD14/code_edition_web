<?php
require_once '../../bootstrap.php';

$file = $_GET['file'] ?? '';
$path = realpath(HTDOC . '/' . $file);

if (!$path || !is_file($path) || strpos($path, realpath(HTDOC)) !== 0) {
    http_response_code(403);
    echo "Acesso negado ou arquivo não encontrado.";
    exit;
}

if (ob_get_level()) ob_end_clean();

header('Content-Type: text/plain');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;