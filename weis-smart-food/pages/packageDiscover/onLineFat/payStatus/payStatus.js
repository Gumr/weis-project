// pages/packageDiscover/onLineFat/payStatus/payStatus.js
import apiRequest from '../../../../service/index';
import { getStorage, removeStorage } from '../../../../utils/storage'
const app = getApp()
const util = require('../../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    joinCode: false,
    showCode: false,
    code: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      status: options.status || false, //true 成功 false 失败
      orderId: options.orderId || '',
      payPrice: options.payPrice || 0,
    })
    let code = getStorage('tacGroupQrcode') //减肥营群二维码
    this.setData({
      joinCode: Boolean(code),
      code: code
    })
    removeStorage('tacGroupQrcode')

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.payPopup = this.selectComponent('#pay');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  showQrcode() {
    this.setData({
      showCode: !this.data.showCode
    })

  },

  rePay() {
    let {
      payPrice
    } = this.data;
    // 重新支付
    this.payPopup.pay(payPrice)
  },


  async handlePayConfirm(e) {
    // 支付弹窗处理函数
    // 支付弹窗确认时间
    const {
      detail
    } = e;
    const changeRes = await this.rePayOrder({
      tradeNo: this.data.orderId,
      payWay: detail.type,
      openid: app.globalData.openId,
      payChannel: 'mina',
    });
    if (changeRes.errCode === 0) {
      if (detail.type === 'wechat') {
        try {
          await detail.wxPay(changeRes.obj).then((res) => {
            this.setData({
              status: true,
              orderId: changeRes.obj.orderNumber
            })
          });
        } catch {
          detail.done();
          return;
        }
      } else {
        this.setData({
          status: true,
          orderId: changeRes.obj.orderNumber
        })
      }
      detail.done();
    }
  },

  rePayOrder(params) {
    return apiRequest.rePayOrder(params);
  },

  // 回减脂营
  backCamp() {
    const pages = getCurrentPages();
    const index = pages.findIndex(
      page => page.route === 'pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail'
    );
    wx.navigateBack({
      delta: pages.length - index - 1
    });
  },

  checkOrder() {
    if (this.data.joinCode) {
      this.setData({
        showCode: true
      })
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/fatPackOrder/fatPackOrder?fatPackId=${this.data.orderId}&title=${''}`
    })
  },
  priveimg() {
    wx.previewImage({
      urls: [this.data.code],
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
})