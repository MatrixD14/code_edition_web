function validarJava(textoCompleto) {
    let erros = [];
    const linhas = textoCompleto.split('\n');
    let emDeclaracaoMultilinha = false;

    linhas.forEach((linha, index) => {
        const l = linha.trim();
        if (l === '' || l.startsWith('//') || l.startsWith('/*') || l.startsWith('*') || l.startsWith('@')) return;

        if (l.startsWith('for') && l.includes('(') && l.includes(')')) {
            const conteudoParenteses = l.substring(l.indexOf('(') + 1, l.lastIndexOf(')'));
            const contagemPontosVirgula = (conteudoParenteses.match(/;/g) || []).length;
            const contagemDoisPontos = (conteudoParenteses.match(/:/g) || []).length;
            if (contagemDoisPontos > 0) {
                if (contagemDoisPontos !== 1 || contagemPontosVirgula > 0) {
                    erros.push({
                        linha: index,
                        msg: 'Sintaxe de "for-each" inválida. Use apenas um ":" e nenhum ";".',
                    });
                }
            } else {
                if (contagemPontosVirgula !== 2) {
                    const msgErro =
                        contagemPontosVirgula < 2
                            ? 'Faltam ";" internos no "for".'
                            : 'Excesso de ";" internos no "for".';
                    erros.push({ linha: index, msg: msgErro });
                }
            }
        }

        const blocosEOperadores = ['{', '}', '};', '});', '||', '&&', '?', ':'];
        if (blocosEOperadores.some((term) => l.endsWith(term))) {
            emDeclaracaoMultilinha = false;
            return;
        }

        if (l.endsWith(',')) {
            const eInicioDeclaracao = java_base.some((t) => l.startsWith(t)) || l.includes('(');
            if (eInicioDeclaracao || emDeclaracaoMultilinha) emDeclaracaoMultilinha = true;
            else erros.push({ linha: index, msg: 'Vírgula (,) inesperada.' });
            return;
        }

        if (!l.endsWith(';')) {
            const eTipoBase = java_base.some((tipo) => l.startsWith(tipo));
            const eMetodo = java_string_methods.some((m) => l.includes(m.split('(')[0]));
            const eAtribuicao = l.includes('=');
            const eIncremento = l.includes('++') || l.includes('--');
            const eChamadaMetodo = l.includes('(') && l.includes(')');
            const eInstancia = l.startsWith('new ');
            const eImportPackage = l.startsWith('import ') || l.startsWith('package ');
            const eFor = l.startsWith('for');
            const eEstruturaControle = ['if', 'while', 'switch'].some((kw) => l.startsWith(kw));

            if (
                emDeclaracaoMultilinha ||
                l.startsWith('return') ||
                eTipoBase ||
                eMetodo ||
                eAtribuicao ||
                eIncremento ||
                eChamadaMetodo ||
                eInstancia ||
                eImportPackage ||
                eEstruturaControle ||
                eFor
            ) {
                if (!l.endsWith('{')) erros.push({ linha: index, msg: 'Faltando ponto e vírgula (;)' });
            }
        }
        emDeclaracaoMultilinha = false;
    });
    return erros;
}
