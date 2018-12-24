<template>
  <el-container style="height: 100%;">
    <div class="help-mask" v-show="helpshow" @click="hidehelp">
      <el-collapse v-model="activeName" accordion>
        <el-collapse-item title="文字如何编辑？" name="1">
          <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
          <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
        </el-collapse-item>
        <el-collapse-item title="图片如何更换？" name="2">
          <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
          <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
        </el-collapse-item>
        <el-collapse-item title="如何更换字体？" name="3">
          <div>简化流程：设计简洁直观的操作流程；</div>
          <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
          <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
        </el-collapse-item>
        <el-collapse-item title="如何下载图片？" name="4">
          <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
          <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
        </el-collapse-item>
        <el-collapse-item title="填写错误怎么办？" name="5">
          <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
          <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="mobile-wrap" v-show="showImg" @click="hideImg">
      <div style="position:relative;">
        <img :src="canvasImg">
      </div>
    </div>
    <el-container>
      <el-header class="wrap-top">
        <div class="reset-wrap" @click="resetpage">
          <img src="./assert/reset.png">
          <div>重做</div>
        </div>
      </el-header>
      <el-main>
        <div id="image-editor" :style="imageEditorSty">
          <a id="download-link" class="hide"></a>
          <div class="panel" :style="editSty">
            <canvas :width="canvasW" :height="canvasH" ref="canvas"></canvas>
            <div class="mask" :style="editSty" @drop.prevent="drop" @click="maskClick">
              <boxText
                v-if="arry.text"
                v-for="(item,index) in arry.text"
                :index="index"
                :key="index"
                contenteditable="true"
                :width="item.width"
                :height="item.height"
                :show="showText"
                :fs="item.fontSize"
                :left="item.left"
                :top="item.top"
                :fontFamily="item.fontFamily"
                :color="item.color"
                :text="item.text"
                :canvasW="arry.canvasW"
                :canvasH="arry.canvasH"
                :canDrag="item.canDrag"
                :canvas="$refs.canvas"
                @textClick="textClick"
                @textChange="textChange"
                style="outline:none;white-space:nowrap;"
              ></boxText>
              <Box
                v-if="arry.box"
                v-for="(item,index) in arry.box"
                :show="showClip"
                :Imgindex="index"
                :key="index"
                :backgroundImage="item.url"
                :width="item.width"
                :height="item.height"
                :left="item.left"
                :top="item.top"
                :canvasW="arry.canvasW"
                :canvasH="arry.canvasH"
                @boxClick="boxClick"
                :canDrag="item.clipCanDrag"
                :canvas="$refs.canvas"
                @boxChange="boxChange"
              ></Box>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
    <el-aside class="toolbar">
      <div class="tool-top">
        <div class="priview" @click="priviewCanvas">预览</div>
        <div @click="download">下载</div>
      </div>
      <div v-if="cshow">
        <div class="fmselect-wrap">
          <el-select class="fmselect" v-model="fsvalue" placeholder="请选择字号" @change="inputChange">
            <el-option
              v-for="item in textfsList"
              :key="item.idx"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div v-else class="replace-wrap">
        <div id="replace">替换图片</div>
        <input type="file" id="uploadFile" @change="readLocalFile">
      </div>
      <div class="bottom-wrap" @click="help">
        <div class="help-wrap">
          <img src="./assert/help.png" class="help">
        </div>
        <div>帮助</div>
      </div>
    </el-aside>
  </el-container>
</template>
<script>
import { getElemOffset, getPointerToElem, copy } from "./libs/utils.js";
import CanvasHelper from "./libs/canvas-helper.js";
import TimeMachine from "./libs/time-machine.js";

