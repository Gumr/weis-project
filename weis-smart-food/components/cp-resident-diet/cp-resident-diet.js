// components/cp-resident-diet/cp-resident-diet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    data: {
      type: Object,
      value: {}
    }
  },
  observers: {
    data(data) {
      if(!data) {
        return
      }
      this.setData({
        param: data,
        intake: [
            {
              name: '每日所需能量',
              value: data.intake.total,
              dw: 'kcal'
            },
            {
              name: '碳水',
              value: data.intake.resultCarbohydrateWeight,
              dw: 'g'
            },
            {
              name: '蛋白质',
              value: data.intake.resultProteinWeight,
              dw: 'g'
            },
            {
              name: '脂肪',
              value: data.intake.resultFatWeight,
              dw: 'g'
            }
          ]
      })
    },
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
    cancelTap() {
      this.setData({
        show: false
      })
    }
  }
})
