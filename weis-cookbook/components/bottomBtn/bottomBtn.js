// components/bottomBtn/bottomBtn.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: ''
    },
    isDisabled: {
      type: Boolean,
      value: true
    },
    isFixed: {
      type: Boolean,
      value: true
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
    tapEvent() {
      // if(this.data.isDisabled) return
      this.triggerEvent('uploadEvent')
    }
  }
})
