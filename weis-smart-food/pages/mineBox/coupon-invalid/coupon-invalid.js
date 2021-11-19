// pages/mineBox/coupon/coupon.js
const app = getApp();
import apiRequest from '../../../service/index';
const util = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  01:已激活,02:已绑定,03:已兑换/已使用,04:已失效 后端卡券状态
    status: {
      '00': '未开始',
      '01': '正常',
      '02': '即将过期',
      '03': '已过期',
      '04': '已使用',
      '05': '卡券正常，不满足消费金额'
    },
    IMG_URL: app.globalData.IMG_URL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      typeValue: options.typeValue
    })
    if(options.typeValue == 0) {
      this.queryCouponList()
      return
    }
    if(options.typeValue == 1) {
      this.queryRedPacketByUser()
      return
    }
    // this.setData({
    //   price: options.price ? options.price : ''
    // }, () => {
    //   this.init()
    // })
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

  // 优惠券
  queryCouponList: function () {
    var that = this;
    apiRequest.queryCouponList({
      stt: '04',//已失效
    })
      .then(res => {
        let currentDate = new Date().getTime();
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : []

        couponUserVos.forEach((item, index) => {
          item.sTime = util.dateUtil.format(new Date(Number(item.tcuStime)), 'Y.M.D');
          item.eTime = util.dateUtil.format(new Date(Number(item.tcuEtime)), 'Y.M.D');
          item.tcaIntro = item.tcaIntro.split(';');
          item.tcuAmount = Number(item.tcuAmount)
          if (currentDate > item.tcuEtime) {
            item.status = '03'//已过期
          }
        })
        // 只显示 - 已过期
        that.setData({
          couponUserVos: couponUserVos.filter((item) => {return item.status == '03'})
        })
      })
      .catch(error => {

      })
  },
  // 红包
  queryRedPacketByUser: function () {
    var that = this;
    apiRequest.queryRedPacketByUser({
      stt: '03',//已失效
    })
      .then(res => {
        let currentDate = new Date().getTime();
        let redPacketList = res.obj.redPacketList ? res.obj.redPacketList : []

        redPacketList.forEach((item, index) => {
          item.sTime = util.dateUtil.format(new Date(Number(item.stime)), 'Y.M.D');
          item.eTime = util.dateUtil.format(new Date(Number(item.etime)), 'Y.M.D');
        })
        // 只显示 - 已过期
        that.setData({
          // redPacketList: redPacketList.filter((item) => {return item.stt == '03'})
          redPacketList
        })
      })
      .catch(error => {

      })
  },
  // 使用规则
  use: function (e) {
    let { index, } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mineBox/couponRule/couponRule?index=${index}&typeValue=${this.data.typeValue}`,
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