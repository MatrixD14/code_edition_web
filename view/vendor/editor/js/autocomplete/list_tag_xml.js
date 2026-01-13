window.xml_tag_duplic = {
  android: {
    // prefix: "android:",
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

      TextView: [
        "text",
        "textColor",
        "textSize",
        "textStyle",
        "gravity",
        "ellipsize",
        "singleLine",
        "maxLines",
      ],

      EditText: ["hint", "inputType", "textColor", "textSize"],

      ImageView: ["src", "scaleType"],

      Button: ["text", "textAllCaps"],
    },
  },

  drawable: {
    // prefix: "android:",
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
window.xml_tag = {
  xmlns: {
    // prefix: "xmlns:",
    base: ["android", "tools"],
    views: {},
  },
  tools: {
    // prefix: "tools:",
    base: ["context", "ignore", "targetApi"],
    views: {},
  },
};
const NS_PREFIX = {
  android: "android:",
  drawable: "android:",
  tools: "tools:",
  xmlns: "xmlns:",
  atribPadrao: "name=",
  style: "parent=",
  styles: "style=",
};

window.xml_resouc = {
  color: {
    prefix: "@color/",
    values: ["#ffffffff", "#ff000000"],
  },
  drawable: {
    prefix: "@drawable/",
    values: [],
  },
  style: {
    prefix: "@style/",
    values: [],
  },
  xmlnsTools: {
    prefix: "http://schemas.android.com/tools",
    values: [],
  },
  xmlnsAndroid: {
    prefix: "http://schemas.android.com/apk/res/android",
    values: [],
  },
};

window.xml_values = {
  layout_width: ["match_parent", "wrap_content", "0dp"],
  layout_height: ["match_parent", "wrap_content", "0dp"],
  layout_weight: ["0", "0.5", "1"],
  visibility: ["visible", "invisible", "gone"],
  orientation: ["horizontal", "vertical"],
  gravity: ["start", "end", "center", "center_vertical", "center_horizontal"],
  ellipsize: ["start", "middle", "end", "marquee"],
  singleLine: ["true", "false"],
  maxLines: ["1", "2", "5", "10"],
  textStyle: ["normal", "bold", "italic", "bold|italic"],
  textSize: ["12sp", "14sp", "16sp", "20sp", "30sp", "40sp"],
  background: ["@color/", "@drawable/"],
  src: ["@drawable/"],
  textColor: ["@color/"],
  id: ["@+id/"],
  style: ["@style/"],
  layout_margin: ["5dp", "10dp", "20dp", "30dp"],
  layout_marginTop: ["5dp", "10dp", "20dp", "30dp"],
  layout_marginBottom: ["5dp", "10dp", "20dp", "30dp"],
  layout_marginStart: ["5dp", "10dp", "20dp", "30dp"],
  layout_marginEnd: ["5dp", "10dp", "20dp", "30dp"],
  padding: ["5dp", "10dp", "20dp", "30dp"],
  paddingTop: ["5dp", "10dp", "20dp", "30dp"],
  paddingBottom: ["5dp", "10dp", "20dp", "30dp"],
  paddingStart: ["5dp", "10dp", "20dp", "30dp"],
  paddingEnd: ["5dp", "10dp", "20dp", "30dp"],
  alpha: ["0.0", "0.5", "1.0"],
  text: ["@string/"],
};
