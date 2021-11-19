// pages/packSubAccount/receiveTreat/receiveTreat.js
const app = getApp();
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage
} from '../../../utils/storage'
import {
  isLoginClick,
  loginPromise,
  t,
  round,
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
    wx.hideShareMenu();
    if(options.scene){
      app.globalData.aldId = options.scene;
    }
    if(options.invite){
      app.globalData.inviteUid = options.invite;
    }
    loginPromise.then((res) => {
      this.setData({
        navStatusHeight: getStorage('navStatusHeight'),
        oid: options.oid,
        inviteUid: options.invite,
        uid: res.uid,
        scene: options.scene,
      })
      this.queryInviteOrderAndUserInfo();
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
    this.ready ? this.queryInviteOrderAndUserInfo() : this.ready = true;
  },

  queryInviteOrderAndUserInfo() {
    let {
      oid,
      inviteUid
    } = this.data;
    apiRequest.queryInviteOrderAndUserInfo({
      oid,
      inviteUid,
    }).then((res) => {
      this.setData({
        info: res.obj || {}
      })
    })
  },

  // 领取
  receive: isLoginClick(function () {
    let {
      oid,
      scene
    } = this.data;
    apiRequest.receivedInviteMelaAmount({
      oid,
      channel: scene,
    }).then((res) => {
      if (res.errCode == '0') {
        this.queryInviteOrderAndUserInfo();
      }
    })
  }),

  toList: isLoginClick(function(){
    let {oid} = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/getPerson/getPerson?oid=${oid}`,
    });
  }),

  // 点餐
  toMeal(){
    wx.switchTab({
      url: `/pages/index/index`,
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