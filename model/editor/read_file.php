<?php
require_once '../../bootstrap.php';

$file = $_GET['file'] ?? '';
$path = realpath(HTDOC . '/' . $file);

if (!$path || !is_file($path) || strpos($path, realpath(HTDOC)) !== 0) {
    http_response_code(403);
    echo "Acesso negado ou arquivo não encontrado.";
    exit;
}

header('Content-Type: text/plain');
// Jeito mais seguro de ler arquivos grandes no PHP
$content = file_get_contents($path);
echo $content;