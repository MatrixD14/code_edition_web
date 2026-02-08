function validarJava(textoCompleto) {
    const erros = [];

    erros.push(...analisarParenteses(textoCompleto));

    const linhas = textoCompleto.split('\n');
    let emDeclaracaoMultilinha = false;

    linhas.forEach((linha, index) => {
        const limpa = removerConteudoStrings(linha);
        const l = limpa.trim();

        if (!l || l.startsWith('//') || l.startsWith('/*') || l.startsWith('@')) return;

        const operadoresFim = ['||', '&&', '%', '==', '!=', '<', '>', '<=', '>=', '?', ':'];

        if (operadoresFim.some((op) => l.endsWith(op))) return;

        if (l.endsWith('{') || l.endsWith('}') || l.endsWith('};') || l.endsWith('});')) {
            emDeclaracaoMultilinha = false;
            return;
        }

        if (l.startsWith('for')) {
            const abre = limpa.indexOf('(');
            const fecha = limpa.lastIndexOf(')');

            if (abre === -1 || fecha === -1 || fecha <= abre) {
                erros.push({
                    linha: index,
                    coluna: limpa.length,
                    msg: 'for com parênteses inválidos',
                });

                return;
            }

            const dentro = limpa.slice(abre + 1, fecha);

            const semi = (dentro.match(/;/g) || []).length;
            const colon = (dentro.match(/:/g) || []).length;

            if (!colon && semi !== 2)
                erros.push({
                    linha: index,
                    coluna: abre,
                    msg: 'for precisa de 2 ;',
                });

            if (colon > 1 || (colon === 1 && semi))
                erros.push({
                    linha: index,
                    coluna: abre,
                    msg: 'for-each inválido',
                });
        }

        if (l.endsWith(',')) {
            emDeclaracaoMultilinha = true;
            return;
        }

        const controle = ['if', 'for', 'while', 'switch'];

        if (controle.some((k) => l.startsWith(k)) && l.includes('(') && l.endsWith(')')) return;

        if (!l.endsWith(';')) {
            const chamadaMetodo = /\w+\s*\(.*\)/.test(l);

            const precisaSemi =
                l.includes('=') ||
                chamadaMetodo ||
                l.includes('++') ||
                l.includes('--') ||
                l.startsWith('new ') ||
                l.startsWith('import ') ||
                l.startsWith('package ') ||
                emDeclaracaoMultilinha;

            if (precisaSemi)
                erros.push({
                    linha: index,
                    coluna: limpa.length,
                    msg: 'Faltando ;',
                });
        }

        emDeclaracaoMultilinha = false;
    });

    return erros;
}

function analisarParenteses(texto) {
    const erros = [];
    const pilha = [];

    texto.split('\n').forEach((linha, ln) => {
        const linhaLimpa = removerConteudoStrings(linha).split('//')[0].split('/*')[0];

        for (let col = 0; col < linhaLimpa.length; col++) {
            const c = linhaLimpa[col];

            if (c === '(') pilha.push({ linha: ln, coluna: col });

            if (c === ')') {
                if (!pilha.length)
                    erros.push({
                        linha: ln,
                        coluna: col,
                        msg: 'Parêntese não fechado',
                    });
                else pilha.pop();
            }
        }
    });

    pilha.forEach((p) => {
        erros.push({
            linha: p.linha,
            coluna: p.coluna,
            msg: 'Parêntese não fechado',
        });
    });

    return erros;
}
function removerConteudoStrings(linha) {
    return linha.replace(/"([^"\\]|\\.)*"/g, '""').replace(/'([^'\\]|\\.)*'/g, "''");
}
