<?php
$classes = [];
$jsFile = __DIR__ . '/../../../view/vendor/editor/js/autocomplete/list_lib_java.js';
// file_put_contents($jsFile, "");

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
