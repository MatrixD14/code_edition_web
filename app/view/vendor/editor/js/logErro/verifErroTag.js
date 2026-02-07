function validarTagExiste(tag, schema) {
    if (!schema?.tags) return null;

    if (!schema.tags.includes(tag)) {
        return {
            msg: `Tag <${tag}> não reconhecida`,
        };
    }

    return null;
}

function validarFechamentoTags(texto) {
    const erros = [];
    const tagRegex = /<(?!!--)(\/?)([A-Za-z0-9_\-]+)[^>]*?>/g;

    const stack = [];

    let match;

    while ((match = tagRegex.exec(texto))) {
        const fullTag = match[0];
        const isClose = match[1] === '/';
        const tag = match[2];

        const linha = texto.substring(0, match.index).split('\n').length - 1;

        if (isClose) {
            const last = stack.pop();

            if (!last || last.tag !== tag) {
                erros.push({
                    linha,
                    tag,
                    msg: `Fechamento incorreto: </${tag}>`,
                });
            }
            continue;
        }
        if (fullTag.endsWith('/>')) continue;
        stack.push({
            tag,
            linha,
        });
    }

    stack.forEach((item) => {
        erros.push({
            linha: item.linha,
            tag: item.tag,
            msg: `Tag <${item.tag}> não foi fechada`,
        });
    });

    return erros;
}
