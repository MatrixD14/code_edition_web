const xml_tag = {
  android: {
    prefix: "android:",
    base: [
      "id",
      "layout_width",
      "layout_height",
      "layout_margin",
      "layout_marginTop",
      "layout_marginBottom",
      "layout_marginStart",
      "layout_marginEnd",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingStart",
      "paddingEnd",
      "background",
      "visibility",
      "alpha",
    ],
    views: {
      LinearLayout: ["orientation", "gravity", "weightSum"],

      TextView: ["text", "textColor", "textSize", "textStyle", "gravity"],

      EditText: ["hint", "inputType", "textColor", "textSize"],

      ImageView: ["src", "scaleType"],

      Button: ["text", "textAllCaps"],
    },
  },
  atribPadrao: {
    prefix: "name=",
    base: [],
    views: {
      color: [],
      string: [],
      style: [],
      item: [],
    },
  },
  style: {
    prefix: "parent=",
    base: [],
    views: {},
  },
  xmlns: {
    prefix: "xmlns:",
    base: ["android", "tools"],
    views: {},
  },
  tools: {
    prefix: "tools:",
    base: ["context", "ignore", "targetApi"],
    views: {},
  },
  drawable: {
    prefix: "android:",
    base: [
      "color",
      "width",
      "height",
      "radius",
      "top",
      "bottom",
      "left",
      "right",
      "drawable",
      "startColor",
      "endColor",
      "centerColor",
      "angle",
      "type",
    ],
    views: {
      shape: ["shape"],
      solid: ["color"],
      stroke: ["width", "color", "dashWidth", "dashGap"],
      corners: ["radius", "topLeftRadius", "topRightRadius"],
      padding: ["left", "top", "right", "bottom"],
      size: ["width", "height"],
      gradient: ["startColor", "endColor", "centerColor", "angle", "type"],
      item: [
        "state_pressed",
        "state_enabled",
        "state_checked",
        "drawable",
        "top",
        "bottom",
        "left",
        "right",
      ],
    },
  },
};
const xml_resouc = {
  color: {
    prefix: "@color/",
    values: ["#ffffffff", "#ff000000"],
  },
  drawable: {
    prefix: "@drawable/",
    values: [""],
  },
  style: {
    prefix: "@style/",
    values: [""],
  },
};
const xml_values = {
  layout_width: ["match_parent", "wrap_content", "0dp"],
  layout_height: ["match_parent", "wrap_content", "0dp"],
  layout_weight: ["0", "0.5", "1"],
  visibility: ["visible", "invisible", "gone"],
  orientation: ["horizontal", "vertical"],
  gravity: ["start", "end", "center", "center_vertical", "center_horizontal"],
  ellipsize: ["start", "middle", "end", "marquee"],
  textSize: ["12sp", "14sp", "16sp", "20sp", "30sp", "40sp"],
  background: ["@color/", "@drawable/"],
  textColor: ["@color/"],
  id: ["@+id/"],
  style: ["@style/"],
};
