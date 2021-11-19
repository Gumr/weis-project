// components/cp-control-sugar/cp-control-sugar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      type: String,
      value: 'sugar'
    },
    show: {
      type: Boolean,
      value: false
    },
    showClose: {
      type: Boolean,
      value: false
    },
    title: String,
  },
  /**
   * 组件的初始数据
   */
  data: {
    // ---血糖值&主食---
    sugarList: [{
        name: '4-7.8',
        title: 'mmol/L',
        value: '1'
      },
      {
        name: '7.9-11.1',
        title: 'mmol/L',
        value: '2'
      },
      {
        name: '大于11.1',
        title: 'mmol/L',
        value: '3'
      }
    ],
    sugarSelect: '',
    sugarValue: '',

    foodList: [{
        name: '1碗',
        title: '',
        value: '1'
      },
      {
        name: '1.5碗',
        title: '',
        value: '1.5'
      },
      {
        name: '2碗',
        title: '',
        value: '2'
      },
      {
        name: '2碗以上',
        title: '',
        value: '100'
      }
    ],
    foodSelect: '',
    foodValue: '',
    // ---你的怀孕周期---
    pregnantList: [
      {
        name: '孕早期',
        title: '(1-13周)',
        value: '01'
      },
      {
        name: '孕中期',
        title: '(14-27周)',
        value: '02'
      },
      {
        name: '孕晚期',
        title: '(28周及以后)',
        value: '03'
      },
    ],
    pregnantSelect: '',
    pregnantValue: '',
    // ---你的肾病是第几期---
    kidneyList: [
      {
        name:"肾病1期",
        value:"01"
      },
      {
        name:"肾病2期",
        value:"02"
      },
      {
        name:"肾病3期",
        value:"03"
      },
      {
        name:"肾病4期",
        value:"04"
      },
      {
        name:"肾病5期",
        value:"05"
      },
      {
        name:"血液透析与\n腹膜透析",
        value:"06"
      },
      {
        name:"合并高分解\n代谢疾病",
        value:"07"
      }
    ],
    kidneySelect: '',
    kidneyValue: '',

    btnSelected: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 血糖值
    sugarSelect: function (e) {
      this.setData({
        sugarSelect: e.currentTarget.dataset.index,
        sugarValue: e.currentTarget.dataset.value,
        btnSelected: this.data.foodValue && e.currentTarget.dataset.value
      });
    },
    // 主食
    foodSelect: function (e) {
      this.setData({
        foodSelect: e.currentTarget.dataset.index,
        foodValue: e.currentTarget.dataset.value,
        btnSelected: this.data.sugarValue && e.currentTarget.dataset.value
      });
    },
    // 你的怀孕周期
    pregnantSelect(e) {
      this.setData({
        pregnantSelect: e.currentTarget.dataset.index,
        pregnantValue: e.currentTarget.dataset.value,
        btnSelected: e.currentTarget.dataset.value
      });
    },
    // 你的肾病是第几期
    kidneySelect(e) {
      this.setData({
        kidneySelect: e.currentTarget.dataset.index,
        kidneyValue: e.currentTarget.dataset.value,
        btnSelected: e.currentTarget.dataset.value
      });
    },
    // 确定
    sugarConfirmDialog() {
      this.setData({
        show: false
      })
      this.triggerEvent('on-confirm', {
        value: this.data.from == 'sugar'?{
          from: this.data.from,
          sugarValue: this.data.sugarValue,
          foodValue: this.data.foodValue
        }: this.data.from == 'pregnant'?{
          from: this.data.from,
          pregnantValue: this.data.pregnantValue
        }: this.data.from == 'kidney'? {
          from: this.data.from,
          kidneyValue: this.data.kidneyValue
        }: {}
      })
    },
    // 关闭
    sugarCancelDialog() {
      this.setData({
        show: false
      })
      this.triggerEvent('on-cancel');
    }
  }
})
