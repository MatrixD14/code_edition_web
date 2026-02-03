const codeInput = document.getElementById('code-input');
const lineNumbers = document.querySelector('#line-numbers');
const errorPanel = document.querySelector('#error-panel');
let checando = false;
let linhaAtiva = null;
function getCursorLine() {
    return codeInput.value.slice(0, codeInput.selectionStart).split('\n').length - 1;
}
('');

function marcarErroVisual(linhaIndex, erros) {
    const div = lineNumbers.querySelector(`div[data-line="${linhaIndex + 1}"]`);
    if (!div) return;
    div._erros = erros || [];
    if (erros && erros.length) div.classList.add('line-error');
    else {
        div.classList.remove('line-error');
        div._erros = null;
    }
}

function atualizarNumerosLinha(total, force = false) {
    if (lineNumbers.children.length === total && !force) return;
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
            ${targetElement._erros.map((e) => `<div>• ${e.msg}</div>`).join('')}
        `;
    errorPanel.classList.add('visible');
}

function esconderPainel() {
    errorPanel.classList.remove('visible');
    if (linhaAtiva) linhaAtiva.classList.remove('active');
    linhaAtiva = null;
}

function validarLinhaPorIndice(linha, force = false) {
    const totalLinhas = codeInput.value.split('\n').length;
    atualizarNumerosLinha(totalLinhas, force);
    requestAnimationFrame(() => {
        const texto = codeInput.value.split('\n')[linha] || '';
        if (typeof validarLinhaXML === 'function') marcarErroVisual(linha, validarLinhaXML(texto));
    });
}
let ultimaLinhaCursor = getCursorLine();

function checarMudancaDeLinha() {
    if (checando) return;
    checando = true;
    requestAnimationFrame(() => {
        const atual = getCursorLine();
        if (atual !== ultimaLinhaCursor) {
            validarLinhaPorIndice(ultimaLinhaCursor);
            ultimaLinhaCursor = atual;
        }
        checando = false;
    });
}

codeInput.addEventListener('keyup', checarMudancaDeLinha);
codeInput.addEventListener('click', checarMudancaDeLinha);
codeInput.addEventListener('touchend', checarMudancaDeLinha);
document.addEventListener('selectionchange', () => {
    if (document.activeElement === codeInput) checarMudancaDeLinha();
});
codeInput.addEventListener('blur', () => {
    validarLinhaPorIndice(ultimaLinhaCursor);
});

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
