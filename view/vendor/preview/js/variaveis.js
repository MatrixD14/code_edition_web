const androidColors = {
  "@android:color/transparent": "transparent",
  "@android:color/black": "#000000",
  "@android:color/white": "#ffffff",
  "@android:color/darker_gray": "#444444",
  "@android:color/holo_blue_light": "#33b5e5",
};

const attributeHandlers = {
  layout_width(el, value) {
    if (value === "match_parent") el.style.width = "100%";
    else if (value === "wrap_content") el.style.width = "auto";
    else if (value === "0dp") el.style.width = "0px";
    else el.style.width = toPx(value);
  },

  layout_height(el, value) {
    if (value === "match_parent") el.style.height = "100%";
    else if (value === "wrap_content") el.style.height = "auto";
    else el.style.height = toPx(value);
  },

  layout_weight(el, value) {
    el.style.flex = value;
  },

  textSize(el, value) {
    el.style.fontSize = toPx(value);
  },

  textColor(el, value) {
    el.style.color = obterValor(value);
  },

  background(el, value) {
    if (value.startsWith("@drawable/")) {
      let name = value.replace("@drawable/", "");
      if (!drawablesCache[name]) {
        carregarDrawable(currentProject, name).then((drawable) => {
          if (drawable) {
            drawablesCache[name] = drawable;
            aplicarShapeDrawable(el, drawable);
          }
        });
      } else aplicarShapeDrawable(el, drawablesCache[name]);
    } else el.style.backgroundColor = obterValor(value);
  },

  gravity(el, value) {
    el.style.display = "flex";

    if (value.includes("center")) {
      el.style.justifyContent = "center";
      el.style.alignItems = "center";
    }
    if (value.includes("center_horizontal")) el.style.justifyContent = "center";

    if (value.includes("center_vertical")) el.style.alignItems = "center";

    if (value.includes("end") || value.includes("right"))
      el.style.justifyContent = "flex-end";

    if (value.includes("start") || value.includes("left"))
      el.style.justifyContent = "flex-start";

    if (value.includes("bottom")) el.style.alignItems = "flex-end";

    if (value.includes("top")) el.style.alignItems = "flex-start";
  },

  padding(el, value) {
    el.style.padding = toPx(value);
  },

  paddingTop(el, value) {
    el.style.paddingTop = toPx(value);
  },

  paddingBottom(el, value) {
    el.style.paddingBottom = toPx(value);
  },

  paddingLeft(el, value) {
    el.style.paddingLeft = toPx(value);
  },

  paddingRight(el, value) {
    el.style.paddingRight = toPx(value);
  },

  visibility(el, value) {
    if (value === "gone") el.style.display = "none";
    else if (value === "invisible") el.style.visibility = "hidden";
    else el.style.visibility = "visible";
  },

  alpha(el, value) {
    el.style.opacity = value;
  },

  elevation(el, value) {
    let e = parseFloat(value);
    el.style.boxShadow = `0 ${e / 2}px ${e}px rgba(0,0,0,0.2)`;
  },

  textStyle(el, value) {
    if (value === "bold") el.style.fontWeight = "bold";
  },
};
function toPx(val) {
  if (typeof val !== "string") return val;
  return val.replace(/dp|sp/g, "px");
}
