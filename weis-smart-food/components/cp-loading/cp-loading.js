// components/cp-loading/cp-loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    duration: {
      type: Number,
      value: 2000
    }
  },
  observers: {
    show(val) {
      if (val) {
        setTimeout(() => {
          this.triggerEvent('on-end')
          this.setData({
            show: false
          })
        }, this.data.duration)
      }
    }
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

  }
})
