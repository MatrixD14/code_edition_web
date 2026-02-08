function atributoPermitido(tag, attr, schema) {
    if (!schema) return true;
    const [namespace, nomeAttr] = attr.split(':');
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
    const attrRegex = /([a-zA-Z]+:[a-zA-Z0-9_]+)\s*=\s*"[^"]*"/g;

    let match;

    while ((match = attrRegex.exec(linhaTexto))) {
        const attr = match[1];

        if (!atributoPermitido(tag, attr, schema)) {
            erros.push({
                msg: `Atributo ${attr} não permitido em <${tag}>`,
            });
        }
    }
    return erros;
}

function validarStyle(linhaTexto, tag) {
    const erros = [];
    const match = linhaTexto.match(/<item\s+name\s*=\s*"([\w]+:[\w_]+)"/);
    if (!match) return erros;
    const attrFull = match[1];
    const [, attr] = attrFull.split(':');
    if (!GLOBAL.attrValueType[attr]) {
        erros.push({
            msg: `Atributo ${attr} inválido em <${tag}>`,
        });
    }

    return erros;
}

function detectarSchema(texto) {
    const schemas = self.xmlSchemas || self.GLOBAL?.xmlSchemas;

    if (!schemas) {
        return { tags: [], allowNamespaces: [], tagAttrs: {} };
    }
    const primeiraTag = texto.match(/<\s*([a-zA-Z\-]+)/);
    if (!primeiraTag) return schemas.layout;

    const tag = primeiraTag[1];
    if (schemas.drawable?.tags.includes(tag)) return schemas.drawable;
    if (schemas.manifest?.tags.includes(tag)) return schemas.manifest;

    if (tag === 'resources') {
        const v = schemas.values;
        return {
            allowNamespaces: [],
            tags: [...v.strings.tags, ...v.colors.tags, ...v.styles.tags],
            tagAttrs: {
                ...v.strings.tagAttrs,
                ...v.colors.tagAttrs,
                ...v.styles.tagAttrs,
            },
        };
    }
    return schemas.layout;
}
