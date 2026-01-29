let timer,
    lastXML = null,
    previewReady = false,
    previewWindow = null;
const btnReload = $('#btn-open-preview');
const previewChannel = new BroadcastChannel('android_preview');

previewChannel.onmessage = (e) => {
    if (e.data?.type === 'ready') {
        previewReady = true;
        console.log('Preview conectado');
        sendPreviewData();
    }
};
btnReload.onclick = () => {
    xml = ui.input.value;
    if (!previewWindow || previewWindow.closed) {
        previewReady = false;
        previewWindow = window.open('/app/view/vendor/preview/preview.php', '_blank');
    }
    debounceSend();
};

function debounceSend() {
    clearTimeout(timer);
    timer = setTimeout(() => {
        sendPreviewData(true);
    }, 300);
}

function sendPreviewData(force = false) {
    if (!previewReady) return;
    const xml = ui.input.value;
    if (!force && xml === lastXML) return;
    lastXML = xml;
    btnReload.textContent = '⌛';
    previewChannel.postMessage({
        type: 'update_layout',
        xml,
        filePath: ui.input.dataset.currentFile,
        projectRoot: state.currentProjectRoot,
    });
    setTimeout(() => {
        btnReload.textContent = '⟳';
    }, 500);
}
