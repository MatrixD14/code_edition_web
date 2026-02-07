function getAttrValueType(attrName) {
    return window.attrValueType[attrName] || null;
}
function getAllowedValues(type) {
    if (!type) return null;
    if (type.startsWith('enums.')) {
        const key = type.split('.')[1];
        return window.xml_values.enums[key] || null;
    }
    if (type.startsWith('refs.')) {
        const key = type.split('.')[1];
        return window.xml_values.refs[key] || null;
    }
    return window.xml_values[type] || null;
}
function validarValor(attrName, value) {
    const type = getAttrValueType(attrName);
    if (!type) return null;
    if (type.startsWith('refs.')) {
        const allowed = getAllowedValues(type);
        if (!allowed) return null;
        if (value === '') return null;
        if (!value.startsWith('@')) return null;
        if (Array.isArray(allowed)) {
            if (allowed.some((prefix) => value.startsWith(prefix))) return null;
            return { level: 'error', msg: `Referência inválida para ${attrName}` };
        }
        if (typeof allowed === 'string') {
            if (value.startsWith(allowed)) return null;
            return { level: 'error', msg: `Esperado ${allowed} em ${attrName}` };
        }
    }
    if (type.startsWith('enums.')) {
        const allowed = getAllowedValues(type);
        if (allowed && allowed.includes(value)) return null;

        return { level: 'error', msg: `Valor inválido para ${attrName}` };
    }
    if (type === 'dimension') {
        if (value === 'wrap_content' || value === 'match_parent' || /^[0-9]+(\.[0-9]+)?(dp|px)$/.test(value))
            return null;
        return { level: 'error', msg: `Valor "${value}" inválido para ${attrName}` };
    }
    if (type === 'size') {
        if (/^[0-9]+(\.[0-9]+)?sp$/.test(value)) return null;
        return { level: 'error', msg: `Valor "${value}" inválido para ${attrName}` };
    }
    if (type === 'boolean') {
        if (['true', 'false'].includes(value)) return null;
        return { level: 'error', msg: `Boolean inválido em ${attrName}` };
    }
    if (type === 'visibility') {
        if (window.xml_values.visibility.includes(value)) return null;
        return { level: 'error', msg: `Valor inválido para visibility` };
    }

    return null;
}

function validarAtributoMainDrawable(linhaTexto) {
    let erros = [];
    const regex = /android:([\w_]+)\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = regex.exec(linhaTexto))) {
        const attr = match[1];
        const value = match[2];
        const erro = validarValor(attr, value);
        if (erro) {
            erros.push({
                attr,
                value,
                msg: erro.msg,
                level: erro.level || 'error',
            });
        }
    }
    return erros;
}
function validadorAtributoStyle(linhaTexto) {
    let erros = [];

    const styleRegex = /<item\s+name\s*=\s*"android:([\w_]+)"\s*>([^<]*)<\/item>/;

    const styleMatch = linhaTexto.match(styleRegex);

    if (styleMatch) {
        const attr = styleMatch[1];
        const value = styleMatch[2].trim();

        const erro = validarValor(attr, value);

        if (erro) {
            erros.push({
                attr,
                value,
                msg: `[style] ${erro.msg}`,
                level: erro.level || 'error',
            });
        }
    }

    return erros;
}

function validarBlocoXML(texto) {
    const erros = [];
    const linhas = texto.split('\n');
    const schema = detectarSchema(texto);
    let tagAtual = null;

    linhas.forEach((linha, idx) => {
        const openTag = linha.match(/<\s*([A-Za-z0-9_\-]+)/);

        if (openTag) {
            tagAtual = openTag[1];

            const erroTag = validarTagExiste(tagAtual, schema);

            if (erroTag) {
                erros.push({
                    ...erroTag,
                    linha: idx,
                    tag: tagAtual,
                });
            }
        }

        if (tagAtual) {
            if (schema === window.xmlSchemas.values.styles) {
                validarStyle(linha, tagAtual).forEach((e) =>
                    erros.push({
                        ...e,
                        linha: idx,
                        tag: tagAtual,
                    }),
                );
                validadorAtributoStyle(linha).forEach((e) =>
                    erros.push({
                        ...e,
                        linha: idx,
                        tag: tagAtual,
                    }),
                );
            } else {
                validarTag(linha, tagAtual, schema).forEach((e) =>
                    erros.push({
                        ...e,
                        linha: idx,
                        tag: tagAtual,
                    }),
                );
                validarAtributoMainDrawable(linha).forEach((e) =>
                    erros.push({
                        ...e,
                        linha: idx,
                        tag: tagAtual,
                    }),
                );
            }
        }

        if (tagAtual && (linha.includes('/>') || linha.includes(`</${tagAtual}>`))) {
            tagAtual = null;
        }
    });
    erros.push(...validarFechamentoTags(texto));

    return erros;
}
