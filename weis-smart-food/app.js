//app.js
// import {
//   setStorage
// } from './utils/storage'
import {
  login
} from './utils/request'
import apiRequest from './service/index';
import {
  announceConf,
  getTablewareList,
  isIpx,
  loginResolve,
  checkNewVersion,
  setNavStatus,
  binding,
  queryQrCodeDetail,
  querySubUserInfo,
  queryDiscoverDialog
} from './utils/common'
import {
  setStorage,
  getStorage,
  removeStorage
} from './utils/storage'
const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
const gio = require("/libs/gio-minp/index.js").default;
gio('init', envVersion === 'release' ? '9d4ae3fde030ab9d' : '', 'wxb41830cd88835f5c', {
  followShare: true,
  version: '1.0'
});
// require('./utils/page')

App({

  onLaunch: function (options) {
    checkNewVersion();
    this.globalData.isOld = Boolean(options.referrerInfo.extraData && options.referrerInfo.extraData.isOld);
    this.globalData.inviteUid = options.query.invite ? options.query.invite : 0;
    this.globalData.aldId = options.query.scene ? decodeURIComponent(options.query.scene) : '12345';
    this.globalData.gio = gio;
    this.getCode();
    this.loadfontFace();
    setNavStatus(); //设置导航栏高度
  },

  onShow: function (options) {
    this.globalData.aldId = options.query.scene ? decodeURIComponent(options.query.scene) : (this.globalData.aldId || '12345');
    getTablewareList()
  },

  getCode: function () {
    apiRequest.getCode().then((res) => {
      this.quietLogin(res.code);
    });
  },

  // 登录
  quietLogin(code) {
    let that = this;
    let {
      inviteUid,
      aldId
    } = this.globalData;

    login({
      code: code,
      inviteUid: inviteUid,
      aldId: aldId,
    }).then(async (res) => {
      that.globalData.openId = res.openId;
      that.globalData.uid = res.uid;
      gio('setUserId', res.uid)
      gio('identify', res.openId);
      await this.requestConfig();
      // 请求弹窗
      await this.queryDiscoverDialog();
      //由于这里是网络请求，可能会在 Page.onLoad 之后才返回
      loginResolve(res);
      if (inviteUid || aldId != '12345') {
        binding(inviteUid, aldId);
        queryQrCodeDetail(inviteUid, aldId).then((res) => {
          let marketType = (res.obj && res.obj.marketType) || '';
          if (marketType == '01') {
            this.globalData.channelType = 1;
          } else if (marketType == '03') {
            this.globalData.channelType = 2;
          }
        });
      }

    })
  },

  // 请求配置
  requestConfig() {
    return announceConf()
  },

  // 请求弹窗
  queryDiscoverDialog() {
    return queryDiscoverDialog().then((res) => {
      this.globalData.discoverDialogs = (res.obj && res.obj.discoverDialogs) || [];
    })
  },

  // 查询未读返现通知
  checkUnread(type, callback) {
    switch(type) {
      case 'vote':
        apiRequest.redPointToVoteSku({
          optionFlag: 0
        })
        .then(res => {
          if(!res.obj.clicked) {
            wx.showTabBarRedDot({
              index: 2
            })
          } else {
            wx.hideTabBarRedDot({
              index: 2
            })
          }
          this.globalData.uncheck_vote = !res.obj.clicked
        })
        break
      default:
        apiRequest.checkUserUnconfirmedRecord()
        .then(res => {
          const keys = Object.keys(res.obj).length
          if(res.errCode == 0 && keys > 0) {
            wx.showTabBarRedDot({
              index: 4
            })
            this.globalData.uncheck = res.obj.capitalFlow
          } else {
            wx.hideTabBarRedDot({
              index: 4
            })
            this.globalData.uncheck = {}
          }
          callback && callback()
        })
        break
    }
    // return apiRequest.checkUserUnconfirmedRecord()
    //   .then(res => {
    //     if (res.errCode === 0) {
    //       if (Object.keys(res.obj).length > 0) {
    //         wx.showTabBarRedDot({
    //           index: 4
    //         })
    //         this.globalData.uncheck = res.obj.capitalFlow
    //       } else {
    //         wx.hideTabBarRedDot({
    //           index: 4
    //         })
    //         this.globalData.uncheck = {}
    //       }
    //     }
    //   })
  },

  // 下载字体
  loadfontFace() {
    wx.loadFontFace({
      global: true,
      family: 'DINAlternate-Bold',
      source: 'url("https://prodstatic.weis1606.cn/api/smartFood/style/DIN%20Alternate%20Bold.ttf")',
      success: function (res) {
        console.log(res)
      },
    })
  },

  onPageNotFound(res) {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  onError(res) {
    // console.log(res)
    apiRequest.saveRecord({
      eventKey: 'onError',
      eventValue: JSON.stringify(res),
    })
  },

  globalData: {
    isIpx: isIpx(), //是否iPhone X
    navStatusHeight: '', //状态栏高度
    inviteUid: 0,
    IMG_URL: 'https://prodstatic.weis1606.cn',
    px2rpx: 750 / wx.getSystemInfoSync().windowWidth,
    channelType: 0, //渠道类型-1客户经理  2营养师
    source: '', //来源
    uncheck: {}, // 未读返现消息
  },
});