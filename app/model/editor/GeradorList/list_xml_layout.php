<?php
$widgetClasses = [];
$tagAttrsAuto = ["View" => [], "ViewGroup" => []];
$manifestAttrsAuto = [];
$drawableAttrsAuto = [];
$GLOBAL_attrValueType = [];
$GLOBAL_xml_values_enums = [];
$tempStyleables = [];

function processXmlAttr($attr, &$GLOBAL_xml_values_enums)
{
    $name = (string)$attr['name'];
    if (!$name || str_starts_with($name, '__')) return null;
    $detectedTypes = [];
    if ($attr->flag->count() > 0 || $attr->enum->count() > 0) {
        $values = [];
        $nodes = $attr->flag->count() > 0 ? $attr->flag : $attr->enum;
        foreach ($nodes as $node) {
            $values[] = (string)$node['name'];
        }
        $GLOBAL_xml_values_enums[$name] = $values;
        $detectedTypes[] = "enums.$name";
    }
    $formatAttr = (string)$attr['format'];
    $formats = $formatAttr !== '' ? explode('|', $formatAttr) : [];
    $map = [
        'boolean'   => 'boolean',
        'integer'   => 'integer',
        'float'     => 'float',
        'dimension' => 'dimension',
        'color'     => 'color',
        'string'    => 'string'
    ];

    foreach ($map as $key => $val) {
        if (in_array($key, $formats)) {
            $detectedTypes[] = $val;
            if ($key === 'color' || $key === 'string') $detectedTypes[] = "refs.$key";
        }
    }
    if (in_array('reference', $formats)) {
        if (preg_match('/(src|icon|drawable|background|thumb|button|indeterminateDrawable)/i', $name)) {
            $detectedTypes[] = "refs.drawable";
        }
        if (preg_match('/(style|appearance|theme)/i', $name)) {
            $detectedTypes[] = "refs.style";
        }
        if (preg_match('/(id|below|above|toLeft|toRight|toStart|toEnd|align)/i', $name)) {
            $detectedTypes[] = "refs.id_ref";
        }
        if ($name === 'id') $detectedTypes[] = "refs.id_new";
        if (!preg_grep('/^refs\./', $detectedTypes)) {
            $detectedTypes[] = "refs.id_ref";
            $detectedTypes[] = "refs.string";
        }
        if (in_array('dimension', $formats)) {
            if (str_contains($name, 'textSize') || str_contains($name, 'TextSize')) {
                $detectedTypes[] = "sp_dimen";
            } else {
                $detectedTypes[] = "dp_dimen";
            }
        }
    }

    return !empty($detectedTypes) ? implode("|", array_unique($detectedTypes)) : null;
}

function resolveLayoutAttrs($tag, $tagAttrsAuto, $mapaPaiLayout)
{
    $attrs = $tagAttrsAuto[$tag] ?? [];
    if (isset($mapaPaiLayout[$tag])) {
        $pai = $mapaPaiLayout[$tag];
        $parentAttrs = resolveLayoutAttrs($pai, $tagAttrsAuto, $mapaPaiLayout);
        $attrs = array_merge($parentAttrs, $attrs);
    }
    return array_values(array_unique($attrs));
}

$attrsPath = $platforms . '/data/res/values/attrs.xml';

if (file_exists($attrsPath)) {
    $xml = @simplexml_load_file($attrsPath);
    if ($xml) {
        foreach ($xml->xpath('//attr') as $attr) {
            $typeStr = processXmlAttr($attr, $GLOBAL_xml_values_enums);
            if ($typeStr) {
                $GLOBAL_attrValueType[(string)$attr['name']] = $typeStr;
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
    $paisNecessarios = ["TextView", "ImageView", "ProgressBar", "AbsListView", "ViewAnimator", "View", "ViewGroup"];

    $jsLayoutPrototypes = "var layoutParents = {};\n";
    foreach ($paisNecessarios as $pai) {
        if ($pai === 'View') $attrs = $viewBase;
        elseif ($pai === 'ViewGroup') $attrs = $tempStyleables["ViewGroup"] ?? [];
        else $attrs = resolveLayoutAttrs($pai, $tagAttrsAuto, $mapaPaiLayout);

        $jsLayoutPrototypes .= "layoutParents['$pai'] = " . json_encode(array_values(array_unique($attrs))) . ";\n";
    }

    $layoutEntries = [];
    foreach ($tagAttrsAuto as $tag => $attrs) {
        if (in_array($tag, $paisNecessarios)) {
            $layoutEntries[] = "'$tag': layoutParents['$tag']";
            continue;
        }
        if (isset($mapaPaiLayout[$tag])) {
            $pai = $mapaPaiLayout[$tag];
            $especificos = array_diff($attrs, $tagAttrsAuto[$pai] ?? []);
            if (empty($especificos)) {
                $layoutEntries[] = "'$tag': layoutParents['$pai']";
            } else {
                $especificosJson = json_encode(array_values($especificos));
                $layoutEntries[] = "'$tag': [...layoutParents['$pai'], ...$especificosJson]";
            }
        } else {
            $layoutEntries[] = "'$tag': " . json_encode($tagAttrsAuto[$tag]);
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
