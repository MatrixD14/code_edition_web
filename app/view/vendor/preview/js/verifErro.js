///tag
function extrairErroXML(errorText) {
    let tipo = 'Erro de sintaxe no XML';
    let linha = null;
    let tipoMatch = errorText.match(/Erro no codigo do XML:[^\n]+/);
    if (tipoMatch) tipo = tipoMatch[0].replace('Erro no codigo do XML:', '').trim();

    let linhaMatch = errorText.match(/Linha número (\d+)/);
    if (linhaMatch) linha = linhaMatch[1];
    if (errorText.includes('tag sem correspondência')) tipo = 'Tag não fechada ou fechamento incorreto (>)';
    else if (errorText.includes('formato incorreto')) tipo = 'Formato inválido no XML';
    else if (errorText.includes('Esperado: .')) tipo = 'Esperado fechamento de tag (>)';
    return { tipo, linha };
}

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

function validarLinhaXML(linhaTexto) {
    const regex = /android:([\w_]+)\s*=\s*"([^"]*)"/g;
    let match;
    let erros = [];
    while ((match = regex.exec(linhaTexto))) {
        const attr = match[1];
        const value = match[2];
        const erro = validarValor(attr, value);
        if (erro) {
            erros.push({
                attr,
                value,
                ...erro,
            });
        }
    }
    return erros;
}
