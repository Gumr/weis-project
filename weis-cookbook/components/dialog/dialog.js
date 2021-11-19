// components/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tip: {
      type: String,
      value: ''
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmText: {
      type: String,
      value: '删除'
    },
    dialogFlag: {
      type: Boolean,
      value: false
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
    cancelEvent() {
      this.triggerEvent('cancelEvent')
    },
    confirmEvent() {
      this.triggerEvent('confirmEvent')
    }
  }
})
