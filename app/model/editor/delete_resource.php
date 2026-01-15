<?php
require_once '../../../bootstrap.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$pathRelative = $data['path'] ?? '';

if (empty($pathRelative)) {
    echo json_encode(['status' => 'error', 'message' => 'Caminho vazio']);
    exit;
}

$fullPath = realpath(HTDOC . DIRECTORY_SEPARATOR . $pathRelative);
if (!$fullPath || strpos($fullPath, realpath(HTDOC)) !== 0) {
    echo json_encode(['status' => 'error', 'message' => 'Acesso negado']);
    exit;
}

try {
    if (is_dir($fullPath)) {
        function deleteDir($dirPath) {
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dirPath, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $item) {
                $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
            }
            return rmdir($dirPath);
        }
        deleteDir($fullPath);
    } else {
        unlink($fullPath);
    }
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}