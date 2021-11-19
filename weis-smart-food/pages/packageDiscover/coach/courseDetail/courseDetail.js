// pages/packageDiscover/coach/courseDetail/courseDetail.js
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
    this.setData({
      detail: JSON.parse(options.detail),
      coach: JSON.parse(options.coach),
    })
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
  // 复制微信
  copyCode() {
    const { coach } = this.data;
    if(!coach.wechat){
      return
    }
    wx.setClipboardData({
      data: coach.wechat,
      success: function (res) {
        wx.showToast({
          title: '微信已复制'
        })
      }
    })
  },
  // 拨打
  call() {
    const { coach } = this.data;
    if(!coach.phone){
      return
    }
    this.setData({
      showCall: true
    })
  },
  // 确定拨打
  sureCall() {
    const { coach } = this.data;
    wx.makePhoneCall({
      phoneNumber: coach.phone + '',
    }).catch((e) => {
      // console.log(e)  //用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })
  },
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