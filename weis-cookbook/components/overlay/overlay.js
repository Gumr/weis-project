// components/mask/mask.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    opacity: {
      type: Number,
      value: .4,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bg: ''
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
     this.setData({
       bg: `background: rgba(0, 0, 0, ${this.data.opacity})`
     })
    },
    hide: function () { },
    resize: function () { },
  },
  methods: {
    handleClick() {
      this.triggerEvent('hideEvent', false)
    }
  }
})