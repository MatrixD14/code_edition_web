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
};
//terminal.js variables
// const rootFolderName = "htdocs";

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
