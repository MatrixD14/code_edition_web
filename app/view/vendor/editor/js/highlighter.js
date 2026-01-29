document.addEventListener('DOMContentLoaded', () => {
    const $ = (q) => document.querySelector(q);

    const input = $('#code-input');
    const output = $('#highlight-content');
    const layer = $('#highlight-layer');
    const lineNumbers = $('#line-numbers');
    const highlighterWorker = new Worker('/app/view/vendor/editor/js/highlighter-worker.js');
    let timeout,
        lastMsgId = 0;

    if (!input || !output) return;
    const extensionBloqueio = new Set([
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
        'exe',
        'dll',
        'bin',
        'iso',
        'img',
        'dmg',
        'msi',
        'deb',
        'rpm',
        'cab',
        'arj',
        'lha',
        'lzh',
        'zoo',
        'uue',
        'bzip2',
        'xz',
        'lzma',
        'lz4',
        'snappy',
        'zstd',
        'apk',
        'class',
        'jar',
        'idsig',
        'dex',
        'log',
        'md',
    ]);
    highlighterWorker.onmessage = function (e) {
        if (e.data.msgId !== lastMsgId) return;
        requestAnimationFrame(() => {
            output.innerHTML = e.data.html;
        });
    };

    function getExtension(fileName) {
        if (!fileName) return '';
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot <= 0) return '';
        return fileName.slice(lastDot + 1).toLowerCase();
    }

    function sendToWorker() {
        let msgId = ++lastMsgId;
        let rawValue = input.value;

        let fileName = input.dataset.currentFile || '';
        let extension = getExtension(fileName);
        if (rawValue.length > 50000 || extensionBloqueio.has(extension)) {
            output.textContent = rawValue;
            return;
        }

        let isXML = ['html', 'xml', 'svg', 'manifest'].includes(extension) || fileName.endsWith('AndroidManifest.xml');
        highlighterWorker.postMessage({
            code: rawValue,
            isXML: isXML,
            msgId: msgId,
        });
    }

    function syncEditorInicial() {
        updateLineNumbers(input.value);
        sendToWorker();
    }

    input.addEventListener('input', () => {
        clearTimeout(timeout);
        let delay = input.value.length > 25000 ? 200 : 50;
        timeout = setTimeout(syncEditorInicial, delay);
    });

    let totalLinhas = 1;
    function updateLineNumbers(text) {
        const total = text.split('\n').length;
        if (total === totalLinhas && lineNumbers.children.length) return;
        for (let i = totalLinhas; i < total; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            span.dataset.line = i;
            lineNumbers.appendChild(span);
        }
        while (lineNumbers.children.length > total) {
            lineNumbers.removeChild(lineNumbers.lastChild);
        }
        totalLinhas = total;
    }

    const observer = new ResizeObserver(() => {
        const rect = input.getBoundingClientRect();
        layer.style.width = `${rect.width}px`;
        layer.style.height = `${rect.height}px`;
        layer.style.left = `${input.offsetLeft}px`;
    });
    observer.observe(input);

    input.addEventListener(
        'scroll',
        () => {
            requestAnimationFrame(() => {
                lineNumbers.scrollTop = input.scrollTop;
                layer.scrollTop = input.scrollTop;
                layer.scrollLeft = input.scrollLeft;
            });
        },
        { passive: true },
    );
});
