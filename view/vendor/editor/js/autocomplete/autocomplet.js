const editor = document.getElementById("code-input");
const helperList = document.getElementById("xml-list");
const helperContext = document.getElementById("xml-context");
const xmml_help = document.getElementById("xml-help");
let max_list_mostrado = 250;

function getAttrs(tag) {
  let list = [];
  Object.values(xml_tag).forEach((ns) => {
    if (!ns) return;
    if (Array.isArray(ns.base)) list.push(...ns.base);

    if (ns.views && ns.views[tag]) list.push(...ns.views[tag]);
  });
  return [...new Set(list)];
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
  let tags = new Set();

  Object.values(xml_tag).forEach((ns) => {
    if (!ns.views) return;
    Object.keys(ns.views).forEach((tag) => tags.add(tag));
  });
  TAG_CACHE = [...tags];
  return TAG_CACHE;
}

function getXmlContext(text, cursor) {
  let before = text.slice(0, cursor);
  if (/<\w*$/.test(before)) return "tag";
  if (/<\w+[^>]*\s+[\w:]*$/.test(before)) return "attr";
  if (/="[^"]*$/.test(before)) return "value";
  return null;
}
function getCurrentWord(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/([a-zA-Z0-9_:@\-]+)$/);
  return match ? match[1] : "";
}
function getItemTypedValue(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/<item[^>]*>([^<]*)$/);
  return match ? match[1].trim() : "";
}
function getCurrentAttr(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/([\w:]+)\s*=\s*"[^"]*$/);
  if (!match) return null;
  return match[1].replace(/^\w+:/, "");
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
  return last.replace(/^android:/, "");
}

function getCurrentValue(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/="([^"]*)$/);
  return match ? match[1] : "";
}

function isStyleItemName(text, cursor) {
  const before = text.slice(0, cursor);
  return /<item[^>]*\sname="[^"]*$/.test(before);
}

function getCurrentTag(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/<([\w:.]+)[^>]*$/);
  return match ? match[1].split(".").pop() : null;
}
//java
function getJavaImportContext(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/import\s+([a-zA-Z0-9_.]*)$/);
  if (!match) return null;

  return {
    typed: match[1] || "",
  };
}

function updateHelperPanel() {
  if (!editor) return;

  const text = editor.value;
  const cursor = editor.selectionStart;

  const context = getXmlContext(text, cursor);
  const isInsideItem = isInsideItemValue(text, cursor);
  const JavaImport = getJavaImportContext(text, cursor);
  helperList.innerHTML = "";

  if (!context && !isInsideItem && !JavaImport) {
    xmml_help.style.display = "none";
    return;
  }
  xmml_help.style.display = "flex";

  const currentWord = getCurrentWord(text, cursor);
  const word = currentWord || "";

  let typesms,
    items = [];

  if (JavaImport) {
    typesms = "imports java";
    items = java_imports;
    if (JavaImport.typed) {
      items = items.filter((i) =>
        i.toLowerCase().startsWith(JavaImport.typed.toLowerCase())
      );
    }
  } else if (isStyleItemName(text, cursor)) {
    typesms = "atributos de style (android)";
    items = StyleAttrs();
  } else if (isInsideItem) {
    typesms = "valores do style";
    const itemName = getItemName(text, cursor);
    const typed = getItemTypedValue(text, cursor);
    if (itemName && xml_values[itemName]) items = xml_values[itemName];
    else items = [];
    if (typed) {
      items = items.filter((v) =>
        v.toLowerCase().startsWith(typed.toLowerCase())
      );
    }
  } else if (isInsideValue(text, cursor)) {
    typesms = "valores";
    let attr = getCurrentAttr(text, cursor);
    let typedValue = getCurrentValue(text, cursor);
    if (attr && xml_values[attr]) {
      items = xml_values[attr];
    } else {
      Object.values(xml_resouc).forEach((res) => {
        items.push(...res.values.map((v) => res.prefix + v));
      });
    }
    if (typedValue) {
      items = items.filter((v) =>
        v.toLowerCase().startsWith(typedValue.toLowerCase())
      );
    }
  } else if (context === "tag") {
    typesms = "tags disponivel";
    items = getTags();
  } else if (context === "attr") {
    typesms = "atributos android";
    const tag = getCurrentTag(text, cursor);
    const idx = currentWord.indexOf(":");

    if (idx === -1) {
      items = Object.values(xml_tag)
        .map((ns) => ns.prefix)
        .filter(Boolean);
    } else {
      const typed = currentWord.slice(idx + 1);
      items = getAttrs(tag).filter((a) =>
        a.toLowerCase().startsWith(typed.toLowerCase())
      );
    }
  }
  helperContext.textContent = typesms;

  if (
    !JavaImport &&
    !isStyleItemName(text, cursor) &&
    !isInsideValue(text, cursor) &&
    !isInsideItem
  ) {
    if (context === "attr" && currentWord.includes(":")) {
      const typed = currentWord.split(":")[1] || "";
      items = items.filter((i) =>
        i.toLowerCase().startsWith(typed.toLowerCase())
      );
    } else if (word) {
      items = items.filter((i) =>
        i.toLowerCase().startsWith(word.toLowerCase())
      );
    }
  }

  if (!items.length) {
    helperList.textContent = "";
    helperContext.textContent = "";
    return;
  }
  if (items.length > max_list_mostrado) {
    const more = document.createElement("li");
    more.textContent = `...e mais ${items.length - max_list_mostrado} itens`;
    helperList.appendChild(more);
  }

  items.slice(0, max_list_mostrado).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.listStyleType = "none";
    li.onclick = () => {
      copySuggestion(item);
      helperList.innerHTML = "";
    };
    helperList.appendChild(li);
  });
}
function copySuggestion(value) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(value);
  } else {
    const tmp = document.createElement("textarea");
    tmp.value = value;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
  }
  helperContext.textContent = "Copiado: " + value;
}

let composing = false;

editor.addEventListener("compositionstart", () => {
  composing = true;
});

editor.addEventListener("compositionend", () => {
  composing = false;
  updateHelperPanel();
});

let autoTimer = null;

function scheduleUpdate() {
  if (composing) return;
  clearTimeout(autoTimer);
  autoTimer = setTimeout(updateHelperPanel, 50);
}

editor.addEventListener("beforeinput", (e) => {
  if (composing) return;
  if (
    e.inputType.startsWith("insert") ||
    e.inputType === "deleteContentBackward"
  ) {
    requestAnimationFrame(scheduleUpdate);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (!editor) {
    console.error("Editor não encontrado (#code-input)");
    return;
  }
  let enabled = window.EDITOR_CONFIG?.autocomplete ?? true;
  applyautocomple(enabled);
  if (config?.painel_tag) config.painel_tag.checked = enabled;
  config.painel_tag.addEventListener("change", (e) => {
    enabled = e.target.checked;
    applyautocomple(enabled);
  });
});
function applyautocomple(enabled) {
  if (enabled) {
    editor.addEventListener("input", scheduleUpdate);
    editor.addEventListener("click", updateHelperPanel);
  } else {
    editor.removeEventListener("input", scheduleUpdate);
    editor.removeEventListener("click", updateHelperPanel);
    xmml_help.style.display = "none";
  }
}
