// components/cp-payment-status/cp-payment-status.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Object
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
    // 返回
    back() {
      this.triggerEvent('on-back')
    },
    // 成功-第二按钮（查看明细）
    detail() {
      this.triggerEvent('on-detail')
    },
    // 失败-第二按钮（重新提交）
    submit() {
      this.triggerEvent('on-submit')
    },
  }
})
