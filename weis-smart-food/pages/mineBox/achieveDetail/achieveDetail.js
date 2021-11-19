// pages/mineBox/achieveDetail/achieveDetail.js
import apiRequest from '../../../service/index';
import { formatDate } from '../../../utils/util'
import {round} from '../../../utils/common'
const fullDate = formatDate('Y-M-D')
import day from '../../../libs/day';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    profitCols: [{
      name: '餐单', 
      value: 0
    }, {
      name: '业绩', 
      value: 0
    }, {
      name: '提成', 
      value: 0
    }],
    tseIds: [],
    characterMatch: {
      100001: '主管', 
      100002: '2B', 
      100003: '2C', 
    },
    character: [], // tab
    tabIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      index: options.index,
      date: options.date,
      title: day(options.date).format('MM月DD日')
    }, () => {
      this.initPage()
    })
    // this.setData({
    //   date: options.date,
    //   status: options.status,
    //   type: options.type,
    //   code: options.code,
    //   title: options.desc || '我'
    // })
    // this.queryIncome()
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
  // 初始化页面，根据不同用户角色
  initPage: function() {
    let obj = {}, character = []
    let {profitCols, index} = this.data
    const pages = getCurrentPages(),
      {employeeInfo, profitList, tseIds} = pages[pages.length - 2].data
    if(tseIds.length > 1) {
      // 生成tab
      employeeInfo.map(item => {
        obj = {
          tseId: item.tseId,
          name: this.data.characterMatch[item.tseRoleId]
        }
        character.push(obj)
      })
    }
    profitCols.forEach(item => {
      item.name == '餐单' && (item.value = profitList[index].orderQuantity)
      item.name == '业绩' && (item.value = profitList[index].achievement)
      item.name ==  '提成' && (item.value = profitList[index].income)
    })
    employeeInfo[0].tseRoleId == 100006 && profitCols.splice(0, 1)
    this.setData({
      tseIds,
      employeeInfo,
      character,
      profitCols
    }, () => {
      const tseId = character.length > 1 ? character[0].tseId : tseIds
      this.querySaleProfitDetail(tseId)
    })
  },


  // 点餐/充值-详情
  querySaleProfitDetail(tseId) {
    const { date } = this.data
    apiRequest.querySaleProfitDetail({
      date,
      tseId,
      pageNo: this.$pageNo,
      pageSize: 20,
    }).then((res) => {
      if (res.errCode === 0) {
        let totalMeal = 0, totalAchieve = 0, totalIncome = 0
        const {saleProfitDTOS} = res.obj
        saleProfitDTOS.forEach(item => {
          totalAchieve = round(totalAchieve + Number(item.actual), 2)
          totalMeal = round(totalMeal + Number(item.orderQuantity), 2)
          totalIncome = round(totalIncome + Number(item.profit), 2)
        })
        // profitCols.forEach(item => {
        //   item.name == '餐单' && (item.value = totalMeal)
        //   item.name == '业绩' && (item.value = totalAchieve)
        //   item.name ==  '提成' && (item.value = totalIncome)
        // }) 
        this.setData({ 
          recommendList: saleProfitDTOS,
          totalMeal,
          totalIncome
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        })
      }
    })
  },
  switchTab: function(e) {
    const {character, tabIndex} = this.data
    const {index} = e.currentTarget.dataset
    if(tabIndex === index) return
    this.setData({
      tabIndex: index
    }, () => {
      this.querySaleProfitDetail(character[index].tseId)
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