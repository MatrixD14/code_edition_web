const xml_tag = {
  android: {
    prefix: "android:",
    base: [
      "id",
      "style",
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
};
