
import { t, round } from '../../utils/common'

function saleValue(val) {
  return Math.min(val, 1)
}
// pages/packageDatum/components/data-circle-bar/data-circle-bar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value: 'light'
    },
    circleData: Array,
    barData: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageUrl: '',
    bars: []
  },
  ready() {
    this.readied = true;
    // if (this.changed) {
    //   this.drawCircle();
    // }
  },
  observers: {
    circleData(bar) {
      const [value, total] = bar;
      const radio = saleValue(value / total);
      this.setData({
        energyBar: {
          value,
          total,
          percent: radio*100,
          width: radio * 418,
          label: '总能量kcal',
        }
      })
    },
    barData(bar) {
      this.setData({
        bars: bar.map(item => {
          const [value, total] = item.data;
          item.data = [round(value, 2), round(total, 2)]
          const radio = saleValue(value / total);
          item.percent = radio * 100;
          item.height = radio * 140;
          item.lessRed = item.label == '膳食纤维' || item.label == '食物多样性' ? true : false;
          return item;
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    drawCircle() {
      const [value, total] = this.data.circleData;
      const ctx = wx.createCanvasContext('circle', this);

      const percent = Math.ceil(saleValue(value / total) * 100) || 0;
      const radius = t(202) / 2;

      const x = radius;
      const y = radius;
      const startArc = 0;
      const endArc = 2;

      const arcRange = endArc - startArc;

      const excircleWidth = t(14);
      const circleR = radius - Math.ceil(Math.ceil(excircleWidth) / 2);
      ctx.clearRect(0, 0, t(202), t(202));
      ctx.beginPath();
      ctx.arc(x, y, circleR, Math.PI * startArc, Math.PI * endArc)
      ctx.strokeStyle = this.data.mode === 'light' ? '#DEDEDE' : '#474747';
      ctx.lineWidth = t(6);
      ctx.lineCap = 'round'
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(x, y, circleR, Math.PI * (0.5 + startArc), Math.PI * (0.5 + startArc + (arcRange * percent / 100)));
      ctx.strokeStyle = percent >= 100 ? '#FA6400' : '#FCA649';
      ctx.lineWidth = Math.floor(excircleWidth);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.closePath();

      ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: 'circle',
          success: (res) => {
            this.setData({
              imageUrl: res.tempFilePath
            })
          }
        }, this);
      });
    }
  }
})
