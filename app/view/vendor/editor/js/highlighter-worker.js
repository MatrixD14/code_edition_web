const KEYWORDS = new Set([
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'default',
    'break',
    'continue',
    'try',
    'catch',
    'finally',
    'throw',
    'throws',
    'new',
    'this',
    'super',
    'async',
    'export',
    'import',
    'package',
    'public',
    'private',
    'protected',
    'static',
    'final',
    'class',
    'interface',
    'enum',
    'extends',
    'implements',
]);

const TYPES = new Set([
    'int',
    'float',
    'double',
    'char',
    'boolean',
    'byte',
    'long',
    'short',
    'void',
    'String',
    'Object',
    'Integer',
    'Boolean',
    'Long',
    'Float',
    'Double',
    'List',
    'ArrayList',
    'Map',
    'HashMap',
    'Set',
    'HashSet',
    'Thread',
    'Runnable',
    'Exception',
    'RuntimeException',
    'IOException',
    'Context',
    'Intent',
    'Bitmap',
    'Toast',
    'Button',
    'TextView',
    'LinearLayout',
    'View',
    'Bundle',
    'Override',
]);
function isIdentStart(ch) {
    return /[a-zA-Z_]/.test(ch);
}

function isIdentChar(ch) {
    return /[a-zA-Z0-9_]/.test(ch);
}

function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}

function createState() {
    return {
        inBlockComment: false,
        inString: null,
    };
}
function createXMLState() {
    return {
        inComment: false,
        inTag: false,
        inString: null,
        tagNameDone: false,
    };
}

function highlightLine(line, state) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        const next = line[i + 1];
        if (state.inBlockComment) {
            if (ch === '*' && next === '/') {
                state.inBlockComment = false;
                out += '*/</sp>';
                i += 2;
            } else {
                out += ch;
                i++;
            }
            continue;
        }
        if (ch === '/' && next === '/') {
            out += `<sp class="c">${line.slice(i)}</sp>`;
            break;
        }
        if (ch === '/' && next === '*') {
            state.inBlockComment = true;
            out += '<sp class="c">/*';
            i += 2;
            continue;
        }
        if (state.inString) {
            out += ch;
            if (ch === state.inString) {
                out += '</sp>';
                state.inString = null;
            }
            i++;
            continue;
        }

        if (ch === '"' || ch === "'") {
            state.inString = ch;
            out += `<sp class="s">${ch}`;
            i++;
            continue;
        }
        if (isIdentStart(ch)) {
            let word = ch;
            let j = i + 1;
            while (j < line.length && isIdentChar(line[j])) {
                word += line[j++];
            }
            if (KEYWORDS.has(word)) out += `<sp class="k">${word}</sp>`;
            else if (TYPES.has(word)) out += `<sp class="v">${word}</sp>`;
            else out += word;
            i = j;
            continue;
        }
        if (isDigit(ch)) {
            let num = ch;
            let j = i + 1;
            while (j < line.length && isDigit(line[j])) {
                num += line[j++];
            }
            out += `<sp class="n">${num}</sp>`;
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}
function highlightXMLLine(line, state) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if (state.inComment) {
            if (line.slice(i, i + 3) === '-->') {
                state.inComment = false;
                out += '--></sp>';
                i += 3;
            } else {
                out += ch;
                i++;
            }
            continue;
        }
        if (line.slice(i, i + 4) === '&lt;!--') {
            state.inComment = true;
            out += '<sp class="c">&lt;!--';
            i += 4;
            continue;
        }
        if (state.inString) {
            out += ch;
            if (ch === state.inString) {
                out += '</sp>';
                state.inString = null;
            }
            i++;
            continue;
        }

        if (ch === '"' || ch === "'") {
            state.inString = ch;
            out += `<sp class="s">${ch}`;
            i++;
            continue;
        }

        if (line.slice(i, i + 4) === '&lt;') {
            state.inTag = true;
            state.tagNameDone = false;
            out += '<sp class="t">&lt;';
            i += 4;
            continue;
        }
        if (line.slice(i, i + 4) === '&gt;') {
            state.inTag = false;
            state.tagNameDone = false;
            out += '&gt;</sp>';
            i += 4;
            continue;
        }
        if (state.inTag && !state.tagNameDone && /[a-zA-Z0-9:_\-]/.test(ch)) {
            let name = ch;
            let j = i + 1;
            while (j < line.length && /[a-zA-Z0-9:_\-]/.test(line[j])) {
                name += line[j++];
            }
            state.tagNameDone = true;
            out += name;
            i = j;
            continue;
        }
        if (state.inTag && /[a-zA-Z:_]/.test(ch)) {
            let attr = ch;
            let j = i + 1;
            while (j < line.length && /[a-zA-Z0-9:_\-]/.test(line[j])) {
                attr += line[j++];
            }
            out += `<sp class="a">${attr}</sp>`;
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}
function highlightXML(text) {
    const lines = text.split('\n');
    const state = createXMLState();
    return lines.map((line) => highlightXMLLine(line, state)).join('\n');
}

function highlightJava(text) {
    const lines = text.split('\n');
    const state = createState();
    return lines.map((line) => highlightLine(line, state)).join('\n');
}
const escapeHTML = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ $/gm, ' \u00A0');

self.onmessage = (e) => {
    const { code, isXML, msgId } = e.data;
    const escaped = escapeHTML(code);
    const html = isXML ? highlightXML(escaped) : highlightJava(escaped);
    self.postMessage({
        html: html + (code.endsWith('\n') ? ' ' : ''),
        msgId,
    });
};
