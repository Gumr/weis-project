// pages/mineBox/mineActive/mineActive.js
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
import {
  campStatus,
  onLineCampStatus
} from '../../../../utils/map';
//type 02 企业减脂营 type 01 线上减脂营
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // selectTab: 0,
    campStatus, //企业减脂营
    onLineCampStatus, //线上减脂营
    list: [],
    activityList: [
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.queryList()

  },
  detail(e) {
    let trrrTrrId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?trrrTrrId=' + trrrTrrId +'&trrtype=true'
    })

  },
  queryList() {
    apiRequest.queryMyRiceBallRecord().then(res => {
      const data = res.errCode === 0 ? res.obj.riceRallRecordInfoList : [];
      const activityList = data.map(item => {
        const sTime = String(item.reportTime).substring(4, 6) + '月' + String(item.reportTime).substring(6, 8) + '日';
        const eTime = String(item.reportTime).substring(13, 15) + '月' + String(item.reportTime).substring(15, 18) + '日'
        item.date = sTime + '-' + eTime
        return item
      })
      this.setData({
        activityList
      })
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});