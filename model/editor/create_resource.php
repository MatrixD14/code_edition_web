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
        $content = "";
        $extension = pathinfo($targetPath, PATHINFO_EXTENSION);
        $fileNameOnly = pathinfo($targetPath, PATHINFO_FILENAME);
        switch($extension){
            case "xml":
                $content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
                break;
            case "java":
                $relativePath = str_replace(HTDOC, '', $targetPath);
                $relativePath = trim($relativePath, DIRECTORY_SEPARATOR);
                $pathParts = explode(DIRECTORY_SEPARATOR, $relativePath);
                $srcIndex = array_search('src', $pathParts);
                if ($srcIndex !== false) {
                    $packageArray = array_slice($pathParts, $srcIndex + 1, -1);
                    $packageName = implode('.', $packageArray);
                    
                    $rootPackage = (count($packageArray) >= 3) 
                        ? $packageArray[0] . '.' . $packageArray[1] . '.' . $packageArray[2]
                        : $packageName;}
                        $content = "package {$packageName};\n\nimport {$rootPackage}.R;\nimport android.app.Activity;\nimport android.os.Bundle;\npublic class {$fileNameOnly} extends Activity {\n\n  @Override\n  protected void onCreate(Bundle b) {\n    super.onCreate(b);\n  }\n}";
                break;
        }
        file_put_contents($targetPath, $content);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Arquivo já existe.']);
    }
}
