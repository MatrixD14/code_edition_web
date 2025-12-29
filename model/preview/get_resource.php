<?php
header('Content-Type: application/json');
$projectRoot = $_GET['projectRoot'];
$dir = $projectRoot . "/res/drawable/";
$drawables = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $name = "@drawable/" . pathinfo($file, PATHINFO_FILENAME);
            $drawables[$name] = [
                'path' => "res/drawable/" . $file,
                'type' => pathinfo($file, PATHINFO_EXTENSION)
            ];
        }
    }
}
echo json_encode($drawables);