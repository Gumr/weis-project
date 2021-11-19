// pages/navBar/navBar.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
  },
  properties: {
    // 显示层级
    zIndex: {
      type: Number,
      value: 100
    },
    // 状态栏样式
    statusStyle: {
      type: String,
      value: ''
    },
    // 导航栏样式
    navBarStyle: {
      type: String,
      value: ''
    },
    // 标题内容
    titleText: String,
    // 标题样式
    titleStyle: {
      type: String,
      value: ''
    },
    // 背景颜色
    background: {
      type: String,
      value: 'rgba(255, 255, 255, 1)'
    },
    // 自定义返回
    preventBack: {
      type: Boolean,
      value: false
    },
    // 返回按钮颜色
    backIconColor: {
      type: String,
      value: 'black'
    },
    // 回到首页图标隐藏
    hideHome: {
      type: Boolean,
      value: false,
    },
    // 回到首页图标
    homeIcon: String,
  },
  attached: function () {
    this.setNavSize();
    this.setStyle();
  },

  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/components/'
  },
  methods: {
    // 导航栏高度 && 页面
    setNavSize: function () {
      const pages = getCurrentPages();
      const tabArr = ['pages/index/index', 'pages/order/order', 'pages/my/my'];
      this.setData({
        statusHeight: app.globalData.statusHeight,
        navHeight: app.globalData.navHeight,
        pages,
        isTabbar: tabArr.includes(pages[0].route),
      });
    },
    // 设置样式
    setStyle: function () {
      var that = this;
      let menuInfo = tt.getMenuButtonBoundingClientRect();//胶囊按钮信息
      let containerStyle = ['background:' + that.data.background].join(';');
      let menuStyle = [
        `width:${menuInfo.width}px`,
        `height:${menuInfo.height}px`,
        `border-radius:${menuInfo.height/2}px`,
        `border: 2rpx solid rgba(233, 233, 233, 0.7);`,
      ].join(';')
      that.setData({
        containerStyle,
        menuStyle
      });
    },
    // 返回事件
    back: function () {
      this.triggerEvent('back', {
        back: 1
      });
      if (this.data.preventBack) {
        return
      }
      tt.navigateBack({
        delta: 1
      });
    },
    // 回到首页
    home() {
      tt.switchTab({
        url: '/pages/index/index'
      });
    },
    // 标题点击
    titleTextTap() {
      this.triggerEvent('titleTextTap');
    },
  }
});