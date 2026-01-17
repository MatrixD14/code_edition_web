<?php
require_once '../../../bootstrap.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$currentDir = !empty($data['cwd']) ? $data['cwd'] : realpath(HTDOC);
$partial = $data['partial'] ?? '';

if (strpos(realpath($currentDir), realpath(HTDOC)) !== 0) {
    echo json_encode([]);
    exit;
}

$files = scandir($currentDir);
$suggestions = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;

    if (stripos($file, $partial) === 0) {
        $suggestions[] = is_dir($currentDir . DIRECTORY_SEPARATOR . $file) ? $file . '/' : $file;
    }
}

echo json_encode($suggestions);
