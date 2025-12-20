<?php
require_once '../../bootstrap.php';

$file = $_FILES['file'] ?? null;
$relativePath = $_POST['path'] ?? '';

if (!$file || empty($relativePath)) {
    echo json_encode(['status' => 'error', 'message' => 'Arquivo ausente']);
    exit;
}

$targetPath = HTDOC . DIRECTORY_SEPARATOR . $relativePath;
$targetDir = dirname($targetPath);

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Falha ao mover arquivo']);
}
