// pages/packSubAccount/treatSucc/treatSucc.js
import apiRequest from '../../../service/index';
import {
  round,loginPromise
} from '../../../utils/common'
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
    wx.hideShareMenu();
    this.setData({
      status: options.status || false,
      oid: options.oid,
      inviteNumber: options.inviteNumber || '',
      preAmount: options.preAmount || '',
    })
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid
      })
    })
    const pages = getCurrentPages();
    const myPage = pages.find(
      page => page.route === 'pages/my/my'
    );
    this.userInfo = myPage && myPage.data.info || '';
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

  // 重新支付
  rePay(){
    let {status,inviteNumber, preAmount} = this.data;
    if(!status){
      this.payPopup.pay(round(inviteNumber*preAmount,2))
    }
  },

  wxPay(e){
    const {
      detail
    } = e;
    let {inviteNumber, preAmount, oid} = this.data;
    let that = this;
    apiRequest.rePayInviteMelaOrder({
      payWay: detail.type,
      payChannel: 'mina',
      perAmount: preAmount,
      totalAmount: round(inviteNumber*preAmount,2),
      inviteNum: inviteNumber,
      oid,
    }).then(res => {
      detail.done();
      if (res.errCode == '0') {
        if (detail.type == 'wechat') {
          detail.wxPay(res.obj.payInfo).then(data => {
            if (data.errMsg == 'requestPayment:ok') {
              that.setData({
                status: true
              })
            }
          }).catch((data) => {
            if (data.errMsg == 'requestPayment:fail cancel') {
              
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
          that.setData({
            status: true
          })
        }
      }
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
  onShareAppMessage: function (e) {
    if(e.from == 'button'){
      let {oid,uid} = this.data;
      let userInfo = this.userInfo;
      return {
        title: `${userInfo && userInfo.uname || ''}请你体验一顿维士健康餐`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareMoney.png',
        path: `/pages/packSubAccount/receiveTreat/receiveTreat?oid=${oid}&invite=${uid}&scene=10401`,
      }
    }
  }
})