import Box from "./components/box.vue";
import boxText from "./components/text.vue";
import List from "./components/select.vue";
import html2canvas from "html2canvas";
// import demoImg from "./assert/haibao.jpg";
// import demoImg from "./assert/abc.jpg";
import fmList from "./configs/fm-list.json";
import fsList from "./configs/fs-list.json";
import figureList from "./configs/figure-list.json";
import clipList from "./configs/clip-list.json";
import mosaicList from "./configs/mosaic-list.json";
import filterList from "./configs/filter-list.json";
import urlList from "../static/test/config.json";
import $ from 'jquery'
let DATA = {
  timeMachine: null,
  ctx: null,
  mosaicCtx: null,
  beforeBlur: null,
  beforeFilter: null
};
export default {
  name: "ImageEditor",

  props: ["minWidth", "maxWidth"],
  components: {
    Box,
    boxText,
    List
  },
  data() {
    return {
      demoImg:'',
      fmvalue: "",
      fsvalue: "",
      cshow: false,
      helpshow: false,
      activeName: "1",
      canvasImg:'',
      showImg:false,
      arry:{},
      // arry: {
      //   canvasW: 680,
      //   canvasH: 1701,
      //   text: [
      //     {
      //       text: "双击编辑1",
      //       width: 200,
      //       height: 30,
      //       fontSize: "",
      //       left: 20,
      //       top: 20,
      //       color: "red",
      //       fontFamily: "宋体",
      //       canDrag: false
      //     },
      //     {
      //       text: "全场满减",
      //       width: 304,
      //       height: 77,
      //       left: 187,
      //       top: 668,
      //       fontSize: "",
      //       color: "white",
      //       fontFamily: "FZshangKuS-R-GB",
      //       canDrag: false
      //     }
      //   ],
      //   box: [
      //     {
      //       width: 200,
      //       height: 200,
      //       left: 200,
      //       top: 200,
      //       clipCanDrag: false,
      //       url:''
      //     },
      //     {
      //       width: 200,
      //       height: 200,
      //       left: 500,
      //       top: 500,
      //       borderW: 2,
      //       clipCanDrag: false,
      //       url:''
      //     }
      //   ]
      // },
      // init main style
      toolWrapperMargin: 10,
      toolBarH: 40,
      enhanceBarH: 30,
      toolBarMargin: 10,
      lineHeight: 30,
      minCanvasW: this.minWidth,
      minCanvasH: 500,
      canvasW: this.minWidth,
      canvasH: 500,
      maskOpacity: 0,
      maxCanvasW: this.maxWidth,

      // text style
      textL: 10,
      textT: 10,
      textFz: 28,
      textBorderW: 2,
      type: "0",
      textColors: {
        hex: "#ffffff"
      },
      shadowColors: {
        hex: "#000000"
      },
      textAlpha: 1,
      shadowBlur: 0,
      shadowX: 0,
      shadowY: 0,

      // clip style
      clipBorderW: 1,
      clipW: 200,
      clipH: 200,
      clipL: 10,
      clipT: 10,
      clipClickX: 0,
      clipClickY: 0,

      // mosaic style
      mosaicBorderW: 1,
      mosaicW: 200,
      mosaicH: 200,
      mosaicL: 10,
      mosaicT: 10,

      // figure style
      figureBorderW: 1,
      figureW: 200,
      figureH: 200,
      figureL: 10,
      figureT: 10,
      figureAlpha: 0.5,
      figureColors: {
        hex: "#9E4949"
      },
      lineColors: {
        hex: "#000000"
      },
      borderR: 0,

      // action state
      canPaint: false,
      showText: true,
      showClip: true,
      showBlur: false,
      showMosaic: false,
      showFigure: false,
      showFilter: false,

      //text state
      textContenteditable: false,
      textCanDrag: false,
      canDrag: false,
      textTextGroup: [],
      textText: "双击编辑",
      textMinW: 130,
      textToPointer: null,
      textShowColorPicker: false,
      textShowShadowColorPicker: false,
      textFmList: fmList,
      textfsList: fsList,
      textFmNow: 0,
      textLine: 1,
      textW: 200,
      textH: 30,
      textClickX: 0,
      textClickY: 0,
      textFont: 30,
      // clip state
      clipCanDrag: false,
      clipList: clipList,
      clipNow: 0,

      // blur state
      blur: 0,
      blurRangeW: 100,
      blurMax: 10,

      // mosaic state
      mosaicCanDrag: false,
      mosaicList: mosaicList,
      mosaicNow: 0,

      // figure state
      figureCanDrag: false,
      figureShowShadowColorPicker: false,
      figureLineShowShadowColorPicker: false,
      figureList: figureList,
      figureNow: 0,

      // filter state
      filterList: filterList,
      filterNow: 0,

      // data url
      url: null,
      mosaicUrl: null
    };
  },

  watch: {
    textFz(val, old) {
      this.backToOld(val, old, "fz");
    },

    textFmNow(val, old) {
      this.backToOld(val, old, "fm");
    },
    textH() {
      return this.textFont + "px";
    }
  },
  computed: {
    // style
    // style outer
    imageEditorSty() {
      return {
        width:
          this.canvasW < this.minCanvasW
            ? this.minCanvasW + "px"
            : this.canvasW + "px",
        height:
          (this.canvasH < this.minCanvasH ? this.minCanvasH : this.canvasH) +
          this.toolWrapperMargin +
          this.toolBarH +
          this.enhanceBarH +
          this.toolBarMargin +
          "px"
      };
    },

    toolWrapperSty() {
      return {
        height: this.toolBarH + this.enhanceBarH + this.toolBarMargin + "px",
        marginBottom:
          this.canvasH < this.minCanvasH
            ? (this.minCanvasH - this.canvasH + this.toolWrapperMargin) / 2 +
              "px"
            : this.toolWrapperMargin + "px"
      };
    },

    funcSty() {
      return {
        height: this.toolBarH + "px",
        marginBottom: this.toolBarMargin + "px"
      };
    },

    enhanceSty() {
      return {
        height: this.enhanceBarH + "px"
      };
    },

    editSty() {
      return {
        width: this.canvasW + "px",
        height: this.canvasH + "px",
        backgroundColor: this.showClip
          ? "rgba(0,0,0," + this.maskOpacity + ")"
          : "transparent"
      };
    },

    // style text
    // textSty() {
    //   // var h = document.getElementsByClassName('textarea')[0]
    //   // if(h){
    //   //   this.textHeight = h.offsetHeight
    //   // }
    //   return {
    //     left: this.textL + 'px',
    //     top: this.textT + 'px',
    //     color: this.textColors.hex,
    //     width: this.textW + 'px',
    //     // height:this.textHeight + 'px',
    //     // height: this.textTextGroup.length > 0 ? (Number(this.textFz) * this.textTextGroup.length + this.textBorder * 2) + 'px' : (Number(this.textFz) + this.textBorder * 2) + 'px',
    //     borderW: this.textBorder + 'px',
    //     fontSize: this.textFz + 'px',
    //     // lineHeight: this.textFz + 'px',
    //     fontFamily: this.textFmList[this.textFmNow].value,
    //     opacity: this.textAlpha,
    //     textShadow: ((!this.shadowX) && (!this.shadowY)) ? 'none' : this.shadowX + 'px ' + this.shadowY + 'px ' + this.shadowBlur + 'px ' + this.shadowColors.hex
    //   }
    // },
    Sty() {
      return {
        left: this.textL + "px",
        top: this.textT + "px",
        color: this.textColors.hex,
        width: this.textW + "px",
        height: this.textH + "px",

        // fontSize:this.textFont + 'px',
        //height: this.textTextGroup.length > 0 ? (Number(this.textFz) * this.textTextGroup.length + this.textBorder * 2) + 'px' : (Number(this.textFz) + this.textBorder * 2) + 'px',
        borderW: this.textBorder + "px",
        lineHeight: this.textH + "px",
        fontFamily: this.textFmList[this.textFmNow].value,
        opacity: this.textAlpha
      };
    },
    colorInputSty() {
      return {
        background: this.textColors.hex
      };
    },

    shadowColorInputSty() {
      return {
        background: this.shadowColors.hex
      };
    },

    // style clip
    clipSty() {
      return {
        width: this.clipW - this.clipBorderW * 2 + "px",
        height: this.clipH - this.clipBorderW * 2 + "px",
        backgroundImage: this.url == null ? "none" : "url(" + this.url + ")",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        borderRadius: this.clipNow == 0 ? "0" : "50%"
      };
    },

    blurRangeSty() {
      return {
        width: this.blurRangeW + "px"
      };
    },

    mosaicSty() {
      return {
        width: this.mosaicW - this.mosaicBorderW * 2 + "px",
        height: this.mosaicH - this.mosaicBorderW * 2 + "px",
        backgroundImage:
          this.mosaicUrl == null ? "none" : "url(" + this.mosaicUrl + ")",
        backgroundPosition:
          -this.mosaicL -
          this.mosaicBorderW +
          "px " +
          (-this.mosaicT - this.mosaicBorderW) +
          "px"
      };
    },

    figureSty() {
      return {
        width: this.figureW - this.figureBorderW * 2 + "px",
        height: this.figureH - this.figureBorderW * 2 + "px",
        // borderColor:this.lineColors.hex,
        // borderWidth:this.figureBorderW,
        backgroundColor: this.figureColors.hex,
        opacity: this.figureAlpha,
        borderRadius: this.figureNow == 0 ? "0" : "50%"
      };
    },

    colorFigureInputSty() {
      return {
        background: this.figureColors.hex
      };
    },

    colorLineInputSty() {
      return {
        background: this.lineColors.hex
      };
    },
    // class
    // class text
    textCla() {
      return {
        hide: !this.showText,
        abled: this.textContenteditable,
        disabled: !this.textContenteditable
      };
    },
    // state
    blurRation() {
      return this.blurRangeW / this.blurMax;
    }
  },
  created() {
    debugger
    var a = this.$route.query.url;
    this.demoImg = decodeURIComponent(a);
    var publicUrl = this.demoImg
    var l = publicUrl.lastIndexOf('/')+1 
    publicUrl =publicUrl.substring(0,l);
    this.init(this.demoImg);
    var b = $.ajax({url:publicUrl+"config.json",async:false})
    var obj = JSON.parse(b.responseText)
    this.arry = obj
    for(var i=0;i<this.arry.box.length;i++){
       this.arry.box[i].url = publicUrl + obj.box[i].url
    }
  },
  methods: {
    readLocalFile() {
      debugger;
      var _this = this;
      var localFile = document.getElementById("uploadFile").files[0];
      var box = document.getElementsByClassName("box");

      var reader = new FileReader();
      var content;
      reader.onload = function(event) {
        debugger;
        content = event.target.result;
        for (var i = 0; i < box.length; i++) {
          if (box[i].style.border !== "none") {
            _this.arry.box[i].url = content;
          }
        }
      };
      content = reader.readAsDataURL(localFile, "UTF-8");
    },
    detail() {
      debugger;
      console.log(this.arry.text[1].text);
    },
    handleAvatarSuccess(res, file) {
      debugger;
      this.url = res.data.imgUrl;
    },
    // upload image
    init(url) {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      let natureW,
        natureH,
        scale = 1;
      img.onload = () => {
        debugger;
        natureW = img.width;
        natureH = img.height;
        if (natureW > this.maxCanvasW) scale = natureW / this.maxCanvasW;
        this.canvasW = natureW / scale;
        this.canvasH = natureH / scale;
        this.$nextTick(function() {
          DATA.ctx = new CanvasHelper(this.$refs.canvas);
          DATA.ctx.ctx.save();
          DATA.ctx.ctx.scale(1 / scale, 1 / scale);
          DATA.ctx.put(img);
          DATA.ctx.ctx.restore();
          DATA.timeMachine = new TimeMachine(DATA.ctx);
          DATA.timeMachine.add();
          this.reset();
          this.canPaint = true;
        });
      };
      img.src = url;
    },

    drop(e) {
      let url = URL.createObjectURL(e.dataTransfer.files[0]);
      this.init(url);
    },

    open(e) {
      let url = URL.createObjectURL(e.target.files[0]);
      this.init(url);
    },

    // text
    toggleText() {
      if (!this.canPaint) return false;
      if (this.showMosaic) this.paintMosaic();
      if (this.showBlur) this.paintBlur();
      if (this.showFilter) this.paintFilter();
      if (this.showFigure) this.paintFigure();
      this.resetFunc();
      this.showText = true;
      this.textW =
        DATA.ctx.textGroupW(
          this.textTextGroup,
          this.textFz,
          this.textFmList[this.textFmNow].value,
          this.textMinW
        ) +
        this.textBorder * 2;
    },

    textMouseDown(e) {
      this.textCanDrag = true;
      this.textToPointer = getPointerToElem(e, this.$refs.text);
    },

    textDouble() {
      this.textContenteditable = true;
      this.textTextGroup = [];
      this.textText = "";
      this.textW =
        DATA.ctx.textGroupW(
          this.textTextGroup,
          this.textFz,
          this.textFmList[this.textFmNow].value,
          this.textMinW
        ) +
        this.textBorder * 2;
    },

    textInput() {
      debugger;
      let beyond, maxString;
      this.textTextGroup = this.textText.split("\n");
      this.textW =
        DATA.ctx.textGroupW(
          this.textTextGroup,
          this.textFz,
          this.textFmList[this.textFmNow].value,
          this.textMinW
        ) +
        this.textBorder * 2;
    },

    backToOld(val, old, type) {
      let beyondW, beyondH;
      this.textW =
        DATA.ctx.textGroupW(
          this.textTextGroup,
          this.textFz,
          this.textFmList[this.textFmNow].value,
          this.textMinW
        ) +
        this.textBorder * 2;
      this.$nextTick(function() {
        beyondW =
          getElemOffset(this.$refs.canvas, this.$refs.text).left +
          this.textW -
          this.canvasW;
        beyondH =
          getElemOffset(this.$refs.canvas, this.$refs.text).top - this.canvasH;
        beyondH =
          getElemOffset(this.$refs.canvas, this.$refs.text).top +
          parseFloat(this.textSty.height) -
          this.canvasH;
        if (beyondW > 0 || beyondH > 0) {
          if (type == "fz") {
            this.textFz = old;
          }
          if (type == "fm") {
            this.textFmNow = old;
          }
        }
      });
    },

    toggleColorPicker() {
      this.textShowColorPicker = !this.textShowColorPicker;
    },

    toggleShadowColorPicker() {
      this.textShowShadowColorPicker = !this.textShowShadowColorPicker;
    },

    onColorChange(val) {
      this.textColors.hex = val.hex;
    },

    onShadowColorChange(val) {
      this.shadowColors.hex = val.hex;
    },

    paintText() {
      for (var i = 0; i < this.arry.text.length; i++) {
        debugger;
        DATA.ctx.text(
          this.arry.text[i].text,
          // this.arry.text[i].left,
          187,
          668,
          // this.arry.text[i].top + this.arry.text[i].height-4,
          this.arry.text[i].color,
          parseFloat(this.arry.text[i].fontSize) ||
            parseFloat(this.arry.text[i].height) - 2,
          this.arry.text[i].fontFamily
        );
      }
      for (var i = 0; i < this.arry.box.length; i++) {
        DATA.ctx.url(
          0,
          0,
          0,
          0,
          Number(this.arry.box[i].left),
          Number(this.arry.box[i].top),
          Number(this.arry.box[i].width),
          Number(this.arry.box[i].height),
          this.arry.box[i].url
        );
      }
      DATA.timeMachine.add();
    },

    resetText() {
      this.showText = false;
      this.textContenteditable = false;
      this.textTextGroup = [];
      this.textText = "双击编辑";
      this.textL = 10;
      this.textT = 10;
      this.textColors.hex = "#ffffff";
      this.shadowColors.hex = "#000000";
      this.textFz = 18;
      this.textFmNow = 0;
      this.textShowColorPicker = false;
      this.shadowY = 0;
      this.shadowX = 0;
      this.shadowBlur = 0;
      this.textAlpha = 1;
      this.textLine = 1;

      this.textW = 200;
      this.textH = 30;
      this.textNow = 0;
    },

    // clip
    toggleClip() {
      if (!this.canPaint) return false;
      this.url = DATA.ctx.url();
      if (this.showMosaic) this.paintMosaic();
      if (this.showText && this.textContenteditable) this.paintText();
      if (this.showBlur) this.paintBlur();
      if (this.showFigure) this.paintFigure();
      this.resetFunc();
      this.showClip = true;
    },

    boxChange(status) {
      this.arry.box[status.index].width = status.width;
      this.arry.box[status.index].height = status.height;
      this.arry.box[status.index].left = status.left;
      this.arry.box[status.index].top = status.top;
      this.arry.box[status.index].url = status.backgroundImage;
    },
    textChange(status) {
      this.arry.text[status.index].width = status.width;
      this.arry.text[status.index].height = status.height;
      this.arry.text[status.index].left = status.left;
      this.arry.text[status.index].top = status.top;
      this.arry.text[status.index].text = status.text;
    },
    inputChange(value) {
      debugger;
      var textbox = document.getElementsByClassName("box-text");
      for (var i = 0; i < textbox.length; i++) {
        if (textbox[i].style.border !== "none") {
          this.arry.text[i].fontSize = value;
        }
      }
    },
    textClick(status) {
      this.cshow = status.canDrag;
    },
    boxClick(status) {
      this.cshow = status.canDrag;
    },
    help() {
      if (this.helpshow == true) {
        this.helpshow = false;
      } else {
        this.helpshow = true;
      }
    },
    hidehelp() {
      this.helpshow = false;
    },
    resetpage() {
      window.window.location.reload();
    },
    downloadClip() {
      if (this.clipNow == 0)
        DATA.ctx.downloadRect(this.clipL, this.clipT, this.clipW, this.clipH);
      if (this.clipNow == 1)
        DATA.ctx.downloadArc(this.clipW, this.clipH, this.clipL, this.clipT);
    },

    resetClip() {
      this.showClip = false;
      this.clipL = 10;
      this.clipT = 10;
      this.clipW = 200;
      this.clipH = 200;
      this.clipNow = 0;
      this.showClipSelect = false;
    },

    // blur
    toggleBlur() {
      if (!this.canPaint) return false;
      if (this.showMosaic) this.paintMosaic();
      if (this.showText && this.textContenteditable) this.paintText();
      if (this.showFigure) this.paintFigure();
      this.resetFunc();
      this.showBlur = true;
      DATA.beforeBlur = DATA.ctx.get();
    },

    blurInput(e) {
      let r = Math.floor(e.target.value / this.blurRation);
      let coped = copy(DATA.beforeBlur);
      DATA.ctx.put(coped);
      DATA.ctx.blur(r);
    },

    paintBlur() {
      this.url = DATA.ctx.url();
      DATA.timeMachine.add();
    },

    resetBlur() {
      this.showBlur = false;
      this.blur = 0;
    },

    // mosaic
    toggleMosaic() {
      if (!this.canPaint) return false;
      if (this.showText && this.textContenteditable) this.paintText();
      if (this.showBlur) this.paintBlur();
      if (this.showFigure) this.paintFigure();
      this.resetFunc();
      this.showMosaic = true;
      this.setMosaic(this.mosaicList[this.mosaicNow].value);
    },

    mosaicChange(status) {
      this.mosaicW = status.width;
      this.mosaicH = status.height;
      this.mosaicL = status.left;
      this.mosaicT = status.top;
    },

    setMosaic(value) {
      let canvas = document.createElement("canvas");
      canvas.width = this.canvasW;
      canvas.height = this.canvasH;
      DATA.mosaicCtx = new CanvasHelper(canvas);
      DATA.mosaicCtx.put(DATA.ctx.get());
      DATA.mosaicCtx.mosaic(value);
      this.mosaicUrl = DATA.mosaicCtx.url();
    },

    mosaicSelect() {
      this.setMosaic(this.mosaicList[this.mosaicNow].value);
    },

    paintMosaic() {
      DATA.ctx.mosaic(
        this.mosaicList[this.mosaicNow].value,
        this.mosaicL,
        this.mosaicT,
        this.mosaicW,
        this.mosaicH
      );
      DATA.timeMachine.add();
      this.url = DATA.ctx.url();
    },

    resetMosaic() {
      this.showMosaic = false;
      this.mosaicL = 10;
      this.mosaicT = 10;
      this.mosaicW = 200;
      this.mosaicH = 200;
      this.mosaicNow = 0;
      this.showMosaicSelect = false;
    },

    toggleFigure() {
      if (!this.canPaint) return false;
      if (this.showText && this.textContenteditable) this.paintText();
      if (this.showBlur) this.paintBlur();
      if (this.showMosaic) this.paintMosaic();
      this.resetFunc();
      this.showFigure = true;
    },

    toggleFigureColorPicker() {
      this.figureShowShadowColorPicker = !this.figureShowShadowColorPicker;
    },

    toggleLineColorPicker() {
      this.figureLineShowShadowColorPicker = !this
        .figureLineShowShadowColorPicker;
    },

    onFigureColorChange(val) {
      this.figureColors.hex = val.hex;
    },

    onLineColorChange(val) {
      this.lineColors.hex = val.hex;
    },

    figureChange(status) {
      this.figureW = status.width;
      this.figureH = status.height;
      this.figureL = status.left;
      this.figureT = status.top;
    },

    figureInputChange(id) {
      this.borderR = id == 0 ? "0" : "50%";
    },

    paintFigure() {
      let color = this.figureColors.hex;
      let linecolor = this.lineColors.hex;
      let alpha = this.figureAlpha;
      if (this.figureNow == 0) {
        DATA.ctx.rect(
          this.figureL,
          this.figureT,
          this.figureW,
          this.figureH,
          this.figureBorderW,
          color,
          linecolor,
          alpha
        );
      } else {
        DATA.ctx.arc(
          this.figureL + this.figureW / 2,
          this.figureT + this.figureH / 2,
          this.figureW / 2,
          this.figureH / 2,
          this.figureBorderW,
          color,
          linecolor,
          alpha
        );
      }
      DATA.timeMachine.add();
    },

    resetFigure() {
      this.showFigure = false;
      this.figureL = 10;
      this.figureT = 10;
      this.figureW = 200;
      this.figureH = 200;
      this.figureNow = 0;
      this.showFigureSelect = false;
      this.figureAlpha = 0.5;
      this.figureBorderW = 1;
      this.figureColors.hex = "#9E4949";
      this.lineColors.hex = "#000000";
      this.borderR = 0;
    },

    // filter
    toggleFilter() {
      if (!this.canPaint) return false;
      if (this.showText && this.textContenteditable) this.paintText();
      if (this.showBlur) this.paintBlur();
      if (this.showFigure) this.paintFigure();
      if (this.showMosaic) this.paintMosaic();
      this.resetFunc();
      this.showFilter = true;
      DATA.beforeFilter = DATA.ctx.get();
    },

    paintFilter() {
      this.url = DATA.ctx.url();
      DATA.timeMachine.add();
    },

    resetFilter() {
      this.showFilter = false;
      this.filterNow = 0;
    },

    filterSelect() {
      let coped;
      this.$nextTick(function() {
        coped = copy(DATA.beforeFilter);
        if (this.filterNow == 0) {
          DATA.ctx.put(DATA.beforeFilter);
        } else {
          DATA.ctx.put(coped);
          DATA.ctx[this.filterList[this.filterNow].name]();
        }
      });
    },

    // mask
    maskClick(e) {
      if (e.target.className !== "mask") return false;
      var Alltextbox = document.getElementsByClassName("box-text");
      var Allbox = document.getElementsByClassName("box");
      var Allpoint = document.getElementsByClassName("point");
      for (var i = 0; i < Alltextbox.length; i++) {
        Alltextbox[i].style.border = "none";
      }
      for (var i = 0; i < Allbox.length; i++) {
        Allbox[i].style.border = "none";
      }
      for (var i = 0; i < Allpoint.length; i++) {
        Allpoint[i].style.display = "none";
      }
    },
    // reset and download
    resetFunc() {
      if (this.showText) this.resetText();
      if (this.showClip) this.resetClip();
    },

    stage(name) {
      debugger;
      if (!this.canPaint) return false;
      if (this.showBlur) DATA.ctx.put(DATA.beforeBlur);
      if (this.showFilter) DATA.ctx.put(DATA.beforeFilter);
      if (
        this.showText ||
        this.showClip ||
        this.showBlur ||
        this.showMosaic ||
        this.showFigure ||
        this.showFilter
      ) {
        this.resetFunc();
        return;
      }
      if (name == "undo") {
        DATA.ctx.put(DATA.timeMachine.undo());
      } else {
        DATA.ctx.put(DATA.timeMachine.restore());
      }
    },

    reset() {
      if (!this.canPaint) return false;
      this.resetFunc();
      this.url = null;
      this.mosaicUrl = null;
      DATA.ctx.put(DATA.timeMachine.init());
      DATA.timeMachine.reset();
      DATA.mosaicCtx = null;
      DATA.beforeBlur = null;
      DATA.beforeFilter = null;
    },
    hideImg(){
      this.showImg = false
    },
    priviewCanvas(){
      debugger
       var _this = this;
      var imgEditor = document.getElementsByClassName("panel")[0];
      html2canvas(imgEditor).then(function(canvas) {
        _this.canvasImg = canvas.toDataURL("image/jpeg", 1.0);
        _this.showImg = true
      });
    },
    download() {
      debugger;
      var _this = this;
      var imgEditor = document.getElementsByClassName("panel")[0];
      html2canvas(imgEditor).then(function(canvas) {
        var pageData = canvas.toDataURL("image/jpeg", 1.0);
        _this.saveFile(
          pageData.replace("image/jpeg", "image/octet-stream"),
          new Date().getTime() + ".jpeg"
        );
      });
    },
    saveFile(data, filename) {
      var save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
      );
      save_link.href = data;
      save_link.download = filename;

      var event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      save_link.dispatchEvent(event);
    }
  }
  // mounted() {
  //   let d = document;
  //   let offset, left, top, moveT, moveL;

  //   ["dragleave", "drop", "dragenter", "dragover"].forEach(name =>
  //     document.body.addEventListener(name, e => e.preventDefault())
  //   );

  //   d.addEventListener("mousemove", e => {
  //     if (this.textCanDrag) {
  //       offset = getPointerToElem(e, this.$refs.canvas);
  //       left = offset.left - this.textToPointer.left;
  //       top = offset.top - this.textToPointer.top;
  //       moveL = this.canvasW - parseFloat(this.textSty.width);
  //       // moveT = this.canvasH;
  //       moveT = this.canvasH - parseFloat(this.textSty.height);
  //       if (left >= 0 && left <= moveL) {
  //         this.textL = left;
  //       } else {
  //         if (left < 0) {
  //           this.textL = 0;
  //         } else {
  //           this.textL = moveL;
  //         }
  //       }
  //       if (top >= 0 && top <= moveT) {
  //         this.textT = top;
  //       } else {
  //         if (top < 0) {
  //           this.textT = 0;
  //         } else {
  //           this.textT = moveT;
  //         }
  //       }
  //     }
  //   });

  //   d.addEventListener("mouseup", () => {
  //     this.textCanDrag = false;
  //   });
  // }
};
</script>
<style>
.text {
  color: white;
  font-size: 18px;
  display: inline-block;
}
.wrap-top {
  /* width: calc(100% - 293px) !important; */
  /* display: flex;
  justify-content: center;
  align-items: center; */
  background-color: #fff;
  height: 90px;
  border-right: 1px solid #eeeeee;
  font-size: 20px;
  color: #494949;
  /* position: fixed;
  z-index: 123; */
}
.wrap-top img {
  width: 35px;
  height: 35px;
  margin-right: 14px;
}
.toolbar {
  width: 292px !important;
  height: 100%;
  background-color: #fff;
}
.tool-top {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #fff;
  margin-bottom: 26px;
}
.tool-top div {
  width: 118px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0767ff;
  border-radius: 2px;
}
.tool-top .priview {
  margin-right: 14px;
  background-color: #fff;
  color: #0b68ff;
  border: 1px solid #0867ff;
}
.fmselect-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.fmselect-wrap .fmselect {
  width: 232px;
  height: 38px;
  font-size: 14px;
  color: #333;
}
#replace {
  width: 232px;
  height: 50px;
  background: rgba(251, 251, 254, 1);
  border-radius: 2px;
  border: 1px solid rgba(179, 207, 255, 1);
  color: #0767ff;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.replace-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}
#uploadFile {
  width: 232px;
  height: 50px;
  opacity: 0;
  position: absolute;
  top: 0;
}
.help {
  width: 31px;
  height: 31px;
  display: block;
}
.bottom-wrap {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  position: absolute;
  bottom: 37px;
  right: 42px;
  font-size: 14px;
  color: #494949;
}
.help-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.el-main {
  display: flex;
  justify-content: center;
}
.el-collapse {
  bottom: 73px;
  position: absolute;
  right: 185px;
  width: 259px;
  padding-left: 18px;
  background-color: #fff;
  border: none;
  box-shadow: 0px 2px 20px 0px rgba(234, 242, 255, 1);
}
.el-collapse-item:last-child {
  border: none;
}
.el-collapse-item:last-child .el-collapse-item__header {
  border: none;
}
.help-mask {
  position: absolute !important;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  top: 0;
  z-index: 1111111111;
}
.reset-wrap {
  display: flex;
  height: 100%;
  align-items: center;
}
.mobile-wrap {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  height: auto;
  z-index: 999999999999;
  background-color: rgba(0, 0, 0, 0.7);
  top: 0;
  left: 0;
  padding: 50px 0;
}
</style>

