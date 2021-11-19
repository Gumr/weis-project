// components/dispatch-select-popup/dispatch-select-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    show(value) {
      if (value) {
        this.updateBtnDisabled()
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isIpx: false,
    btnDisabled: true,
    selected: {
      time: '00',
      mode: '00'
    },
    dispatchTimes: [
      {
        text: '每餐',
        plain: '餐餐配送',
        value: '00'
      },
      {
        text: '每日',
        plain: '当日全部餐食仅配送一次',
        value: '01',
        disabled: false,
      }
    ],
    dispatchModes: [
      {
        text: '热食配送',
        disables: ['01'], // 数组内的值 表示这个选项在配送方式为01的情况下 要被禁用
        value: '00',
        disabled: false
      },
      {
        text: '冷链配送',
        plain: '冷链保鲜袋收费2.5元/个',
        value: '01',
        disabled: false
      },
      {
        text: '热食自取',
        disables: ['01'],
        value: '02',
        disabled: false
      },
      {
        text: '冷链自取',
        value: '03',
        disabled: false
      },
    ]
  },
  ready() {
    this.setData({
      isIpx: getApp().globalData.isIpx
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    updateDispatchMode() {
      let { time, mode } = this.data.selected;
      const { dispatchModes, selfTaking } = this.data;

      dispatchModes.forEach((item) => {
        item.disabled = item.disables // mode 有disables 则跟当前的time匹配 如果匹配成功代表这个选项要被禁用
          ? item.disables.includes(time)
          : false;
        item.show = selfTaking === 1 && (item.value == '00' || item.value == '01') ? false : (selfTaking === 0 && (item.value == '02' || item.value == '03') ? false : true)   
      })

      const currenMode = dispatchModes.find(item => item.value === mode) // 找到当前选中的mode

      this.setData({
        dispatchModes,
        'selected.mode': (currenMode && currenMode.disabled) ? '' : mode  // 当前选中的mode disable为true表示不能被选 则删除选中值
      })
    },
    dispatch(time, mode, unable, selfTaking) {
      const setData = {};
      setData['selected.time'] = time || ''
      setData['selected.mode'] = mode || ''
      setData.show = true;
      setData.selfTaking = selfTaking;
      if (unable) {
        setData['dispatchTimes[1].disabled'] = true
      } else {
        setData['dispatchTimes[1].disabled'] = false
      }
      this.setData(setData, () => {
        this.updateDispatchMode()
      })
    },
    closeTap() {
      this.setData({
        show: false
      })
      this.triggerEvent('on-close')
    },
    confirmTap() {
      if (this.data.btnDisabled) return;
      this.triggerEvent('on-confirm', {
        ...this.data.selected,
        callback: () => {
          this.setData({
            show: false
          })
        }
      })
    },
    timeMenuTap(evt) {
      const { value, disabled } = evt.currentTarget.dataset;
      if (disabled) return;
      this.setData({
        'selected.time': value
      }, () => {
        this.updateDispatchMode();
        this.updateBtnDisabled();
      })
    },
    updateBtnDisabled() {
      const { selected } = this.data;

      this.setData({
        btnDisabled: (!selected.time) || (!selected.mode)
      })
    },
    modeMenuTap(evt) {
      const { value, disabled } = evt.currentTarget.dataset;
      if (disabled) return;

      this.setData({
        'selected.mode': value
      }, () => {
        this.updateBtnDisabled();
      })
    },
  }
})
