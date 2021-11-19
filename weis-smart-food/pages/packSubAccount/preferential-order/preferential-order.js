// pages/packSubAccount/preferential-order/preferential-order.js
import {
  getStorage
} from '../../../utils/storage';
import day from '../../../libs/day';
import apiRequest from '../../../service/index';
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
      subToken: getStorage('subToken'),
    })
  },

  tap1() {
    if (this.data.subToken) {
      wx.showToast({
        title: '请切换成主账号后进入',
        icon: 'none',
      });
      return
    }
    const now = day().hour() // 用于判断当天是否超过18点
    // 当天不超过18点，默认开始为明天，超过则为后天
    const startDate = now >= 18 ? day().add(2, 'day').format('YYYYMMDD') : day().add(1, 'day').format('YYYYMMDD'),
      endDate = day(startDate).add(5, 'day').format('YYYYMMDD')
    // console.log(startDate, endDate);
    let planState = {
      startDate,
      endDate,
      type: 'multiMeal'
    }
    wx.navigateTo({
      url: `/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=multiMeal&joinRuleOrderOrder=1`,
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('ai-state', planState);
      },
    })
  },

  tap2() {
    if (this.data.subToken) {
      wx.showToast({
        title: '请切换成主账号后进入',
        icon: 'none',
      });
      return
    }
    wx.navigateTo({
      url: '/pages/mineBox/aiFatSetInfo/aiFatSetInfo'
    })
  },

  tap3() {
    if (this.data.subToken) {
      wx.showToast({
        title: '请切换成主账号后进入',
        icon: 'none',
      });
      return
    }
    wx.navigateTo({
      url: '/pages/packageDiscover/riceBall/preRiceBall/preRiceBall'
    })

    // apiRequest.checkUserInRiceBall({}).then((res) => {
    //   if (!res.obj.inRiceBall) { // 未建团
    //     wx.navigateTo({
    //       url: '/pages/packageDiscover/riceBall/preRiceBall/preRiceBall'
    //     })
    //   } else if (res.obj.stt == '99' && res.obj.riceRallRecordInfos.length > 0) { // 过了报名期，饭团人数小于5人时
    //     let riceRallRecordBeans = JSON.stringify(res.obj.riceRallRecordInfos)
    //     wx.navigateTo({
    //       url: `/pages/packageDiscover/riceBall/fail/fail?riceRallRecordBeans=${riceRallRecordBeans}&trrrTrrId=${res.obj.trrrTrrId}`
    //     });
    //   } else {
    //     wx.navigateTo({
    //       url: '/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?trrrTrrId=' + res.obj.trrrTrrId
    //     })
    //   }
    // })
  },

  // 教练点餐
  coach() {
    wx.navigateTo({
      url: '/pages/packSubAccount/coachMeal/coachMeal',
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
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