document.addEventListener('DOMContentLoaded', () => {
    const $ = (q) => document.querySelector(q);

    const input = $('#code-input');
    const output = $('#highlight-content');
    const layer = $('#highlight-layer');
    const lineNumbers = $('#line-numbers');
    const WORKER_COUNT = Math.min(2, navigator.hardwareConcurrency || 2);

    const workers = Array.from(
        { length: WORKER_COUNT },
        () => new Worker('/app/view/vendor/editor/js/highlighter-worker.js'),
    );

    let timeout,
        lastMsgId = 0;
    let pendingChunks = 0;
    let htmlChunks = [];

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
    workers.forEach((worker) => {
        worker.onmessage = function (e) {
            const { index, html, msgId } = e.data;
            if (e.data.msgId !== lastMsgId) return;
            htmlChunks[index] = html;
            pendingChunks--;
            if (pendingChunks === 0)
                requestAnimationFrame(() => {
                    output.innerHTML = htmlChunks.join('\n');
                });
        };
    });
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

        const linhas = rawValue.split('\n');
        const chunkSize = Math.ceil(linhas.length / workers.length);

        pendingChunks = workers.length;
        htmlChunks = [];

        const isXML =
            ['html', 'xml', 'svg', 'manifest'].includes(extension) || fileName.endsWith('AndroidManifest.xml');

        workers.forEach((worker, i) => {
            const start = i * chunkSize;
            const end = start + chunkSize;

            worker.postMessage({
                code: String(linhas.slice(start, end).join('\n')),
                isXML,
                index: i,
                msgId,
            });
        });
    }

    function syncEditorInicial() {
        updateLineNumbers(input.value);
        sendToWorker();
    }
    window.syncEditorInicial = syncEditorInicial;
    // input.addEventListener('input', () => {
    //     clearTimeout(timeout);
    //     let delay = input.value.length > 25000 ? 200 : 50;
    //     timeout = setTimeout(syncEditorInicial, delay);
    // });

    function updateLineNumbers(text) {
        const total = text.split('\n').length;
        if (lineNumbers.children.length === total) return;
        lineNumbers.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 1; i <= total; i++) {
            const div = document.createElement('div');
            div.dataset.line = i;
            div.textContent = i;
            fragment.appendChild(div);
        }
        lineNumbers.appendChild(fragment);
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
