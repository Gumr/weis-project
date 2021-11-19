// components/confirm-dialog/confirm-dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    confirmDisabled: {
      type: Boolean,
      value: false
    },
    title: String,
    cancelText: {
      type: null,
      value: '取消'
    },
    confirmText: {
      type: null,
      value: '确认'
    },
    autoCancel: {
      type: Boolean,
      value: true
    },
    autoConfirm: {
      type: Boolean,
      value: false
    },
    showClose: {
      type: Boolean,
      value: false
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    showConfirm: {
      type: Boolean,
      value: true
    },
    dialogStyle: String,
    cancelStyle: String,
    confirmStyle: String,
    titleStyle: String,
    leftClose: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},
  lifetimes: {
    attached: function () {
      // console.log('kkk');
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    cancelTap() {
      if (this.data.autoCancel) {
        this.setData({
          show: false
        });
      }

      this.triggerEvent('on-cancel');
    },
    confirmTap(evt) {
      if (evt.currentTarget.dataset.disabled) return;
      if (this.data.autoConfirm) {
        this.setData({
          show: false
        })
      }
      this.triggerEvent('on-confirm');
    }
  }
});
