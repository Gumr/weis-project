import { t } from '../../utils/common'
// components/cp-switch/cp-switch.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: [Boolean, String, Number],
      value: false,
      observer: function(val) {
        const { status, activeValue } = this.data;
        const st = val === activeValue;
        if (st === status) return;
  
        this.setData({
          status: st
        })
      }
    },
    activeValue: {
      type: [Boolean, String, Number],
      value: true
    },
    inactiveValue: {
      type: [Boolean, String, Number],
      value: false
    },
    async: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    status: false,
    loading: false,
    loadingSize: t(22),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleLoading(status) {
      this.setData({
        loading: status,
        status
      })
    },
    toggle() {
      const { value, activeValue, inactiveValue, status } = this.data;
      const val = value === activeValue ? inactiveValue : activeValue;

      const event = { value: val };

      if (this.data.async) {
        this.setData({
          loading: true,
          status: !status
        })
        event.done = (state = true) => {
          if (state) {
            this.setData({
              loading: false,
              value: val
            })
          } else {
            this.setData({
              loading: false,
              status
            });
          }
        }
      } else {
        this.setData({
          value: val
        })
      }
      this.triggerEvent('on-change', event)

    }
  }
})
