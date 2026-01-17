const java_imports_parts = java_imports.map((i) => i.split('.'));
const java_base_norm = java_base.map((i) => ({
    raw: i,
    low: i.toLowerCase(),
}));
const maxs = 200;
function getJavaImportContext(text, cursor) {
    const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
    const line = text.slice(lineStart, cursor);
    if (!line.startsWith('import ')) return null;
    const typed = line.slice(7);
    const parts = typed.split('.').filter(Boolean);
    return {
        parts,
        typedEndsWithDot: typed.endsWith('.'),
    };
}
function getJavaContext(text, cursor) {
    const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
    const line = text.slice(lineStart, cursor);

    if (line.startsWith('import ')) return { type: 'import', ctx: getJavaImportContext(text, cursor) };

    const match = line.match(/([a-zA-Z_][a-zA-Z0-9_\.]*)$/);
    if (match) return { type: 'code', prefix: match[1] };
    return null;
}

function trataAtributoJava(ctx) {
    const level = ctx.typedEndsWithDot ? ctx.parts.length : ctx.parts.length - 1;
    const prefix = ctx.typedEndsWithDot ? '' : ctx.parts[ctx.parts.length - 1].toLowerCase();
    const results = new Set();
    for (const imp of java_imports_parts) {
        if (results.size >= maxs) break;
        if (imp.length <= level) continue;
        let ok = true;
        for (let i = 0; i < level; i++) {
            if (imp[i] !== ctx.parts[i]) {
                ok = false;
                break;
            }
        }
        if (!ok) continue;
        const name = imp[level];
        if (!prefix || name.toLowerCase().startsWith(prefix)) results.add(name);
    }
    return {
        items: [...results],
        typesms: 'imports',
    };
}
function trataJavaBase(prefix) {
    const res = [];
    const p = prefix.toLowerCase();

    for (const k of java_base_norm) {
        if (res.length >= maxs) break;
        if (k.low.startsWith(p)) res.push(k.raw);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'java',
    };
}

function trataJavaSnippets(prefix) {
    const res = [];
    const p = prefix.toLowerCase();

    for (const s of java_snippets) {
        if (res.length >= maxs) break;
        if (s.toLowerCase().startsWith(p)) res.push(s);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'snippets',
    };
}
function trataJavaMethods(prefix) {
    const res = [];
    const p = prefix.toLowerCase();
    const partes = p.split('.');
    const busca = partes[partes.length - 1];
    for (const m of java_string_methods) {
        if (res.length >= maxs) break;
        if (busca === '' || m.toLowerCase().startsWith(busca)) res.push(m);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'methods',
    };
}
function trataJavaBaseXML(prefix) {
    const res = [];
    const p = prefix.toLowerCase();

    for (const m of android_xml_views) {
        if (res.length >= maxs) break;
        if (m.toLowerCase().startsWith(p)) res.push(m);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'xml',
    };
}
function trataJavaNoXML(prefix) {
    const res = [];
    const p = prefix.toLowerCase();

    for (const m of android_not_xml) {
        if (res.length >= maxs) break;
        if (m.toLowerCase().startsWith(p)) res.push(m);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'class',
    };
}
function trataAndroidR(prefix) {
    if (!prefix) return null;
    const res = [];
    const p = prefix.toLowerCase();

    for (const m of android_imports) {
        if (res.length >= maxs) break;
        if (m.toLowerCase().startsWith(p)) res.push(m);
    }
    if (!res.length) return null;
    return {
        items: res,
        typesms: 'Resources',
    };
}
const candidates = [
    trataJavaSnippets,
    trataJavaMethods,
    trataJavaBase,
    trataJavaBaseXML,
    trataJavaNoXML,
    trataAndroidR,
];
function unirMethods(ctx) {
    const items = [];
    const types = [];

    for (const fn of candidates) {
        const result = fn(ctx.prefix);
        if (!result) continue;
        if (result.items?.length) items.push(...result.items);
        if (result.typesms) types.push(result.typesms);
        if (items.length >= maxs) break;
    }
    if (!items.length) return null;
    return {
        items: items,
        typesms: types.join(' | '),
    };
}
