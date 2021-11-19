// pages/packageDiscover/riceBall/establish/establish.js
import {
  getStorage,
} from '../../../../utils/storage'
import apiRequest from '../../../../service/index'
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
    let riceRallRecordBeans = JSON.parse(options.riceRallRecordBeans)
    this.setData({
      riceRallRecordBeans:riceRallRecordBeans,
      trrrTrrId:options.trrrTrrId
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
  torules() {   
    apiRequest.cancelRiceBall({ 
      trrrTrrId: this.data.trrrTrrId,
    }).then((res) => {
      if (res.errCode == 0) {
        wx.redirectTo({
          url: '/pages/packageDiscover/riceBall/rules/rules'
        })     
      }
    })


  
  },
  toJoins() {
    wx.navigateTo({
      url: `/pages/packageDiscover/riceBall/myGroupUser/myGroupUser?riceRallRecordBeans=${JSON.stringify(this.data.riceRallRecordBeans)}&type=true`,
    });


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