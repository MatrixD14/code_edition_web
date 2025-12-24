config.configSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  config.painelConfig.classList.toggle("hidden");
  ui.projectSelector.classList.add("hidden");
});
config.painelConfig.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () =>
  config.painelConfig.classList.add("hidden")
);
config.closeConfig.addEventListener("click", () => {
  let fontSize = $("#font_size").value;
  document.documentElement.style.setProperty("--font-global", fontSize + "px");
  config.painelConfig.classList.add("hidden");
});
