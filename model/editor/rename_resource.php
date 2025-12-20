<?php
require_once '../../bootstrap.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$oldPath = $data['oldPath'] ?? '';
$newName = $data['newName'] ?? '';

if (empty($oldPath) || empty($newName)) {
    echo json_encode(['status' => 'error', 'message' => 'Dados incompletos.']);
    exit;
}

$fullOldPath = realpath(HTDOC . DIRECTORY_SEPARATOR . $oldPath);
$parentDir = dirname($fullOldPath);
$fullNewPath = $parentDir . DIRECTORY_SEPARATOR . $newName;

if (!$fullOldPath || strpos($fullOldPath, realpath(HTDOC)) !== 0) {
    echo json_encode(['status' => 'error', 'message' => 'Acesso negado.']);
    exit;
}

if (rename($fullOldPath, $fullNewPath)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao renomear no servidor.']);
}