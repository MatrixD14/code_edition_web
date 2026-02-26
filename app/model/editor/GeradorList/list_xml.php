<?php


$drawableData = [
    "namespaces" => ['android', 'xmlns'],
    "tags" => array_keys($drawableAttrsAuto),
    "tagAttrs" => $drawableAttrsAuto
];

$valuesData = [
    "strings" => ["tags" => ["string", "resources"], "attrs" => ["name"]],
    "colors" => ["tags" => ["color", "resources"], "attrs" => ["name"]],
    "styles" => [
        "tags" => ["style", "item", "resources"],
        "attrs" => ["style" => ["name", "parent"], "item" => ["name"]]
    ]
];
$drawablePart = json_encode($drawableData, JSON_PRETTY_PRINT);
$valuesPart   = json_encode($valuesData, JSON_PRETTY_PRINT);
$manifestTags = json_encode(array_values(array_unique($manifestTagsList ?? [])));
$xmlTagsJS = "{\n" .
    "    layout: {\n" .
    "        global: ['style'],\n" .
    "        namespaces: ['android', 'tools', 'xmlns', 'app'],\n" .
    "        tags: " . json_encode($widgetClasses) . ",\n" .
    "        baseAttrs: {android: " . json_encode($finalBase) . "},\n" .
    "        tagAttrs: $layoutTagAttrsJS\n" .
    "    },\n" .
    "    drawable: $drawablePart,\n" .
    "    manifest: {\n" .
    "        namespaces: ['android', 'xmlns', 'package'],\n" .
    "        tags: $manifestTags,\n" .
    "        attrs: $manifestJS\n" .
    "    },\n" .
    "    values: $valuesPart\n" .
    "}";

$GLOBAL_xml_values = [
    "boolean"   => ["true", "false"],
    "integer"   => ["0", "1", "2", "10", "100"],
    "float"     => ["0.0", "1.0", "0.5"],
    "const_dimen" => ["match_parent", "wrap_content"],
    "dp_values"   => ["0dp", "8dp", "16dp", "32dp"],
    "sp_values"   => ["12sp", "14sp", "16sp", "18sp", "20sp", "24sp"],
    "refs" => [
        "color"    => ["@color/", "@android:color/"],
        "drawable" => ["@drawable/", "@android:drawable/"],
        "string"   => ["@string/", "@android:string/"],
        "style"    => ["@style/", "@android:style/"],
        "id_ref"   => ["@id/", "@android:id/"],
        "id_new" => "@+id/"
    ],
    "enums" => $GLOBAL_xml_values_enums
];
$outputFile = __DIR__ . '/../../../view/vendor/editor/js/autocomplete/list_xml.js';
$jsContent = "$jsLayoutPrototypes\n\n";
$jsContent .= $jsManifestPrototypes . "\n";
$jsContent .= "GLOBAL.xml_tags = $xmlTagsJS;\n\n";
$jsContent .= "GLOBAL.xml_values = " . json_encode($GLOBAL_xml_values, JSON_PRETTY_PRINT) . ";\n\n";
$jsContent .= "GLOBAL.attrValueType = " . json_encode($GLOBAL_attrValueType, JSON_PRETTY_PRINT) . ";\n";

file_put_contents($outputFile, $jsContent);
