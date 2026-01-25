let timer,
    lastXML = '';
let previewReady = false;
const previewChannel = new BroadcastChannel('android_preview');

previewChannel.onmessage = (e) => {
    if (e.data?.type === 'ready') {
        previewReady = true;
        console.log('Preview conectado');
        previewChannel.postMessage({
            type: 'update_layout',
            xml: ui.input.value,
            filePath: ui.input.dataset.currentFile,
            projectRoot: state.currentProjectRoot,
        });
    }
};
// ui.input.addEventListener('input', () => {
//     const xml = ui.input.value;
//     const filePath = ui.input.dataset.currentFile;
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//         if (!previewReady) return;
//         if (xml === lastXML) return;
//         lastXML = xml;
//         const send = () => {
//             previewChannel.postMessage({
//                 type: 'update_layout',
//                 xml,
//                 filePath,
//                 projectRoot: state.currentProjectRoot,
//             });
//         };

//         if ('requestIdleCallback' in window) requestIdleCallback(send);
//         else requestAnimationFrame(send);
//     }, 300);
// });

let previewWindow = null;
const btnReload = $('#btn-open-preview');
btnReload.onclick = () => {
    // const xml = ui.input.value;
    // const filePath = ui.input.dataset.currentFile;
    if (!previewWindow || previewWindow.closed) {
        previewWindow = window.open('/app/view/vendor/preview/preview.php', '_blank');
    } else previewWindow.focus();
    clearTimeout(timer);
    timer = setTimeout(() => {
        btnReload.textContent = '⌛';
        previewChannel.postMessage({
            type: 'force_reload',
            // xml,
            // filePath,
            // projectRoot: state.currentProjectRoot,
        });
    }, 300);
    setTimeout(() => {
        btnReload.textContent = '⟳';
    }, 1000);
};
