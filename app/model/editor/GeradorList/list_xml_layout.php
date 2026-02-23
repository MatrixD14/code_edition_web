<?php

$widgetClasses = [];
$tagAttrsAuto = ["View" => [], "ViewGroup" => []];
$manifestAttrsAuto = [];
$drawableAttrsAuto = [];
$GLOBAL_attrValueType = [];
$GLOBAL_xml_values_enums = [];


$attrsPath = $platforms . '/data/res/values/attrs.xml';

if (file_exists($attrsPath)) {

    $xml = simplexml_load_file($attrsPath);

    foreach ($xml->xpath('//attr') as $attr) {

        $name = (string) $attr['name'];
        if (!$name || str_starts_with($name, '__')) continue;

        // Detecta FLAGS
        if ($attr->flag->count() > 0) {

            $values = [];
            foreach ($attr->flag as $flag) {
                $values[] = (string) $flag['name'];
            }

            $GLOBAL_xml_values_enums[$name] = $values;
            $GLOBAL_attrValueType[$name] = "enums.$name";
            continue;
        }

        // Detecta ENUM
        if ($attr->enum->count() > 0) {

            $values = [];
            foreach ($attr->enum as $enum) {
                $values[] = (string) $enum['name'];
            }

            $GLOBAL_xml_values_enums[$name] = $values;
            $GLOBAL_attrValueType[$name] = "enums.$name";
            continue;
        }

        // Se não tem enum/flag → usa format
        $formatAttr = (string) $attr['format'];
        $formats = $formatAttr !== '' ? explode('|', $formatAttr) : [];

        if (in_array('boolean', $formats)) {
            $GLOBAL_attrValueType[$name] = "boolean";
        } elseif (in_array('dimension', $formats)) {
            $GLOBAL_attrValueType[$name] = "dimension";
        } elseif (in_array('color', $formats)) {
            $GLOBAL_attrValueType[$name] = "refs.color";
        } elseif (in_array('reference', $formats)) {
            $GLOBAL_attrValueType[$name] = "refs.id_ref";
        }
    }

    $tempStyleables = [];

    foreach ($xml->{'declare-styleable'} as $styleable) {

        $styleName = (string) $styleable['name'];
        $attrs = [];

        foreach ($styleable->attr as $a) {
            $attrName = (string) $a['name'];
            if ($attrName) $attrs[] = $attrName;
        }

        $tempStyleables[$styleName] = $attrs;

        foreach ($tempStyleables as $name => $attrs) {

            // Ignorar styleables que NÃO são views
            if (
                str_contains($name, '_') ||                     // Layout params
                str_starts_with($name, 'Drawable') ||           // Drawable
                str_starts_with($name, 'TextAppearance') ||     // Aparência
                str_starts_with($name, 'AndroidManifest') ||    // Manifest
                str_starts_with($name, 'Animation') ||
                str_starts_with($name, 'Animator')
            ) {
                continue;
            }

            // Começa com letra maiúscula = provável View real
            if (ctype_upper($name[0])) {
                $widgetClasses[] = $name;
            }
        }

        $widgetClasses = array_unique($widgetClasses);
        sort($widgetClasses);
    }

    $viewBase = $tempStyleables["View"] ?? [];
    $viewGroupBase = $tempStyleables["ViewGroup"] ?? [];

    $layoutBase = array_unique(array_merge(
        $tempStyleables["ViewGroup_Layout"] ?? [],
        $tempStyleables["ViewGroup_MarginLayout"] ?? []
    ));

    foreach ($widgetClasses as $tag) {

        $specificAttrs = $tempStyleables[$tag] ?? [];

        // Remove attrs globais herdados
        $specificAttrs = array_diff($specificAttrs, $viewBase);
        $specificAttrs = array_diff($specificAttrs, $layoutBase);

        $tagAttrsAuto[$tag] = array_values(array_unique($specificAttrs));
    }

    // Define base View
    $tagAttrsAuto["View"] = [];

    // ViewGroup remove o que já é de View
    $tagAttrsAuto["ViewGroup"] = array_values(
        array_diff($viewGroupBase, $viewBase)
    );

    foreach ($tempStyleables as $name => $attrs) {

        // Manifest
        if (str_starts_with($name, 'AndroidManifest')) {

            $clean = str_replace('AndroidManifest', '', $name);

            $map = [
                'UsesPermission' => 'uses-permission',
                'UsesSdk' => 'uses-sdk',
                'IntentFilter' => 'intent-filter',
                'Application' => 'application',
                'Activity' => 'activity'
            ];

            $tagName = $map[$clean] ?? strtolower($clean);
            $manifestAttrsAuto[$tagName] = $attrs;
        }

        // Drawable
        $dMap = [
            'GradientDrawable' => 'gradient',
            'ShapeDrawable' => 'shape',
            'StateListDrawable' => 'selector',
            'LayerDrawable' => 'layer-list',
            'DrawableCorners' => 'corners',
            'DrawablePadding' => 'padding',
            'DrawableSize' => 'size',
            'DrawableSolid' => 'solid',
            'DrawableStroke' => 'stroke',
            'StateListDrawableItem' => 'item',
            'LayerDrawableItem' => 'item'
        ];

        if (isset($dMap[$name])) {
            $drawableAttrsAuto[$dMap[$name]] =
                array_unique(array_merge($drawableAttrsAuto[$dMap[$name]] ?? [], $attrs));
        }
    }
}
