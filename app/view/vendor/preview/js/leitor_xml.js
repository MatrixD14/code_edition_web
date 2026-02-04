let screen = document.getElementById('screen');
let error = document.querySelector('.error');
let channel = new BroadcastChannel('android_preview');
let stringsCache = {},
    colorsCache = {},
    stylesCache = {};

let currentProject = '',
    lastTreeHash = '';

channel.postMessage({ type: 'ready' });
channel.onmessage = async (event) => {
    const data = event.data;
    const errorsInXML = data.errors || false;
    if (!data || data.type !== 'update_layout') return;
    const { xml, projectRoot, filePath } = data;
    if (projectRoot && projectRoot !== currentProject) {
        currentProject = projectRoot;
        stringsCache = {};
        colorsCache = {};
        stylesCache = {};
        drawablesCache = {};
        lastTreeHash = '';
        screen.textContent = 'Carregando…';
        await carregarRecursos(projectRoot);
    }
    requestAnimationFrame(() => renderizar(xml, filePath, errorsInXML));
};

async function renderizar(xmlString, filePath, errorsInXML = false) {
    if (!filePath || !filePath.includes('/res/layout/')) return;
    if (xmlString === lastTreeHash && !errorsInXML) return;
    lastTreeHash = xmlString;
    error.textContent = '';
    if (errorsInXML) {
        error.textContent = 'Erros: corrija o erro do XML para visualizar';
        error.classList.add('show');
        return;
    }
    error.classList.remove('show');
    const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');
    if (xmlDoc.documentElement) {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(converter(xmlDoc.documentElement));
        screen.replaceChildren(fragment);
    }
}

async function carregarRecursos(projectRoot) {
    const fetchXML = async (path) => {
        try {
            const r = await fetch(
                `../../../model/editor/read_file.php?file=${encodeURIComponent(projectRoot + path)}&v=${Date.now()}`,
            );
            return r.ok ? new DOMParser().parseFromString(await r.text(), 'text/xml') : null;
        } catch (e) {
            return null;
        }
    };

    const [colors, strings, styles] = await Promise.all([
        fetchXML('/res/values/colors.xml'),
        fetchXML('/res/values/strings.xml'),
        fetchXML('/res/values/styles.xml'),
    ]);
    if (colors) {
        for (let c of colors.getElementsByTagName('color'))
            colorsCache[`@color/${c.getAttribute('name')}`] = c.textContent.trim();
    }
    if (strings) {
        for (let s of strings.getElementsByTagName('string'))
            stringsCache[`@string/${s.getAttribute('name')}`] = s.textContent.trim();
    }
    if (styles) {
        for (let s of styles.getElementsByTagName('style')) {
            let name = s.getAttribute('name');
            stylesCache[name] = { parent: s.getAttribute('parent'), items: {} };
            for (let item of s.getElementsByTagName('item'))
                stylesCache[name].items[item.getAttribute('name')] = item.textContent.trim();
        }
    }
}

function obterValor(attr) {
    if (!attr) return '';
    if (androidColors[attr]) return androidColors[attr];
    if (attr.startsWith('@android:color/') && !androidColors[attr]) console.warn('Android color não mapeado:', attr);

    let valor = attr;
    if (attr.startsWith('@color/')) valor = colorsCache[attr] || '#000000';
    if (attr.startsWith('@string/')) return stringsCache[attr] || attr;
    if (valor.startsWith('#') && valor.length === 9) {
        let a = valor.substring(1, 3);
        let rgb = valor.substring(3);
        return '#' + rgb + a;
    }
    return valor;
}

function aplicarAtributo(el, attr, value) {
    if (!value) return;
    if (attr.startsWith('android:')) attr = attr.replace('android:', '');
    const handler = attributeHandlers[attr];
    if (handler) handler(el, value);
    else {
    }
}

function aplicarEstilo(el, styleName) {
    let name = styleName.replace('@style/', '');
    let style = stylesCache[name];
    if (!style) return;

    if (style.parent) aplicarEstilo(el, style.parent);
    for (let [attr, val] of Object.entries(style.items)) {
        aplicarAtributo(el, attr, val);
    }
}

function converter(node) {
    const handler = viewHandlers?.[node.tagName];
    const el = handler ? handler(node) : document.createElement('div');
    el.style.boxSizing = 'border-box';
    let styleAttr = node.getAttribute('style');
    if (styleAttr) aplicarEstilo(el, styleAttr);
    for (let attr of node.attributes) aplicarAtributo(el, attr.name, attr.value);
    for (let child of node.children) el.appendChild(converter(child));
    return el;
}
