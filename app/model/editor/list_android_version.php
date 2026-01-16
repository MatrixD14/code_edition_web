<?php
require_once '../../../bootstrap.php';
header("Content-Type: application/json");
$platformDir = $sdkPath . DIRECTORY_SEPARATOR . "platforms";
if (!is_dir($platformDir)) {
    echo json_encode([]);
    exit;
}
$versions = [];
$dir = new DirectoryIterator($platformDir);
foreach ($dir as $fileinfo) {
    if ($fileinfo->isDir() && !$fileinfo->isDot()) {
        $name = $fileinfo->getFilename();
        if (preg_match('/^android-\d+$/', $name)) $versions[] = $name;
    }
}
natsort($versions);
echo json_encode(array_values($versions));
