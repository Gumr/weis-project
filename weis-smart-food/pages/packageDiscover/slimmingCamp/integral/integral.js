// pages/orderFood/integral/integral.js
const app = getApp();
import requests from "../../../../service/index";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navHeight: wx.getStorageSync('navStatusHeight'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryUserScore(options.campId)
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

  queryUserScore(tacid) {
    requests.queryUserScore({
      tacid
    }).then((res) => {
      let member = res.obj;
      member.memberScoreRecordListResult.forEach((item) => {
        let tmsrCtime = String(item.tmsrCtime);
        item.tmsrCtime = `${tmsrCtime.substring(0, 4)}/${tmsrCtime.substring(4, 6)}/${tmsrCtime.substring(6, 8)} ${tmsrCtime.substring(8, 10)}:${tmsrCtime.substring(10, 12)}`
      })
      member.memberScoreDto.score = member.memberScoreDto.score || 0;
      this.setData({
        member
      })
    }).catch((error) => {

    })
  },

  rule() {
    wx.navigateTo({
      url: '/pages/packageDiscover/slimmingCamp/rule/rule',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
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