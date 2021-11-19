// pages/mineBox/couponRule/couponRule.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let lastPage = getCurrentPages()[getCurrentPages().length - 2];
    let index = options.index;
    this.setData({
      typeValue: options.typeValue || 0,
    })
    if(this.data.typeValue == 0) {
      this.setData({
        coupon: lastPage.data.couponUserVos[index]
      })
      return
    }
    if(this.data.typeValue == 1) {
      this.setData({
        redPacket: lastPage.data.redPacketList[index]
      })
      return
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // use: function () {
  //   wx.navigateTo({
  //     url: '/pages/index/index',
  //   });
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})