// pages/mineBox/forecast/submitStatus/submitStatus.js
import apiRequest from '../../../../service/index';
import { debounce } from '../../../../utils/throttle'
import wxService from '../../../../service/WxService'
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
    this.setData({
      payData: {
        status: options.status,
        success: {
          content: '提交成功，预计一个工作日后到账',
          btnText: '查看明细',
        },
        fail: {
          content: '提交失败',
          btnText: '重新提交'
        }
      },
      employeeInfo: JSON.parse(options.employeeInfo)
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
    this.setData({
      isClick: true
    })
  },
  // 返回
  back() {
    const pages = getCurrentPages()
    // const prepage = pages.length - 2
    const index = pages.findIndex(
      page => page.route === 'pages/packSubAccount/withdrawal/withdrawal/withdrawal'
    );
    wx.navigateBack({
      delta: pages.length - (index + 1)
    });
  },
  // 提交修改
  recharge: function () {
    if(!this.data.isClick) {
      return;
    }
    this.setData({
      isClick: false
    })
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packSubAccount/withdrawal/wallet/wallet'
    );
    const prepage = pages[index];
    //调用上一个页面中的submit方法
    prepage.withdrawal()
  },
  detail() {
    let { employeeInfo } = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/withdrawal/detail/detail?employeeInfo=${JSON.stringify(employeeInfo)}`,
    });
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