function getAttrs(tag, nsName) {
    let list = new Set();

    const groups = [xml_tag, xml_tag_duplic];

    for (const group of groups) {
        const ns = group[nsName];
        if (!ns) continue;

        if (Array.isArray(ns.base)) {
            ns.base.forEach((a) => list.add(a));
        }

        if (ns.views?.[tag]) {
            ns.views[tag].forEach((a) => list.add(a));
        }
    }

    return [...list];
}

function getAvailablePrefixes() {
    return [...new Set(Object.values(NS_PREFIX))];
}

function StyleAttrs() {
    let list = [];
    const android = xml_tag.android;
    list.push(android.prefix);
    list.push(...android.base.map((a) => android.prefix + a));
    Object.values(android.views).forEach((arr) => {
        list.push(...arr.map((a) => android.prefix + a));
    });
    return [...new Set(list)];
}
let TAG_CACHE = null;
function getTags() {
    if (TAG_CACHE) return TAG_CACHE;

    const tags = new Set();
    const groups = [xml_tag, xml_tag_duplic];

    for (const group of groups) {
        Object.values(group).forEach((ns) => {
            if (!ns.views) return;
            Object.keys(ns.views).forEach((tag) => tags.add(tag));
        });
    }

    TAG_CACHE = [...tags];
    return TAG_CACHE;
}

function getXmlContext(text, cursor) {
    let before = text.slice(0, cursor);
    if (/<\w*$/.test(before)) return 'tag';
    if (/<\w+[^>]*\s+[\w:]*$/.test(before)) return 'attr';
    if (/="[^"]*$/.test(before)) return 'value';
    return null;
}
function getCurrentWord(text, cursor) {
    const before = text.slice(0, cursor);
    const match = before.match(/([a-zA-Z0-9_:@\-]+)$/);
    return match ? match[1] : '';
}
function getItemTypedValue(text, cursor) {
    const before = text.slice(0, cursor);
    const match = before.match(/<item[^>]*>([^<]*)$/);
    return match ? match[1].trim() : '';
}
function getCurrentAttr(text, cursor) {
    const before = text.slice(0, cursor);
    const match = before.match(/([\w:]+)\s*=\s*"[^"]*$/);
    if (!match) return null;
    return match[1].replace(/^\w+:/, '');
}

function isInsideValue(text, cursor) {
    const before = text.slice(0, cursor);
    return /="[^"]*$/.test(before);
}
function isInsideItemValue(text, cursor) {
    const before = text.slice(0, cursor);
    return /<item[^>]*>[^<]*$/.test(before);
}
function getItemName(text, cursor) {
    const before = text.slice(0, cursor);
    const matches = [...before.matchAll(/<item[^>]*name="([^"]+)"/g)];
    if (!matches.length) return null;
    const last = matches[matches.length - 1][1];
    return last.replace(/^android:/, '');
}

function getCurrentValue(text, cursor) {
    const before = text.slice(0, cursor);
    const match = before.match(/="([^"]*)$/);
    return match ? match[1] : '';
}

function isStyleItemName(text, cursor) {
    const before = text.slice(0, cursor);
    return /<item[^>]*\sname="[^"]*$/.test(before);
}

function getCurrentTag(text, cursor) {
    const before = text.slice(0, cursor);
    const match = before.match(/<([\w:.]+)[^>]*$/);
    return match ? match[1].split('.').pop() : null;
}
