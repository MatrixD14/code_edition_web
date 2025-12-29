const previewChannel = new BroadcastChannel("android_preview");
async function sincronizarRecursosCompletos() {
  if (!state.currentProjectRoot) return;

  let ler = async (caminho) => {
    try {
      let r = await fetch(
        `../../../model/editor/read_file.php?file=${encodeURIComponent(
          state.currentProjectRoot + caminho
        )}`
      );
      let texto = await r.text();
      return texto.trim().startsWith("<?xml")
        ? texto
        : `<resources></resources>`;
    } catch (e) {
      return `<resources></resources>`;
    }
  };

  let colorsXml = await ler("/res/values/colors.xml");
  let stringsXml = await ler("/res/values/strings.xml");
  let stylesXml = await ler("/res/values/styles.xml");

  previewChannel.postMessage({
    type: "SYNC_RESOURCES",
    colors: colorsXml,
    strings: stringsXml,
    styles: stylesXml,
  });
}

ui.input.addEventListener("input", () => {
  const currentFile = ui.input.dataset.currentFile;

  if (currentFile && currentFile.endsWith(".xml")) {
    console.log("Enviando para preview:", state.currentProjectRoot);
    previewChannel.postMessage({
      xml: ui.input.value,
      path: currentFile,
      projectRoot: state.currentProjectRoot,
    });
  }
});

$("#btn-open-preview").onclick = () => {
  window.open("../preview/preview.php", "_blank");
};
