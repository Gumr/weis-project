import { getRect } from '../../utils/common'

// components/fixed-button/fixed-button.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    backgroundColor: {
      value: '#fff',
      type: String
    },
    zIndex: {
      value: 1,
      type: Number
    },
    disabled: {
      value: false,
      type: Boolean
    },
    buttonHeight: {
      value: 0,
      type: Number
    },
    radius: {
      value: true,
      type: Boolean
    },
    useSlot: {
      value: false,
      type: Boolean
    },
    customStyle: String
    // shadow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  ready() {
    this.setData({
      isIpx: getApp().globalData.isIpx
    }, () => {
      getRect.call(this, '.fixed-button')
        .then((rect) => {
          if (rect) {
            this.setData({
              buttonHeight: rect.height
            })
          }
        })
    })


  },
  /**
   * 组件的方法列表
   */
  methods: {
    buttonTap() {
      if (this.data.disabled) return;
      this.triggerEvent('on-tap')
    }
  }
})
