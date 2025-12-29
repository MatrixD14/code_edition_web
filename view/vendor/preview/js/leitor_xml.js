let screen = document.getElementById("screen");
let channel = new BroadcastChannel("android_preview");

let stringsCache = {},
  colorsCache = {},
  stylesCache = {};
let currentProject = "";

channel.onmessage = async (event) => {
  let { xml, projectRoot } = event.data;
  if (projectRoot && projectRoot !== currentProject) {
    currentProject = projectRoot;
    stringsCache = {};
    colorsCache = {};
    stylesCache = {};
    await carregarRecursos(projectRoot);
  }
  renderizar(xml);
};

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
  let valor = attr;
  if (attr.startsWith("@color/")) valor = colorsCache[attr] || "#000000";
  if (attr.startsWith("@string/")) return stringsCache[attr] || attr;
  if (valor.startsWith("#") && valor.length === 9) {
    let a = valor.substring(1, 3);
    let rgb = valor.substring(3);
    return "#" + rgb + a;
  }
  return valor;
}

function aplicarAtributo(el, attr, value) {
  if (!value) return;
  if (attr.startsWith("android:")) attr = attr.replace("android:", "");
  let toPx = (val) => {
    if (typeof val !== "string") return val;
    return val.replace(/dp|sp/g, "px");
  };

  switch (attr) {
    case "layout_width":
      if (value === "match_parent") el.style.width = "100%";
      else if (value === "wrap_content") el.style.width = "auto";
      else if (value === "0dp") el.style.width = "0px";
      else el.style.width = toPx(value);
      break;
    case "layout_height":
      if (value === "match_parent") el.style.height = "100%";
      else if (value === "wrap_content") el.style.height = "auto";
      else el.style.height = toPx(value);
      break;
    case "layout_weight":
      el.style.flex = value;
      break;
    case "textSize":
      el.style.fontSize = toPx(value);
      break;
    case "background":
      el.style.backgroundColor = obterValor(value);
      break;
    case "textColor":
      el.style.color = obterValor(value);
      break;
    case "gravity":
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
    case "layout_gravity":
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
    case "layout_margin":
      el.style.margin = toPx(value);
      break;
    case "layout_marginTop":
      el.style.marginTop = toPx(value);
      break;
    case "layout_marginBottom":
      el.style.marginBottom = toPx(value);
      break;
    case "layout_marginStart":
    case "layout_marginLeft":
      el.style.marginLeft = toPx(value);
      break;
    case "layout_marginEnd":
    case "layout_marginRight":
      el.style.marginRight = toPx(value);
      break;
    case "padding":
      el.style.padding = toPx(value);
      break;
    case "paddingTop":
      el.style.paddingTop = toPx(value);
      break;
    case "paddingBottom":
      el.style.paddingBottom = toPx(value);
      break;
    case "paddingStart":
    case "paddingLeft":
      el.style.paddingLeft = toPx(value);
      break;
    case "paddingEnd":
    case "paddingRight":
      el.style.paddingRight = toPx(value);
      break;
    case "visibility":
      if (value === "gone") el.style.display = "none";
      else if (value === "invisible") el.style.visibility = "hidden";
      else el.style.visibility = "visible";
      break;
    case "alpha":
      el.style.opacity = value;
      break;
    case "radius":
    case "cornerRadius":
      el.style.borderRadius = toPx(value);
      break;
    case "elevation":
      let elevation = parseFloat(value);
      el.style.boxShadow = `0px ${
        elevation / 2
      }px ${elevation}px rgba(0,0,0,0.2)`;
      break;
    case "textAlignment":
      if (value === "center") el.style.textAlign = "center";
      if (value === "viewStart" || value === "textStart")
        el.style.textAlign = "left";
      if (value === "viewEnd" || value === "textEnd")
        el.style.textAlign = "right";
      break;
    case "lineSpacingExtra":
      el.style.lineHeight = `calc(1em + ${toPx(value)})`;
      break;
    case "layout_centerInParent":
      if (value === "true") {
        el.style.top = "50%";
        el.style.left = "50%";
        el.style.transform = "translate(-50%, -50%)";
      }
      break;
    case "layout_alignParentBottom":
      if (value === "true") el.style.bottom = "0";
      break;
    case "layout_alignParentRight":
    case "layout_alignParentEnd":
      if (value === "true") el.style.right = "0";
      break;
    case "strokeWidth":
      el.style.borderWidth = toPx(value);
      el.style.borderStyle = "solid";
      break;
    case "strokeColor":
      el.style.borderColor = obterValor(value);
      break;
    case "textStyle":
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
  switch (tag) {
    case "LinearLayout":
      el = document.createElement("div");
      el.style.display = "flex";
      let orientation =
        node.getAttribute("android:orientation") || "horizontal";
      el.style.flexDirection = orientation === "vertical" ? "column" : "row";
      break;
    case "FrameLayout":
    case "RelativeLayout":
    case "ConstraintLayout":
      el = document.createElement("div");
      el.style.position = "relative";
      el.style.display = "block";
      break;
    case "ScrollView":
      el = document.createElement("div");
      el.style.overflowY = "auto";
      el.style.display = "block";
      break;
    case "ImageView":
      el = document.createElement("img");
      el.style.display = "block";
      el.style.objectFit = "cover";
      let src =
        node.getAttribute("android:src") || node.getAttribute("app:srcCompat");
      if (src) el.src = obterValor(src);
      break;
    case "TextView":
    case "Button":
      el = document.createElement(tag === "Button" ? "button" : "div");
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.innerText = obterValor(node.getAttribute("android:text"));
      if (tag === "Button") {
        el.style.cursor = "pointer";
        el.style.border = "1px solid #ddd";
        el.style.appearance = "none";
        el.style.outline = "none";
      }
      break;
    case "AbsoluteLayout":
      el = document.createElement("div");
      el.style.position = "relative";
      break;
    case "View":
      el = document.createElement("div");
      break;
    case "CheckBox":
    case "RadioButton":
      el = document.createElement("input");
      el.type = tag === "CheckBox" ? "checkbox" : "radio";
      el.style.marginRight = "8px";
      break;

    case "EditText":
      el = document.createElement("input");
      el.type = "text";
      el.style.border = "0px";
      el.style.borderBottom = "1px solid #777";
      el.style.padding = "4px 0";
      el.placeholder = obterValor(node.getAttribute("android:hint") || "");
      break;
    default:
      el = document.createElement("div");
      el.style.display = "flex";
  }
  el.style.boxSizing = "border-box";
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
  Array.from(node.children).forEach((child) => {
    let childEl = converter(child);
    if (tag === "RelativeLayout" || tag === "FrameLayout")
      childEl.style.position = "absolute";
    el.appendChild(childEl);
  });
  return el;
}
