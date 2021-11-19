// pages/packageDiscover/onLineFat/onLineReduceFat/onLineReduceFat.js
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
import { onLineCampStatus } from '../../../../utils/map';
import {
  isLoginClick,
} from '../../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onLineCampStatus,
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
    this.queryActivityList()
  },
  // 获取数据
  queryActivityList() {
    apiRequest.queryActivityList().then(res => {
      let activityList = (res.obj.activityList || []).filter((item) => {
        return item.activity.type != '03';
      });

      // let activityList = res.obj.activityList || [];

      activityList.forEach((item)=>{
        item.activity.startTime = day(String(item.activity.startTime).substring(0,8)).format('YYYY/MM/DD');
        item.activity.endTime = day(String(item.activity.endTime).substring(0,8)).format('YYYY/MM/DD')
      })
      this.setData({
        activityList,
      })
    })
  },
  apply() {
    wx.navigateTo({
      url: '/pages/packageDiscover/onLineFat/applyOpen/applyOpen',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });

  },

  fatDetail: isLoginClick(function(e){
    let {index} = e.currentTarget.dataset;
    let activityList = this.data.activityList;
    wx.navigateTo({
      url: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?campId=${activityList[index].camp.campId}&activityId=${activityList[index].activity.activityId}`,
      success: (result) => {
        
      },
      fail: () => { },
      complete: () => { }
    });
  }),

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