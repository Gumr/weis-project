import {
  t
} from '../../utils/common'
// demo
/* <semicircle-process
        dia="{{216}}"
        value="{{100}}"
        total="{{147}}"
        title="蛋白质"
        percent="{{50}}"
        lineWidth="{{{
      dark: 16,
      light: 22
    }}}"
      ></semicircle-process> */

Component({
  /**
   * 组件的属性列表
   */
  name: 'semicircle-process',
  properties: {
    title: String,
    dia: { // 直径 因为是个圆 呈正方形展示 画正圆
      value: 200,
      type: Number
    },
    value: {
      type: Number,
      value: 0
    },
    total: {
      type: Number,
      value: 0
    },
    percent: {
      value: 0,
      type: Number
    },
    lineWidth: {
      value: {
        dark: 6, // 内圆宽度
        light: 10 // 外圆宽度
      },
      type: Object
    },
    margin: { // 中间字体的上下外边距
      value: 14,
      type: Number
    },
    lineColor: {
      value: {
        dark: '#E9E9E9', // 内圆颜色
        light: '#F7B500', // 外圆颜色
        overLight: '#FE5E0F', // 外圆颜色
      },
      type: Object
    },
    fontSize: {
      value: {
        title: 24,
        value: 60,
        unit: 18,
        label: 20,
      },
      type: Object
    }
  },
  observers: {
    'percent, value, total'() {
      if (this.readied) {
        this.drawCircle()
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached() {
      // console.log(requestAnimationFrame, 'requestAnimationFrame')
    },
  },
  pageLifetimes: {
    show() {
      this.ctx = wx.createCanvasContext('canvas', this);
      this.drawCircle();
    }
  },
  ready() {
    this.ctx = wx.createCanvasContext('canvas', this);
    this.readied = true;
    this.drawCircle();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    drawCircle() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.draw();
      }, 100)
    },
    draw() {
      const {
        ctx
      } = this;
      const {
        dia,
        lineWidth,
        lineColor
      } = this.data;
      const percent = Math.min(this.data.percent || 0.1, 100);
      const radius = t(dia) / 2;

      const x = radius;
      const y = radius;
      const startArc = 0.75;
      const endArc = 2.25;

      const arcRange = endArc - startArc;

      const excircleWidth = t(lineWidth.light);
      const circleR = radius - (excircleWidth / 2);
      ctx.clearRect(0, 0, dia, dia);
      ctx.beginPath();
      ctx.arc(x, y, circleR, Math.PI * startArc, Math.PI * endArc)
      ctx.strokeStyle = lineColor.dark;
      ctx.lineWidth = t(lineWidth.dark);
      ctx.lineCap = 'round'
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(x, y, circleR, Math.PI * startArc, Math.PI * (startArc + (arcRange * percent / 100)));
      ctx.strokeStyle = percent >= 100 ? lineColor.overLight : lineColor.light;
      ctx.lineWidth = excircleWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.closePath();

      // 绘制百分比
      let px = radius - Math.cos(0.25 * Math.PI - Math.PI * ((arcRange) * (percent / 100))) * radius;
      let py = radius + Math.sin(0.25 * Math.PI - Math.PI * ((arcRange) * (percent / 100))) * radius;


      this.setData({
        px: 100 * px / (radius * 2) + '%',
        py: 100 * py / (radius * 2) + '%',
      })

      ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          canvasId: 'canvas',
          fileType: 'png',
          quality: 1,
          success: (res) => {
            this.setData({
              image: res.tempFilePath
            })
          }
        }, this);
      });
    }
  }
})