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
                $xmlType = $data['xmlType'] ?? null;
                if ($extension === "xml") $content = xmlTemplate($xmlType);
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
function xmlTemplate($type) {
    switch ($type) {
        case 'layout':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LinearLayout xmlns:android=\"http://schemas.android.com/apk/res/android\"\n  android:layout_width=\"match_parent\"\n  android:layout_height=\"match_parent\">\n\n</LinearLayout>";

    case 'values':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n\n</resources>";

    case 'drawable:shape':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<shape xmlns:android=\"http://schemas.android.com/apk/res/android\">\n</shape>";

    case 'drawable:selector':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<selector xmlns:android=\"http://schemas.android.com/apk/res/android\">\n</selector>";

    case 'drawable:layerList':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<layer-list xmlns:android=\"http://schemas.android.com/apk/res/android\">\n</layer-list>";

    case 'drawable:ripple':
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<ripple xmlns:android=\"http://schemas.android.com/apk/res/android\">\n</ripple>";

    default:
      return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n</resources>";
  }
}
