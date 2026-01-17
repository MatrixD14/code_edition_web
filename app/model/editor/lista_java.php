<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once '../../../bootstrap.php';

function voltapagina($sms)
{
    if (ob_get_length()) ob_clean();
    header('Content-Type: text/plain; charset=utf-8');
    echo $sms;
    exit;
}
$totalClasses = 0;
$classes = [];
$VersionAndroid = $_GET['version'] ?? null;
if (!$VersionAndroid) voltapagina("Versão Android não informada");

if (!is_dir($sdkPath)) voltapagina("caminho invalido: $sdkPath");
$platforms = $sdkPath . DIRECTORY_SEPARATOR . 'platforms' . DIRECTORY_SEPARATOR . $VersionAndroid;
if (!is_dir($platforms)) voltapagina("Nenhuma plataforma $VersionAndroid encontrada em $sdkPath/platforms\n");

$jar = $platforms . DIRECTORY_SEPARATOR . 'android.jar';
if (!file_exists($jar))  voltapagina("android.jar não encontrado em $VersionAndroid");
$jsFile = __DIR__ . '/../../view/vendor/editor/js/autocomplete/list_lib_java.js';
file_put_contents($jsFile, "");

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
    foreach (explode("\n", trim($output)) as $line) {
        $classes[] = str_replace(['/', '.class', '$'], ['.', '', '.'], $line);
    }
}

$classes =  array_values(array_unique($classes));
sort($classes);
$totalClasses = count($classes);
$java = [];
$android = [];
foreach ($classes as $c) {
    if ($c === 'android.R' || str_starts_with($c, 'android.R.')) $android[] = str_replace('android.', '', $c);
    else $java[] = $c;
}
$fileContent  = "var java_imports = [\n  '" . implode("',\n  '", $java) . "'\n];\n";
$fileContent .= "var android_imports = [\n  '" . implode("',\n  '", $android) . "'\n];\n";
$fileContent .= "window.versionAndroid = '$VersionAndroid';\n";
file_put_contents($jsFile, $fileContent);

voltapagina("Listagem concluída em list_lib_java.js | importor $totalClasses classes do $VersionAndroid \n");
