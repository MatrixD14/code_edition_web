const java_imports_parts = java_imports.map((i) => i.split("."));
const maxs = 100;
function getJavaImportContext(text, cursor) {
  const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
  const line = text.slice(lineStart, cursor);
  if (!line.startsWith("import ")) return null;
  const typed = line.slice(7);
  const parts = typed.split(".").filter(Boolean);
  return {
    parts,
    typedEndsWithDot: typed.endsWith("."),
  };
}

function trataAtributoJava(ctx) {
  const level = ctx.typedEndsWithDot ? ctx.parts.length : ctx.parts.length - 1;
  const prefix = ctx.typedEndsWithDot
    ? ""
    : ctx.parts[ctx.parts.length - 1].toLowerCase();
  const results = new Set();
  for (const imp of java_imports_parts) {
    if (results.size >= maxs) break;
    if (imp.length <= level) continue;
    let ok = true;
    for (let i = 0; i < level; i++) {
      if (imp[i] !== ctx.parts[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const name = imp[level];
    if (!prefix || name.toLowerCase().startsWith(prefix)) results.add(name);
  }
  return {
    items: [...results],
    typesms: "imports java",
  };
}
