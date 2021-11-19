// components/cp-ruler/cp-ruler.js
import tool from "../../libs/tool";;
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number,
      value: 0
    },
    max: {
      type: Number,
      value: 10
    },
    value: {
      type: Number,
      value: 0
    },
    scrollWidth: {
      type: Number,
      value: 548,//水平滚动宽度
    },
    scrollHeight: {
      type: Number,
      value: 400,//垂直滚动高度
    },
    scrollType: {
      type: String,
      value: 'level'
    },
  },

  observers: {
    min() {
      this.toView();
      console.log('min')
    },
    // max() {
    //   this.toView();
    // },
    value(data) {
      this.toView();
      console.log('value')
    }
  },

  attached(){
    
  },

  ready(){
    this.setData({
      firstTo: true,
    })
    console.log('ready')
    setTimeout(() => {
      this.toView();
    }, 200);
  },

  /**
   * 组件的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    start(e){
      this.setData({
        scrollKind: 'scroll'
      })
    },

    scrollHandler: tool.debounce(function(data) {
      console.log(data[0])
      console.log(this.data.scrollKind)
      const e = data[0];
      if(this.data.scrollKind == 'data'){
        return
      }
      let scrollType = this.data.scrollType;
      const scrollLeft = Math.ceil(scrollType == 'level' ? e.detail.scrollLeft : e.detail.scrollTop);
      const elMargin = 4; //刻度之间距离
      const elWidth = 1; //刻度宽度
      const px2rpx = this.data.px2rpx;
      // 用当前距离left的滑动距离/间隔宽度 就是当前四舍五入后要对应的数据index
      const current = Math.floor(scrollLeft / (elMargin + elWidth));
      let value = current + this.data.min;
      console.log(value)
      this.setData({
        scrollStatus: true
      })
      this.triggerEvent('change', { value });
    },100),

    toView() {
      const {value, min,} = this.data;
      if(value < min){
        return
      }
      if(this.data.scrollStatus){
        this.setData({
          scrollStatus: false,
        })
        return
      }
      const elMargin = 4; //刻度之间距离
      const elWidth = 1; //刻度宽度
      const scrollLeft = elMargin * (value - min) + elWidth * (value - min);
      setTimeout(()=>{
        this.setData({
          scrollLeft: `${scrollLeft}`,
          scrollKind: 'data'
        });
        console.log(scrollLeft)
      },200)
    },
  }

})
