<?php 
if(session_status() === PHP_SESSION_NONE) session_start();
require_once "../../bootstrap.php";

function voltapagina($sms){
    $_SESSION["list_java"]= $sms;
    header("location: ../../view/vendor/editor/editor.php");
    exit;
}
if(!is_dir($sdkPath))voltapagina("caminho invalido: $sdkPath");
$platforms = glob($sdkPath . DIRECTORY_SEPARATOR . 'platforms' . DIRECTORY_SEPARATOR . 'android-*');
if (!$platforms) voltapagina("Nenhuma plataforma android-* encontrada em $sdkPath/platforms\n");

$jsFile = __DIR__ . '/../../view/vendor/editor/js/autocomplete/list_java.js';
file_put_contents($jsFile, "");

foreach ($platforms as $platformPath) {
    $jar = $platformPath . DIRECTORY_SEPARATOR . 'android.jar';
    if (!file_exists($jar)) continue;

    $classes = [];

    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        $zip = new ZipArchive;
        if ($zip->open($jar) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (!str_ends_with($name, '.class')) continue;
                if (str_starts_with($name, 'META-INF/') || $name === 'AndroidManifest.xml' || str_starts_with($name, 'NOTICES') || str_starts_with($name, 'LICENSE')) continue;
                $name = str_replace(['/', '.class', '$'], ['.', '', '.'], $name);
                $classes[] = $name;
            }
            $zip->close();
        }
    } else {
        $output = shell_exec("jar tf \"$jar\" | grep -E '\\.class\$' | grep -v '^META-INF/' | grep -v 'AndroidManifest.xml'");
        $lines = array_filter(array_map('trim', explode("\n", $output)));
        foreach ($lines as $line) {
        $classes[] = str_replace(['/', '.class', '$'], ['.', '', '.'], $line);
    }
    }

    $classes = array_unique($classes);
    sort($classes);

    if ($classes) {
        $fileContent = "const java_imports = [\n  \"" . implode("\",\n  \"", $classes) . "\"\n];\n";
        file_put_contents($jsFile, $fileContent, FILE_APPEND);
    }
}
voltapagina("Listagem concluída em list_java.js\n");