document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("code-input");
  const output = document.getElementById("highlight-content");
  const layer = document.getElementById("highlight-layer");

  if (!input || !output) return;

  function updateHighlight() {
    const input = document.getElementById("code-input");
    const output = document.getElementById("highlight-content");
    if (!input || !output) return;

    let code = input.value;

    code = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const combinedRegex = new RegExp(
      [
        /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)/.source,
        /(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/.source,
        /(?<keyword>\b(?:function|return|var|let|const|if|else|for|while|switch|case|break|php|echo|public|private|protected|class|static|import|package|extends|new|super|void|this.)\b)/
          .source,
        /(?<number>\b\d+\b)/.source,
        /(?<tag>&lt;\/?[a-z1-6]+.*?&gt;)/.source,
      ].join("|"),
      "gi"
    );

    const highlighted = code.replace(combinedRegex, (match, ...args) => {
      const groups = args[args.length - 1];
      if (groups.comment) return `<span class="token-comment">${match}</span>`;
      if (groups.string) return `<span class="token-string">${match}</span>`;
      if (groups.keyword) return `<span class="token-keyword">${match}</span>`;
      if (groups.number) return `<span class="token-number">${match}</span>`;
      if (groups.tag) return `<span class="token-tag">${match}</span>`;

      return match;
    });

    output.innerHTML = highlighted + "\n";
  }

  // Sincronização de Scroll
  input.addEventListener("scroll", () => {
    layer.scrollTop = input.scrollTop;
    layer.scrollLeft = input.scrollLeft;
  });

  input.addEventListener("input", updateHighlight);

  // EXTREMAMENTE IMPORTANTE:
  // Chame esta função globalmente para quando o arquivo for aberto pelo PHP
  window.forceHighlight = updateHighlight;
});
