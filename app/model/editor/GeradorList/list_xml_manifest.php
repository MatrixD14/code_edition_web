<?php
$manifestAttrsPath = $platforms . '/data/res/values/attrs_manifest.xml';

if (file_exists($manifestAttrsPath)) {

    $xmlManifest = simplexml_load_file($manifestAttrsPath);

    foreach ($xmlManifest->xpath('//attr') as $attr) {

        $name = (string) $attr['name'];
        if (!$name) continue;

        $allAvailableAttributes[] = $name;

        // FLAGS
        if ($attr->flag->count() > 0) {
            $values = [];
            foreach ($attr->flag as $flag) {
                $values[] = (string)$flag['name'];
            }

            $GLOBAL_xml_values_enums[$name] = $values;
            $GLOBAL_attrValueType[$name] = "enums.$name";
            continue;
        }

        // ENUM
        if ($attr->enum->count() > 0) {
            $values = [];
            foreach ($attr->enum as $enum) {
                $values[] = (string)$enum['name'];
            }

            $GLOBAL_xml_values_enums[$name] = $values;
            $GLOBAL_attrValueType[$name] = "enums.$name";
            continue;
        }
        $formatAttr = (string) $attr['format'];
        $formats = $formatAttr !== '' ? explode('|', $formatAttr) : [];

        if (in_array('boolean', $formats)) {
            $GLOBAL_attrValueType[$name] = "boolean";
        } elseif (in_array('string', $formats)) {
            $GLOBAL_attrValueType[$name] = "string";
        }
    }
    // foreach ($xmlManifest->{'declare-styleable'} as $styleable) {

    //     $styleName = (string) $styleable['name'];
    //     $attrs = [];

    //     foreach ($styleable->attr as $a) {
    //         $attrName = (string) $a['name'];
    //         if ($attrName) $attrs[] = $attrName;
    //     }

    //     // Manifest tags começam com AndroidManifest
    //     if (str_starts_with($styleName, 'AndroidManifest')) {

    //         $clean = str_replace('AndroidManifest', '', $styleName);

    //         $map = [
    //             'Application' => 'application',
    //             'Activity' => 'activity',
    //             'Service' => 'service',
    //             'Receiver' => 'receiver',
    //             'Provider' => 'provider',
    //             'UsesPermission' => 'uses-permission',
    //             'UsesSdk' => 'uses-sdk',
    //             'IntentFilter' => 'intent-filter',
    //             'Permission' => 'permission',
    //             'Manifest' => 'manifest'
    //         ];

    //         $tagName = $map[$clean] ?? strtolower($clean);

    //         $manifestAttrsAuto[$tagName] = $attrs;
    //     }
    // }

    $manifestStyleables = [];

    foreach ($xmlManifest->{'declare-styleable'} as $styleable) {

        $styleName = (string) $styleable['name'];
        $parent = (string) $styleable['parent'];

        $attrs = [];

        foreach ($styleable->attr as $a) {
            $attrName = (string) $a['name'];
            if ($attrName) $attrs[] = $attrName;
        }

        $manifestStyleables[$styleName] = [
            'attrs' => $attrs,
            'parent' => $parent ?: null
        ];
    }
    $manifestAttrsAuto = [];

    foreach ($manifestStyleables as $styleName => $data) {

        // Só queremos os que começam com AndroidManifest
        if (!str_starts_with($styleName, 'AndroidManifest')) continue;

        if ($styleName === 'AndroidManifest')
            $clean = 'Manifest';
        else
            $clean = str_replace('AndroidManifest', '', $styleName);
        if (!$clean) continue;
        $map = [
            'Manifest' => 'manifest',
            'Application' => 'application',
            'Activity' => 'activity',
            'Service' => 'service',
            'Receiver' => 'receiver',
            'Provider' => 'provider',
            'UsesPermission' => 'uses-permission',
            'UsesSdk' => 'uses-sdk',
            'IntentFilter' => 'intent-filter',
            'Permission' => 'permission',
            'Manifest' => 'manifest'
        ];

        $tagName = $map[$clean] ?? strtolower($clean);

        // 🔥 AQUI está a mágica da herança
        $manifestAttrsAuto[$tagName] =
            resolveManifestStyleable($styleName, $manifestStyleables);
    }
}
function resolveManifestStyleable($name, $styleables)
{
    if (!isset($styleables[$name])) return [];

    $current = $styleables[$name];

    $attrs = $current['attrs'];
    $parent = $current['parent'];

    if ($parent && isset($styleables[$parent])) {
        $attrs = array_merge(
            resolveManifestStyleable($parent, $styleables),
            $attrs
        );
    }

    return array_values(array_unique($attrs));
}
