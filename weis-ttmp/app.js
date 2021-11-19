//app.js
import apiRequest from './service/index';
import {loginResolve,} from './utils/common'
import {
  login
} from './utils/api'
App({
  onLaunch: function (options) {
    console.log(options)
    // this.globalData.inviteUid = options.query.invite ? options.query.invite : 0;
    // this.globalData.aldId = options.query.scene ? decodeURIComponent(options.query.scene) : '12345';
    this.getCode();
    this.setNavStatus(); // 设置导航栏高度
  },
  onShow: function (options) {
    // Do something when show.
  },
  getCode: function () {
    apiRequest.getCode().then((res) => {
      this.quietLogin(res.code);
    });
  },
  // 登录
  quietLogin(code) {
    apiRequest.quietLogin({
      code
    }).then(async (res) => {
      let loginInfo = {
        isAuthorized: res.obj.isAuthorized,
        isLogin: res.obj.isLogin
      } 
      tt.setStorageSync('loginInfo', loginInfo);
      tt.setStorageSync('openId', res.obj.openId);
      tt.setStorageSync('token', res.obj.token);
      console.log('quietLogin')
      console.log(loginInfo)
    })
  },
  // 通过获取系统信息计算导航栏高度
  setNavStatus() {
    let sysinfo = tt.getSystemInfoSync(),
      statusHeight = sysinfo.statusBarHeight,
      isiOS = sysinfo.system.indexOf('iOS') > -1,
      navHeight;
    if (!isiOS) {
      navHeight = 48;
    } else {
      navHeight = 44;
    }
    this.globalData.navStatusHeight = statusHeight + navHeight;
    this.globalData.statusHeight = statusHeight;
    this.globalData.navHeight = navHeight;
    this.globalData.isiOS = isiOS;
  },
  onHide: function () {
    // Do something when hide.
  },
  onError: function (msg) {
    console.log(msg);
  },
  onPageNotFound: function (msg) {
    // Do something when page path is not found.
  },
  globalData: {
    navStatusHeight: '', // 导航栏高度 = 状态栏 + 标题栏
    statusHeight: '', // 状态栏高度
    navHeight: '', // 标题栏高度
    isiOS: '', // true: iOS   false: Andriod
    px2rpx: 750 / tt.getSystemInfoSync().windowWidth,
  },
});