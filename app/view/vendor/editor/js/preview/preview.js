const previewChannel = new BroadcastChannel('android_preview');
let timer;
ui.input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        const currentFile = ui.input.dataset.currentFile;

        if (currentFile && currentFile.endsWith('.xml')) {
            console.log('Enviando para preview:', state.currentProjectRoot);
            previewChannel.postMessage({
                xml: ui.input.value,
                path: currentFile,
                projectRoot: state.currentProjectRoot,
            });
        }
    }, 300);
});

$('#btn-open-preview').onclick = () => {
    window.open('../preview/preview.php', '_blank');
};
