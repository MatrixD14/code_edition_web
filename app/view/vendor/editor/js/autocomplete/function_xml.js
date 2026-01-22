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

    // tag
    const tagMatch = before.match(/<([a-zA-Z0-9:_\-]*)$/);
    const closingTagMatch = before.match(/<\/([a-zA-Z0-9:_\-]*)$/);
    if (tagMatch || closingTagMatch) {
        return {
            type: 'tag',
            prefix: tagMatch ? tagMatch[1] : closingTagMatch[1],
        };
    }
    // style <item> value
    if (!state.inTag && !state.inString) {
        const itemMatch = before.match(/<item[^>]*name\s*=\s*"([^"]+)"[^>]*>([^<]*)$/);
        if (itemMatch) {
            return {
                type: 'item-value',
                attrName: itemMatch[1].replace(/^android:/, ''),
                prefix: itemMatch[2] || '',
            };
        }
    }

    // style <item name="...">
    if (state.inTag && state.inString && state.tagName === 'item' && state.attrName === 'name') {
        const lastQuote = Math.max(before.lastIndexOf('"'), before.lastIndexOf("'"));
        const prefix = lastQuote >= 0 ? before.slice(lastQuote + 1) : '';

        return {
            type: 'item-name',
            prefix,
        };
    }

    // atributo
    if (state.inTag && !state.inString && state.tagName) {
        const m = before.match(/([a-zA-Z_:][a-zA-Z0-9:_\-]*)$/);
        return {
            type: 'attribute',
            tagName: state.tagName,
            namespace: state.namespace,
            prefix: m ? m[1] : '',
        };
    }

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
    const p = ctx.prefix.toLowerCase();
    let items = [];
    if (!p && schema.allowNamespaces) items.push(...schema.allowNamespaces.map((ns) => ns + ':'));
    else if (p.includes(':')) {
        const [ns, partial] = p.split(':');
        const lowPartial = partial.toLowerCase();
        let sourceAttrs = [];
        if (ns === 'android') {
            if (schema.baseAttrs?.android) sourceAttrs.push(...schema.baseAttrs.android);
            if (schema.tagAttrs?.[ctx.tagName]) {
                const tagData = schema.tagAttrs[ctx.tagName];
                if (Array.isArray(tagData)) sourceAttrs.push(...tagData);
            }
        } else if (ns === 'tools') sourceAttrs.push(...(window.xmlSchemas?.namespaces?.tools?.attrs || []));
        else if (ns === 'xmlns') sourceAttrs.push(...(window.xmlSchemas?.namespaces?.xmlns?.attrs || []));
        for (const a of sourceAttrs || []) if (a.toLowerCase().startsWith(lowPartial)) items.push(a);
    } else {
        if (schema.allowNamespaces) for (const ns of schema.allowNamespaces) if (ns.startsWith(p)) items.push(ns + ':');
        const tagAttrs = schema.tagAttrs?.[ctx.tagName];
        if (Array.isArray(tagAttrs)) for (const a of tagAttrs) if (a.toLowerCase().startsWith(p)) items.push(a);
    }
    return items.length ? { items: [...new Set(items)], typesms: 'attrs' } : null;
}

function xmlStyleItemNameProvider(ctx, schema) {
    if (ctx.type !== 'item-name') return null;
    const p = ctx.prefix.toLowerCase();
    const attrs = Object.keys(window.attrValueType || {});
    let items = [];
    if (p.includes(':')) {
        const [ns, partial = ''] = p.split(':');
        if (ns === 'android') for (const a of attrs) if (a.toLowerCase().startsWith(partial)) items.push(a);
    } else items.push('android:');
    return items.length ? { items: [...new Set(items)], typesms: 'attrs' } : null;
}

function xmlStyleItemValueProvider(ctx) {
    if (ctx.type !== 'item-value') return null;
    const type = window.attrValueType[ctx.attrName];
    if (!type) return null;
    let values = window.xml_values;
    const parts = type.split('.');
    for (const part of parts) values = values?.[part];
    if (!values) return null;
    let items = Array.isArray(values) ? [...values] : [values];
    if (ctx.prefix) {
        const p = ctx.prefix.toLowerCase();
        items = items.filter((v) => v.toLowerCase().startsWith(p));
    }
    return items.length ? { items, typesms: 'value style' } : null;
}

function xmlXmlnsValueProvider(ctx, schema) {
    if (ctx.type !== 'attr-value') return null;
    if (!ctx.attrName.startsWith('xmlns:')) return null;
    const typed = ctx.attrName.split(':')[1] || '';
    if (!window.xmlSchemas.namespaces.xmlns?.attrs) return null;
    const match = window.xmlSchemas.namespaces.xmlns.attrs.find((ns) => ns.startsWith(typed));
    if (!match) return null;
    const idx = window.xmlSchemas.namespaces.xmlns.attrs.indexOf(match);
    const value = window.xmlSchemas.namespaces.xmlns.values?.[idx];
    if (!value) return null;
    return {
        items: [value],
        typesms: 'xmlns-value',
    };
}

function xmlAttrValueProvider(ctx, schema) {
    if (ctx.type !== 'attr-value') return null;
    const attr = ctx.attrName.replace(/^.*:/, '');
    const type = window.attrValueType[attr];
    if (!type) return null;
    const parts = type.split('.');
    let values = window.xml_values;
    for (const part of parts) values = values?.[part];
    if (!values) return null;
    let items = Array.isArray(values) ? [...values] : [values];
    if (ctx.prefix) {
        const p = ctx.prefix.toLowerCase();
        items = items.filter((v) => v.toLowerCase().startsWith(p));
    }
    return items.length ? { items, typesms: type } : null;
}

const xmlCandidates = [
    xmlStyleItemNameProvider,
    xmlStyleItemValueProvider,
    xmlAttrValueProvider,
    xmlXmlnsValueProvider,
    xmlAttrsProvider,
    xmlTagsProvider,
];

function unirXML(ctx, schema) {
    const items = [];
    const types = [];
    for (const fn of xmlCandidates) {
        const r = fn(ctx, schema);
        if (!r || !r.items?.length) continue;
        items.push(...r.items);
        if (r.typesms) types.push(r.typesms);
        if (items.length >= maxs) break;
    }

    if (!items.length) return null;
    // if (ctx.prefix && items.length === 1 && items[0].toLowerCase() === ctx.prefix.toLowerCase()) return null;
    return {
        items: [...new Set(items)],
        typesms: [...new Set(types)].join(' | '),
    };
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
