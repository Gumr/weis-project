//app.js
import {CONFIG} from './utils/http'
import BasicService from './service/BasicService'
const basicService = new BasicService()
App({
  globalData: {
    appVer: 'Ver1.0.0',
    BASE_ENV: CONFIG.BASE_URL.includes('prod') ? 'product' : 'development',
    userInfo: null,
    loginInfo: null,
    isConnected: null,
    isFullScreen: false,
    navBarHeight: 0,
    systemInfo: null,
    device: 'android'
  },
  onLaunch: function (options) {
    const that = this
    this.getNetworkType()
    this.checkNewVersion()
    this.onNetworkStatusChange()
    this.quietLogin()
    this.globalData.invite = options.query.invite || 0
    // 获取设备信息
    wx.getSystemInfo({
      success(res) {
        let deviceModel = 'iPhone X';
        that.globalData.isFullScreen = res.model.includes(deviceModel) || res.model.includes('iPhone 11') ?  true : false
        that.globalData.device = res.model.includes('iPhone') ? 'ios' : 'android'
        that.globalData.systemInfo = res
      },
    });
  },
  // 检测登录
  quietLogin() {
    const that = this;
    wx.login({
      success(res) {
        if (res.code) {
          basicService.quietLogin({
            code: res.code,
            inviteUid: that.globalData.invite || 0,
            aldId: "12345"
          }).then(res => {
            if (res.errCode === 0) {
              wx.setStorageSync('token', res.obj.token)
              // wx.setStorageSync('token', '36CB517455C2E0FFEA54188061A1A3EBE4A58392D5675487')
              // wx.setStorageSync('token', 'B0854595B96D570522C907862D7D7D2FCDD2BDF1EE17228B')
              // wx.setStorageSync('token', 'C363C955C6B458E53471F1BFC38AB7FC7FC24D3E26F1D1FC') // 橘子
              // wx.setStorageSync('token', '5679B47B68108512C89D44B4F4826EE4DDCDB889102E5F4E') //朱
              // wx.setStorageSync('token', '632044ABD250DE7F0A8AD281BF438D093EFF5868AF855030') // 杨
              that.queryUserInfo()
            } else {
              wx.showToast({
                title: res.errMsg,
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  // 小程序检测更新
  checkNewVersion() {
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(res => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  },
  // 获取用户信息
  queryUserInfo() {
    return new Promise(resolve => {
      basicService.queryUserInfo({}).then(res => {
        if (res.errCode === 0) {
          let userInfos = res.obj
          let { userProfile} = userInfos
          userProfile.sex = userProfile.sex === 0 ? userInfos.sex : userProfile.sex
          userInfos.userProfile = userProfile
          
          this.globalData.userInfo = userInfos
          this.globalData.loginInfo = {
            isLogin: res.obj.isLogin,
            isAuthorized: res.obj.isAuthorized,
            isPerProfile: res.obj.isPerProfile
          }
        }
        if(this.userInfoReadyCallback) {
          this.userInfoReadyCallback()
        }
        resolve(res.obj)
      })
    })
  },
  // 初次加载判断网络情况
  getNetworkType() {
    const that = this
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
  },
  // 监听网络状态变化可根据业务需求进行调整
  onNetworkStatusChange() {
    const that = this
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function () {

          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });
  },
  // 检测登录状态
  checkLogin(callback) {
    const {loginInfo: {isLogin}} = this.globalData
    if(!isLogin) {
      wx.navigateTo({
        url: '/pages/mine/login/login'
      })
    } else callback && callback()
    return isLogin
  }
})