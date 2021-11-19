// pages/mineBox/forecast/submitStatus/submitStatus.js
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
      status: options.status
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
  // 返回
  back() {
    const pages = getCurrentPages()
    // const prepage = pages.length - 2
    const index = pages.findIndex(
      page => page.route === 'pages/packageDiscover/coach/coachDetail/coachDetail'
    );
    wx.navigateBack({
      delta: pages.length - (index + 1)
    });
  },
  // 提交修改
  submit() {
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packageDiscover/coach/comment/comment'
    );
    const prepage = pages[index];
    //调用上一个页面中的addComment方法
    prepage.addComment()
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