let screen = document.getElementById("screen");
let channel = new BroadcastChannel("android_preview");

let stringsCache = {},
  colorsCache = {},
  stylesCache = {},
  drawablesCache = {};
let currentProject = "";
channel.onmessage = async (event) => {
  let { xml, projectRoot } = event.data;
  if (projectRoot && projectRoot !== currentProject) {
    currentProject = projectRoot;
    stringsCache = {};
    colorsCache = {};
    stylesCache = {};
    drawablesCache = {};
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
  if (androidColors[attr]) return androidColors[attr];
  if (attr.startsWith("@android:color/") && !androidColors[attr])
    console.warn("Android color não mapeado:", attr);

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

async function carregarDrawable(projectRoot, name) {
  try {
    let r = await fetch(
      `../../../model/editor/read_file.php?file=${encodeURIComponent(
        projectRoot + "/res/drawable/" + name + ".xml"
      )}`
    );

    if (!r.ok) return null;

    let text = await r.text();
    let doc = new DOMParser().parseFromString(text, "text/xml");

    if (doc.querySelector("parsererror")) {
      console.warn("Erro ao parsear drawable:", name);
      return null;
    }

    return doc.documentElement;
  } catch (e) {
    console.warn("Drawable não encontrado:", name);
    return null;
  }
}

function aplicarShapeDrawable(el, shapeNode) {
  if (!shapeNode || shapeNode.tagName !== "shape") return;

  let solid = shapeNode.querySelector("solid");
  if (solid) {
    let color = solid.getAttribute("android:color");
    el.style.backgroundColor = obterValor(color);
  }

  let stroke = shapeNode.querySelector("stroke");
  if (stroke) {
    el.style.borderStyle = "solid";
    el.style.borderWidth = stroke
      .getAttribute("android:width")
      ?.replace(/dp/g, "px");
    el.style.borderColor = obterValor(stroke.getAttribute("android:color"));
  }

  let corners = shapeNode.querySelector("corners");
  if (corners) {
    let radius =
      corners.getAttribute("android:radius") ||
      corners.getAttribute("android:topLeftRadius");

    if (radius) el.style.borderRadius = radius.replace(/dp/g, "px");
  }

  let padding = shapeNode.querySelector("padding");
  if (padding) {
    el.style.paddingTop =
      padding.getAttribute("android:top")?.replace(/dp/g, "px") || "";
    el.style.paddingBottom =
      padding.getAttribute("android:bottom")?.replace(/dp/g, "px") || "";
    el.style.paddingLeft =
      padding.getAttribute("android:left")?.replace(/dp/g, "px") || "";
    el.style.paddingRight =
      padding.getAttribute("android:right")?.replace(/dp/g, "px") || "";
  }
}

function aplicarAtributo(el, attr, value) {
  if (!value) return;

  if (attr.startsWith("android:")) attr = attr.replace("android:", "");

  const handler = attributeHandlers[attr];

  if (handler) handler(el, value);
  else {
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
