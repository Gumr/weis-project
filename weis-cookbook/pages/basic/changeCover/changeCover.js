// pages/basic/changeCover/changeCover.js
let startx = 0, movex = 0, tranx = 0, currentindex = 0, paddingValue = 0, offsetLeft = 0, distance = 0
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoFrameImg: [],
    tranx: 0,
    systemInfo: {},
    selectedImg: '',
    currentindex : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      videoFrameImg: wx.getStorageSync('videoFrameImg'),
      systemInfo: app.globalData.systemInfo,
      selectedImg: wx.getStorageSync('videoFrameImg')[0]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    const areaWidth = await this.calcWidth('.imgs')
    const iconWidth = await this.calcWidth('.icon')
    this.$areaWidth = areaWidth
    this.$iconWidth = iconWidth
    this.$areaWidth -= this.$iconWidth
    paddingValue = (app.globalData.systemInfo.windowWidth - areaWidth) / 2
    this.$areaWidth += paddingValue
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  touchstart(e) {
    const {offsetLeft} = e.currentTarget
    startx = offsetLeft + this.$iconWidth / 2
  },
  touchmove(e) {
    const {videoFrameImg} = this.data
    movex = e.touches[0].pageX
    tranx = movex - (paddingValue + this.$iconWidth / 2)
    tranx = tranx < paddingValue ? 0 : tranx > this.$areaWidth ? this.$areaWidth : tranx
    currentindex = Math.floor(tranx / this.$areaWidth * this.data.videoFrameImg.length - 1)
    currentindex = currentindex < 0 ? 0 : currentindex > this.data.videoFrameImg.length - 1 ? this.data.videoFrameImg.length - 1 : currentindex
    this.setData({
      tranx,
      currentindex,
      selectedImg: videoFrameImg[currentindex]
    })
  },
  touchend(e) {
    
  },
  cancel() {
    wx.navigateBack()
  },
  selectCover() {
    const pages = getCurrentPages();
    const prePage = pages[pages.length - 2]
    prePage.setData({
      ['cookCover.trCoverImageUrl']: this.data.selectedImg
    }, () => {
      wx.navigateBack()
    })
  },
  calcWidth(obj) {
    return new Promise((resolve, reject) => {
      let query = wx.createSelectorQuery()
      query.select(obj).boundingClientRect()
      query.exec((res) => {
        resolve(res[0].width)
      })
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