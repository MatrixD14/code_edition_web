const editor = document.getElementById('code-input');
const helperList = document.getElementById('xml-list');
const helperContext = document.getElementById('xml-context');
const xmml_help = document.getElementById('xml-help');
let max_list_mostrado = 200;
let lastCursor = -1;
let composing = false;
let autoTimer = null;
function cleanvar() {
    xmml_help.style.display = 'none';
    helperList.textContent = '';
    helperContext.textContent = '';
}
function updateHelperPanel() {
    if (!editor) return;
    const text = editor.value;
    const cursor = editor.selectionStart;
    let fileName = editor.dataset.currentFile || '';
    const schema = getSchemaByFile(fileName);
    const isXML = !!schema;
    const lastChar = text[cursor - 1];
    if (!/[a-zA-Z0-9_:\-@\.<=\/"' ]/.test(lastChar)) {
        cleanvar();
        return;
    }

    let result = null;
    if (isXML) {
        const ctx = getXMLContext(text, cursor);
        if (ctx) result = unirXML(ctx, schema);
    } else {
        const ctx = getJavaContext(text, cursor);
        if (!ctx) {
            cleanvar();
            return;
        }
        if (ctx.type === 'import' && ctx.ctx) {
            result = trataAtributoJava(ctx.ctx);
        } else if (ctx.type === 'code') {
            result = unirMethods(ctx);
        }
    }
    if (!result || !result.items.length) {
        cleanvar();
        return;
    }
    xmml_help.style.display = 'flex';
    helperContext.textContent = result.typesms;

    renderList(result.items);
}
function renderList(items) {
    const max = Math.min(items.length, max_list_mostrado);
    if (!max) {
        helperList.textContent = '';
        return;
    }
    let html = items
        .slice(0, max)
        .map((item) => `<li style="list-style-type:none" data-value="${item}">${item}</li>`)
        .join('');

    if (items.length > max_list_mostrado) html += `<li>...e mais ${items.length - max_list_mostrado} itens</li>`;

    helperList.innerHTML = html;

    helperList.onclick = (e) => {
        const val = e.target.dataset.value;
        if (val) copySuggestion(val);
        helperList.textContent = '';
    };
}

function copySuggestion(value) {
    if (navigator.clipboard) navigator.clipboard.writeText(value);
    else {
        const tmp = document.createElement('textarea');
        tmp.value = value;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
    }
    helperContext.textContent = 'Copiado: ' + value;
}

editor.addEventListener('compositionstart', () => {
    composing = true;
});

editor.addEventListener('compositionend', () => {
    composing = false;
    scheduleUpdate();
});

function scheduleUpdate() {
    if (composing) return;
    if (autoTimer) cancelAnimationFrame(autoTimer);
    autoTimer = requestAnimationFrame(updateHelperPanel);
}
function handleEditorClick() {
    if (editor.selectionStart !== lastCursor) {
        lastCursor = editor.selectionStart;
        updateHelperPanel();
    }
}
function applyautocomple(enabled) {
    if (enabled) {
        editor.addEventListener('input', scheduleUpdate);
        editor.addEventListener('click', handleEditorClick);
    } else {
        editor.removeEventListener('input', scheduleUpdate);
        editor.removeEventListener('click', handleEditorClick);
        xmml_help.style.display = 'none';
    }
}
window.addEventListener('DOMContentLoaded', () => {
    if (!editor) {
        console.error('Editor não encontrado (#code-input)');
        return;
    }
    let enabled = window.EDITOR_CONFIG?.autocomplete ?? true;
    applyautocomple(enabled);
    if (config?.painel_tag) {
        config.painel_tag.checked = enabled;
        config.painel_tag.addEventListener('change', (e) => {
            applyautocomple(e.target.checked);
        });
    }
});
