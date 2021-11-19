// pages/login/login.js
import {
  setStorage,
  getStorage
} from '../../utils/storage'
import apiRequest from '../../service/index';
import day from '../../libs/day'
import {
  loginPromise
} from '../../utils/common'
const app = getApp();
import {
  ignoreProfile
} from '../../utils/map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPhonePopup: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then((res) => {
      const loginInfo = getStorage('loginInfo') || {}; //{"isAuthorized":true,"isLogin":true,"isPerProfile":true}
      this.setData({
        loginInfo,
      })
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

  },

  close() {
    let loginInfo = this.data.loginInfo;
    if (loginInfo.isAuthorized && loginInfo.isLogin) {
      wx.navigateBack({
        delta: 1
      });
      return
    }
    this.setData({
      showPhonePopup: !this.data.showPhonePopup
    })
  },

  // 授权用户信息
  getUserProfile() {
    var that = this;
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (result) => {
        apiRequest.getCode().then((data) => {
          apiRequest.userAuth({
              code: data.code,
              rawData: result.rawData,
              signature: result.signature,
              encryptedData: result.encryptedData,
              iv: result.iv,
              inviteUid: app.globalData.inviteUid ? app.globalData.inviteUid : 0,
              aldId: app.globalData.aldId
            })
            .then(res => {
              if (res.errCode == '1001') {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                });
                return
              }
              if (res.obj && res.obj.isAuthorized == true) {
                setStorage('token', res.obj.token);
                let loginInfo = {
                  isAuthorized: res.obj.isAuthorized,
                  isLogin: res.obj.isLogin,
                  isPerProfile: res.obj.isPerProfile
                }
                setStorage('loginInfo', loginInfo);
                setStorage('userInfo', result.userInfo)
                that.setData({
                  loginInfo
                })
                if (loginInfo.isLogin) {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            })
            .catch(error => {

            })


        })
      }
    })
  },

  // 授权手机号
  getPhoneNumber(e) {
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '获取信息失败，请重新授权',
        icon: 'none',
      });
      return
    }
    var that = this;
    apiRequest.getCode().then((data) => {
      apiRequest.getWxPhoneNum({
          code: data.code,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          inviteUid: app.globalData.inviteUid ? app.globalData.inviteUid : 0,
          aldId: app.globalData.aldId
        })
        .then(res => {
          if (res.errCode == '1001') {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
            });
            return
          }
          if (res.obj && res.obj.isLogin == true) {
            setStorage('token', res.obj.token);
            let coupon = res.obj.coupon || [];
            coupon.forEach((item) => {
              item.tcuAmount = parseInt(item.tcuAmount);
              item.tcuEtime = day(Number(item.tcuEtime)).format('YYYY.MM.DD')
            })
            let loginInfo = {
              isAuthorized: res.obj.isAuthorized,
              isLogin: res.obj.isLogin,
              isPerProfile: res.obj.isPerProfile
            }
            setStorage('loginInfo', loginInfo)
            setStorage('loginCoupon', coupon)
            this.setData({
              loginInfo,
            })
            const pages = getCurrentPages()
            const preRoute = pages.length > 1 ? pages[pages.length - 2].route : '';
            if(loginInfo.isPerProfile || ignoreProfile.indexOf(preRoute) != -1){
              wx.navigateBack({
                delta: 1
              });
            }else{
              wx.navigateTo({
                url: '/pages/mineBox/role/role',
              });  
            }
          }
        })
        .catch(error => {

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