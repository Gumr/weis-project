// pages/mineBox/balance/balance.js
// import {throttle} from '../../../utils/limit'
const app = getApp()
import apiRequest from '../../../service/index';
import wxService from '../../../service/WxService'
// import {
//   throttle
// } from '../../../utils/throttle'
import libTool from '../../../libs/tool'
import {
  round
} from '../../../utils/common'
import {add, sub, mul} from '../../../libs/calc'
const dayjs = require('../../../libs/day')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    navBarHeight: app.globalData.navBarHeight,
    balance: {},
    agree: true, // 协议勾选
    // discountList: [],
    tabIndex: 1,
    isIpx: app.globalData.isIpx,
    uncheckList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uncheck = app.globalData.uncheck;
    uncheck.totalcash = round(Number(uncheck.amount || 0) + Number(uncheck.donation || 0), 2)
    this.setData({
      source: options.source,
      joinRuleBalance: options.joinRuleBalance || 0,
      uncheck: Object.assign(uncheck, {
        date: dayjs(uncheck.ctime).format('MM月DD日')
      })
    })
    // this.queryCardTicketTemplate()
    this.clearUncheck()
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
    this.queryBalance()
  },
  // 清空未读
  clearUncheck() {
    apiRequest.reversalUnconfirmedRecord()
      .then(res => {
        if (res.errCode == 0) {
          app.globalData.uncheck = {}
          wx.hideTabBarRedDot({
            index: 4,
            fail: function (res) {
              console.log(res)
            }
          })
        }
      })
  },
  // 输入充值金额并计算赠送金
  inputCashFn(e) {
    const {value} = e.detail
    const {balance: {ruleArray}} = this.data
    this.setData({
      rgAmount: value,
      present: parseFloat(mul(value, calcPre(value))).toFixed(2)
    })
    function calcPre(amount) {
      let discount = 0
      ruleArray.forEach(item => {
        if(amount >= item.startInterval && amount < item.endInterval) {
          discount = item.discount
        }
      })
      return discount
    }
  },
  // 立即充值
  recharge: libTool.throttle(function () {
    if (!this.data.agree) return
    const { rgAmount, present, balance, joinRuleBalance, source } = this.data
    if(rgAmount <= 0) return
    // 充值后本金不能超1000
    const afterMoney = add(balance.totalRecharge + +rgAmount)
    if (afterMoney > 1000) {
      this.setData({
        show: true
      })
      return
    }
    apiRequest.customRecharge({
      rechargeAmount: rgAmount
    }).then(res => {
      if (res.errCode == '0') {
        // 微信支付
        wxService.payment(res.obj).then(async data => {
          if (data.errMsg == 'requestPayment:fail cancel') {
            wx.navigateTo({
              url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
            });
          }
          if (data.errMsg == 'requestPayment:ok') {
            // await this.activatePurchaseRrder(res.obj.orderId)
            wx.navigateTo({
              url: `/pages/mineBox/rechargeStt/rechargeStt?status=1&amount=${rgAmount}&discount=${present}&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
            });
          }
        })
      } else {
        wx.navigateTo({
          url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
        });
      }
    })
    .catch(error => {
      wx.navigateTo({
        url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
      });
    })
    // apiRequest.rechargeCardTicket({
    //     buyCardList: [{
    //       cid: discountList[tabIndex].cid,
    //       count: 1
    //     }]
    //   }).then(res => {
    //     if (res.errCode == '0') {
    //       // 微信支付
    //       wxService.payment(res.obj).then(async data => {
    //         if (data.errMsg == 'requestPayment:fail cancel') {
    //           wx.navigateTo({
    //             url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
    //           });
    //         }
    //         if (data.errMsg == 'requestPayment:ok') {
    //           // await this.activatePurchaseRrder(res.obj.orderId)
    //           wx.navigateTo({
    //             url: `/pages/mineBox/rechargeStt/rechargeStt?status=1&amount=${discountList[tabIndex].amount}&discount=${discountList[tabIndex].discount}&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
    //           });


    //         }
    //       })
    //     } else {
    //       wx.navigateTo({
    //         url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
    //       });
    //     }
    //   })
    //   .catch(error => {
    //     wx.navigateTo({
    //       url: `/pages/mineBox/rechargeStt/rechargeStt?status=-1&source=${source}&joinRuleBalance=${joinRuleBalance}&totalBalance=${balance.totalBalance}`,
    //     });
    //   })
  }, 1500),
  showDialog() {
    this.setData({
      show: true
    })
  },
  knowFn() {
    const higest = add(1000, -this.data.balance.totalRecharge)
    this.setData({
      show: false,
      rgAmount: higest
    }, () => {
      this.inputCashFn({detail: {value: higest}})
    })
  },
  // recharge: throttle(function() {
  //   if(!this.data.agree) return
  //   const {discountList, tabIndex, source} = this.data
  //   apiRequest.rechargeCardTicket({
  //     buyCardList: [{
  //       cid: discountList[tabIndex].cid,
  //       count: 1
  //     }]
  //   }).then(res => {
  //     if (res.errCode == '0') {
  //       wxService.payment(res.obj).then(async data => {
  //         if (data.errMsg == 'requestPayment:fail cancel') {
  //           wx.navigateTo({
  //             url: `/pages/mine/rechargeStt/rechargeStt?status=-1&source=${source}`,
  //           });
  //         }
  //         if (data.errMsg == 'requestPayment:ok') {
  //           await this.activatePurchaseRrder(res.obj.orderId)
  //           wx.navigateTo({
  //             url: `/pages/mine/rechargeStt/rechargeStt?status=1&amount=${discountList[tabIndex].amount}&discount=${discountList[tabIndex].discount}&source=${source}`,
  //           });
  //         }
  //       })
  //     } else {
  //       wx.navigateTo({
  //         url: `/pages/mine/rechargeStt/rechargeStt?status=-1&source=${source}`,
  //       });
  //     }
  //   })
  //   .catch(error => {
  //     wx.navigateTo({
  //       url: `/pages/mine/rechargeStt/rechargeStt?status=-1&source=${source}`,
  //     });
  //   })
  // }, 1500),
  // 激活购买卡券
  activatePurchaseRrder: function (oid) {
    return new Promise(resolve => {
      apiRequest.activatePurchaseRrder({
        oid
      }).then(res => {
        resolve()
      })
    })
  },
  // 选择充值金额
  // selectCash: function (e) {
  //   let {
  //     discountList
  //   } = this.data
  //   const {
  //     index
  //   } = e.currentTarget.dataset
  //   discountList.map(item => item.isDefault = false)
  //   discountList[index].isDefault = true
  //   this.setData({
  //     discountList,
  //     tabIndex: index
  //   })
  // },
  // 协议
  xyFn: function () {
    this.setData({
      agree: !this.data.agree
    })
  },
  // 查询余额
  queryBalance: function () {
    apiRequest.detailsBalance({
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      // this.setData({
      //   balance: res.obj
      // })
      const totalBalance = res.obj.totalBalance ? res.obj.totalBalance : 0;
      const ruleArray = res.obj.ruleArray.filter(item => item.stt !== '01')
      const higest = res.obj.totalRecharge >= 1000 ? 0 : add(1000, -res.obj.totalRecharge)
      this.setData({
        balance: res.obj ? {
          ...res.obj,
          ruleArray,
          totalBalance: parseFloat(totalBalance.toFixed(2))
        } : {},
        rgAmount: higest,
        higestAmount: higest,
        present: parseFloat(mul(higest, calcPre(higest))).toFixed(2),
      })
      function calcPre(amount) {
        let discount = 0
        ruleArray.forEach(item => {
          if(amount >= item.startInterval && amount < item.endInterval) {
            discount = item.discount
          }
        })
        return discount
      }
    })
  },
  // 获取可充值金额数据
  // queryCardTicketTemplate: function () {
  //   apiRequest.queryCardTicketTemplate({
  //     pageNo: 1,
  //     pageSize: 10,
  //     type: '00'
  //   }).then(res => {
  //     let {
  //       cardList: {
  //         record
  //       }
  //     } = res.obj
  //     const list = record.map(async (item, index) => {
  //       if (30 <= item.amount && item.amount <= 10000) {
  //         const discount = await this.rechargeDiscount(item.amount)
  //         item.discount = discount
  //         return item
  //       }
  //     })
  //     Promise.all(list).then(result => {
  //       const newArr = result.filter(item => item != undefined).reverse()
  //       newArr[1].isDefault = true
  //       this.setData({
  //         discountList: newArr
  //       })
  //     })

  //   })
  // },
  // // 获取可充值金额对应的折扣
  // rechargeDiscount: function (orderPrice) {
  //   return new Promise(resolve => {
  //     apiRequest.rechargeDiscount({
  //       orderPrice
  //     }).then(res => {
  //       resolve(Number(res.obj.cardDiscount))
  //     })
  //   })
  // },
  // 余额明细
  goBalanceDetail: function () {
    wx.navigateTo({
      url: '/pages/mineBox/balanceDetail/balanceDetail'
    })
  },
  // 《维士健康(付费)会员协议》
  goRechargeDeal: function () {
    wx.navigateTo({
      url: '/pages/mineBox/rechargeDeal/rechargeDeal'
    })
  },

  activation() {
    wx.navigateTo({
      url: '/pages/mineBox/activationCard/activationCard',
    });
  },

  // 下载网络字体
  // loadFontFace() {
  //   const that = this
  //   wx.loadFontFace({
  //     family: 'DINCondensed',
  //     source: 'url("https://prodstatic.weis1606.cn/api1/recipes/DIN%20Condensed%20Bold.ttf")',
  //     success(res) {
  //       that.setData({fontLoaded: true})
  //     },
  //     fail: function(res) {
  //     },
  //     complete: function(res) {
  //     }
  //   })
  // },
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

  }
})