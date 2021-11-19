// components/stepSelect/stepSelect.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    active: {
      type: Number,
      value: 0
    },
    steps: {
      type: Array,
      value: []
    },
    barStyle: {
      type: String,
      value: ''
    }
  },
  observers: {
    active() {
      const index = this.data.steps.findIndex(
        item => item.value === this.data.active
      );
      if (index !== this.data.activeIndex) {
        this.setData({
          activeIndex: index
        });
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    activeIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    stepTap(evt) {
      this.triggerEvent('on-change', {
        value: evt.currentTarget.dataset.value
      });
    },
    stepBarTap(evt) {
      const { index } = evt.currentTarget.dataset;

      const item = this.data.steps[index + 1];
      this.triggerEvent('on-change', {
        value: item.value
      });
    }
  }
});
