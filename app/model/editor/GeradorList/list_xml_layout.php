<?php
$widgetClasses = [];
$tagAttrsAuto = ["View" => [], "ViewGroup" => []];
$manifestAttrsAuto = [];
$drawableAttrsAuto = [];
$GLOBAL_attrValueType = [];
$GLOBAL_xml_values_enums = [];
$tempStyleables = [];

$attrsPath = $platforms . '/data/res/values/attrs.xml';

if (file_exists($attrsPath)) {
    $xml = @simplexml_load_file($attrsPath);
    if ($xml) {
        foreach ($xml->xpath('//attr') as $attr) {
            $name = (string)$attr['name'];
            if (!$name || str_starts_with($name, '__')) continue;

            if ($attr->flag->count() > 0 || $attr->enum->count() > 0) {
                $values = [];
                $nodes = $attr->flag->count() > 0 ? $attr->flag : $attr->enum;
                foreach ($nodes as $node) {
                    $values[] = (string)$node['name'];
                }
                $GLOBAL_xml_values_enums[$name] = $values;
                $GLOBAL_attrValueType[$name] = "enums.$name";
            } else {
                $formatAttr = (string)$attr['format'];
                $formats = $formatAttr !== '' ? explode('|', $formatAttr) : [];
                if (in_array('boolean', $formats)) $GLOBAL_attrValueType[$name] = "boolean";
                elseif (in_array('dimension', $formats)) $GLOBAL_attrValueType[$name] = "dimension";
                elseif (in_array('color', $formats)) $GLOBAL_attrValueType[$name] = "refs.color";
                elseif (in_array('reference', $formats)) $GLOBAL_attrValueType[$name] = "refs.id_ref";
            }
        }

        foreach ($xml->{'declare-styleable'} as $styleable) {
            $styleName = (string)$styleable['name'];
            $attrs = [];
            foreach ($styleable->attr as $a) {
                if ($a['name']) $attrs[] = (string)$a['name'];
            }
            $tempStyleables[$styleName] = $attrs;
            if (
                ctype_upper($styleName[0]) &&
                !str_contains($styleName, '_') &&
                !str_contains($styleName, 'Drawable') &&
                !str_contains($styleName, 'Vector') &&
                !str_contains($styleName, 'Animation') &&
                !str_contains($styleName, 'State') &&
                !in_array($styleName, ['Window', 'Theme', 'TextAppearance'])
            ) {
                $widgetClasses[] = $styleName;
            }
        }
    }

    $viewBase = $tempStyleables["View"] ?? [];

    $layoutBase = array_unique(array_merge(
        $tempStyleables["ViewGroup_Layout"] ?? [],
        $tempStyleables["ViewGroup_MarginLayout"] ?? [],
        $tempStyleables["RelativeLayout_Layout"] ?? []
    ));
    $heranca_simples = [
        "TextView" => ["Button", "EditText", "CheckBox", "RadioButton", "Switch", "CheckedTextView", "ToggleButton", "Chronometer"],
        "ImageView" => ["ImageButton", "QuickContactBadge"],
        "ProgressBar" => ["SeekBar", "RatingBar"],
        "AbsListView" => ["ListView", "GridView"],
        "ViewAnimator" => ["ViewFlipper", "ViewSwitcher", "ImageSwitcher", "TextSwitcher"]
    ];
    $mapaPaiLayout = [];
    foreach ($heranca_simples as $pai => $filhos) {
        foreach ($filhos as $filho) {
            $mapaPaiLayout[$filho] = $pai;
        }
    }

    foreach (array_unique($widgetClasses) as $tag) {
        $attrs = $tempStyleables[$tag] ?? [];
        $attrs = array_diff($attrs, $viewBase, $layoutBase);
        $attrsLimpos = array_filter($attrs, function ($attr) {
            return !str_starts_with($attr, '__removed') &&
                !str_contains($attr, 'nextCluster') &&
                !str_starts_with($attr, 'focusedBy');
        });
        $tagAttrsAuto[$tag] = array_values(array_unique($attrsLimpos));
    }
    $layoutEntries = [];
    foreach ($tagAttrsAuto as $tag => $attrs) {
        if (isset($mapaPaiLayout[$tag])) {
            $pai = $mapaPaiLayout[$tag];
            $especificos = array_diff($attrs, $tagAttrsAuto[$pai] ?? []);
            if (empty($especificos)) {
                $layoutEntries[] = "$tag: [...GLOBAL.xml_tags.layout.tagAttrs.$pai]";
            } else {
                $especificosJson = trim(json_encode(array_values($especificos)), "[]");
                $layoutEntries[] = "$tag: [...GLOBAL.xml_tags.layout.tagAttrs.$pai,$especificosJson]";
            }
        } else {
            $layoutEntries[] = "$tag: " . json_encode($tagAttrsAuto[$tag]);
        }
    }
    $layoutTagAttrsJS = "{\n            " . implode(",\n            ", $layoutEntries) . "\n        }";

    // Drawable
    $dMap = [
        'GradientDrawable' => 'shape',
        'ShapeDrawable' => 'shape',
        'GradientDrawableSolid' => 'solid',
        'GradientDrawableStroke' => 'stroke',
        'GradientDrawableSize'  => 'size',
        'GradientDrawableGradient' => 'gradient',
        'StateListDrawable' => 'selector',
        'LayerDrawable' => 'layer-list',
        'DrawableCorners' => 'corners',
        'DrawablePadding' => 'padding',
        'StateListDrawableItem' => 'item',
        'LayerDrawableItem' => 'item'
    ];
    foreach ($dMap as $style => $tag) {
        if (isset($tempStyleables[$style])) {
            $drawableAttrsAuto[$tag] = array_values(array_unique(array_merge($drawableAttrsAuto[$tag] ?? [], $tempStyleables[$style])));
        }
    }
    $finalBaseRaw = array_unique(array_merge($viewBase, $layoutBase));

    $finalBase = array_values(array_filter($finalBaseRaw, function ($attr) {
        $blackList = ['__removed', 'nextCluster', 'keyboardNavigation'];

        foreach ($blackList as $word) {
            if (str_contains($attr, $word)) return false;
        }
        return true;
    }));
}
