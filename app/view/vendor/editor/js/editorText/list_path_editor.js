GLOBAL.addEventListener('DOMContentLoaded', () => {
    lockEditor();
});

document.addEventListener('click', () => ui.projectSelector.classList.add('hidden'));

function toggleDir(li) {
    const isOpened = li.dataset.open === '1';
    if (isOpened) {
        li.querySelector('ul')?.remove();
        li.dataset.open = '0';
    } else {
        li.dataset.open = '1';
        const ulContainer = document.createElement('div');
        li.appendChild(ulContainer);
        loadSubDir(li.dataset.path, ulContainer);
    }
}

async function loadSubDir(dirPath, container) {
    const r = await fetch(`${window.BASE_URL}model/editor/list_path.php?open_file=${encodeURIComponent(dirPath)}`);
    const items = await r.json();
    const ul = document.createElement('ul');
    ul.style.paddingLeft = '15px';
    items.forEach((item) => ul.appendChild(createListItem(item)));
    container.appendChild(ul);
}
function setPreviewVisible(visible) {
    const linkPreview = $('#btn-open-preview');
    if (!linkPreview) return;
    linkPreview.style.display = visible ? 'block' : 'none';
}

async function refreshFolder(path) {
    const li = $(`li[data-path="${path}"]`);
    if (!li) return initProjectTree(state.currentProjectRoot);

    let containersAntigos = li.querySelectorAll('div, ul');
    containersAntigos.forEach((el) => el.remove());
    let novoContainer = document.createElement('div');
    li.appendChild(novoContainer);
    li.dataset.open = '1';
    await loadSubDir(path, novoContainer);
}
function quickPick(options) {
    return new Promise((resolve) => {
        let box = $('#xml-quick');
        let container = box.querySelector('.xml-quick-box');
        container.innerHTML = '';

        Object.entries(options).forEach(([key, label]) => {
            let div = document.createElement('div');
            div.textContent = label;
            div.onclick = () => {
                box.classList.add('hidden');
                resolve(key);
            };
            container.appendChild(div);
        });

        box.classList.remove('hidden');
    });
}
async function askXmlType() {
    const main = await quickPick({
        layout: 'Layout',
        drawable: 'Drawable',
        values: 'Values',
        generic: 'XML genérico',
    });

    if (main !== 'drawable') return main;

    const sub = await quickPick({
        shape: 'Shape',
        selector: 'Selector',
        layerList: 'Layer-list',
        ripple: 'Ripple',
    });

    return `drawable:${sub}`;
}

function selecionarItem(elemento, caminho) {
    document.querySelectorAll('.path_display li').forEach((el) => {
        el.classList.remove('item-selecionado');
    });

    elemento.classList.add('item-selecionado');
    currentSelectedPath = caminho;

    if (elemento.classList.contains('file')) {
        state.currentSelectedFolder = caminho.substring(0, caminho.lastIndexOf('/'));
    } else state.currentSelectedFolder = caminho;
    GLOBAL.terminalCWD = state.currentSelectedFolder;
}

function sincronizarTerminalComProjeto(path) {
    GLOBAL.terminalCWD = path;

    const outputTerm = $('#terminal-output');
    if (outputTerm) {
        outputTerm.innerHTML += `<div style="color: #e2c08d; font-size: 0.8em;">-- Root alterado: ${path.split('/').pop()} --</div>`;
        const container = $('.terminal');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

$('#btn_rename').onclick = () => renameResource();
$('#criar_file').onclick = () => createResource('file');
$('#criar_dir').onclick = () => createResource('folder');
$('#btn-delete').onclick = () => DeleteResource(currentSelectedPath);
