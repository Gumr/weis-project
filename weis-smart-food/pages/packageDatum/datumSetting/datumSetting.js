
import requests from '../../../service/index'
import { userConfigMap } from '../../../utils/map'
import {
  getStorage
} from '../../../utils/storage';
// pages/packageDatum/datumSetting/datumSetting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userConfigs: [], // 设置列表
    authDialog: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryUserConfig();
    this.setData({
      subToken: getStorage('subToken'),
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

  },
  authConfirm() {
    wx.openSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.werun']) {
          this.done();
          this.changeUserConfig(this.configParams);
        } else {
          this.done(false);
        }
      },
      complete: () => {
        this.setData({
          authDialog: false
        })
      }
    })
  },
  authCancel() {
    this.done(false);
  },
  switchChange(evt) {
    const { value, done } = evt.detail;
    const { type, id } = evt.currentTarget.dataset;

    this.configParams = {
      type,
      value,
      id
    }
    if (type === '06' && value === '01') {
      wx.getWeRunData({ // 先调用一次获取微信运动
        success: () => {
          done();
          this.changeUserConfig(this.configParams)
        },
        fail: () => {
          this.done = done; // 把done函数赋值给this
          this.setData({ // 打开自定义授权弹窗
            authDialog: true
          })
        }
      });
    } else {
      done && done();
      this.changeUserConfig(this.configParams)
    }
  },
  changeUserConfig({
    type,
    value,
    id
  }) {
    return requests.changeUserConfig({
      tucId: id,
      tucStt: value,
      tucType: type
    })
  },
  queryUserConfig() {
    requests.queryUserConfig()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            userConfigs: res.obj.userConfigList.map((conf) => {
              conf.$label = userConfigMap[conf.tucType];
              return conf;
            })
          })
        }
      })
  }
})