function atributoPermitido(tag, attr, schema) {
    if (!schema) return true;
    if (!attr.includes(':')) {
        const global = schema.globalattrs || [];
        if (global.includes(attr)) return true;
        const tagAttrs = schema.tagAttrs?.[tag];
        if (!Array.isArray(tagAttrs)) return true;
        return tagAttrs.includes(attr);
    }

    const idx = attr.indexOf(':');
    const namespace = attr.substring(0, idx);
    const nomeAttr = attr.substring(idx + 1);
    if (!schema.allowNamespaces?.includes(namespace)) return false;
    if (namespace === 'android') {
        const base = schema.baseAttrs?.android || [];
        const tagAttrs = schema.tagAttrs?.[tag] || [];
        return base.includes(nomeAttr) || tagAttrs.includes(nomeAttr);
    }
    if (namespace === 'tools') {
        return GLOBAL.xmlSchemas.namespaces.tools.attrs.includes(nomeAttr);
    }
    if (namespace === 'xmlns') {
        return GLOBAL.xmlSchemas.namespaces.xmlns.attrs.includes(nomeAttr);
    }

    return true;
}
function extrairConteudoTag(linha) {
    const start = linha.indexOf('<');
    const end = linha.indexOf('>');

    if (start === -1 || end === -1 || end <= start) return null;

    return linha.slice(start + 1, end);
}

function validarTag(linhaTexto, tag, schema) {
    const erros = [];
    const attrRegex = /([\w:]+)\s*=\s*"([^"]*)"/g;

    let match;

    while ((match = attrRegex.exec(linhaTexto))) {
        const attr = match[1];

        if (!atributoPermitido(tag, attr, schema)) {
            erros.push({
                msg: `Atributo "${attr}" não existe `,
            });
        }
    }
    return erros;
}

function validarStyle(linhaTexto) {
    const erros = [];
    const regex = /<item\s+name\s*=\s*"([^"]+)"\s*>(.*?)<\/item>/g;
    let match;
    while ((match = regex.exec(linhaTexto))) {
        const attrFull = match[1];
        const value = match[2].trim();
        if (!attrFull.startsWith('android:')) {
            erros.push({
                msg: `tem que iniciar com "android:" `,
            });
            continue;
        }
        const attr = attrFull.substring(8);
        if (!GLOBAL.attrValueType[attr]) {
            erros.push({
                msg: `Atributo "${attr}" inválido`,
            });
        }
        const erroValor = validarValor(attr, value);
        if (erroValor) erros.push(erroValor);
    }
    return erros;
}

function detectarSchema(texto) {
    const schemas = GLOBAL.xmlSchemas;

    if (!schemas) {
        return { tags: [], allowNamespaces: [], tagAttrs: {} };
    }
    const primeiraTag = texto.match(/<\s*([a-zA-Z\-]+)/);
    if (!primeiraTag) return schemas.layout;

    const tag = primeiraTag[1];
    if (schemas.drawable?.tags?.includes(tag)) return schemas.drawable;
    if (schemas.manifest?.tags?.includes(tag)) return schemas.manifest;

    if (tag === 'resources') {
        const v = schemas.values;

        return {
            type: 'values',
            allowNamespaces: ['android', 'tools', 'xmlns'],
            tags: [...v.strings.tags, ...v.colors.tags, ...v.styles.tags],
            tagAttrs: Object.assign({}, v.strings.tagAttrs, v.colors.tagAttrs, v.styles.tagAttrs),
            baseAttrs: schemas.layout.baseAttrs,
        };
    }

    return schemas.layout;
}
