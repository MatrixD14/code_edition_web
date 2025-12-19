<?php
require_once '../bootstrap.php';

if (!empty($_FILES['file'])) {
    $paths = $_POST['paths']; 
    
    foreach ($_FILES['file']['tmp_name'] as $key => $tmpName) {
        $relativePath = $paths[$key];
        $fullPath = HTDOC . DIRECTORY_SEPARATOR . $relativePath;
        $folder = dirname($fullPath);

        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }

        move_uploaded_file($tmpName, $fullPath);
    }
    echo json_encode(['status' => 'success']);
}