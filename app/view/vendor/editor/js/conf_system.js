config.configSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    config.painelConfig.classList.toggle('hidden');
    ui.projectSelector.classList.add('hidden');
});
config.painelConfig.addEventListener('click', (e) => e.stopPropagation());
document.addEventListener('click', () => config.painelConfig.classList.add('hidden'));
window.addEventListener('DOMContentLoaded', () => {
    let fontSize = Number(window.EDITOR_CONFIG.fontsizevalue) || 14;
    document.documentElement.style.setProperty('--font-global', fontSize + 'px');
    const input = $('#font_size');
    if (input) input.value = fontSize;
});

config.closeConfig.addEventListener('click', () => {
    let fontSize = $('#font_size').value;
    document.documentElement.style.setProperty('--font-global', fontSize + 'px');
    config.painelConfig.classList.add('hidden');
});

$('#xml-quick').addEventListener('click', (e) => {
    if (e.target.id === 'xml-quick') e.currentTarget.classList.add('hidden');
});
