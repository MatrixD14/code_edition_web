function createXMLState() {
    return {
        inTag: false,
        inString: false,
        quote: null,
        tagName: null,
        attrName: null,
        namespace: null,
    };
}

function scanXMLUntilCursor(text, cursor) {
    const state = createXMLState();
    let i = 0;

    while (i < cursor) {
        const ch = text[i];

        // comentário <!-- -->
        if (!state.inString && text.slice(i, i + 4) === '<!--') {
            const end = text.indexOf('-->', i + 4);
            if (end === -1 || end >= cursor) break;
            i = end + 3;
            continue;
        }

        if (!state.inString && ch === '<') {
            state.inTag = true;
            state.tagName = '';
            state.attrName = null;
            state.namespace = null;
            i++;
            continue;
        }

        if (state.inTag && !state.inString && ch === '>') {
            state.inTag = false;
            state.tagName = null;
            state.attrName = null;
            state.namespace = null;
            i++;
            continue;
        }

        if (state.inTag && (ch === '"' || ch === "'")) {
            if (!state.inString) {
                state.inString = true;
                state.quote = ch;
            } else if (state.quote === ch) {
                state.inString = false;
                state.quote = null;
            }
            i++;
            continue;
        }

        // nome da tag
        if (state.inTag && !state.tagName && /[a-zA-Z]/.test(ch)) {
            let name = ch;
            let j = i + 1;
            while (j < cursor && /[a-zA-Z0-9:_\-]/.test(text[j])) {
                name += text[j++];
            }
            state.tagName = name;
            i = j;
            continue;
        }

        // atributo
        if (state.inTag && !state.inString && /[a-zA-Z]/.test(ch)) {
            let attr = ch;
            let j = i + 1;
            while (j < cursor && /[a-zA-Z0-9:_\-]/.test(text[j])) {
                attr += text[j++];
            }

            state.attrName = attr;
            state.namespace = attr.includes(':') ? attr.split(':')[0] : null;
            i = j;
            continue;
        }

        i++;
    }

    return state;
}

function getXMLContext(text, cursor) {
    const state = scanXMLUntilCursor(text, cursor);
    const before = text.slice(0, cursor);

    // valor de atributo
    if (state.inTag && state.inString && state.attrName) {
        const lastQuote = Math.max(before.lastIndexOf('"'), before.lastIndexOf("'"));
        const prefix = lastQuote >= 0 ? before.slice(lastQuote + 1) : '';
        return {
            type: 'attr-value',
            tagName: state.tagName,
            attrName: state.attrName,
            namespace: state.namespace,
            prefix,
        };
    }

    // atributo
    if (state.inTag && !state.inString && state.tagName) {
        const m = before.match(/([a-zA-Z_:][a-zA-Z0-9:_\-]*)$/);
        // já existe "=" depois do nome → não é atributo
        if (m && before.slice(before.lastIndexOf(m[1]) + m[1].length).includes('=')) return null;
        return {
            type: 'attribute',
            tagName: state.tagName,
            namespace: state.namespace,
            prefix: m ? m[1] : '',
        };
    }

    // tag
    const tagMatch = before.match(/<([a-zA-Z0-9:_\-]*)$/);
    if (tagMatch) {
        return {
            type: 'tag',
            prefix: tagMatch[1],
        };
    }

    return null;
}

function xmlTagsProvider(ctx, schema) {
    if (ctx.type !== 'tag') return null;
    if (!schema.tags) return null;

    const p = ctx.prefix.toLowerCase();
    const items = schema.tags.filter((t) => t.toLowerCase().startsWith(p));

    return items.length ? { items, typesms: 'tags' } : null;
}

function xmlAttrsProvider(ctx, schema) {
    if (ctx.type !== 'attribute') return null;
    if (!schema.tagAttrs && !schema.baseAttrs) return null;

    const tagAttrs = schema.tagAttrs?.[ctx.tagName] || [];
    let baseAttrs = [];

    if (ctx.namespace) baseAttrs = schema.baseAttrs?.[ctx.namespace] || [];
    else if (schema.baseAttrs) baseAttrs = Object.values(schema.baseAttrs).flat();

    const p = ctx.prefix.toLowerCase();
    const items = [...baseAttrs, ...tagAttrs].filter((a) => a.toLowerCase().startsWith(p));

    return items.length ? { items, typesms: 'attrs' } : null;
}

function xmlAttrValueProvider(ctx, schema) {
    if (ctx.type !== 'attr-value') return null;

    const attr = ctx.attrName.replace(/^.*:/, '');
    const type = window.attrValueType[attr];
    if (!type) return null;

    const parts = type.split('.');
    let values = window.xml_values;

    for (const p of parts) values = values?.[p];
    if (!values) return null;

    if (Array.isArray(values)) {
        return { items: values, typesms: type };
    }

    if (typeof values === 'string') {
        return { items: [values], typesms: 'ref' };
    }

    return null;
}

const xmlCandidates = [xmlAttrValueProvider, xmlTagsProvider, xmlAttrsProvider];

function unirXML(ctx, schema) {
    const items = [];
    const types = [];

    for (const fn of xmlCandidates) {
        const r = fn(ctx, schema); // 👈 schema entra aqui
        if (!r) continue;

        if (r.items) items.push(...r.items);
        if (r.typesms) types.push(r.typesms);

        if (items.length >= maxs) break;
    }

    return items.length ? { items, typesms: types.join(' | ') } : null;
}

function getSchemaByFile(fileName) {
    if (fileName.endsWith('AndroidManifest.xml')) return xmlSchemas.manifest;
    if (fileName.includes('/layout/')) return xmlSchemas.layout;
    if (fileName.includes('/drawable/')) return xmlSchemas.drawable;
    if (fileName.includes('/values/strings')) return xmlSchemas.values.strings;
    if (fileName.includes('/values/colors')) return xmlSchemas.values.colors;
    if (fileName.includes('/values/styles')) return xmlSchemas.values.styles;
    return null;
}
