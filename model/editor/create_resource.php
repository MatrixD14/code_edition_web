<?php
require_once '../../bootstrap.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$type = $data['type'] ?? '';
$parentDir = $data['parentDir'] ?? '';
$name = $data['name'] ?? '';
$parentDir = trim($parentDir, '/\\');
$basePath = realpath(HTDOC);

$targetPath = $basePath . DIRECTORY_SEPARATOR;
if (!empty($parentDir)) {
    $targetPath .= $parentDir . DIRECTORY_SEPARATOR;
}
$targetPath .= $name;


if ($type === 'folder') {
    if (!is_dir($targetPath)) {
        mkdir($targetPath, 0777, true);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Pasta já existe.']);
    }
} else {
    if (!file_exists($targetPath)) {
        file_put_contents($targetPath, ""); 
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Arquivo já existe.']);
    }
}
