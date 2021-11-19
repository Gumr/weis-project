// pages/mineBox/achievement/achievement.js
import {formatNumber, formatDate} from '../../../utils/util'
const fullDate = formatDate('Y-M-D')
const app = getApp()
import apiRequest from '../../../service/index';
import day from '../../../libs/day';

let years = []
let months = []
const year = new Date().getFullYear()
var month = new Date().getMonth() + 1
//年份
for(var i = 1949; i <=year; i++) {
  years.push(i)
}
//月份
for(var i = 1; i < 13; i++) {
  months.push(i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navtitle: '',
    achievement: '',
    profitCols: [],
    cols: [],
    profitList: [],
    characterMatch: {
      100001: '主管业绩', 
      100002: '2B拓展业绩', 
      100003: '2C客户业绩', 
      100005: '消耗类渠道业绩', 
      100006: '充值类渠道业绩'
    },
    character: [],
    characterVal: [0],
    selectTab: 0,
    years: years,
    months: months,
    dateValue: [years.indexOf(year) != -1 ? years.indexOf(year) : 0, 0, months.indexOf(month) != -1 ? months.indexOf(month) : 0, 0],
    year: year,
    month: month,
    selectArr: year + '' + formatNumber(month),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.queryAchieve()
    // this.loadFontFace()
    this.$pageNo = 1
    this.getEmployeeInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getEmployeeInfo() {
    let {character, characterMatch} = this.data
    const pages =  getCurrentPages(),
      {employeeInfo} = pages[pages.length - 2].data
    let tseIds = employeeInfo.map(item => item.tseId)
    tseIds = tseIds.join()
    this.setData({
      employeeInfo,
      tseIds // 用户角色id组，用于展示不同角色业绩
    }, () => {
      if(employeeInfo[0].tseType === '02') {//01外部、02内部
        if(employeeInfo.length > 1) {
          character = ['全部业绩']
        } 
        employeeInfo.forEach(item => {
          character.push(characterMatch[item.tseRoleId])
        })
        this.setData({
          character,
          achievement: character[0]
        })
      } else {
        this.setData({
          navtitle: characterMatch[employeeInfo[0].tseRoleId]
        })
      }
      this.querySaleProfit()
      this.querySaleProfitList()
    })
  },
  // 根据月份获取总业绩
  querySaleProfit: function() {
    const {selectArr, tseIds, employeeInfo} = this.data
    apiRequest.querySaleProfit({
      date: selectArr,
      tseId: tseIds
    }).then(res => {
      if(res.errCode === 0) {
        const {saleProfitDTO: {orderQuantity, achievement, income}} = res.obj
        let profitCols = [{
          name: '餐单', 
          value: orderQuantity
        }, {
          name: '业绩', 
          value: achievement
        }, {
          name: '提成', 
          value: income
        }]
        employeeInfo[0].tseRoleId == 100006 && profitCols.splice(0, 1)
        this.setData({
          profitCols
        })
      }
    })
  },
  querySaleProfitList: function() {
    let {selectArr, tseIds, employeeInfo, profitList} = this.data
    apiRequest.querySaleProfitList({
      date: selectArr,
      tseId: tseIds,
      pageNo: this.$pageNo,
      pageSize: 20
    }).then(res => {
      if(res.errCode === 0) {
        const {saleProfitDTOS} = res.obj
        if(this.$pageNo == 1 && saleProfitDTOS.length === 0) {
          profitList = []
        }
        if(this.$pageNo > 1 && saleProfitDTOS.length === 0) {
          this.$pageNo--
        }
        saleProfitDTOS.forEach(item => {
          item.date = day(String(item.dateTime)).format('MM月DD日')
        })
        this.setData({
          cols: employeeInfo[0].tseRoleId !== 100006 
          ?
          ['日期', '餐数', '业绩', '提成'] : ['日期', '业绩', '提成'],
          profitList: profitList.concat(saleProfitDTOS)
        })
      }
    })
  },
  // 选日历
  selectDate() {
    this.setData({
      showPicker: true
    })
  },
  // 日期-确定
  dateConfirm(e) {
    const val = e.detail.value;
    const {years, months} = this.data;
    this.setData({
      year: years[val[0]],
      month: months[val[2]],
      selectArr: years[val[0]]   + '' + formatNumber(months[val[2]]),
      profitList: []
    }, () => {
      this.querySaleProfit()
      this.querySaleProfitList()
    })
  },
  // 查看不同角色对应的业绩
  roleConfirm(e) {
    const {value} = e.detail,
      {character, employeeInfo, characterMatch} = this.data,
      roleTxt = character[value]
    let tseIds
    if(roleTxt === '全部业绩') {
      tseIds = employeeInfo.map(item => item.tseId)
      tseIds = tseIds.join()
    } else {
      for(var key in characterMatch) {
        if(characterMatch[key] === roleTxt) {
          employeeInfo.forEach(item => {
            if(item.tseRoleId == key) {
              tseIds = item.tseId
            }
          })
        }
      }
    }
    this.setData({
      tseIds,
      achievement: roleTxt,
      profitList: []
    }, () => {
      this.$pageNo = 1
      this.querySaleProfit()
      this.querySaleProfitList()
    })
  },



  // 切换tab
  switchTab(e) {
    const {index} = e.currentTarget.dataset
    this.setData({
      selectTab: index
    }, () => {
      this.queryAchieve()
    })
  },
  queryAchieve() {
    const {selectTab} = this.data
    apiRequest.queryMyRevenuesByQrcode({
      date: this.data.selectArr,
      status: '20',
      type: selectTab == '0' ? '10' : '20'
    }).then(res => {
      if (res.errCode === 0) {
        const { totalProfit20, totalProfit20Type10, totalProfit20Type20 } = res.obj
        const totalcount = selectTab == 0 ? Number(totalProfit20Type10) : Number(totalProfit20Type20)
        // res.obj.partnerProfitHistVos = [{
        //   qrcodeDesc: '我',
        //   totalAmount: 20
        // }, {
        //   qrcodeDesc: '王匠师',
        //   totalAmount: 50
        // }, {
        //   qrcodeDesc: '隔壁老王',
        //   totalAmount: 80
        // }]

        this.setData({
          profitList: res.obj.partnerProfitHistVos.map((item) => {
            item.date = fullDate(item.tpphCtime)
            return item
          }),
          totalcount,
          // selectDate: false,
          total: Number(totalProfit20)
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        })
      }
    })
  },
  
  // selDate(e) {
  //   const {colData: [years, months], default: defaultVal} = e.detail
  //   const userYear = years[defaultVal[0]]
  //   const userMonth = months[defaultVal[1]]
  //   const searchDate = userYear + '' + formatNumber(userMonth)
  //   this.setData({
  //     year: userYear,
  //     month: userMonth,
  //     selectArr: searchDate
  //   }, () => {
  //     this.queryAchieve()
  //   })
  // },
  // 点餐/充值-详情
  goAchieveDetail(e) {
    const {profitList} = this.data
    const {index} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/mineBox/achieveDetail/achieveDetail?date=${profitList[index].dateTime}&index=${index}`
    })
  },
  characterTap: function() {
    this.setData({
      showCharacter: true
    })
  },
  // // 下载网络字体
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
    this.querySaleProfitList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})