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

function aplicarShapeDrawable(el, drawableNode) {
  if (!drawableNode) return;
  if (drawableNode.tagName === "shape") aplicarShape(el, drawableNode);
  if (drawableNode.tagName === "selector") aplicarSelector(el, drawableNode);
  if (drawableNode.tagName === "layer-list") aplicarLayerList(el, drawableNode);
  if (drawableNode.tagName === "inset") aplicarInset(el, drawableNode);
  if (drawableNode.tagName === "bitmap") aplicarBitmap(el, drawableNode);
}

function aplicarShape(el, shapeNode) {
  let shapeType = shapeNode.getAttribute("android:shape");
  if (shapeType === "oval") el.style.borderRadius = "50%";

  for (let child of shapeNode.children) {
    let handler = shapeHandlers[child.tagName];
    if (handler) handler(el, child);
  }
}
function aplicarDrawableByName(el, name) {
  if (!name) return;
  if (drawablesCache[name]) {
    aplicarShapeDrawable(el, drawablesCache[name]);
    return;
  }
  carregarDrawable(currentProject, name).then((drawable) => {
    if (drawable) {
      drawablesCache[name] = drawable;
      aplicarShapeDrawable(el, drawable);
    }
  });
}
function applyLayerOffset(layer, item) {
  const map = {
    top: "top",
    left: "left",
    right: "right",
    bottom: "bottom",
  };

  for (let [android, css] of Object.entries(map)) {
    const v = item.getAttribute(`android:${android}`);
    if (v) layer.style[css] = toPx(v);
  }
}

function aplicarLayerList(el, layerNode) {
  el.style.background = "none";
  el.style.position = "relative";

  el.querySelectorAll(".android-layer").forEach((n) => n.remove());

  for (let item of layerNode.children) {
    if (item.tagName !== "item") continue;

    const layer = document.createElement("div");
    layer.className = "android-layer";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "0";

    applyLayerOffset(layer, item);

    let drawableChild = Array.from(item.children).find((n) =>
      ["shape", "selector", "bitmap"].includes(n.tagName)
    );

    if (drawableChild) aplicarShapeDrawable(layer, drawableChild);

    el.appendChild(layer);
  }
}
function aplicarSelector(el, selectorNode) {
  let normal = null;
  let pressed = null;

  for (let item of selectorNode.children) {
    if (item.tagName !== "item") continue;

    let ref = item.getAttribute("android:drawable");
    if (!ref) continue;

    let name = ref.replace("@drawable/", "");

    if (item.getAttribute("android:state_pressed") === "true") pressed = name;
    else normal = name;
  }

  if (normal) aplicarDrawableByName(el, normal);

  if (pressed) {
    el.addEventListener("mousedown", () => aplicarDrawableByName(el, pressed));

    el.addEventListener("mouseup", () => aplicarDrawableByName(el, normal));

    el.addEventListener("mouseleave", () => aplicarDrawableByName(el, normal));

    el.addEventListener("touchstart", () => aplicarDrawableByName(el, pressed));

    el.addEventListener("touchend", () => aplicarDrawableByName(el, normal));
  }
}
function aplicarInset(el, insetNode) {
  const insetDiv = document.createElement("div");
  insetDiv.style.position = "absolute";
  insetDiv.style.inset = "0";
  ["top", "left", "right", "bottom"].forEach((dir) => {
    const val = insetNode.getAttribute(`android:${dir}`);
    if (val) insetDiv.style[dir] = toPx(val);
  });
  const childDrawable = Array.from(insetNode.children).find((n) =>
    ["shape", "selector", "layer-list"].includes(n.tagName)
  );
  if (childDrawable) aplicarShapeDrawable(insetDiv, childDrawable);
  el.appendChild(insetDiv);
}
function aplicarBitmap(el, bitmapNode) {
  const src = bitmapNode.getAttribute("android:src");
  if (!src) return;
  let url = src;

  if (src.startsWith("@drawable/")) {
    const name = src.replace("@drawable/", "");
    url = `../../../model/editor/read_file.php?file=${encodeURIComponent(
      currentProject + "/res/drawable/" + name + ".png"
    )}`;
  }

  el.style.backgroundImage = `url('${url}')`;
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
  el.style.backgroundRepeat = "no-repeat";
}
