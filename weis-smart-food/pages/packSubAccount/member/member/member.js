// pages/packSubAccount/member/member.js
import {
  setStorage,
  getStorage,
  setStorageSync
} from '../../../../utils/storage'
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day'
import {
  isLoginClick,
  loginPromise,
  saveUseLog
} from '../../../../utils/common'
import { debounce } from '../../../../utils/throttle'
import wxService from '../../../../service/WxService'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
    pageShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({
    //   btnStatus: options.btnStatus
    // })
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
    loginPromise.then(()=>{
      this.setData({
        isClick: true
      })
      this.queryUserVipCouponMessage()
    })
  },
  queryUserInfo: function () {
    return new Promise((resolve, reject) => {
      apiRequest.queryUserInfo()
        .then(res => {
          resolve(res)
        })
        .catch(error => {

        })
    })
  },
  // 维士会员
  async queryUserVipCouponMessage() {
    let res = await this.queryUserInfo()
    apiRequest.queryUserVipCouponMessage({
      uid: res.obj.userInfo.uid
    })
      .then(res => {
        let obj = res.obj;
        setStorage('isVip', obj.joinVip)
        this.setData({
          vipCoupon: {
            ...obj,
            days: obj.endDate?day(obj.endDate.toString().slice(0,8)).diff(new Date(), 'day') + 1:'' // 得出的少一天偏差，所以+1
          },
          couponBeanList: obj.couponBeanList || [],
          vipCouponConfigList: obj.vipCouponConfigList,
          coupon: obj.vipCouponMap['01'],
          add: obj.vipCouponMap['02'],
          vipRecord: obj.vipRecord?{
            ...obj.vipRecord,
            tvrDateArr: [day(obj.vipRecord.tvrEndDate.toString().slice(0,8)).add(1, 'day').format('YYYY.MM.DD'), day(obj.vipRecord.tvrEndDate.toString().slice(0,8)).add(31, 'day').format('YYYY.MM.DD')],
          }:{},
          pageShow: true,
          // isFirst: vipCoupon.firstJoinVip// 是否首次购买会员
          // isFirst: obj.firstJoinVip && !obj.joinVip // 是否首次购买会员
        })
      })
      .catch(error => {

      })
  },
  // 付款
  recharge: isLoginClick(function (e) {
    if(!this.data.isClick) {
      return;
    }
    this.setData({
      isClick: false
    })
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    saveUseLog('04', 0, '04', '', '06');
    const { vipCoupon, vipRecord, vipCouponConfigList } = this.data;
    let { paytype, item } = e.currentTarget.dataset
    let payData = {
      status: 0,
      fail: {
        content: '购买失败',
        btnText: '重新支付'
      }
    }
    let payParams = {
      payType: paytype, // 支付类型 01  首次开通会员  02 续费会员  03 购买加油包
      payWay: 'wechat', // 支付方式
      payChannel: 'mina', // 支付渠道
      totalAmount: item?item.tvccCouponTotalAmount:vipCouponConfigList.tvccCouponTotalAmount, // 总金额
      // actualAmount: 0.01, // 实际付款
      actualAmount: item?item.tvccActualAmount:vipCoupon.vipPayAmount, // 实际付款
      tvccCouponActivityId: item?item.tvccCouponActivityId:vipCouponConfigList.tvccCouponActivityId,
      tvprTvccId: item?item.tvccId:vipCoupon.tvccId,
    }
    apiRequest.payVip(payParams).then(res => {
      // vipStt: 01 立即开通 02 没券续费 03 有券续费  04 五折购买
      switch (vipCoupon.vipStt) {
        case '01':
        case '02':
          payData.success = {
            content: '成功购买维士会员',
            tip: ''
          }
          break;
        case '03': 
        case '04':
          // 支付类型 01  首次开通会员  02 续费会员  03 购买加油包
          if(paytype == '02') {
            payData.success = {
              content: '成功购买维士会员',
              tip: vipCouponConfigList.tvccNum + '张会员券，将于' + vipRecord.tvrDateArr[0] + '发放'
            }
          } else if (paytype == '03') {
            payData.success = {
              content: '成功购买' + item.tvccNum + '张' + item.tvccCouponAmount + '元会员券',
              tip: ''
            }
          } else {
            payData = {}
          }   
          break;
      }
      // 支付类型 01  首次开通会员  02 续费会员  03 购买加油包
      // switch (paytype) {
      //   case '01':
      //     payData.success = {
      //       content: '成功购买维士会员',
      //       tip: ''
      //     }
      //     break;
      //   case '02': 
      //     payData.success = {
      //       content: '成功购买维士会员',
      //       tip: vipCouponConfigList.tvccNum + '张会员券，将于' + vipRecord.tvrDateArr[0] + '发放'
      //     }
      //     break;
      //   case '03':
      //     payData.success = {
      //       content: '成功购买' + item.tvccNum + '张' + item.tvccCouponAmount + '元会员券',
      //       tip: ''
      //     }
      //     break;
      // }
      payParams = Object.assign(payParams, {tradeNo: res.obj.payInfo.tradeNo})
      this.setData({
        renewShow: false,
        addBuyShow: false
      })
      if (res.errCode == '0') {
        // 微信支付
        wxService.payment(res.obj.payInfo).then(async data => {
          if (data.errMsg == 'requestPayment:fail cancel') {
            wx.navigateTo({
              url: `/pages/packSubAccount/member/submitStatus/submitStatus?payData=${JSON.stringify(payData)}&payParams=${JSON.stringify(payParams)}`,
            });
          }
          if (data.errMsg == 'requestPayment:ok') {
            payData.status = 1
            wx.navigateTo({
              url: `/pages/packSubAccount/member/submitStatus/submitStatus?payData=${JSON.stringify(payData)}&payParams=${JSON.stringify(payParams)}`,
            });
          }
        })
      } else {
        wx.navigateTo({
          url: `/pages/packSubAccount/member/submitStatus/submitStatus?payData=${JSON.stringify(payData)}&payParams=${JSON.stringify(payParams)}`,
        });
      }
    })
      .catch(error => {
        wx.navigateTo({
          url: `/pages/packSubAccount/member/submitStatus/submitStatus?payData=${JSON.stringify(payData)}&payParams=${JSON.stringify(payParams)}`,
        });
      })
      .finally(error => {
        wx.hideLoading();
      })
  }),
  // 去使用
  toUse() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  // 立即续费
  renew() {
    this.setData({
      renewShow: true
    })
  },
  // 加量包购买
  addBuy(e) {
    let { item } = e.currentTarget.dataset;
    this.setData({
      addBuyShow: true,
      addBuyData: item
    })

  },
  // 购买记录
  buyRecord() {
    wx.navigateTo({
      url: '/pages/packSubAccount/member/buyRecord/buyRecord'
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