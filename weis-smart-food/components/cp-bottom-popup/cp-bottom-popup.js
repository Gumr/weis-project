// components/cp-bottom-popup/cp-bottom-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    // 是否需要自定义弹窗的显示隐藏
    showCustom: {
      type: Boolean,
      value: false
    },
    show: {
      type: Boolean,
      value: false
    },
    // 默认选中值
    val: {
      type: Array,
      value: [0]
    },
    // 选项数据
    data: {
      type: Array,
      value: [],
    },
    // 单位（不传不显示）
    dw: {
      type: String,
      value: ''
    },
    // 单位样式覆盖
    dwStyleCustom: String,
    // 选项2数据
    data2: {
      type: Array,
      value: []
    },
    // 单位2（不传不显示）
    dw2: {
      type: String,
      value: ''
    },
    zIndex: {
      type: Number,
      value: 100
    },
    useSlot: {
      type: Boolean,
      value: false
    },
    showButton: {
      type: Boolean,
      value: true
    },
    useSlot: {
      type: Boolean,
      value: false
    },
    confirmDisabled: {
      type: Boolean,
      value: false
    },
    confirmStyle: String,
    confirmText: {
      type: String,
      value: '确定'
    },
    showClose: {
      type: Boolean,
      value: true
    },
    closeImg: {
      type: String,
      value: '/images/icon_down.png'
    },
    // 关闭自定义
    closeCustom: {
      type: Boolean,
      value: false
    },
    customStylePopup: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  observers: {

  },

  ready() {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 改变
    change(e) {
      const val = e.detail.value;
      this.setData({
        val
      })
      this.triggerEvent('on-change', {
        value: val
      })
    },
    // 确定
    confirm(e) {
      if (e.currentTarget.dataset.disabled) return;

      this.setData({
        show: this.data.showCustom ? this.data.show : false
      })
      this.triggerEvent('on-confirm', {
        value: this.data.val
      })
    },
    // 关闭
    close() {
      this.setData({
        show: this.data.closeCustom ? this.data.show : false
      })
      this.triggerEvent('on-close')
    }
  }
})