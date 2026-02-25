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
$manifestTags = json_encode(array_values(array_unique($manifestTagsList)));
$layoutPartJS = "{\n" .
    "        global: ['style'],\n" .
    "        namespaces: ['android', 'tools', 'xmlns', 'app'],\n" .
    "        tags: " . json_encode($widgetClasses) . ",\n" .
    "        baseAttrs: {android: " . json_encode($finalBase) . "},\n" .
    "        tagAttrs: $layoutTagAttrsJS\n" .
    "    }";

$xmlTagsJS = "{\n" .
    "    layout: $layoutPartJS,\n" .
    "    drawable: $drawablePart,\n" .
    "    manifest: {\n" .
    "        namespaces: ['android', 'xmlns'],\n" .
    "        tags: $manifestTags,\n" .
    "        attrs: $manifestJS\n" .
    "    },\n" .
    "    values: $valuesPart\n" .
    "}";

$GLOBAL_xml_values = [
    "dimension" => ["0dp", "5dp", "10dp", "20dp", "wrap_content", "match_parent"],
    "size" => ["12sp", "14sp", "16sp", "20sp", "30sp", "40sp"],
    "boolean" => ["true", "false"],
    "refs" => [
        "color" => "@color/",
        "drawable" => "@drawable/",
        "style" => "@style/",
        "id_ref" => "@id/",
        "id_new" => "@+id/"
    ],
    "enums" => $GLOBAL_xml_values_enums
];
$outputFile = __DIR__ . '/../../../view/vendor/editor/js/autocomplete/list_xml.js';
$jsContent  = "GLOBAL.xml_tags = $xmlTagsJS;\n\n";
$jsContent .= "GLOBAL.xml_values = " . json_encode($GLOBAL_xml_values, JSON_PRETTY_PRINT) . ";\n\n";
$jsContent .= "GLOBAL.attrValueType = " . json_encode($GLOBAL_attrValueType, JSON_PRETTY_PRINT) . ";\n";

file_put_contents($outputFile, $jsContent);
