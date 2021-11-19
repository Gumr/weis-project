// pages/mine/login/login.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    authFlag: false
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

  },
  async wxQuickLogin(e) {
    const that = this;
    const {errMsg, encryptedData, iv} = e.detail
    if (errMsg && errMsg.includes('getPhoneNumber:fail')) return;
    let code = await this.wxLogin()
    if(!code) return
    basicService.getWxPhoneNum({
      code: code,
      encryptedData: encryptedData,
      iv: iv
    }).then(res => {
      if (res.errCode === 0) {
        const {token, isLogin, isAuthorized, isPerProfile} = res.obj
        app.globalData.token = token
        app.globalData.loginInfo = {
          isLogin: isLogin,
          isAuthorized: isAuthorized,
          isPerProfile: isPerProfile
        }
        wx.setStorageSync('token', token)
        app.queryUserInfo()
        wx.switchTab({ url: '/pages/index/index' })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  async authFn() {
    const that = this
    let wxUserInfo = await this.wxGetUserInfo()
    let authInfo = {
      iv: wxUserInfo.iv,
      rawData: wxUserInfo.rawData,
      signature: wxUserInfo.signature,
      encryptedData: wxUserInfo.encryptedData
    }
    let code = await this.wxLogin()
    if(!code) return
    authInfo.code = code
    basicService.userAuth(authInfo).then(res => {
      wx.showToast({
        title: '授权成功',
        icon: 'none'
      })
      // 授权成功
      if (res.errCode === 0) {
        that.setData({
          authFlag: true,
        })
        wx.setStorageSync('token', res.obj.token)
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          resolve(res.code)
        },
        fail(err) {
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          })
          reject()
        }
      })
    })
  },
  wxGetUserInfo(e) {
    const that = this;
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        lang: "zh_CN",
        success(res) {
          resolve(res)
        },
        fail(err) {
          // 显示主动授权的button
          wx.navigateBack()
          reject(err)
        }
      });
    })
  },
  hideModal() {
    this.setData({
      authFlag: false
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

  }
})