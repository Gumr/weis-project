// pages/mineBox/balanceDetail/balanceDetail.js
import day from '../../../libs/day'
import apiRequest from '../../../service/index';
import {
  rechargeType
} from '../../../utils/map'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPopup: false,
    rechargeType,
    queryCapitalFlows: [],
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    px2rpx: app.globalData.px2rpx,
    whichCate: '01',
    cateObj: {
      '01': {
        que: '本金是什么？',
        answer: '本金为充值时微信实际支付金额。'
      },
      '02': {
        que: '赠送金是什么',
        answer: '赠送金为维士各种形式的赠送金额。包括充值赠送金额，翻牌返现赠送金额，拼单返配送费金额，拼单折扣组返利金额等'
      }
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.queryBalance()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 查询余额及明细
  queryBalance: function () {
    let {
      queryCapitalFlows: oldArr
    } = this.data
    apiRequest.detailsBalance({
      pageNo: this.$pageNo,
      pageSize: 20
    }).then(res => {
      if (res.errCode === 0) {
        let {
          queryCapitalFlows
        } = res.obj
        if (this.$pageNo > 1 && queryCapitalFlows.length === 0) {
          this.setData({
            loadmoreFlag: false
          }, () => {
            this.$pageNo--
          })
          return
        }
        let list = queryCapitalFlows.map((item) => {
          item.longTime = item.ctime.substring(0, 4) + '-' + item.ctime.substring(4, 6) + '-' + item.ctime.substring(6, 8) + ' ' + item.ctime.substring(8, 10) + ':' + item.ctime.substring(10, 12) + ':' + item.ctime.substring(12, 14)
          item.ctime = item.longTime.split(' ')[0];
          item.amount = parseFloat(Number(item.amount).toFixed(2))
          item.donation = parseFloat(Number(item.donation).toFixed(2))
          item.total = (Number(item.amount) + Number(item.donation)).toFixed(2)
          item.total = Number(item.total)
          item.date = day(item.ctime).format('YYYY/MM/DD')
          item.time = item.longTime.split(' ')[1]
          return item
        })
        this.setData({
          queryCapitalFlows: oldArr.concat(list),
          totalDonation: res.obj.totalDonation,
          totalRecharge: res.obj.totalRecharge
        })
      }
    })
  },
  // 余额明细-详情
  goBillDetail: function (e) {
    const {
      index
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/mineBox/billDetail/billDetail?index=${index}`
    })
  },
  clickFn(e) {
    const {
      type
    } = e.currentTarget.dataset
    if (type) {
      this.setData({
        whichCate: type
      })
    }
    this.setData({
      showPopup: !this.data.showPopup
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    this.$pageNo++
    this.setData({
      loadmoreFlag: true
    })
    this.queryBalance()
  }
})