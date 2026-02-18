function getAttrValueType(attrName) {
    return GLOBAL.attrValueType[attrName] || null;
}
function getAllowedValues(type) {
    if (!type) return null;
    const key = type.includes('.') ? type.substring(type.indexOf('.') + 1) : type;

    if (type.startsWith('enums.')) {
        return GLOBAL.xml_values.enums[key] || null;
    }
    if (type.startsWith('refs.')) {
        return GLOBAL.xml_values.refs[key] || null;
    }
    return GLOBAL.xml_values[type] || null;
}
function validarValor(attrName, value) {
    const type = getAttrValueType(attrName);
    if (!type) return null;
    if (type.startsWith('refs.')) {
        const allowed = getAllowedValues(type);
        if (!allowed || value === '') return null;
        if (!value.startsWith('@')) return null;
        if (Array.isArray(allowed)) {
            if (allowed.some((prefix) => value.startsWith(prefix))) return null;
            return { level: 'error', msg: `Referência inválida para "${attrName}"` };
        }
        if (typeof allowed === 'string') {
            if (value.startsWith(allowed)) return null;
            return { level: 'error', msg: `Esperado "${allowed}" na tag "${attrName}"` };
        }
    }
    if (type.startsWith('enums.')) {
        const allowed = getAllowedValues(type);
        if (allowed && allowed.includes(value)) return null;

        return { level: 'error', msg: `Valor inválido para "${attrName}"` };
    }
    if (type === 'dimension') {
        if (value === 'wrap_content' || value === 'match_parent' || /^[0-9]+(\.[0-9]+)?(dp|px)$/.test(value))
            return null;
        return { level: 'error', msg: `Valor "${value}" inválido para "${attrName}"` };
    }
    if (type === 'size') {
        if (/^[0-9]+(\.[0-9]+)?sp$/.test(value)) return null;
        return { level: 'error', msg: `Valor "${value}" inválido para "${attrName}"` };
    }
    if (type === 'boolean') {
        if (['true', 'false'].includes(value)) return null;
        return { level: 'error', msg: `Boolean inválido em "${attrName}"` };
    }
    if (type === 'visibility') {
        if (GLOBAL.xml_values.visibility.includes(value)) return null;
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
function validarBlocoXML(texto) {
    const erros = [];
    const stack = [];
    const linhas = texto.split('\n');
    const schema = detectarSchema(texto);
    let dentroDeComentario = false;
    let androidNamespaceDeclarado = false;

    linhas.forEach((linha, idx) => {
        let limpa = linha.trim();
        if (!limpa || limpa.startsWith('<?')) return;
        let posFim = limpa.indexOf('-->');
        if (dentroDeComentario) {
            if (posFim !== -1) {
                dentroDeComentario = false;
                limpa = limpa.substring(posFim + 3).trim();
                if (!limpa) return;
            } else return;
        }
        if (limpa.startsWith('<!--')) {
            if (posFim !== -1) {
                limpa = limpa.substring(posFim + 3).trim();
                if (!limpa) return;
            } else {
                dentroDeComentario = true;
                return;
            }
        }
        if (limpa.includes('xmlns:android=')) androidNamespaceDeclarado = true;

        const openTagMatch = limpa.match(/^<\s*([A-Za-z][\w\-]*)\b/);
        let tagDestaLinha = null;
        if (openTagMatch && !limpa.startsWith('</')) {
            const tag = openTagMatch[1];

            const isSelfClosing = limpa.endsWith('/>');
            tagDestaLinha = tag;
            if (!isSelfClosing) stack.push(tag);

            const erroTag = validarTagExiste(tag, schema);

            if (erroTag) {
                erros.push({
                    ...erroTag,
                    linha: idx,
                    tag,
                });
            }
        } else tagDestaLinha = stack[stack.length - 1];

        if (tagDestaLinha) {
            validarTag(linha, tagDestaLinha, schema).forEach((e) =>
                erros.push({ ...e, linha: idx, tag: tagDestaLinha }),
            );

            if (schema.type === 'values') {
                validarStyle(linha).forEach((e) => erros.push({ ...e, linha: idx, tag: tagDestaLinha }));
            } else {
                validarAtributoMainDrawable(linha).forEach((e) => erros.push({ ...e, linha: idx, tag: tagDestaLinha }));
            }
        }
        const closeTag = limpa.match(/^<\/\s*([A-Za-z][\w\-]*)>/);

        if (closeTag) {
            const closing = closeTag[1];
            if (stack.length > 0 && stack[stack.length - 1] === closing) stack.pop();
        }
    });

    return erros;
}
