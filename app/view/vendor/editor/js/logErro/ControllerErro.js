const codeInput = document.getElementById('code-input');
const lineNumbers = document.querySelector('#line-numbers');
const errorPanel = document.querySelector('#error-panel');
const WORKER_COUNT = Math.min(2, navigator.hardwareConcurrency || 2);

const worker = Array.from(
    { length: WORKER_COUNT },
    () => new Worker('/app/view/vendor/editor/js/logErro/validator-worker.js'),
);

let delayValidacao;
let linhaAtiva = null;
let linhasComErro = new Set();
let cacheTexto = '';
worker.forEach((workers) => {
    workers.onmessage = function (e) {
        if (!Array.isArray(e.data)) {
            const { linha, erros = [] } = e.data;

            marcarErroVisual(linha, erros.length ? erros : null);
            return;
        }

        e.data.forEach((erro) => {
            marcarErroVisual(erro.linha, [erro]);
        });
    };
});

function marcarErroVisual(linhaIndex, erros) {
    const div = lineNumbers.children[linhaIndex];
    if (!div) return;
    div._erros = erros || [];
    if (erros && erros.length) {
        div.classList.add('line-error');
        linhasComErro.add(linhaIndex);
    } else {
        div.classList.remove('line-error');
        div._erros = null;
    }
}
function limparErrosVisuais() {
    linhasComErro.forEach((i) => {
        const div = lineNumbers.children[i];
        if (div) {
            div.classList.remove('line-error');
            div._erros = null;
        }
    });
    linhasComErro.clear();
}

function atualizarNumerosLinha(total, force = false) {
    const atual = lineNumbers.children.length;
    if (atual === total && !force) return;
    if (total > atual) {
        const fragment = document.createDocumentFragment();
        for (let i = atual + 1; i <= total; i++) {
            const div = document.createElement('div');
            div.dataset.line = i;
            div.textContent = i;
            fragment.appendChild(div);
        }
        lineNumbers.appendChild(fragment);
    } else if (total < atual) {
        for (let i = atual; i > total; i--) {
            lineNumbers.lastElementChild.remove();
        }
    }
}

function mostrarPainel(targetElement) {
    if (!targetElement._erros || !targetElement._erros.length) return;

    if (linhaAtiva === targetElement) {
        esconderPainel();
        return;
    }

    esconderPainel();
    linhaAtiva = targetElement;
    targetElement.classList.add('active');

    errorPanel.innerHTML = `
    <div class="line">Linha ${targetElement.dataset.line}</div> 
    ${targetElement._erros.map((e) => `<div>• ${e.msg}${e.tag ? ` em &lt;${e.tag}&gt;` : ''}</div>`).join('')}
`;
    errorPanel.classList.add('visible');
}

function esconderPainel() {
    errorPanel.classList.remove('visible');
    if (linhaAtiva) linhaAtiva.classList.remove('active');
    linhaAtiva = null;
}

function validarCodigo(force = false) {
    const texto = codeInput.value;
    if (!force && texto === cacheTexto) return;
    cacheTexto = texto;
    const linhas = texto.split('\n');
    if (linhas.length > 8000 && !force) return;
    atualizarNumerosLinha(linhas.length, force);

    limparErrosVisuais();
    const isJava = (window.editor?.dataset?.currentFile || '').endsWith('.java') || texto.includes('public class');

    const meio = Math.ceil(linhas.length / worker.length);

    limparErrosVisuais();

    worker.forEach((worker, i) => {
        const inicio = i * meio;
        const fim = inicio + meio;

        const bloco = linhas.slice(inicio, fim);

        worker.postMessage({
            texto: bloco.join('\n'),
            isJava,
            offset: inicio,
        });
    });
}
window.validarCodigo = validarCodigo;

lineNumbers.addEventListener('click', (e) => {
    e.stopPropagation();
    const divClicada = e.target.closest('div');
    if (divClicada && divClicada.classList.contains('line-error')) mostrarPainel(divClicada);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#line-numbers') && !e.target.closest('#error-panel')) {
        esconderPainel();
    }
});
