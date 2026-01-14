<?php
require_once "../../bootstrap.php";
header("Content-Type: application/json");
$platformDir = $sdkPath . DIRECTORY_SEPARATOR . "platforms";
$versions = [];

foreach (glob($platformDir . DIRECTORY_SEPARATOR . "android-*") as $dir) {
    if (is_dir($dir)) $versions[] = basename($dir);
    
}
sort($versions);
echo json_encode($versions);
