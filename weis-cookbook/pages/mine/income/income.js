// pages/mine/income/income.js
import IncomeService from '../../../service/IncomeService'
const incomeService = new IncomeService()
import {formatDate} from '../../../utils/util'
const getMonthday = formatDate('Y-M-D')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0,
    historyBalance: 0,
    balanceRecordList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.queryIncome()
    this.queryIncomeList()
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
  cashout(){
    const {balance} = this.data
    if(balance == 0) return
    wx.navigateTo({
      url: '/pages/basic/cashout/cashout'
    })
  },
  queryIncome() {
    incomeService.queryIncomeTotal().then(res => {
      if(res.errCode === 0) {
        const {balanceHistory, balanceCurrent} = res.obj
        this.setData({
          balance: balanceCurrent ? balanceCurrent : 0,
          historyBalance: balanceHistory ? balanceHistory : 0
        })
      }
      
    })
  },
  queryIncomeList() {
    incomeService.queryIncomeList({
      pageNo: this.$pageNo,
      pageSize: 10
    }).then(res => {
      const {balanceRecordList} = res.obj
      if(res.errCode === 0 && balanceRecordList) {
        balanceRecordList.forEach(item => {
          item.createTime = getMonthday(item.createTime)
        })
        this.setData({
          balanceRecordList
        })
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
    this.$pageNo++
    this.queryIncomeList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})