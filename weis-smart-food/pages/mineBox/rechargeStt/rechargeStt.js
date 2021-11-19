// pages/mineBox/rechargeStt/rechargeStt.js
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // debugger
    this.setData({
      source: options.source,
      status: Number(options.status),
      amount: Number(options.amount),
      discount: Number(options.discount),
      joinRuleBalance: options.joinRuleBalance,
      totalBalance: options.totalBalance,
    })
    
    if (options.joinRuleBalance) {
      this.queryBalance()
    }
  },
  // 查询余额
  queryBalance: function () {
    apiRequest.detailsBalance({
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      const totalBalance = res.obj.totalBalance ? parseFloat(res.obj.totalBalance.toFixed(2)) : 0;
      this.setData({
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        isjoin: Boolean(totalBalance > Number(this.data.joinRuleBalance))
      })
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

  },
  finish: function () {
    let delta = 1
    let isTab = false //是否来自tab页
    const { source } = this.data
    const pages = getCurrentPages()
    switch (source) {
      case 'submit':
        page: for (var i = 0; i < pages.length; i++) {
          if (pages[i].route.includes('submit/submit')) {
            delta = pages.length - i - 1
            break page
          }
        }
        break;
      case 'packages':
        delta = 2;
        break;
      case 'onlineFat':
        if (!this.data.isjoin) {
          const prePage = pages[pages.length - 2]
          // prePage.recharge()
          break
        } else {
          delta = 2;
          break;
        }
      case 'treat'://请客吃饭
        delta = 2;
        break;
      default:
        const prePage = pages[pages.length - 2]
        delta = prePage.route.includes('rechargeStt/rechargeStt') ? 2 : 1
        break;
    }

    if (!isTab) {
      wx.navigateBack({
        delta
      })
      return
    }

  },
  // 重新支付
  payAgain: function () {
    // debugger
    const pages = getCurrentPages();
    const prePage = pages[pages.length - 2]
    prePage.recharge()
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