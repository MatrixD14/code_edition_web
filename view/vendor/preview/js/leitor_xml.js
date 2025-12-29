let screen = document.getElementById("screen");
let channel = new BroadcastChannel("android_preview");

let stringsCache = {};
let colorsCache = {};
let stylesCache = {};
let currentProject = "";

channel.onmessage = async (event) => {
  let { xml, projectRoot } = event.data;

  if (projectRoot && projectRoot !== currentProject) {
    currentProject = projectRoot;
    await carregarRecursos(projectRoot);
  }

  renderizar(xml);
};
function renderizar(xmlString) {
  if (!xmlString) return;
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlString, "text/xml");
  let errorNode = xmlDoc.getElementsByTagName("parsererror");
  if (errorNode.length > 0) {
    console.error("Erro no XML:", errorNode[0].textContent);
    screen.innerHTML = `<div style="color:red; padding:10px;">Erro de sintaxe no XML</div>`;
    return;
  }
  screen.textContent = "";
  let root = xmlDoc.documentElement;
  if (root) {
    console.log("Renderizando tag raiz:", root.tagName);
    screen.appendChild(converter(root));
  }
}
async function carregarRecursos(projectRoot) {
  try {
    let fetchXML = async (path) => {
      let r = await fetch(
        `../../../model/editor/read_file.php?file=${encodeURIComponent(
          projectRoot + path
        )}`
      );
      return new DOMParser().parseFromString(await r.text(), "text/xml");
    };

    try {
      let docColors = await fetchXML("/res/values/colors.xml");
      for (let c of docColors.getElementsByTagName("color")) {
        colorsCache[`@color/${c.getAttribute("name")}`] = c.textContent.trim();
      }
    } catch (e) {
      console.warn("colors.xml não encontrado");
    }

    try {
      let docStrings = await fetchXML("/res/values/strings.xml");
      for (let s of docStrings.getElementsByTagName("string")) {
        stringsCache[`@string/${s.getAttribute("name")}`] =
          s.textContent.trim();
      }
    } catch (e) {
      console.warn("strings.xml não encontrado");
    }

    try {
      let docStyles = await fetchXML("/res/values/styles.xml");
      for (let s of docStyles.getElementsByTagName("style")) {
        let name = s.getAttribute("name");
        stylesCache[name] = {
          parent: s.getAttribute("parent"),
          items: {},
        };
        for (let item of s.getElementsByTagName("item")) {
          stylesCache[name].items[item.getAttribute("name")] =
            item.textContent.trim();
        }
      }
    } catch (e) {
      console.warn("styles.xml não encontrado");
    }
    console.log("Recursos sincronizados com sucesso");
  } catch (e) {
    console.error("Falha crítica ao sincronizar recursos:", e);
  }
}

function obterValor(attr) {
  if (!attr) return "";
  if (attr.startsWith("@color/")) {
    let cor = colorsCache[attr];
    if (!cor) return attr === "@color/white" ? "#ffffff" : "#000000";
    if (cor.length === 9 && cor.startsWith("#"))
      return "#" + cor.substring(3) + cor.substring(1, 3);
    return cor;
  }
  if (attr.startsWith("@string/")) return stringsCache[attr] || attr;

  return attr;
}
function renderizar(xmlString) {
  if (!xmlString) return;

  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlString, "text/xml");

  let errorNode = xmlDoc.querySelector("parsererror");
  if (errorNode) {
    console.error("Erro no XML:", errorNode.textContent);
    screen.innerHTML = `<div style="color:red; padding:10px;">Erro de sintaxe no XML: ${errorNode.textContent}</div>`;
    return;
  }

  screen.textContent = "";
  let root = xmlDoc.documentElement;

  if (root) {
    console.log("Renderizando tag raiz:", root.tagName);
    screen.appendChild(converter(root));
  }
}

