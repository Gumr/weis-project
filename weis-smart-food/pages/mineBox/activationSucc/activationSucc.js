// pages/mineBox/activationSucc/activationSucc.js
import {round} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    queryCapitalFlows: [],
    succType: 'activationCard'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rechargeAmount: options.rechargeAmount,
      donationAmount: options.donationAmount || 0,
      price: round((Number(options.rechargeAmount) + (Number(options.donationAmount) || 0)),2),
      succType: options.succType || this.data.succType,
      phone: options.phone || '',
      uname: options.uname || '',
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

  back(){
    const pages = getCurrentPages();
    if(pages.length == 1){
      wx.switchTab({
        url: '/pages/index/index',
      });
      return
    }
    wx.navigateBack({
      delta: 1
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
    
  }
})