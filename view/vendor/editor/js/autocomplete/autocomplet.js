const editor = document.getElementById("code-input");
const helperList = document.getElementById("xml-list");
const helperContext = document.getElementById("xml-context");
const xmml_help = document.getElementById("xml-help");

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
function getTags() {
  let tags = new Set();

  Object.values(xml_tag).forEach((ns) => {
    if (!ns.views) return;
    Object.keys(ns.views).forEach((tag) => tags.add(tag));
  });
  return [...tags];
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

function updateHelperPanel() {
  if (!editor) return;

  const text = editor.value;
  const cursor = editor.selectionStart;

  const context = getXmlContext(text, cursor);
  helperList.innerHTML = "";

  if (!context) {
    xmml_help.style.display = "none";
    return;
  } else if (context !== " ") xmml_help.style.display = "flex";

  const currentWord = getCurrentWord(text, cursor);
  const word = currentWord || "";

  let typesms,
    items = [];

  if (isStyleItemName(text, cursor)) {
    typesms = "atributos de style (android)";
    items = StyleAttrs();
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

  if (!isStyleItemName(text, cursor) && !isInsideValue(text, cursor)) {
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
  items.forEach((item) => {
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
