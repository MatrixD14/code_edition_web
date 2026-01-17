const androidColors = {
    '@android:color/transparent': 'transparent',
    '@android:color/black': '#000000',
    '@android:color/white': '#ffffff',
    '@android:color/darker_gray': '#444444',
    '@android:color/holo_blue_light': '#33b5e5',
};

const attributeHandlers = {
    layout_width(el, value) {
        if (value === 'match_parent') el.style.width = '100%';
        else if (value === 'wrap_content') el.style.width = 'auto';
        else if (value === '0dp') el.style.width = '0px';
        else el.style.width = toPx(value);
    },

    layout_height(el, value) {
        if (value === 'match_parent') el.style.height = '100%';
        else if (value === 'wrap_content') el.style.height = 'auto';
        else el.style.height = toPx(value);
    },

    layout_weight(el, value) {
        el.style.flex = value;
    },

    textSize(el, value) {
        el.style.fontSize = toPx(value);
    },

    textColor(el, value) {
        el.style.color = obterValor(value);
    },

    background(el, value) {
        if (value.startsWith('@drawable/')) {
            let name = value.replace('@drawable/', '');
            if (!drawablesCache[name]) {
                carregarDrawable(currentProject, name).then((drawable) => {
                    if (drawable) {
                        drawablesCache[name] = drawable;
                        aplicarShapeDrawable(el, drawable);
                    }
                });
            } else aplicarShapeDrawable(el, drawablesCache[name]);
        } else el.style.backgroundColor = obterValor(value);
    },

    gravity(el, value) {
        el.style.display = 'flex';

        if (value.includes('center')) {
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
        }
        if (value.includes('center_horizontal')) el.style.justifyContent = 'center';

        if (value.includes('center_vertical')) el.style.alignItems = 'center';

        if (value.includes('end') || value.includes('right')) el.style.justifyContent = 'flex-end';

        if (value.includes('start') || value.includes('left')) el.style.justifyContent = 'flex-start';

        if (value.includes('bottom')) el.style.alignItems = 'flex-end';

        if (value.includes('top')) el.style.alignItems = 'flex-start';
    },

    padding(el, value) {
        el.style.padding = toPx(value);
    },

    paddingTop(el, value) {
        el.style.paddingTop = toPx(value);
    },

    paddingBottom(el, value) {
        el.style.paddingBottom = toPx(value);
    },

    paddingLeft(el, value) {
        el.style.paddingLeft = toPx(value);
    },

    paddingRight(el, value) {
        el.style.paddingRight = toPx(value);
    },

    visibility(el, value) {
        if (value === 'gone') el.style.display = 'none';
        else if (value === 'invisible') el.style.visibility = 'hidden';
        else el.style.visibility = 'visible';
    },

    alpha(el, value) {
        el.style.opacity = value;
    },

    elevation(el, value) {
        const e = parseFloat(value);
        el.style.boxShadow = `0 ${e / 2}px ${e}px rgba(0,0,0,0.2)`;
    },

    textStyle(el, value) {
        if (value === 'bold') el.style.fontWeight = 'bold';
    },
};

const shapeHandlers = {
    solid(el, node) {
        const color = node.getAttribute('android:color');
        if (color) el.style.backgroundColor = obterValor(color);
    },
    size(el, node) {
        const w = node.getAttribute('android:width');
        const h = node.getAttribute('android:height');

        if (w) el.style.width = toPx(w);
        if (h) el.style.height = toPx(h);
    },
    gradient(el, node) {
        const start = obterValor(node.getAttribute('android:startColor'));
        const end = obterValor(node.getAttribute('android:endColor'));
        const angle = node.getAttribute('android:angle') || '0';

        el.style.background = `linear-gradient(${angle}deg, ${start}, ${end})`;
    },
    stroke(el, node) {
        el.style.borderStyle = 'solid';

        const width = node.getAttribute('android:width');
        const color = node.getAttribute('android:color');

        if (width) el.style.borderWidth = toPx(width);
        if (color) el.style.borderColor = obterValor(color);
    },

    corners(el, node) {
        const radius = node.getAttribute('android:radius') || node.getAttribute('android:topLeftRadius');

        if (radius) el.style.borderRadius = toPx(radius);
    },

    padding(el, node) {
        if (node.getAttribute('android:top')) el.style.paddingTop = toPx(node.getAttribute('android:top'));

        if (node.getAttribute('android:bottom')) el.style.paddingBottom = toPx(node.getAttribute('android:bottom'));

        if (node.getAttribute('android:left')) el.style.paddingLeft = toPx(node.getAttribute('android:left'));

        if (node.getAttribute('android:right')) el.style.paddingRight = toPx(node.getAttribute('android:right'));
    },
};
const viewHandlers = {
    LinearLayout(node) {
        const el = document.createElement('div');
        el.style.display = 'flex';

        const orientation = node.getAttribute('android:orientation') || 'horizontal';

        el.style.flexDirection = orientation === 'vertical' ? 'column' : 'row';

        return el;
    },

    FrameLayout() {
        const el = document.createElement('div');
        el.style.position = 'relative';
        el.style.display = 'block';
        return el;
    },

    RelativeLayout() {
        const el = document.createElement('div');
        el.style.position = 'relative';
        el.style.display = 'block';
        return el;
    },

    ScrollView() {
        const el = document.createElement('div');
        el.style.overflowY = 'auto';
        return el;
    },

    ImageView(node) {
        const el = document.createElement('img');
        el.style.objectFit = 'cover';
        el.style.display = 'block';

        const src = node.getAttribute('android:src') || node.getAttribute('app:srcCompat');

        if (src) {
            el.src = resolverDrawable(src);
        }

        return el;
    },

    TextView(node) {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.innerText = obterValor(node.getAttribute('android:text'));
        return el;
    },

    Button(node) {
        const el = document.createElement('button');
        el.style.cursor = 'pointer';
        el.style.border = '1px solid #ddd';
        el.style.position = 'relative';
        el.style.zIndex = '1';
        const text = node.getAttribute('android:text');
        if (text) el.innerText = obterValor(text);

        const src = node.getAttribute('android:src');
        if (src) {
            let url = resolverDrawable(src);

            el.style.backgroundImage = `url('${url}')`;
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.backgroundSize = 'cover';
        }

        return el;
    },

    EditText(node) {
        const el = document.createElement('input');
        el.type = 'text';
        el.placeholder = obterValor(node.getAttribute('android:hint') || '');
        return el;
    },
};

function toPx(val) {
    if (typeof val !== 'string') return val;
    return val.replace(/dp|sp/g, 'px');
}
function resolverDrawable(src) {
    if (!src) return '';

    if (src.startsWith('@drawable/')) {
        const name = src.replace('@drawable/', '');
        return `../../../model/editor/read_file.php?file=${encodeURIComponent(
            currentProject + '/res/drawable/' + name + '.png',
        )}`;
    }
    return src;
}
const xmlSuggestions = {
    views: Object.keys(viewHandlers),
    attributes: Object.keys(attributeHandlers),
    shapes: Object.keys(shapeHandlers),
    colors: Object.keys(androidColors),
};
