<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../../bootstrap.php';

ob_start();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$file = $data['file'] ?? '';
if (!$file) {
    http_response_code(400);
    exit('Arquivo não informado');
}
$content = $data['content'] ?? '';

$path = realpath(HTDOC . DIRECTORY_SEPARATOR . $file);

if (!$path || strpos($path, realpath(HTDOC)) !== 0) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Caminho inválido ou fora do HTDOC']);
    exit;
}

if (file_put_contents($path, $content) !== false) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success']);
} else {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Erro de permissão ao salvar']);
}
