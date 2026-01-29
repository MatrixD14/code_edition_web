const codeInput = document.getElementById('code-input');
const highlightLayer = document.getElementById('highlight-content');
const lineNumbers = document.querySelector('#line-numbers');
const errorPanel = document.getElementById('error-panel');
let checando = false;
function getCursorLine() {
    return codeInput.value.slice(0, codeInput.selectionStart).split('\n').length - 1;
}

function marcarErroVisual(linhaIndex, erros) {
    const span = lineNumbers.querySelector(`span[data-line="${linhaIndex}"]`);
    if (!span) return;
    span._erros = erros || [];
    if (erros && erros.length) {
        span.classList.add('line-error');
    } else {
        span.classList.remove('line-error');
        span._erros = null;
    }
    console.log('linha', linhaIndex, 'span', span, 'erros', erros);
}

function mostrarPainel(span, x, y) {
    if (!span._erros || !span._erros.length) return;

    errorPanel.innerHTML = `
        <div class="line">Linha ${Number(span.dataset.line) + 1}</div>
        ${span._erros.map((e) => `<div>• ${e.msg}</div>`).join('')}
    `;
    errorPanel.style.left = `${x + 10}px`;
    errorPanel.style.top = `${y + 10}px`;
    errorPanel.hidden = false;
}

function esconderPainel() {
    errorPanel.hidden = true;
}

function validarLinhaPorIndice(linha) {
    const texto = codeInput.value.split('\n')[linha] || '';
    if (typeof validarLinhaXML === 'function') marcarErroVisual(linha, validarLinhaXML(texto));
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
lineNumbers.addEventListener('mouseover', (e) => {
    const span = e.target.closest('span.line-error');
    if (!span) return;

    mostrarPainel(span, e.clientX, e.clientY);
});

lineNumbers.addEventListener('mousemove', (e) => {
    if (!errorPanel.hidden) {
        errorPanel.style.left = `${e.clientX + 10}px`;
        errorPanel.style.top = `${e.clientY + 10}px`;
    }
});

lineNumbers.addEventListener('mouseout', esconderPainel);

lineNumbers.addEventListener('touchstart', (e) => {
    const span = e.target.closest('span.line-error');
    if (!span) return;

    const t = e.touches[0];
    mostrarPainel(span, t.clientX, t.clientY);
});

document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('#line-numbers')) esconderPainel();
});
