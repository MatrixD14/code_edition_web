const editor = document.getElementById("code-input");
const helperList = document.getElementById("xml-list");
const helperContext = document.getElementById("xml-context");

function getAttrs(tag) {
  let list = [];
  Object.values(xml_tag).forEach((ns) => {
    if (!ns) return;
    if (ns.prefix) list.push(ns.prefix);

    let baseArr = Array.isArray(ns.base) ? ns.base : [];
    let base = baseArr.map((a) => ns.prefix + a);
    list.push(...base);

    if (ns.views && ns.views[tag])
      list.push(...ns.views[tag].map((a) => ns.prefix + a));
  });
  return list;
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
  if (/<\w+[^>]*\s[\w:]*$/.test(before)) return "attr";
  if (/name="[^"]*$/.test(before)) return "attr";
  return null;
}
function getCurrentWord(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/([\w:@]+)$/);
  return match ? match[1] : "";
}
function isInsideValue(text, cursor) {
  const before = text.slice(0, cursor);
  return /="[^"]*$/.test(before);
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
    helperContext.textContent = "Sem contexto";
    return;
  }

  const currentWord = getCurrentWord(text, cursor);

  let typesms,
    items = [];

  if (isStyleItemName(text, cursor)) {
    typesms = "atributos de style (android)";
    items = StyleAttrs();
  } else if (isInsideValue(text, cursor)) {
    typesms = "valores de recurso";
    Object.values(xml_resouc).forEach((res) => {
      items.push(...res.values.map((v) => res.prefix + v));
    });
  } else if (context === "tag") {
    typesms = "tags disponivel";
    items = getTags();
  } else if (context === "attr") {
    typesms = "atributos android";
    const tag = getCurrentTag(text, cursor);
    if (!currentWord.includes(":")) {
      items = Object.values(xml_tag).map((ns) => ns.prefix);
    } else {
      items = getAttrs(tag);
    }
  }
  helperContext.textContent = typesms;
  items = items.filter((item) =>
    item.toLowerCase().startsWith(currentWord.toLowerCase())
  );

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.listStyleType = "none";
    li.onclick = () => insertSuggestion(item);
    helperList.appendChild(li);
  });
}

function insertSuggestion(value) {
  const start = editor.selectionStart;
  const text = editor.value;

  let before;
  if (isStyleItemName(text, start))
    before = text.slice(0, start).replace(/name="[^"]*$/, 'name="');
  else before = text.slice(0, start).replace(/[\w:@]+$/, "");
  let after = text.slice(start);

  editor.value = before + value + after;
  editor.selectionStart = editor.selectionEnd = before.length + value.length;

  editor.focus();
  updateHelperPanel();
}

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
    editor.addEventListener("keyup", updateHelperPanel);
    editor.addEventListener("click", updateHelperPanel);
    helperList.style.display = "block";
    helperContext.style.display = "block";
  } else {
    editor.removeEventListener("keyup", updateHelperPanel);
    editor.removeEventListener("click", updateHelperPanel);
    helperList.style.display = "none";
    helperContext.style.display = "none";
  }
}
