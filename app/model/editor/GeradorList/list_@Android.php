<?php
$publicPath = $platforms . '/data/res/values/public.xml';
$outputFile = __DIR__ . '/../../../view/vendor/editor/js/autocomplete/list_@android.js';
$organized = [];

if (file_exists($publicPath)) {
    $xmlPublic = @simplexml_load_file($publicPath);

    if ($xmlPublic) {
        foreach ($xmlPublic->public as $resource) {
            $type = (string)$resource['type'];
            $name = (string)$resource['name'];
            if (!isset($organized[$type])) {
                $organized[$type] = [];
            }
            $organized[$type][] = "@android:$type/$name";
        }
        $jsonContent = json_encode($organized, JSON_UNESCAPED_SLASHES);
        $jsContent = "const GLOBAL_ANDROID_REFS = " . $jsonContent . ";";

        file_put_contents($outputFile, $jsContent);
    }
}
