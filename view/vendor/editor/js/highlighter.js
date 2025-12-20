document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("code-input");
  const output = document.getElementById("highlight-content");
  const layer = document.getElementById("highlight-layer");

  if (!input || !output) return;

  function updateHighlight() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("highlight-content");
    if (!input || !output) return;

    const fileName = input.dataset.currentFile || "";
    const extension = fileName.split(".").pop().toLowerCase();
    let code = input.value;

    code = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let combinedRegex;

    if (
      ["html", "xml", "svg", "manifest"].includes(extension) ||
      fileName.endsWith("AndroidManifest.xml")
    ) {
      combinedRegex =
        /(?<comment>&lt;!--[\s\S]*?--&gt;)|(?<tag>&lt;\/?[a-z0-9:\-]+[\s\S]*?&gt;)/gi;
    } else {
      combinedRegex =
        /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)|(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(?<keyword>\b(?:function|return|var|let|const|if|else|for|while|php|echo|public|class|static|this|import|void|private|package|protected|new|extends|super|true|false|export|final|null|implements|interface|async|try|catch)\b)|(?<number>\b\d+\b)|(?<keyVar>\b(?:int|string|boolean|float|Toast|Button|TextView|LinearLayout|View|Bundle|double|char|long|short|byte|ArrayList|Context|Intent|Bitmap|HashMap|Override)\b)/gi;
    }

    const highlighted = code.replace(combinedRegex, (match, ...args) => {
      const groups = args[args.length - 1];

      if (groups.comment) return `<span class="token-comment">${match}</span>`;
      if (groups.string) return `<span class="token-string">${match}</span>`;
      if (groups.keyword) return `<span class="token-keyword">${match}</span>`;
      if (groups.number) return `<span class="token-number">${match}</span>`;
      if (groups.keyVar) return `<span class="token-keyvar">${match}</span>`;

      if (groups.tag) {
        return match.replace(
          /(&lt;\/?[a-z0-9:\-]+)([\s\S]*?)(&gt;)/gi,
          (m, t, b, e) => {
            let attrs = b.replace(
              /([\w\-\:]+)=((["\']).*?\3)/g,
              ' <span class="token-attr">$1</span>=<span class="token-string">$2</span>'
            );
            return `<span class="token-tag">${t}</span>${attrs}<span class="token-tag">${e}</span>`;
          }
        );
      }
      return match;
    });

    output.innerHTML = highlighted + "\n";
  }

  input.addEventListener("scroll", () => {
    layer.scrollTop = input.scrollTop;
    layer.scrollLeft = input.scrollLeft;
  });

  let timeoutHighlight;

  function updateHighlightDebounced() {
    clearTimeout(timeoutHighlight);

    timeoutHighlight = setTimeout(() => {
      updateHighlight();
    }, 300);
  }

  input.addEventListener("input", updateHighlightDebounced);
});
