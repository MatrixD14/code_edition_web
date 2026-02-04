const codeInput = document.getElementById('code-input');
const lineNumbers = document.querySelector('#line-numbers');
const errorPanel = document.querySelector('#error-panel');
let delayValidacao;
let linhaAtiva = null;

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

// function atualizarNumerosLinha(total, force = false) {
//     if (lineNumbers.children.length === total && !force) return;
//     lineNumbers.innerHTML = '';
//     const fragment = document.createDocumentFragment();
//     for (let i = 1; i <= total; i++) {
//         const div = document.createElement('div');
//         div.dataset.line = i;
//         div.textContent = i;
//         fragment.appendChild(div);
//     }
//     lineNumbers.appendChild(fragment);
// }

function atualizarNumerosLinha(total, force = false) {
    const atual = lineNumbers.children.length;
    if (atual === total && !force) return;
    if (total > atual) {
        // Se o código cresceu, adicionamos apenas as linhas novas
        const fragment = document.createDocumentFragment();
        for (let i = atual + 1; i <= total; i++) {
            const div = document.createElement('div');
            div.dataset.line = i;
            div.textContent = i;
            fragment.appendChild(div);
        }
        lineNumbers.appendChild(fragment);
    } else if (total < atual) {
        // Se o código diminuiu, removemos as linhas que sobraram do final
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
            ${targetElement._erros.map((e) => `<div>• ${e.msg}</div>`).join('')}
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
    const linhas = texto.split('\n');
    const totalLinhas = linhas.length;
    atualizarNumerosLinha(totalLinhas, force);
    lineNumbers.querySelectorAll('.line-error').forEach((div) => {
        div.classList.remove('line-error');
        div._erros = null;
    });
    const isJava = (editor.dataset.currentFile || '').endsWith('.java') || texto.includes('public class');

    if (isJava) {
        const todosErros = validarJava(texto);
        todosErros.forEach((erro) => {
            marcarErroVisual(erro.linha, [erro]);
        });
    } else {
        linhas.forEach((txt, idx) => {
            const errosXml = validarLinhaXML(txt);
            if (errosXml.length > 0) marcarErroVisual(idx, errosXml);
        });
    }
}

function checarMudancaDeLinha() {
    clearTimeout(delayValidacao);
    delayValidacao = setTimeout(() => {
        requestAnimationFrame(() => {
            validarCodigo();
        });
    }, 400);
}
codeInput.addEventListener('keyup', checarMudancaDeLinha);
codeInput.addEventListener('click', checarMudancaDeLinha);
codeInput.addEventListener('touchend', checarMudancaDeLinha);
document.addEventListener('selectionchange', () => {
    if (document.activeElement === codeInput) checarMudancaDeLinha();
});
codeInput.addEventListener('blur', () => {
    validarCodigo();
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
