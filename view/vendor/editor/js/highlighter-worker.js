const rex_html =
  /(?<comment>&lt;!--[\s\S]*?--&gt;)|(?<tag>&lt;\/?[a-z0-9:\-]+[\s\S]*?&gt;)/gi;
const rex_code =
  /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)|(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(?<keyword>\b(?:function|return|var|let|const|if|else|for|while|php|echo|public|class|static|this|import|void|private|package|protected|new|extends|super|true|false|export|final|null|implements|interface|async|try|catch)\b)|(?<number>\b\d+\b)|(?<keyVar>\b(?:int|string|boolean|float|Toast|Button|TextView|LinearLayout|View|Bundle|double|char|long|short|byte|ArrayList|Context|Intent|Bitmap|HashMap|Override)\b)/gi;
self.onmessage = function (e) {
  const { code, isXML } = e.data;
  let combinedRegex = isXML ? rex_html : rex_code;

  let highlighted = code.replace(combinedRegex, (match, ...args) => {
    let groups = args[args.length - 1];

    if (groups.comment) return `<span class="c">${match}</span>`;
    if (groups.string) return `<span class="s">${match}</span>`;
    if (groups.keyword) return `<span class="k">${match}</span>`;
    if (groups.number) return `<span class="n">${match}</span>`;
    if (groups.keyVar) return `<span class="v">${match}</span>`;

    if (isXML && groups.tag) {
      return match.replace(
        /(&lt;\/?[a-z0-9:\-]+)([\s\S]*?)(&gt;)/gi,
        (m, t, b, e) => {
          const attrs = b.replace(
            /([\w\-\:]+)=((["\']).*?\3)/g,
            '<span class="a">$1</span>=<span class="s">$2</span>'
          );
          return `<span class="t">${t}</span>${attrs}<span class="t">${e}</span>`;
        }
      );
    }
    return match;
  });
  self.postMessage(highlighted);
};
