const $ = (q) => document.querySelector(q);
//ui variables
const ui = {
  pathDisplay: $(".path_display ul"),
  btnOpenProject: $("#btn_open_project"),
  projectSelector: $("#projects_selector"),
  projectsList: $("#projects_list"),
  btnSalvar: $("#salvar"),
  textareaEditor: $(".editor"),
  nomeDiretorioDisplay: $(".nome_diretory"),
  painel_path: $(".painel_path"),
  file_push_open: $(".file_push_open"),
  input: $("#code-input"),
};
//terminal.js variables
const term = {
  inputTerm: $("#terminal-input"),
  outputTerm: $("#terminal-output"),
  containerTerminal: $(".terminal"),
};
//update upload path editor
const inputUpload = $("#upload_projeto");
//config system variables
const config = {
  configSettings: $(".config_settings"),
  painelConfig: $(".painel-config"),
  closeConfig: $("#close_config"),
};

function restEditor() {
  let input = $("#code-input");
  let highlight = $("#highlight-content");
  let lineNumbers = $("#line-numbers");
  let nomeDiretorioDisplay = $(".nome_diretory");

  if (input) {
    input.value = "";
    input.dataset.currentFile = "";
    input.scrollTop = 0;
    input.scrollLeft = 0;
  }

  if (highlight) {
    highlight.textContent = "";
    let layer = $("#highlight-layer");
    if (layer) {
      layer.scrollTop = 0;
      layer.scrollLeft = 0;
    }
  }

  if (lineNumbers) {
    lineNumbers.textContent = "1";
    lineNumbers.scrollTop = 0;
  }

  if (nomeDiretorioDisplay)
    nomeDiretorioDisplay.textContent = "Nenhum arquivo aberto";
}
