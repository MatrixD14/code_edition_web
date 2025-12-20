const configSettings = document.querySelector(".config_settings");
const painelConfig = document.querySelector(".painel-config");
configSettings.addEventListener("click", (e) => {
  e.stopPropagation();
  painelConfig.classList.toggle("hidden");
});
painelConfig.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => painelConfig.classList.add("hidden"));
