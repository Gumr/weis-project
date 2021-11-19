// pages/packageDiscover/riceBall/establish/establish.js
import {
  getStorage,
} from '../../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showtype: '',
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    const navStatusHeight = getStorage('navStatusHeight')
    this.setData({
      showtype: type,
      navStatusHeight
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
  toestablish() {
    wx.navigateTo({
      url: '/pages/packageDiscover/riceBall/establish/establish'
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
  // onShareAppMessage: function () {

  // }
})