// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\payStatus\payStatus\payStatus.js
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/index/',
  },
  onLoad: function (options) {
    this.tradeNo=options.tradeNo;
    this.dayNum=options.dayNum;
    this.mealNum=options.mealNum;
    this.tdpId=options.tdpId;
    this.setData({
      status: options.status || 0,
    })
  },
  // 重新购买
  submit() {
    tt.navigateBack({
      delta: 1
    });
  },
  // 返回
  back() {
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packOne/goodsDetail/goodsDetail'
    );
    tt.navigateBack({
      delta: pages.length - (index + 1)
    });
  },
  //去核销
  tapWriteOff(e){
    tt.navigateTo({
      url: `/pages/packTwo/writeOff/writeOff?tradeNo=${this.tradeNo}&tdpId=${this.tdpId}&dayNum=${this.dayNum}&mealNum=${this.mealNum}`, // 指定页面的 url
    });
  },
  //查看订单
  tapOrder(e){
    tt.navigateTo({
      url: `/pages/packTwo/orderInfo/orderInfo?tradeNo=${this.tradeNo}`, // 指定页面的 url
    });
  },
  // 导航栏-返回
  barBack() {
    tt.switchTab({
      url: '/pages/index/index',
    });
  },
})