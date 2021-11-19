// pages/basic/uploadVideo/uploadVideo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: {},
    url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.onLoad()
  },
  getMessage(e) {
    const {data: [{videoPath, videoFrameImg, lhRatio}]} = e.detail
    const pages = getCurrentPages()
    const prePage = pages[pages.length -2]
    prePage.setData({
      ['cookCover.trCoverImageUrl']: videoFrameImg[0],
      videoFrameImg: videoFrameImg,
      videoPath: videoPath,
      lhRatio: lhRatio
    })
    console.log(videoFrameImg);
    // this.setData({
    //   message: data
    // })
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