function aplicarAtributo(el, attr, value) {
  if (!value) return;
  let toPx = (val) => {
    if (typeof val !== "string") return val;
    return val.replace(/dp|sp/g, "px");
  };

  switch (attr) {
    case "android:layout_width":
      if (value === "match_parent") el.style.width = "100%";
      else if (value === "wrap_content") el.style.width = "auto";
      else if (value === "0dp") el.style.width = "0px";
      else el.style.width = toPx(value);
      break;
    case "android:layout_height":
      if (value === "match_parent") el.style.height = "100%";
      else if (value === "wrap_content") el.style.height = "auto";
      else el.style.height = toPx(value);
      break;
    case "android:layout_weight":
      el.style.flex = value;
      break;
    case "android:textSize":
      el.style.fontSize = toPx(value);
      break;
    case "android:background":
      el.style.backgroundColor = obterValor(value);
      break;
    case "android:textColor":
      el.style.color = obterValor(value);
      break;
    case "android:gravity":
      el.style.display = "flex";
      if (value.includes("center")) {
        el.style.justifyContent = "center";
        el.style.alignItems = "center";
      }
      if (value.includes("center_vertical")) el.style.alignItems = "center";

      if (value.includes("center_horizontal"))
        el.style.justifyContent = "center";

      if (value.includes("end") || value.includes("right"))
        el.style.justifyContent = "flex-end";

      if (value.includes("start") || value.includes("left"))
        el.style.justifyContent = "flex-start";
      if (value.includes("bottom")) el.style.alignItems = "flex-end";

      if (value.includes("top")) el.style.alignItems = "flex-start";
      break;
    case "android:layout_gravity":
      el.style.display = "flex";
      if (value === "center" || value === "center_horizontal") {
        el.style.marginLeft = "auto";
        el.style.marginRight = "auto";
      }
      if (value.includes("center_vertical") || value === "center")
        el.style.alignSelf = "center";

      if (value === "end" || value === "right") el.style.marginLeft = "auto";
      if (value === "start" || value === "left") el.style.marginRight = "auto";
      if (value.includes("bottom")) el.style.alignSelf = "flex-end";

      if (value.includes("top")) el.style.alignSelf = "flex-start";
      break;
    case "android:layout_margin":
      el.style.margin = toPx(value);
      break;
    case "android:layout_marginTop":
      el.style.marginTop = toPx(value);
      break;
    case "android:layout_marginBottom":
      el.style.marginBottom = toPx(value);
      break;
    case "android:layout_marginStart":
    case "android:layout_marginLeft":
      el.style.marginLeft = toPx(value);
      break;
    case "android:layout_marginEnd":
    case "android:layout_marginRight":
      el.style.marginRight = toPx(value);
      break;
    case "android:padding":
      el.style.padding = toPx(value);
      break;
    case "android:paddingTop":
      el.style.paddingTop = toPx(value);
      break;
    case "android:paddingBottom":
      el.style.paddingBottom = toPx(value);
      break;
    case "android:paddingStart":
    case "android:paddingLeft":
      el.style.paddingLeft = toPx(value);
      break;
    case "android:paddingEnd":
    case "android:paddingRight":
      el.style.paddingRight = toPx(value);
      break;

    case "android:textStyle":
      if (value === "bold") el.style.fontWeight = "bold";
      break;
  }
}

function aplicarEstilo(el, styleName) {
  let name = styleName.replace("@style/", "");
  let style = stylesCache[name];
  if (!style) return;

  if (style.parent) aplicarEstilo(el, style.parent);
  for (let [attr, val] of Object.entries(style.items)) {
    aplicarAtributo(el, attr, val);
  }
}

function converter(node) {
  let el,
    tag = node.tagName;
  if (tag === "LinearLayout") {
    let orientation = node.getAttribute("android:orientation") || "horizontal";
    el = document.createElement("div");
    el.style.display = "flex";
    el.style.boxSizing = "border-box";
    el.style.flexDirection = orientation === "vertical" ? "column" : "row";
  } else if (tag === "TextView" || tag === "Button") {
    el = document.createElement(tag === "Button" ? "button" : "div");
    el.style.display = "flex";
    el.style.boxSizing = "border-box";
    el.innerText = obterValor(node.getAttribute("android:text"));
    if (tag === "Button") {
      el.style.cursor = "pointer";
      el.style.border = "1px solid #ddd";
      el.style.appearance = "none";
      el.style.outline = "none";
      el.style.backgroundColor = "transparent";
    }
  } else {
    el = document.createElement("div");
    el.style.display = "flex";
    el.style.boxSizing = "border-box";
  }
  let weight = node.getAttribute("android:layout_weight");
  if (weight) {
    el.style.flexGrow = weight;
    el.style.flexShrink = "1";
    el.style.flexBasis = "0px";
  }
  let styleAttr = node.getAttribute("style");
  if (styleAttr) aplicarEstilo(el, styleAttr);

  Array.from(node.attributes).forEach((attr) => {
    aplicarAtributo(el, attr.name, attr.value);
  });

  Array.from(node.children).forEach((child) =>
    el.appendChild(converter(child))
  );

  return el;
}
