const app = getApp()

Component({
  data: {
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/images/icon-1.png",
      selectedIconPath: "/images/icon-active-1.png",
      text: "首页"
    }, {
      pagePath: "/pages/discover/discover",
      iconPath: "/images/icon-2.png",
      selectedIconPath: "/images/icon-active-2.png",
      text: "发现"
    }, {
      pagePath: "/pages/datum/datum",
      iconPath: "/images/icon-3.png",
      selectedIconPath: "/images/icon-active-3.png",
      text: "数据"
    }, {
      pagePath: "/pages/my/my",
      iconPath: "/images/icon-4.png",
      selectedIconPath: "/images/icon-active-4.png",
      text: "我的"
    }],
    selected: 0,
    color: "#000",
    selectedColor: "#000",
    isIpx: true,
    collectterm: null,
    handleEnd: false, // 当前页面瀑布流是否处理完毕
    showTabbar: true,
    uncheck: false // 是否有未读
  },
  attached() {
    this.setData({
      isIpx: app.globalData.isIpx
    }, () => {
      // this.calcTabbarHeight()
    })
  },
  methods: {
    switchTab(e) {
      const { url } = e.currentTarget.dataset
      wx.switchTab({
        url
      })
    },
    calcTabbarHeight() {
      const that = this
      const query = wx.createSelectorQuery().in(this)
      query.select('.tab-bar-container').boundingClientRect(rect => {
        that.setData({
          height: rect.height
        })
      }).exec()
    }
  }
})