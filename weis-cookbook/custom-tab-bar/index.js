const app = getApp()

Component({
  data: {
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/images/tabbar/home.png",
      selectedIconPath: "/images/tabbar/home_a.png",
      text: "首页"
    }, {
      pagePath: "/pages/createCook/createCook",
      iconPath: "/images/tabbar/add.png",
      selectedIconPath: "/images/tabbar/add.png",
      text: ""
    }, {
      pagePath: "/pages/userCenter/userCenter",
      iconPath: "/images/tabbar/mine.png",
      selectedIconPath: "/images/tabbar/mine_a.png",
      text: "我"
    }],
    selected: 0,
    color: "#000",
    selectedColor: "#000",
    isFullScreen: false,
    collectterm: null,
    handleEnd: false, // 当前页面瀑布流是否处理完毕
  },
  attached() {
    this.setData({
      isFullScreen: app.globalData.isFullScreen
    })
  },
  methods: {
    switchTab(e) {
      const {path, index} = e.currentTarget.dataset
      if(index === 1) {
        app.checkLogin(() => {
          wx.navigateTo({
            url: path
          })
        })
      } else {
        wx.switchTab({
          url: path
        })
      }
    }
  }
})