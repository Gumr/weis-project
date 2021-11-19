Component({
  externalClasses: ['i-class'],

  properties: {
    loading: {
      type: Boolean,
      value: true
    },
    tip: {
      type: String,
      value: '无更多数据'
    },
    loadingTip: {
      type: String,
      value: '正在加载'
    }
  }
});
