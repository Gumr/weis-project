// components/cp-bottom-share/cp-bottom-share.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 微信好友
    wechat() {
      this.setData({
        show: false
      })
      this.triggerEvent('on-wechat')
    },
    // 保存海报分享
    poster() {
      this.triggerEvent('on-poster')
    }
  }
})
