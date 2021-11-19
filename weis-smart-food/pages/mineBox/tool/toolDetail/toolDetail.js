// pages/mineBox/tool/toolDetail/toolDetail.js
import { isLoginClick, loginPromise } from '../../../../utils/common'
const app = getApp()
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
    if(options.invite){
      app.globalData.inviteUid = options.invite;
    }
    this.setData({
      inviteUid: options.invite || 0
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then((res)=>{
      this.setData({
        uid: res.uid
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 测一测你的基础代谢
  toInfo: isLoginClick(function() {
    wx.navigateTo({
      url: '/pages/mineBox/tool/info/info'
    })
  }),
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
    let { uid } = this.data;
    return {
      path: `/pages/mineBox/tool/toolDetail/toolDetail?invite=${uid}`,
      title: '教练告诉你如何正确饮食，让减脂事半功倍',
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/tool_kit_wechat_share@2x.png'
    }
  }
})