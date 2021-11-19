// components/cp-cart/cp-cart.js
Component({
  /**
   * 组件的属性列表
   */
   properties: {
    price: Number,
    piece: Number,
    styleNum: {
      type: Number,
      value: 1,
    },
    confirmText: {
      type: String,
      value: '选好了',
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
    toPay() {
      this.triggerEvent('pay')
    },
    showCart() {
      this.triggerEvent('tapCart')
    },
  }
})
