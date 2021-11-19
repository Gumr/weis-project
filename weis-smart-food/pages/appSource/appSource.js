// pages/appSource/appSource.js
const app = getApp();
import {
  isIpx,
  loginPromise,
  querySubUserInfo
} from '../../utils/common'
import {
  getStorage,
  setStorage
} from '../../utils/storage'
import apiRequest from '../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: isIpx(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then((res) => {
      this.setData({
        img: isIpx() ? 'https://prodstatic.weis1606.cn/api/smartFood/appSource1.png' : 'https://prodstatic.weis1606.cn/api/smartFood/appSource.png',
        key: options.key || '',
        source: options.source || ''
      })
      if (options.key) {
        this.getAppOrderByKey()
      } else if (options.token) {
        setStorage('token', options.token)
        wx.showToast({
          title: '进入中',
          icon: 'loading',
          duration: 1500,
        });
        setTimeout(() => {
          wx.hideToast();
          wx.redirectTo({
            url: '/pages/packageOrder/orderList/orderList',
          });
        }, 2000)
      }
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


  getAppOrderByKey() {
    apiRequest.getAppOrderByKey({
      key: this.data.key
    }).then((res) => {
      // app跳转小程序 携带key source
      app.globalData.source = 'app';
      app.globalData.lat = res.obj.lat;
      app.globalData.lon = res.obj.lon;
      let subToken = res.obj.subToken || '';
      subToken ? setStorage('subToken', subToken) : '';
      setStorage('orderInfo', res.obj.orderInfo);
      if(res.obj.token){
        setStorage('token', res.obj.token);
      }
      if (res.obj.tsuSubUid) {
        querySubUserInfo(res.obj.tsuSubUid).then((res) => {
          if (res.errCode == 0) {
            let subInfo = res.obj.subUserInfo;
            subInfo.subToken = res.obj.subToken;
            setStorage('subInfo', subInfo)
          }
        })
      }

      wx.showToast({
        title: '进入中',
        icon: 'loading',
        duration: 2000,
      });
      setTimeout(() => {
        wx.hideToast();
        wx.switchTab({
          url: '/pages/index/index',
        });
      }, 2000)
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