<?php
$manifestAttrsPath = $platforms . '/data/res/values/attrs_manifest.xml';

if (file_exists($manifestAttrsPath)) {

    $xmlManifest = simplexml_load_file($manifestAttrsPath);

    foreach ($xmlManifest->xpath('//attr') as $attr) {
        $typeStr = processXmlAttr($attr, $GLOBAL_xml_values_enums);
        if ($typeStr) {
            $GLOBAL_attrValueType[(string)$attr['name']] = $typeStr;
        }
    }

    if (isset($xmlManifest)) {
        $manifestStyleables = [];
        $mapManifest = [
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
        $manifestParentsNecessarios = ['AndroidManifest', 'AndroidManifestApplication'];
        $jsManifestPrototypes = "var manifestParents = {};\n";
        foreach ($manifestParentsNecessarios as $parentName) {
            $attrsResolvidos = resolveManifestStyleable($parentName, $manifestStyleables);
            $clean = ($parentName === 'AndroidManifest') ? 'Manifest' : str_replace('AndroidManifest', '', $parentName);
            $parentTag = $mapManifest[$clean] ?? strtolower($clean);
            $jsManifestPrototypes .= "manifestParents['$parentTag'] = " . json_encode($attrsResolvidos) . ";\n";
        }
        $manifestEntries = [];
        $manifestTagsList = [];
        foreach ($manifestStyleables as $styleName => $data) {
            if (!str_starts_with($styleName, 'AndroidManifest')) continue;

            $clean = ($styleName === 'AndroidManifest') ? 'Manifest' : str_replace('AndroidManifest', '', $styleName);
            $tagName = $mapManifest[$clean] ?? strtolower($clean);
            if ($tagName === 'manifest') {
                if (!in_array('package', $data['attrs']))
                    $data['attrs'][] = 'package';
            }
            $manifestTagsList[] = $tagName;
            $parent = $data['parent'];

            if ($parent && isset($manifestStyleables[$parent])) {
                $parentClean = ($parent === 'AndroidManifest') ? 'Manifest' : str_replace('AndroidManifest', '', $parent);
                $parentTag = $mapManifest[$parentClean] ?? strtolower($parentClean);
                $especificos = $data['attrs'];
                $especificosJson = json_encode(array_values($especificos));

                $manifestEntries[] = "\"$tagName\": [...(manifestParents['$parentTag'] || []), ...$especificosJson]";
            } else {
                if (in_array($styleName, $manifestParentsNecessarios)) {
                    $cleanProt = ($styleName === 'AndroidManifest') ? 'Manifest' : str_replace('AndroidManifest', '', $styleName);
                    $tagProt = $mapManifest[$cleanProt] ?? strtolower($cleanProt);
                    $manifestEntries[] = "\"$tagName\": manifestParents['$tagProt']";
                } else {
                    $manifestEntries[] = "\"$tagName\": " . json_encode($data['attrs']);
                }
            }
        }
        $manifestJS = "{\n            " . implode(",\n            ", $manifestEntries) . "\n        }";
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
