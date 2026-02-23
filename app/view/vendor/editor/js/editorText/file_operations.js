async function openFile(path) {
    unlockEditor();
    let highlight = $('#highlight-content');
    if (highlight) highlight.textContent = 'Carregando...';
    if (typeof esconderPainel === 'function') esconderPainel();
    let isLayout = path?.endsWith('.xml') && path.includes('/res/layout/');
    setPreviewVisible(isLayout);

    try {
        const response = await fetch(`${window.BASE_URL}model/editor/read_file.php?file=${encodeURIComponent(path)}`);
        state.currentSelectedFolder = path.substring(0, path.lastIndexOf('/'));
        const text = await response.text();

        if (ui.input) {
            ui.input.value = text;
            ui.input.dataset.currentFile = path;

            const displayNome = $('.nome_diretory');
            if (displayNome) displayNome.textContent = path.split('/').pop();

            if (typeof validarLinhaPorIndice === 'function') validarLinhaPorIndice(0, true);

            ui.input.dispatchEvent(new Event('input'));
        }
    } catch (err) {
        console.error(err);
    }
}
async function createResource(type) {
    let targetDir = state.currentSelectedFolder || state.currentProjectRoot;

    if (!targetDir) {
        alert('Por favor, abra um projeto primeiro!');
        return;
    }
    const name = prompt(`Digite o nome do novo ${type === 'file' ? 'arquivo' : 'pasta'}:`);
    if (!name) return;

    let xmlType = null;

    if (type === 'file' && name.toLowerCase().endsWith('.xml')) {
        xmlType = await askXmlType();
        if (!xmlType) return;
    }
    try {
        const response = await fetch(`${window.BASE_URL}model/editor/create_resource.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                name: name,
                parentDir: targetDir,
                xmlType,
            }),
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Criado com sucesso!');
            if (targetDir === state.currentProjectRoot) {
                await initProjectTree(state.currentProjectRoot);
            } else await refreshFolder(targetDir);
        } else alert('Erro: ' + result.message);
    } catch (err) {
        console.error(err);
    }
}
async function DeleteResource(targetPath, isProjectSelection = false) {
    if (!targetPath) {
        alert('Selecione um arquivo ou pasta para deletar.');
        return;
    }
    if (!confirm(`Tem certeza que deseja deletar: ${targetPath}?`)) {
        return;
    }
    try {
        const response = await fetch(`${window.BASE_URL}model/editor/delete_resource.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: targetPath }),
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert('Deletado com sucesso!');

            if (isProjectSelection) {
                ui.btnOpenProject.click();
                return;
            }

            let parentPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
            if (ui.input && ui.input.dataset.currentFile) {
                let pathLimpo = targetPath.replace(/^\/|\/$/g, ''),
                    fileAbertoLimpo = ui.input.dataset.currentFile.replace(/^\/|\/$/g, '');

                if (fileAbertoLimpo === pathLimpo || fileAbertoLimpo.startsWith(pathLimpo + '/')) {
                    restEditor();
                    lockEditor('Arquivo removido. Selecione outro.');
                }
            }

            currentSelectedPath = '';
            if (parentPath && typeof refreshFolder === 'function') refreshFolder(parentPath);
            else initProjectTree(state.currentProjectRoot);
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro na conexão ao deletar.');
    }
}

async function renameResource() {
    if (!currentSelectedPath) {
        alert('Selecione um arquivo ou pasta para renomear.');
        return;
    }
    const oldName = currentSelectedPath.split('/').pop();
    const oldPath = currentSelectedPath;
    const newName = prompt('Digite o novo nome:', oldName);

    if (!newName || newName === oldName) return;

    try {
        const response = await fetch(`${window.BASE_URL}model/editor/rename_resource.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldPath: oldPath,
                newName: newName,
            }),
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Renomeado com sucesso!');
            const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));

            if (parentPath) await refreshFolder(parentPath);
            else await initProjectTree(state.currentProjectRoot);
            currentSelectedPath = '';
            restEditor();
            lockEditor('Seleciona o file para editar');
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Erro na conexão ao renomear.');
    }
}
