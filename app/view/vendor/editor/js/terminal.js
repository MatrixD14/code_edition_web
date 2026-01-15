let terminalCWD = '';

function scrollToBottom() {
    if (term.containerTerminal) {
        term.containerTerminal.scrollTop = term.containerTerminal.scrollHeight;
    }
}

function getRelativePath(fullPath) {
    if (!fullPath) return '/';
    const rootName = 'htdoc';

    if (fullPath.includes(rootName)) {
        const parts = fullPath.split(rootName);
        let rel = parts.pop();
        return rel === '' ? '/' : rel;
    }
    return '/';
}

let display_terminal = $('.terminal-body'),
    terminal_toggle = $('.terminal_btn');

term.inputTerm.addEventListener('keydown', async (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const fullText = term.inputTerm.value;
        const commandSegments = fullText.split(/[&|;]/);
        const lastCommandSegment = commandSegments[commandSegments.length - 1];
        const words = lastCommandSegment.trimStart().split(' ');
        const partialName = words.pop();

        if (!partialName) return;

        const textBeforePartial = fullText.substring(0, fullText.lastIndexOf(partialName));

        try {
            const response = await fetch('../../../model/terminal/autocomplete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partial: partialName,
                    cwd: window.terminalCWD || (typeof currentProjectRoot !== 'undefined' ? currentProjectRoot : ''),
                }),
            });
            const suggestions = await response.json();

            if (suggestions.length === 1) {
                term.inputTerm.value = textBeforePartial + suggestions[0];
            } else if (suggestions.length > 1) {
                term.outputTerm.innerHTML += `<div style="color: #999; font-size: 0.8em;">${suggestions.join('   ')}</div>`;
                scrollToBottom();
            }
        } catch (err) {
            console.error('Erro no autocomplete');
        }
        return;
    }

    if (e.key === 'Enter') {
        const cmd = term.inputTerm.value.trim();
        if (!cmd) return;

        if (cmd === 'clear') {
            term.outputTerm.innerHTML = '';
            term.inputTerm.value = '';
            return;
        }

        let effectiveCWD = window.terminalCWD || terminalCWD || '';

        const pathPrompt = getRelativePath(terminalCWD);
        term.outputTerm.innerHTML += `<div><span style="color:#56b6c2">user@android:${pathPrompt} $</span> ${cmd}</div>`;
        term.inputTerm.value = '';

        try {
            const response = await fetch('../../../model/terminal/terminal.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: cmd,
                    cwd: effectiveCWD,
                }),
            });
            if (!response.ok) throw new Error('Resposta do servidor inválida');

            const res = await response.json();

            if (res.newCwd) {
                terminalCWD = res.newCwd;
                window.terminalCWD = res.newCwd;
            }

            if (res.output) {
                const pre = document.createElement('pre');
                pre.className = 'terminal-line';
                pre.style.whiteSpace = 'pre-wrap';
                pre.textContent = res.output;
                term.outputTerm.appendChild(pre);
            }
        } catch (err) {
            term.outputTerm.innerHTML += `<div style="color:red">Erro crítico: Verifique a conexão com o terminal.php</div>`;
            terminalCWD = '';
            window.terminalCWD = '';
            console.error('Erro no terminal:', err);
        }
        scrollToBottom();
        term.inputTerm.focus();
    }
});
terminal_toggle.addEventListener('click', () => {
    const isHidden = display_terminal.classList.contains('hidden');
    display_terminal.classList.toggle('hidden');
    if (isHidden) term.inputTerm.focus();
});
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '"') {
        e.preventDefault();
        terminal_toggle.click();
    }
});
