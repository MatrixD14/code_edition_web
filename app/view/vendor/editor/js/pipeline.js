function initEditorPipeline(input) {
    let validateTimer;
    let highlightTimer;
    input.addEventListener('input', () => {
        clearTimeout(highlightTimer);
        clearTimeout(validateTimer);
        let delay = input.value.length > 25000 ? 200 : 50;

        highlightTimer = setTimeout(() => {
            window.syncEditorInicial?.();
        }, delay);

        validateTimer = setTimeout(() => {
            window.validarCodigo?.();
        }, delay * 4);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('code-input');
    if (input) initEditorPipeline(input);
});
