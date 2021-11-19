// pages/mineBox/activationCard/activationCard.js
import apiRequest from '../../../service/index';
import {isLoginClick, } from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xy: true,
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

  searchScanTap: isLoginClick(function(){
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        const { result } = res
        console.log(res, 'scan code res')
        this.setData({
          code: result
        })
      }
    })
  }),

  // 兑换
  blur() {
    this.setData({
      btnHeight: 40
    })
  },

  boardHeightChange(evt) {
    this.setData({
      btnHeight: evt.detail.height
    })
  },

  agree: function () {
    this.setData({
      xy: !this.data.xy
    })
  },

  xy: function () {
    wx.navigateTo({
      url: '/pages/mineBox/rechargeDeal/rechargeDeal',
    });
  },

  bindCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  focus: function () {
    this.setData({
      err: false
    })
  },

  exchangeCardTicket: isLoginClick(function () {
    var that = this;
    if (!that.data.code || !that.data.xy) {
      wx.showToast({
        title: that.data.code ? '请勾选《维士健康(付费)会员协议》' : '请输入兑换码',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return
    }
    let code = that.data.code;
    apiRequest.exchangeCardTicket({
      code: code
    })
      .then(res => {
        if (res.errCode == '0') {
          // let exchangeRes donationAmount rechargeAmount
          let donationAmount = res.obj.exchangeRes.donationAmount;
          let rechargeAmount = res.obj.exchangeRes.rechargeAmount;
          wx.showToast({
            title: '兑换成功',
            mask: false,
            success: (result) => {
              wx.redirectTo({
                url: `/pages/mineBox/activationSucc/activationSucc?rechargeAmount=${rechargeAmount}&donationAmount=${donationAmount}`,
              });  
            },
          });

        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });

          that.setData({
            err: true,
            errActive: true
          })
          setTimeout(() => {
            that.setData({
              errActive: false
            })
          }, 300)
        }
      })
      .catch(error => {

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

  }
})