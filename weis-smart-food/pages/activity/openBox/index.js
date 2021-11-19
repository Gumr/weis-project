// pages/market/openBox/index.js
// import UserService from '../../../service/UserService'
// const userService = new UserService()
import apiRequest from '../../../service/index';
var utils = require('../../../utils/week-utils.js')
const app = getApp();
import {
  getStorage
} from '../../../utils/storage';
import {
  isLoginClick,
  loginPromise,
} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share: '',
    showsharebox: false,
    time: '',
    timeData: {},
    showError: false,
    showLogin: false,
    headImgUrl: '',
    shareimg: '',
    boxtype: 'my',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryUserInfo()
    loginPromise.then((res) => {
      let loginInfo = getStorage('loginInfo');
      let uid = res.uid;
      let isLogin = loginInfo.isLogin && loginInfo.isAuthorized && loginInfo.isPerProfile;
      this.setData({
        isLogin: isLogin ? true : false,
        iuInvitedUid: options.iuInvitedUid || uid,
        boxtype: options.boxtype,
        shareimg: options.shareimg,
        uid,
      })
      if (isLogin) {
        this.getActivityBoxList()
      }
      if (this.data.iuInvitedUid && uid != this.data.iuInvitedUid) {
        app.globalData.gio('track', 'p_Gift', {
          'isLogin': this.data.isLogin,
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


  },
  queryUserInfo() {
    apiRequest.queryUserInfo({})
      .then(res => {
        this.setData({
          headImgUrl: res.obj.headImgUrl,
        })
      })
      .catch(error => {

      })

  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },

  finish: function (e) {
    var that = this;
    var countDown = that.selectComponent('.control-count-down');
    countDown.pause();
  },

  logiuser: isLoginClick(function () {

  }),

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.yetLoad) {
      this.updateLogin()
    } else {
      this.yetLoad = true;
    }
  },
  getActivityBoxList() {
    let {
      iuInvitedUid,
      uid
    } = this.data;
    apiRequest.queryBoxCoup({
      uid: iuInvitedUid,
      flag: '01',
    }).then((res) => {
      let ledtheStockrecordBeans = res.obj.ledtheStockrecordBeans || [];
      this.setData({
        activityBoxList: ledtheStockrecordBeans
      })
      if(ledtheStockrecordBeans.length == 0 && iuInvitedUid != uid){
        this.savebox();
      }
    })
  },

  savebox() {
    if (this.alreadySave) {
      return
    }
    apiRequest.saveuserShareFirends({
        invitedUid: this.data.iuInvitedUid || 0,
        flag: '01',
      })
      .then((res) => {
        this.alreadySave = true;
        if (res.errCode === 0) {
          let couponUser = res.obj.couponUser
          couponUser.tcuAmount = Math.round(couponUser.tcuAmount)
          this.setData({
            couponUser,
          })
        }
        this.getActivityBoxList();
      })
  },

  // 更新页面登录状态
  updateLogin() {
    let loginInfo = getStorage('loginInfo');
    let isLogin = loginInfo.isLogin && loginInfo.isAuthorized && loginInfo.isPerProfile;
    if (isLogin) {
      this.setData({
        isLogin: true,
      })
      this.queryUserInfo();
      this.getActivityBoxList()
    }
  },

  touse: isLoginClick(function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }),

  
  cuntdown() {
    let today = utils.formatTime2(new Date())
    let date = today + ' 23:59:59'
    let comdowntime = new Date(date).getTime()
    let nowTime = new Date().getTime();
    let limitTime = comdowntime;

    this.setData({
      time: limitTime ?
        limitTime - nowTime > 0 ?
        limitTime - nowTime :
        0 :
        0,

    })
    if (this.data.time > 0) {

      this.setData({
        cutdowntime: true
      })
    }


    this.setData({
      activityBoxList: this.data.activityBoxList
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const idx = (Math.random() * 3) | 0;
    let {
      uid,
      headImgUrl
    } = this.data;
    app.globalData.gio('track', 'n_Sendgift', {})
    return {
      title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
      imageUrl: 'https://prodstatic.weis1606.cn/api/sodo/openboxShare.png',
      path: `/pages/activity/openBox/index?iuInvitedUid=${uid}&boxtype=share&scene=0717&shareimg=${headImgUrl}&invite=${uid}`,
    }
  },
  onPageScroll: function ({
    scrollTop
  }) {
    if (scrollTop >= 400) {
      this.setData({
        showsharebox: true
      })
    } else {
      this.setData({
        showsharebox: false
      })

    }
  }
})