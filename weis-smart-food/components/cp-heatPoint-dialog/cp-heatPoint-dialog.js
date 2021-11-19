// components/heatPoint-dialog/heatPoint-dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    heatList: {
      value: [],
      type: Array
    },
    show: {
      value: false,
      type: Boolean
    },
    selectHpid: {
      value: '',
      type: String || Number
    },
    self: {//是否仅切换自取 默认全能选中
      value: false,
      type: Boolean
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
    select(e) {
      if(this.data.heatList[e.currentTarget.dataset.index].id == this.data.selectHpid){
        return
      }
      this.triggerEvent('select',e.currentTarget.dataset.index);
    },
    close() {
      this.triggerEvent('close');
    },
    phone(e) {
      let phone = e.currentTarget.dataset.phone;
      wx.makePhoneCall({
        phoneNumber: String(phone),
      });
    },
    goMap(e) {
      wx.openLocation({
        latitude: Number(e.currentTarget.dataset.lat),
        longitude: Number(e.currentTarget.dataset.lon),
        scale: 18,
        name: e.currentTarget.dataset.name,
        address: e.currentTarget.dataset.address,
      });
    },
  }
})
