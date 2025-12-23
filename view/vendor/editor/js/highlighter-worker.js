const rex_html =
  /(?<comment>&lt;!--[\s\S]*?--&gt;)|(?<tag>&lt;\/?[a-z0-9:\-]+[\s\S]*?&gt;)/gi;
const rex_code =
  /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)|(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(?<keyword>\b(?:function|return|var|let|const|if|else|for|while|php|echo|public|class|static|this|import|void|private|package|protected|new|extends|super|true|false|export|final|null|implements|interface|async|try|catch)\b)|(?<number>\b\d+\b)|(?<keyVar>\b(?:int|string|boolean|float|Toast|Button|TextView|LinearLayout|View|Bundle|double|char|long|short|byte|ArrayList|Context|Intent|Bitmap|HashMap|Override)\b)/gi;
const escapeHTML = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/ $/gm, " \u00A0");

self.onmessage = function (e) {
  const { code, isXML, msgId } = e.data;
  let codes = escapeHTML(code);
  let combinedRegex = isXML ? rex_html : rex_code;
  let highlighted = codes.replace(combinedRegex, (match, ...args) => {
    let groups = args[args.length - 1];

    if (groups.comment) return `<sp class="c">${match}</sp>`;
    if (groups.string) return `<sp class="s">${match}</sp>`;
    if (groups.keyword) return `<sp class="k">${match}</sp>`;
    if (groups.number) return `<sp class="n">${match}</sp>`;
    if (groups.keyVar) return `<sp class="v">${match}</sp>`;

    if (isXML && groups.tag) {
      return match.replace(
        /(&lt;\/?[a-z0-9:\-]+)([\s\S]*?)(&gt;)/gi,
        (m, t, b, e) => {
          const attrs = b.replace(
            /([\w\-\:]+)=((["\']).*?\3)/g,
            '<sp class="a">$1</sp>=<sp class="s">$2</sp>'
          );
          return `<sp class="t">${t}</sp>${attrs}<sp class="t">${e}</sp>`;
        }
      );
    }
    return match;
  });
  self.postMessage({
    html: highlighted + (code.endsWith("\n") ? " " : ""),
    msgId,
  });
};
