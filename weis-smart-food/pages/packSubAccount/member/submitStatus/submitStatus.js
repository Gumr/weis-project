// pages/mineBox/forecast/submitStatus/submitStatus.js
import apiRequest from '../../../../service/index';
import { debounce } from '../../../../utils/throttle'
import wxService from '../../../../service/WxService'
import { isLoginClick } from '../../../../utils/common'
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
      payData: JSON.parse(options.payData),
      payParams: JSON.parse(options.payParams),
      // paymentData: {
      //   status: 0,
      //   success: {
      //     content: '成功购买2张8元会员券',
      //     tip: '6张会员券，将于2021.6.15发放'
      //   },
      //   fail: {
      //     content: '购买失败',
      //     btnText: '重新支付'
      //   }
      // }
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
      page => page.route === 'pages/packSubAccount/member/member/member'
    );
    wx.navigateBack({
      delta: pages.length - (index + 1)
    });
  },
  // 提交修改
  // submit: throttle(1500, function () {
  //   const pages = getCurrentPages()
  //   const index = pages.findIndex(
  //     page => page.route === 'pages/packSubAccount/member/member/member'
  //   );
  //   const prepage = pages[index];
  //   //调用上一个页面中的submit方法
  //   prepage.recharge()
  // }),
  recharge: isLoginClick(function (e) {
    if(!this.data.isClick) {
      return;
    }
    this.setData({
      isClick: false
    })
    let { payData, payParams } = this.data;
    apiRequest.rePayVip(payParams).then(res => {
      if (res.errCode == '0') {
        // 微信支付
        wxService.payment(res.obj.payInfo).then(data => {
          if (data.errMsg == 'requestPayment:fail cancel') {
            // payData.status = 0
          }
          if (data.errMsg == 'requestPayment:ok') {
            payData.status = 1
          }
          this.setData({
            payData
          })
        })
      } else {
        // payData.status = 0
      }
      // this.setData({
      //   payData
      // })
    })
      .catch(error => {
        // payData.status = 0
        // this.setData({
        //   payData
        // })
      })
      .finally(error => {
        this.setData({
          isClick: true
        })
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