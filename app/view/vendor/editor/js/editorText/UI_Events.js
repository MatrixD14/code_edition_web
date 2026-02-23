ui.file_push_open.addEventListener('click', () => {
    if (pathopen === true) {
        ui.painel_path.style.display = ui.painel_path.style.display === 'none' ? 'flex' : 'none';
    }
});
ui.btnOpenProject.addEventListener('click', async (e) => {
    e.stopPropagation();
    ui.projectSelector.classList.toggle('hidden');
    config.painelConfig.classList.add('hidden');

    const r = await fetch(`${window.BASE_URL}model/editor/list_path.php`);
    const items = await r.json();
    ui.projectsList.innerHTML = items
        .filter((item) => item.type === 'dir')
        .map(
            (item) =>
                `<li style="display: flex;justify-content: space-between; " data-path="${item.path}"><span class="project-name">📂 ${item.name}</span>
        <b><a style="color: #ff0000;  font-size: 20px;" class="btn-delete-project" title="Deletar Projeto">X</a></b>
            </li>`,
        )
        .join('');
});
ui.btnSalvar.addEventListener('click', async () => {
    let filePath = ui.input.dataset.currentFile;

    if (!filePath) {
        alert('Selecione um arquivo primeiro!');
        return;
    }

    try {
        const response = await fetch(`${window.BASE_URL}model/editor/save_file.php`, {
            method: 'POST',
            body: JSON.stringify({ file: filePath, content: ui.input.value }),
        });

        const rawText = await response.text();

        try {
            const result = JSON.parse(rawText);
            if (result.status === 'success') alert('💾 Salvo com sucesso!');
            else alert('❌ Erro: ' + result.message);
        } catch (e) {
            console.error('Resposta do servidor não é JSON:', rawText);
            alert('Erro crítico no servidor. Veja o console (F12).');
        }
    } catch (err) {
        alert('Erro na conexão.');
    }
});
ui.projectsList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    let projectPath = li.dataset.path,
        projectName = li.textContent;

    restEditor();
    if (e.target.classList.contains('btn-delete-project')) {
        e.stopPropagation();
        DeleteResource(projectPath, true);
        return;
    }
    if (typeof sincronizarTerminalComProjeto === 'function') sincronizarTerminalComProjeto(projectPath);
    else {
        GLOBAL.terminalCWD = projectPath;
        console.warn('Terminal ainda não carregado, salvando caminho...');
    }

    state.currentProjectRoot = projectPath;
    state.currentSelectedFolder = projectPath;
    $('.nome_diretory').textContent = projectName;
    ui.projectSelector.classList.add('hidden');
    ui.painel_path.style.display = 'flex';
    pathopen = true;
    ui.pathDisplay.innerHTML = '<li>Carregando projeto...</li>';
    lockEditor('Selecione um arquivo para editar');
    initProjectTree(projectPath);
});
GLOBAL.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        ui.btnSalvar.click();
    }

    if (e.ctrlKey && e.key === 'Delete' && document.activeElement.id !== 'code-input') {
        if (currentSelectedPath) $('#btn-delete').click();
    }

    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        ui.file_push_open.click();
    }
    if (e.key === 'F2') {
        e.preventDefault();
        renameResource();
    }
    if (e.ctrlKey && e.key === 'D') {
        createResource('folder');
    }
    if (e.ctrlKey && e.key === 'E') {
        createResource('file');
    }
});
