document.addEventListener("DOMContentLoaded", () => {
  const $ = (q) => document.querySelector(q);

  const input = $("#code-input");
  const output = $("#highlight-content");
  const layer = $("#highlight-layer");
  const highlighterWorker = new Worker("./js/highlighter-worker.js");

  if (!input || !output) return;
  const extensionBloqueio = new Set([
    "zip",
    "rar",
    "7z",
    "tar",
    "gz",
    "exe",
    "dll",
    "bin",
    "iso",
    "img",
    "dmg",
    "msi",
    "deb",
    "rpm",
    "cab",
    "arj",
    "lha",
    "lzh",
    "zoo",
    "uue",
    "bzip2",
    "xz",
    "lzma",
    "lz4",
    "snappy",
    "zstd",
    "apk",
    "class",
    "jar",
    "idsig",
    "dex",
    "log",
    "md",
  ]);
  highlighterWorker.onmessage = function (e) {
    requestAnimationFrame(() => {
      output.innerHTML = e.data;
    });
  };
  function sendToWorker() {
    let rawValue = input.value;

    let fileName = input.dataset.currentFile || "";
    let extension = fileName.split(".").pop().toLowerCase();
    if (rawValue.length > 50000) {
      output.textContent = rawValue;
      return;
    }

    if (extensionBloqueio.has(extension)) {
      output.innerHTML = rawValue;
      return;
    }
    let code = rawValue
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let isXML =
      ["html", "xml", "svg", "manifest"].includes(extension) ||
      fileName.endsWith("AndroidManifest.xml");
    highlighterWorker.postMessage({
      code: code,
      isXML: isXML,
    });
  }

  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    let delay = input.value.length > 25000 ? 200 : 50;
    timeout = setTimeout(sendToWorker, delay);
  });

  input.addEventListener(
    "scroll",
    () => {
      layer.scrollTop = input.scrollTop;
      layer.scrollLeft = input.scrollLeft;
    },
    { passive: true }
  );
});
