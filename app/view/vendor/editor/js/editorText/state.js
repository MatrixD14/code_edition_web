let state = {
    currentSelectedFolder: '',
    currentProjectRoot: '',
};
let currentSelectedPath = '';
let pathopen = false;
function lockEditor(message = 'Abra um projeto') {
    if (!ui.input) return;

    ui.input.value = message;
    ui.input.setAttribute('readonly', 'true');
    ui.input.classList.add('editor-locked');
    delete ui.input.dataset.currentFile;
}

function unlockEditor() {
    if (!ui.input) return;
    ui.input.removeAttribute('readonly');
    ui.input.classList.remove('editor-locked');
}
