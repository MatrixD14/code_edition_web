const configSettings = $(".config_settings");
const painelConfig = $(".painel-config");
const closeConfig = $("#close_config");
configSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  painelConfig.classList.toggle("hidden");
  ui.projectSelector.classList.add("hidden");
});
painelConfig.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => painelConfig.classList.add("hidden"));

closeConfig.addEventListener("click", () => {
  let fontSize = $("#font_size").value;
  document.documentElement.style.setProperty("--font-global", fontSize + "px");
  painelConfig.classList.add("hidden");
});
