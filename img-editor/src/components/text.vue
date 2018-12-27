<template>
  <div
    class="box-text"
    contenteditable="true"
    ref="box"
    :style="sty"
    :class="cla"
    @mousedown="boxMouseDown"
    @keydown.8="del"
  >
    <span class="point" @mousedown="pointMouseDown('LT')"></span>
    <span class="point" @mousedown="pointMouseDown('RT')"></span>
    <span class="point" @mousedown="pointMouseDown('LB')"></span>
    <span class="point" @mousedown="pointMouseDown('RB')"></span>
    <div class="ftext">{{tex}}</div>
  </div>
</template>
<script>
import { getElemOffset, getPointerToElem } from "../libs/utils.js";
import $ from "jquery";

export default {
  name: "boxText",
  props: [
    "show",
    "width",
    "height",
    "lineHeight",
    "left",
    "index",
    "text",
    "top",
    "color",
    "fontFamily",
    "borderW",
    "canvasW",
    "canvasH",
    "canDrag",
    "canvas",
    "borderColor",
    "borderRadius"
  ],
  data() {
    return {
      boxW: this.width,
      boxH: this.height,
      boxL: this.left,
      boxT: this.top,
      boxToPointer: null,
      boxCanDrag: this.canDrag,
      boxPointCanDrag: false,
      boxLTPointCanDrag: false,
      boxRTPointCanDrag: false,
      boxLBPointCanDrag: false,
      boxRBPointCanDrag: false,
      boxStopL: null,
      boxStopT: null,
      boxStopR: null,
      boxStopB: null,
      boxStopW: null,
      boxStopH: null,
      tex: this.text
    };
  },

  computed: {
    sty() {
      return {
        left: this.boxL + "px",
        top: this.boxT + "px",
        width: this.boxW + "px",
        height: this.boxH + "px",
        fontSize: this.boxH - 2 + "px",
        lineHeight: 1,
        color: this.color,
        "font-family": this.fontFamily,
        borderRadius: this.borderRadius
      };
    },
    cla() {
      return {
        hide: !this.show
      };
    }
  },

  watch: {
    left() {
      this.boxL = this.left;
    },
    top() {
      this.boxT = this.top;
    },
    width() {
      this.boxW = this.width;
    },
    height() {
      this.boxH = this.height;
    }
  },

  methods: {
    del() {
      debugger;
      var Alltextbox = document.getElementsByClassName("box-text");
      var box = Alltextbox[this.index];
      if (box.textContent == "    ") {
        box.contentEditable = "false";
      } else {
        box.contentEditable = "true";
      }
    },
    boxMouseDown(e) {
      this.clearFs = true;
      var Alltextbox = document.getElementsByClassName("box-text");
      var box = Alltextbox[this.index];
      if (box.textContent == "    ") {
        box.contentEditable = "true";
      }
      for (var i = 0; i < Alltextbox.length; i++) {
        if (this.index == i) {
          var point = Alltextbox[i].getElementsByClassName("point");
          for (var z = 0; z < point.length; z++) {
            point[z].style.display = "inline-block";
          }
        } else {
          var point = Alltextbox[i].getElementsByClassName("point");
          for (var j = 0; j < point.length; j++) {
            point[j].style.display = "none";
          }
        }
      }
      this.$emit("textChange", {
        width: this.boxW,
        height: this.boxH,
        left: this.boxL,
        top: this.boxT,
        index: this.index,
        text: box.innerText
      });
      this.$emit("textClick", {
        canDrag: true
      });
      this.$emit("change", {
        index: this.index
      });
      this.boxToPointer = getPointerToElem(e, this.$refs.box);
      if (e.target.className !== "point") {
        this.boxCanDrag = true;
      }
    },

    pointMouseDown(name) {
      let offset = getElemOffset(this.canvas, this.$refs.box);
      this.boxPointCanDrag = true;
      this.boxStopW = this.boxW;
      this.boxStopH = this.boxH;
      switch (name) {
        case "LT":
          this.boxLTPointCanDrag = true;
          this.boxR = offset.right;
          this.boxB = offset.bottom;
          this.boxStopL = offset.left;
          this.boxStopT = offset.top;
          break;
        case "RT":
          this.boxRTPointCanDrag = true;
          this.boxL = offset.left;
          this.boxB = offset.bottom;
          this.boxStopR = offset.right;
          this.boxStopT = offset.top;
          break;
        case "LB":
          this.boxLBPointCanDrag = true;
          this.boxR = offset.right;
          this.boxT = offset.top;
          this.boxStopL = offset.left;
          this.boxStopB = offset.bottom;
          break;
        case "RB":
          this.boxRBPointCanDrag = true;
          this.boxL = offset.left;
          this.boxT = offset.top;
          this.boxStopR = offset.right;
          this.boxStopB = offset.bottom;
          break;
      }
    }
  },
  mounted() {
    var Alltextbox = document.getElementsByClassName("box-text");
    var Allbox = document.getElementsByClassName("box");
    var Allpoint = document.getElementsByClassName("point");
    for (var i = 0; i < Alltextbox.length; i++) {
      Alltextbox[i].style.border = "none";
    }
    for (var i = 0; i < Allpoint.length; i++) {
      Allpoint[i].style.display = "none";
    }
    var box = Alltextbox[this.index];

    box.addEventListener("mouseenter", e => {
      for (var i = 0; i < Alltextbox.length; i++) {
        if (Alltextbox[i].style.border !== "none") {
          Alltextbox[i].style.border = "none";
        }
      }
      for (var i = 0; i < Allbox.length; i++) {
        if (Allbox[i].style.border !== "none") {
          Allbox[i].style.border = "none";
        }
        var point = Allbox[i].getElementsByClassName("point");
        for (var z = 0; z < point.length; z++) {
          point[z].style.display = "none";
        }
      }
      for (var i = 0; i < Alltextbox.length; i++) {
        if (this.index !== i) {
          var point = Alltextbox[i].getElementsByClassName("point");
          for (var j = 0; j < point.length; j++) {
            point[j].style.display = "none";
          }
        }
      }
      for (var i = 0; i < Alltextbox.length; i++) {
        if (this.index == i) {
          box.style.border = "2px dashed #fff";
        } else {
          Alltextbox[i].style.border = "none";
        }
      }
    });

    let d = document;
    let offset, left, top, moveL, moveT;
    d.addEventListener("mousemove", e => {
      var _this = this;
      if (_this.boxCanDrag) {
        offset = getPointerToElem(e, _this.canvas);
        left = offset.left - _this.boxToPointer.left;
        top = offset.top - _this.boxToPointer.top;
        moveL = _this.canvasW - parseFloat(_this.boxW);
        moveT = _this.canvasH - parseFloat(_this.boxH);
        if (left >= 0 && left <= moveL) {
          _this.boxL = left;
        } else {
          if (left < 0) {
            _this.boxL = 0;
          } else {
            _this.boxL = moveL;
          }
        }
        if (top >= 0 && top <= moveT) {
          _this.boxT = top;
        } else {
          if (top < 0) {
            _this.boxT = 0;
          } else {
            _this.boxT = moveT;
          }
        }
        _this.$emit("textChange", {
          width: _this.boxW,
          height: _this.boxH,
          left: _this.boxL,
          top: _this.boxT,
          index: _this.index,
          text: box.innerText
        });
      }
      if (_this.boxPointCanDrag) {
        offset = getPointerToElem(e, _this.canvas);
        if (_this.boxLTPointCanDrag) {
          if (offset.left >= 0) {
            _this.boxL = offset.left;
            _this.boxW = _this.boxStopL - offset.left + _this.boxStopW;
          }
          if (offset.top >= 0) {
            _this.boxT = offset.top;
            _this.boxH = _this.boxStopT - offset.top + _this.boxStopH;
          }
        }
        if (_this.boxRTPointCanDrag) {
          if (offset.right >= 0) {
            _this.boxR = offset.right;
            _this.boxW = _this.boxStopR - offset.right + _this.boxStopW;
          }
          if (offset.top >= 0) {
            _this.boxT = offset.top;
            _this.boxH = _this.boxStopT - offset.top + _this.boxStopH;
          }
        }
        if (_this.boxLBPointCanDrag) {
          if (offset.left >= 0) {
            _this.boxL = offset.left;
            _this.boxW = _this.boxStopL - offset.left + _this.boxStopW;
          }
          if (offset.bottom >= 0) {
            _this.boxB = offset.bottom;
            _this.boxH = _this.boxStopB - offset.bottom + _this.boxStopH;
          }
        }
        if (_this.boxRBPointCanDrag) {
          console.log(
            _this.boxStopR + "," + offset.right + "," + _this.boxStopW
          );
          console.log(
            _this.boxStopB + "," + offset.bottom + "," + _this.boxStopH
          );
          if (offset.right >= 0) {
            _this.boxR = offset.right;
            _this.boxW = _this.boxStopR - offset.right + _this.boxStopW;
          }
          if (offset.bottom >= 0) {
            _this.boxB = offset.bottom;
            _this.boxH = _this.boxStopB - offset.bottom + _this.boxStopH;
          }
        }
        _this.$emit("textChange", {
          width: _this.boxW,
          height: _this.boxH,
          left: _this.boxL,
          top: _this.boxT,
          index: _this.index,
          text: box.innerText
        });
      }
    });

    d.addEventListener("mouseup", () => {
      this.boxCanDrag = false;
      this.boxPointCanDrag = false;
      this.boxLTPointCanDrag = false;
      this.boxLBPointCanDrag = false;
      this.boxRTPointCanDrag = false;
      this.boxRBPointCanDrag = false;
    });
  }
};
</script>
<style>
.box-text {
  outline: none;
}
.ftext {
  display: inline-block;
  width: 100%;
  height: 100%;
}
</style>

