<?php
require_once '../bootstrap.php';

$dir = $_GET['open_file'] ?? '';
$path = realpath(HTDOC . '/' . $dir);

if (!$path || strpos($path, HTDOC) !== 0) {
    http_response_code(403);
    exit;
}

$data = [];

foreach (scandir($path) as $f) {
    if ($f[0] === '.') continue;

    $full = "$path/$f";

    $data[] = [
        'name' => $f,
        'path' => substr($full, strlen(HTDOC) + 1),
        'type' => is_dir($full) ? 'dir' : 'file'
    ];
}

header('Content-Type: application/json');
echo json_encode($data);
