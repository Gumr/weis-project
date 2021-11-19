// pages/packageDiscover/onLineFat/checkCampNum/checkCampNum.js
import apiRequest from '../../../../service/index'
import day from '../../../../libs/day';
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
      campId: options.campId,
      activityId: options.activityId
    })
    this.init()
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

  init(){
    apiRequest.queryCampUserList({
      campId: this.data.campId,
      activityId: this.data.activityId
    }).then((res)=>{
      let userList = res.obj.userList || [];
      userList.forEach((item)=>{
        item.stime = day(item.stime).format('MM月DD日')
      })
      this.setData({
        userList,
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