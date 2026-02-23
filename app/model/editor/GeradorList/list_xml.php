<?php

$GLOBAL_xml_tags = [
    "layout" => [
        "global" => ['style'],
        "namespaces" => ['android', 'tools', 'xmlns', 'app'],
        "tags" => $widgetClasses,
        "baseAttrs" => [
            "android" => $viewBase
        ],
        "tagAttrs" => $tagAttrsAuto
    ],
    "drawable" => [
        "namespaces" => ['android', 'xmlns'],
        "tags" => array_keys($drawableAttrsAuto),
        "tagAttrs" => $drawableAttrsAuto
    ],
    "manifest" => [
        "namespaces" => ['android', 'xmlns'],
        "tags" => array_keys($manifestAttrsAuto),
        "attrs" => $manifestAttrsAuto
    ],
    "values" => [
        "strings" => ["tags" => ["string", "resources"], "attrs" => ["name"]],
        "colors" => ["tags" => ["color", "resources"], "attrs" => ["name"]],
        "styles" => [
            "tags" => ["style", "item", "resources"],
            "attrs" => [
                "style" => ["name", "parent"],
                "item" => ["name"]
            ]
        ]
    ]
];

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

$jsContent  = "GLOBAL.xml_tags = " . json_encode($GLOBAL_xml_tags, JSON_PRETTY_PRINT) . ";\n\n";
$jsContent .= "GLOBAL.xml_values = " . json_encode($GLOBAL_xml_values, JSON_PRETTY_PRINT) . ";\n\n";
$jsContent .= "GLOBAL.attrValueType = " . json_encode($GLOBAL_attrValueType, JSON_PRETTY_PRINT) . ";\n";

file_put_contents($outputFile, $jsContent);
