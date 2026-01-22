let timer,
    lastXML = '';
let previewReady = false;
const previewChannel = new BroadcastChannel('android_preview');

previewChannel.onmessage = (e) => {
    if (e.data?.type === 'ready') {
        previewReady = true;
        console.log('Preview conectado');
    }
};
ui.input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        if (!previewReady) return;
        const xml = ui.input.value;
        if (xml === lastXML) return;
        lastXML = xml;
        const send = () => {
            previewChannel.postMessage({
                xml,
                path: ui.input.dataset.currentFile,
                projectRoot: state.currentProjectRoot,
            });
        };

        if ('requestIdleCallback' in window) requestIdleCallback(send);
        else setTimeout(send, 0);
    }, 300);
});

$('#btn-open-preview').onclick = () => {
    window.open('../preview/preview.php', '_blank');
};
