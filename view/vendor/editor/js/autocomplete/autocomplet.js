const editor = document.getElementById("code-input");
const helperList = document.getElementById("xml-list");
const helperContext = document.getElementById("xml-context");
const xmml_help = document.getElementById("xml-help");
let max_list_mostrado = 100;
let lastCursor = -1;
let composing = false;
let autoTimer = null;
function cleanvar() {
  xmml_help.style.display = "none";
  helperList.textContent = "";
  helperContext.textContent = "";
}
function updateHelperPanel() {
  if (!editor) return;
  const text = editor.value;
  const cursor = editor.selectionStart;

  const lastChar = text[cursor - 1];
  if (!/\w|\./.test(lastChar)) {
    cleanvar();
    return;
  }
  const JavaImport = getJavaImportContext(text, cursor);
  if (!JavaImport) {
    cleanvar();
    return;
  }
  xmml_help.style.display = "flex";

  const { items = [], typesms = "" } = trataAtributoJava(JavaImport) || {};

  if (!items.length) {
    cleanvar();
    return;
  }
  xmml_help.style.display = "flex";
  helperContext.textContent = typesms;

  renderList(items);
}
function renderList(items) {
  // const max = Math.min(items.length, max_list_mostrado);
  // if (!max) {
  //   helperList.textContent = "";
  //   return;
  // }
  // let html = items
  //   .slice(0, max)
  //   .map(
  //     (item) =>
  //       `<li style="list-style-type:none" data-value="${item}">${item}</li>`
  //   )
  //   .join("");

  // if (items.length > max_list_mostrado)
  //   html += `<li>...e mais ${items.length - max_list_mostrado} itens</li>`;

  // helperList.innerHTML = html;
  if (!items.length) {
    helperList.textContent = "";
    return;
  }
  helperList.innerHTML = items
    .map(
      (item) =>
        `<li style="list-style-type:none" data-value="${item}">${item}</li>`
    )
    .join("");

  helperList.onclick = (e) => {
    const val = e.target.dataset.value;
    if (val) copySuggestion(val);
    helperList.textContent = "";
  };
}

function copySuggestion(value) {
  if (navigator.clipboard) navigator.clipboard.writeText(value);
  else {
    const tmp = document.createElement("textarea");
    tmp.value = value;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
  }
  helperContext.textContent = "Copiado: " + value;
}

editor.addEventListener("compositionstart", () => {
  composing = true;
});

editor.addEventListener("compositionend", () => {
  composing = false;
  scheduleUpdate();
});

function scheduleUpdate() {
  if (composing) return;
  if (autoTimer) cancelAnimationFrame(autoTimer);
  autoTimer = requestAnimationFrame(updateHelperPanel);
}
function handleEditorClick() {
  if (editor.selectionStart !== lastCursor) {
    lastCursor = editor.selectionStart;
    updateHelperPanel();
  }
}
function applyautocomple(enabled) {
  if (enabled) {
    editor.addEventListener("input", scheduleUpdate);
    editor.addEventListener("click", handleEditorClick);
  } else {
    editor.removeEventListener("input", scheduleUpdate);
    editor.removeEventListener("click", handleEditorClick);
    xmml_help.style.display = "none";
  }
}
window.addEventListener("DOMContentLoaded", () => {
  if (!editor) {
    console.error("Editor não encontrado (#code-input)");
    return;
  }
  let enabled = window.EDITOR_CONFIG?.autocomplete ?? true;
  applyautocomple(enabled);
  if (config?.painel_tag) {
    config.painel_tag.checked = enabled;
    config.painel_tag.addEventListener("change", (e) => {
      applyautocomple(e.target.checked);
    });
  }
});
