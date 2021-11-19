// pages/packSubAccount/shareOther/shareOther.js
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
import {
  loginPromise,
  isLoginClick
} from '../../../utils/common'
let app = getApp();


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
    loginPromise.then((res) => {
      const navStatusHeight = getStorage('navStatusHeight');
      this.setData({
        navStatusHeight,
        tsuUid: options.tsuUid,
        tsuSubUid: options.tsuSubUid,
        tsuSubUname: options.tsuSubUname,
        subToken: options.subToken,
        uid: app.globalData.uid
      })
    })
  },

  agree: isLoginClick(function () {
    if(this.data.agreeExist){
      wx.switchTab({
        url: '/pages/my/my',
      });
      return
    }
    let {
      tsuUid,
      tsuSubUid,
      subToken
    } = this.data;
    apiRequest.bindShareForSubUser({
      tsuSubUid: tsuSubUid,
      tssUid: tsuUid,
      tssStt: 10,
    }).then((res) => {
      if(res.obj.saveFlg){
        this.setData({
          agreeExist: true
        })
        wx.navigateTo({
          url: `/pages/mineBox/personal/personal?subToken=${subToken}&tsuSubUid=${tsuSubUid}`,
        });
      }else{
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });  
      }
    })
  }),


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