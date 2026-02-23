let tabSize = window.EDITOR_CONFIG.tabSize;
let autoIndent = window.EDITOR_CONFIG.autoIndent;
let indentUnit = ' '.repeat(tabSize);

if (config?.tab_Size) {
    config.tab_Size.value = tabSize;
    config.tab_Size.addEventListener('change', (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 99) value = 99;
        config.tab_Size.value = value;
        tabSize = value;
        indentUnit = ' '.repeat(value);
    });
}

if (config?.auto_indent) {
    config.auto_indent.checked = autoIndent;
    config.auto_indent.addEventListener('change', (e) => {
        config.auto_indent.checked = e.target.checked;
        autoIndent = e.target.checked;
    });
}
ui.input.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const tab = indentUnit;
        this.setRangeText(tab, start, end, 'end');
        this.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }
    if (e.key === 'Enter' && autoIndent) {
        e.preventDefault();
        const start = this.selectionStart;
        const value = this.value;
        const linhaAntes = value.substring(0, start);
        const ultimaLinha = linhaAntes.split('\n').pop();
        let indent = ultimaLinha.match(/^\s*/)[0];
        if (
            (ultimaLinha.trim().endsWith('>') &&
                !ultimaLinha.trim().endsWith('-->') &&
                !ultimaLinha.trim().startsWith('</') &&
                !ultimaLinha.trim().endsWith('/>')) ||
            ultimaLinha.trim().endsWith('{')
        )
            indent += indentUnit;
        const novaLinha = '\n' + indent;
        this.setRangeText(novaLinha, start, start, 'end');
        this.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (e.key === 'Backspace' && e.ctrlKey) {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        if (start !== end) return;
        const value = this.value;
        const before = value.substring(0, start);
        const match = before.match(/( +)$/);
        if (match) {
            e.preventDefault();
            const spacesLength = match[1].length;
            this.setRangeText('', start - spacesLength, start, 'end');
            this.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
});
