const configSettings = document.querySelector(".config_settings");
const painelConfig = document.querySelector(".painel-config");
const closeConfig = document.querySelector("#close_config");
configSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  painelConfig.classList.toggle("hidden");
  projectSelector.classList.add("hidden");
});
painelConfig.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => painelConfig.classList.add("hidden"));

closeConfig.addEventListener("click", () => {
  let fontSize = document.querySelector("#font_size").value;
  document.documentElement.style.setProperty("--font-global", fontSize + "px");
  painelConfig.classList.add("hidden");
});
