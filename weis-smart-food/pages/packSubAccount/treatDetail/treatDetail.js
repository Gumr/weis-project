// pages/packSubAccount/treatDetail/treatDetail.js
const app = getApp();
import apiRequest from '../../../service/index';
import {
  getStorage, setStorage
} from '../../../utils/storage'
import {
  isLoginClick,
  loginPromise,
  t,
  round,
} from '../../../utils/common'
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this.setData({
      navStatusHeight: getStorage('navStatusHeight'),
      oid: options.oid,
    })
    this.queryInviteMelaOrderDetail();
  },

  queryInviteMelaOrderDetail(){
    let oid = this.data.oid;
    apiRequest.queryInviteMelaOrderDetail({
      oid,
    }).then((res)=>{
      let info = res.obj;
      info.ctime = day(info.ctime).format('YYYY.MM.DD HH:mm:ss');
      this.setData({
        info,
      })
    })
  },

  toList(){
    let {oid} = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/getPerson/getPerson?oid=${oid}`,
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
  onShareAppMessage: function (e) {
    if(e.from == 'button'){
      let {oid} = this.data;
      let uid = this.data.info.uid;
      return {
        title: '请你体验一顿维士健康餐',
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareMoney.png',
        path: `/pages/packSubAccount/receiveTreat/receiveTreat?oid=${oid}&invite=${uid}&scene=10401`,
      }
    }
  }
})