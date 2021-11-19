
import requests from '../../../service/index'
// pages/mineBox/todayJoin/todayJoin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map: {
      '00': 0,
      '01': 0,
      '02': 0,
      '03': 0
    }
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
    if (this.params) {
      this.getMap()
      return
    }
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('data', (params) => {
      this.params = params
      this.getMap()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  getMap() {
    requests.queryUserGroupCorpScore(this.params).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          map: {
            ...this.data.map,
            ...res.obj.partakeMap
          }
        })
      }
    })
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

  },
  orderTap() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  cardTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/dietCard/dietCard'
    })
  },
})