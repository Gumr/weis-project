// pages/packSubAccount/treat/treat.js
const app = getApp();
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage
} from '../../../utils/storage'
import {
  isLoginClick,
  loginPromise,
  t,
  round,
} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allPrice: '0.00',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this.setData({
      navStatusHeight: getStorage('navStatusHeight'),
    })
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
    if(this.clearData){
      this.clearData = false;
      this.setData({
        number: '',
        price: '',
      })
      this.allPriceChange();
    }
  },

  changeNum(e) {
    this.setData({
      number: round(e.detail.value, 0) || ''
    })
    this.allPriceChange()
  },

  changePrice(e) {
    var reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g;
    let val = e.detail.value;
    if (reg.test(val)) {
      val = val.replace(reg, '$2$3$4')
    } else {
      val = '';
    }
    this.setData({
      price: val
    })
    this.allPriceChange()
  },

  allPriceChange() {
    let {
      number,
      price
    } = this.data;
    if (number > 0 && price > 0) {
      this.setData({
        allPrice: round(price * number, 2),
      })
    } else {
      this.setData({
        allPrice: '0.00'
      })
    }
  },

  pay() {
    let {
      number,
      price,
      allPrice
    } = this.data;
    if (number > 0 && price > 0 && price <= 50) {
      this.payPopup.pay(allPrice)
    }
  },

  wxPay(e) {
    const {
      detail
    } = e;
    let {price, allPrice, number} = this.data;
    const that = this;

    apiRequest.makeInviteMelaOrder({
      payWay: detail.type,
      payChannel: 'mina',
      perAmount: price,
      totalAmount: allPrice,
      inviteNum: number,
    }).then(res => {
      detail.done();
      if (res.errCode == '0') {
        let inviteMelaOrder = res.obj.inviteMelaOrder;
        let {oid,inviteNumber,preAmount} = inviteMelaOrder;
        if (detail.type == 'wechat') {
          detail.wxPay(res.obj.payInfo).then(data => {
            if (data.errMsg == 'requestPayment:ok') {
              wx.navigateTo({
                url: `/pages/packSubAccount/treatSucc/treatSucc?status=true&oid=${oid}`,
                success: function(){
                  that.clearData = true; //返回页面清除当前页数据
                }
              });
            }
          }).catch((data) => {
            if (data.errMsg == 'requestPayment:fail cancel') {
              wx.navigateTo({
                url: `/pages/packSubAccount/treatSucc/treatSucc?oid=${oid}&inviteNumber=${inviteNumber}&preAmount=${preAmount}`,
                success: function(){
                  that.clearData = true; //返回页面清除当前页数据
                }
              });
            }
            if (data.errMsg == 'requestPayment:fail (detail message)') {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                image: '',
                duration: 1500,
                mask: false,
              });
            }
          })
        } else {
          wx.navigateTo({
            url: `/pages/packSubAccount/treatSucc/treatSucc?status=true&oid=${oid}`,
            success: function(){
              that.clearData = true; //返回页面清除当前页数据
            }
          });
        }
      }
    })
  },

  record() {
    wx.navigateTo({
      url: '/pages/packSubAccount/treatRecord/treatRecord',
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