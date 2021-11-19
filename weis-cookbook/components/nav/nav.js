// components/mask/mask.js
const app = getApp()
Component({
  // 启用插槽
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    backIcon: {
      type: String,
      value: 'arrow'
    },
    showBackHome: {
      type: Boolean,
      value: false
    },
    showSearch: {
      type: Boolean,
      value: false
    },
    humanInfo: {
      type: Object,
      value: {}
    },
    customBackEvent: {
      type: Boolean,
      value: false
    },
    // 导航栏背景色
    hasBg: {
      type: Boolean,
      value: true
    },
    // 标题颜色
    titleColor: {
      type: String,
      value: "#000000"
    },
    //标题文字
    title: {
      type: String,
      value: ""
    },
    centerFlag: {
      // 安卓状态下，是否把标题居中
      type: Boolean,
      value: true
    },
    navtype: { // true为cover-view, false为view
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: "", // 状态栏高度
    titleBarHeight: "", // 标题栏高度
    navBarHeight: 0, // 导航栏总高度
    showBack: false,
    inputFocus: false,
    inputInfo: '搜菜谱',
    platform: "",
    model: "", //机型
    brand: "",
    system: "",
    navbgcolorFlag: false,
    userInfo: null
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      const that = this,
      pages = getCurrentPages()
      wx.getSystemInfo({
        success(system) {
          let titleBarHeight, model
          let platformReg = /ios/i;
          if (system.model.indexOf("iPhone") !== -1) {
            titleBarHeight = 44;
            model = "iphone";
          } else {
            titleBarHeight = 48;
            model = "android";
          }
          that.setData({
            showBack: pages.length > 1 ? true : false,
            statusBarHeight: system.statusBarHeight,
            platform: system.platform,
            titleBarHeight: titleBarHeight,
            model: model,
            navBarHeight: system.statusBarHeight + titleBarHeight,
            userInfo: app.globalData.userInfo
          })
          app.globalData.navBarHeight = that.data.navBarHeight
          app.globalData.systemInfo = system
        }
      });
      // if (this.data.navBackgroundColor instanceof Array) {
      //   this.setData({
      //     navbgcolorFlag: true
      //   })
      // } else {
      //   this.setData({
      //     navbgcolorFlag: false
      //   })
      // }
    },
    hide: function () { },
    resize: function () { },
  },
  methods: {
    goSearchCook() {
      // this.setData({
      //   //在真机上将焦点给input
      //   inputFocus:true,
      //   inputInfo: ''
      // })
      this.triggerEvent('goSearchCook', {url: '/pages/searchCook/searchCook'})
    },
    onInput(e) {
      const {value} = e.detail
      this.setData({
        inputInfo: value || '搜菜谱'
      })
    },
    toUserInfo() {
      this.triggerEvent('toUserInfo')
    },
    followEvent() {
      if(this.properties.humanInfo.uname === this.data.userInfo.uname) return
      this.triggerEvent('followEvent')
    },
    backEvent() {
      if (!this.properties.customBackEvent) {
        wx.navigateBack()
      } else {
        this.triggerEvent("handleBackEvent", true);
      }
    },
    backHome() {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})