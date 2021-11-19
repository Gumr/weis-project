// pages/mineBox/joinUs/index.js
import apiRequest from '../../../service/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Allcompany: []
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
    this.QueryBusiness()

  },
  //查询是否加入团餐
  QueryBusiness() {
    apiRequest.userQueryBusiness({
    }).then((res) => {
      this.setData({
        Allcompany: res.obj.groupCorpList
      })
    })
  },
  previewImage: function (e) {

    var current = e.target.dataset.src; //这里获取到的是一张本地的图片
    wx.previewImage({
      current: current, //需要预览的图片链接列表
      urls: [current] //当前显示图片的链接
    })
  },
  copyWechat() {

    wx.setClipboardData({
      data: '13926059073',
      success: function (res) {
        // wx.getClipboardData({
        //   success: function (res) {
        wx.showToast({
          title: '复制成功'
        })
        //   }
        // })
      }
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