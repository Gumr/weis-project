// components/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      default: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputFn(e) {
      const {value} = e.detail
      this.setData({
        inputValue: value
      })
    },
    clearFn() {
      this.setData({
        inputValue: ''
      })
    },
    searchFn() {
      this.triggerEvent('searchFn', this.data.inputValue)
    }
  }
})
