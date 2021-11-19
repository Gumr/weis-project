// pages/mineBox/helpRecharge/helpRecharge.js
import {
  getStorage
} from '../../../utils/storage'
import {
  loginPromise,
  round
} from '../../../utils/common'
import apiRequest from '../../../service/index';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
    selectIndex: 1,
    agree: true,
    errStatus: '', // 1 不存在 2 存在
    isIpx: app.globalData.isIpx,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const navStatusHeight = getStorage('navStatusHeight');
    loginPromise.then((res) => {
      this.setData({
        navStatusHeight,
        selfUid: app.globalData.uid,
      })
    })
    this.queryCardTicketTemplate()
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

  // 获取可充值金额数据
  queryCardTicketTemplate: function () {
    apiRequest.queryCardTicketTemplate({
      pageNo: 1,
      pageSize: 10,
      type: '00'
    }).then(res => {
      let {
        cardList: {
          record
        }
      } = res.obj
      const list = record.map(async (item, index) => {
        if (30 <= item.amount && item.amount <= 3000) {
          const discount = await this.rechargeDiscount(item.amount)
          item.discount = discount
          return item
        }
      })
      Promise.all(list).then(result => {
        const newArr = result.filter(item => item != undefined).reverse()
        this.setData({
          discountList: newArr
        })
      })

    })
  },

  // 获取可充值金额对应的折扣
  rechargeDiscount: function (orderPrice) {
    return new Promise(resolve => {
      apiRequest.rechargeDiscount({
        orderPrice
      }).then(res => {
        resolve(Number(res.obj.cardDiscount))
      })
    })
  },

  select(e) {
    let index = e.currentTarget.dataset.index;
    let selectIndex = this.data.selectIndex;
    if (index === selectIndex) {
      return
    }
    this.setData({
      selectIndex: index
    })
  },

  sure() {
    let {
      errStatus,
      agree,
      selectIndex,
      discountList,
      info
    } = this.data;
    // 充值后本金不能超1000
    const afterMoney = Number(info.totalRecharge + discountList[selectIndex].amount)
    if (afterMoney > 1000) {
      this.setData({
        showCharge: true
      })
      return
    }
    if (errStatus == '2' && agree && selectIndex !== '') {
      this.setData({
        showDialog: !this.data.showDialog
      })
    }
  },

  confirm() {
    const {
      discountList,
      selectIndex,
      info
    } = this.data;
    const rechargeAmount = discountList[selectIndex].amount;
    const donationAmount = round(discountList[selectIndex].amount * discountList[selectIndex].discount, 2)
    this.sure();
    apiRequest.rechargeCardTicket({
      buyCardList: [{
        cid: discountList[selectIndex].cid,
        count: 1,
      }],
      targetUid: info.uid,
      targetPhone: info.phone,
      targetName: info.uname
    }).then(res => {
      if (res.errCode == '0') {
        // 微信支付
        apiRequest.payment(res.obj).then(async data => {
          if (data.errMsg == 'requestPayment:ok') {
            let {
              uname,
              phone
            } = info;
            wx.navigateTo({
              url: `/pages/mineBox/activationSucc/activationSucc?rechargeAmount=${rechargeAmount}&donationAmount=${donationAmount}&succType=helpRecharge&phone=${phone}&uname=${uname}`,
            });
          }
        })
      }
    })
  },

  agree() {
    this.setData({
      agree: !this.data.agree
    })
  },

  record() {
    wx.navigateTo({
      url: '/pages/mineBox/helpRecord/helpRecord',
    });
  },

  checkXy() {
    wx.navigateTo({
      url: '/pages/mineBox/rechargeDeal/rechargeDeal',
    });
  },

  phoneChange(e) {
    this.setData({
      phone: e.detail.value
    })
    if (this.data.phone.length == 11) {
      this.queryUserInfoByPhone()
    } else {
      this.setData({
        errStatus: '',
      })
    }
  },

  // 查询用户
  queryUserInfoByPhone() {
    apiRequest.queryUserInfoByPhone({
      phone: this.data.phone
    }).then(res => {
      if (res.errCode == '1001') {
        this.setData({
          errStatus: '1'
        })
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
        return
      }
      let info = {
        phone: res.obj.phone,
        uid: res.obj.uid,
        uname: res.obj.uname,
        totalRecharge: res.obj.totalRecharge
      };
      if (info.uid == this.data.selfUid) {
        this.setData({
          errStatus: '',
        })
        wx.showToast({
          title: '不能帮自己充值',
          icon: 'none',
        });
        return
      }
      this.setData({
        info,
        errStatus: '2'
      })
    })
  },
  knowFn() {
    this.setData({
      showCharge: false
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