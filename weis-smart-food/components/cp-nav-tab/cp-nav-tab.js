// components/cp-nav-tab/cp-nav-tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // tab数据
    data: {
      type: Array,
      value: [],
    },
    // 选中tab
    currentTab: {
      type: String,
      value: ''
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
    tabChange(e) {
      const currentTab = e.currentTarget.dataset.value;
      this.setData({
        currentTab
      })
      this.triggerEvent('on-change', { value: currentTab })
    },
  }
});