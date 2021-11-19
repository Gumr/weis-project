// pages/openScreen/openScreen.js
const app = getApp();
import {
  isIpx, loginPromise
} from '../../utils/common'
const location = require('../../libs/location.js');
import apiRequest from '../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: 3000,//停留时长 ms
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let time = new Date().getTime();
    this.setData({
      img: isIpx() ? `https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/openScreen-2.png?timestamp=${time}` : `https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/openScreen-1.png?timestamp=${time}`
    })
    this.getLocation();
    loginPromise.then((res) => {
      this.queryTheme();
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

  getLocation() {
    let that = this;
    let time = this.data.time;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        app.globalData.lat = res.latitude;
        app.globalData.lon = res.longitude;
        location.locationMt(res.latitude,res.longitude);
        that.showLine();
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        }, time)
      },
      fail: function (res) {
        that.showLine();
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        }, time)
      }
    })
  },

  showLine(){
    this.setData({
      showPro: true
    })
  },

  queryTheme(){
    let theme = wx.getStorageSync('theme') || '';
    if(!theme){
      apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          let planningType = res.obj && res.obj.healthGoal && res.obj.healthGoal.planningType || '01';
          wx.setStorageSync('theme', planningType == '01' ? 'panel' : 'simple');
        }
      })
    }
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