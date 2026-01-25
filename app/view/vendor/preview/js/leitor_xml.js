let screen = document.getElementById('screen');
let error = document.querySelector('.error');
let channel = new BroadcastChannel('android_preview');
let stringsCache = {},
    colorsCache = {},
    stylesCache = {},
    drawablesCache = {};

let currentProject = '',
    lastXMLRaw = '',
    lastLayoutFile = '',
    lastDeps = null,
    lastTreeHash = '';
let activeXML = null;
let activeFile = null;
channel.postMessage({ type: 'ready' });
channel.onmessage = async (event) => {
    const data = event.data;
    if (!data) return;
    if (data.type === 'force_reload') {
        console.log('🔄 Recarregamento total solicitado');
        lastXMLRaw = null;
        resetAll();
        if (currentProject) await carregarRecursos(currentProject);
        if (activeXML && activeFile) await renderizar(activeXML, activeFile);
        return;
    }
    if (data.type === 'update_layout') {
        const { xml, projectRoot, filePath } = data;

        activeXML = xml;
        activeFile = filePath;

        if (projectRoot && projectRoot !== currentProject) {
            currentProject = projectRoot;
            resetAll();
            await carregarRecursos(projectRoot);
        }
        requestAnimationFrame(() => renderizar(xml, filePath));
    }
};

function resetAll() {
    stringsCache = {};
    colorsCache = {};
    stylesCache = {};
    drawablesCache = {};
    lastTreeHash = '';
    screen.textContent = 'Carregando…';
}

function extrairErroXML(errorText) {
    let tipo = 'Erro de sintaxe no XML';
    let linha = null;
    let tipoMatch = errorText.match(/Erro no codigo do XML:[^\n]+/);
    if (tipoMatch) tipo = tipoMatch[0].replace('Erro no codigo do XML:', '').trim();

    let linhaMatch = errorText.match(/Linha número (\d+)/);
    if (linhaMatch) linha = linhaMatch[1];
    if (errorText.includes('tag sem correspondência')) tipo = 'Tag não fechada ou fechamento incorreto (>)';
    else if (errorText.includes('formato incorreto')) tipo = 'Formato inválido no XML';
    else if (errorText.includes('Esperado: .')) tipo = 'Esperado fechamento de tag (>)';
    return { tipo, linha };
}
function getNodeKey(node) {
    return (
        node.tagName +
        [...node.attributes].map((a) => a.name + '=' + a.value).join('|') +
        [...node.children].map(getNodeKey).join('')
    );
}
async function renderizar(xmlString, filePath) {
    console.log('Renderizando preview para', filePath);
    if (!filePath || !filePath.includes('/res/layout/')) return;
    if (lastXMLRaw !== null && xmlString === lastXMLRaw) return;
    lastXMLRaw = xmlString;
    lastLayoutFile = filePath;
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(lastXMLRaw, 'text/xml');
    let errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
        screen.style.display = 'none';
        let { tipo, linha } = extrairErroXML(errorNode.textContent);
        error.innerHTML = `<div style="color:red; padding:10px;">${tipo}<br>
      ${linha ? `Linha ${linha}` : ''}</div>`;
        return;
    }
    error.textContent = '';
    const newHash = getNodeKey(xmlDoc.documentElement);
    if (newHash === lastTreeHash) return;
    lastTreeHash = newHash;
    const fragment = document.createDocumentFragment();
    fragment.appendChild(converter(xmlDoc.documentElement));
    screen.replaceChildren(fragment);
    screen.classList.add('hidden');
    requestAnimationFrame(() => {
        screen.classList.remove('hidden');
    });
}

async function carregarRecursos(projectRoot) {
    try {
        let fetchXML = async (path) => {
            let r = await fetch(
                `../../../model/editor/read_file.php?file=${encodeURIComponent(projectRoot + path)}&v=${Date.now()}`,
            );
            if (!r.ok) throw new Error('Falha ao ler');
            return new DOMParser().parseFromString(await r.text(), 'text/xml');
        };
        try {
            let docColors = await fetchXML('/res/values/colors.xml');
            for (let c of docColors.getElementsByTagName('color')) {
                colorsCache[`@color/${c.getAttribute('name')}`] = c.textContent.trim();
            }
        } catch (e) {
            console.warn('colors.xml não encontrado');
        }

        try {
            let docStrings = await fetchXML('/res/values/strings.xml');
            for (let s of docStrings.getElementsByTagName('string')) {
                stringsCache[`@string/${s.getAttribute('name')}`] = s.textContent.trim();
            }
        } catch (e) {
            console.warn('strings.xml não encontrado');
        }

        try {
            let docStyles = await fetchXML('/res/values/styles.xml');
            for (let s of docStyles.getElementsByTagName('style')) {
                let name = s.getAttribute('name');
                stylesCache[name] = {
                    parent: s.getAttribute('parent'),
                    items: {},
                };
                for (let item of s.getElementsByTagName('item')) {
                    stylesCache[name].items[item.getAttribute('name')] = item.textContent.trim();
                }
            }
        } catch (e) {
            console.warn('styles.xml não encontrado');
        }
        console.log('Recursos sincronizados com sucesso');
    } catch (e) {
        console.error('Falha crítica ao sincronizar recursos:', e);
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
    const tag = node.tagName;
    const handler = viewHandlers[tag];
    const el = handler ? handler(node) : document.createElement('div');
    el.style.boxSizing = 'border-box';
    let styleAttr = node.getAttribute('style');
    if (styleAttr) aplicarEstilo(el, styleAttr);
    for (let attr of node.attributes) aplicarAtributo(el, attr.name, attr.value);
    for (let child of node.children) el.appendChild(converter(child));
    return el;
}
