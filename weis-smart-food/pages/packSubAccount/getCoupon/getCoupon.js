// pages/packSubAccount/getCoupon/getCoupon.js
import {round,} from '../../../utils/common'
const app = getApp();
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  isLoginClick,
} from '../../../utils/common'
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
      code: options.code || '00001'
    })
    this.init()
  },

  init: function () {
    var that = this;
    const {code} = this.data;
    apiRequest.queryActivityCoupon({
      code,
    })
      .then(res => {
        let couponUserVos = res.obj.coupon || [];
        couponUserVos.forEach((item)=>{
          item.sTime = day(Number(item.tcuStime)).format('YYYY.MM.DD HH:mm');
          item.eTime = day(Number(item.tcuEtime)).format('YYYY.MM.DD HH:mm');
          item.tcuAmount = round(item.tcuAmount,0);
          item.tcaIntro = item.tcaIntro.split(';');
        })
        this.setData({
          couponUserVos
        })
      })
      .catch(error => {

      })
  },

  receive: isLoginClick(function (e) {
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s',],
      success(res) {
        that.getActivityCoupon(e)
      },
      fail(res) {
        that.getActivityCoupon(e)
      }
    })
  }),

  getActivityCoupon(e){
    let {couponUserVos, code} = this.data;
    let {index} = e.currentTarget.dataset;
    apiRequest.getActivityCoupon({
      activityCode: code,
      couponRecordId: couponUserVos[index].tcuId,
    }).then((res)=>{
      if(res.obj && res.obj.couponUsers.length > 0){
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        this.init();
      }
    })
  },

  goUse(){
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  goRule(e){
    let {index} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mineBox/couponRule/couponRule?index=${index}`,
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