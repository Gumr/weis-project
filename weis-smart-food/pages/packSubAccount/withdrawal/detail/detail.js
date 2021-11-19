// pages/packSubAccount/withdrawal/detail/detail.js
import { getStorage } from '../../../../utils/storage';
import { withdrawalList, } from '../../../../utils/map'
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
const years = []
const months = []
for (let i = 1900; i <= new Date().getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    currentTab: '00',
    tabs: [
      {
        label: '全部',
        value: '00'
      },
      {
        label: '提取中',
        value: '01'
      },
      {
        label: '提取成功',
        value: '02'
      },
      {
        label: '提取失败',
        value: '03'
      }
    ],
    withdrawalList,
    dateValue: [], 
    years,
    months
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      employeeInfo: JSON.parse(options.employeeInfo),
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
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
        });
      }
    });
    const {years, months} = this.data;
    let y = day(new Date()).get('year'), m = day(new Date()).get('month') + 1
    this.setData({
      dateValue: [years.indexOf(y), 0, months.indexOf(m), 0]
    });
    this.queryYzhToWxPayList()
  },
  // tab切换
  tabTap({ currentTarget }) {
    this.setData({
      currentTab: currentTarget.dataset.value
    })
    this.queryYzhToWxPayList();
  },
  // 日期
  date() {
    this.setData({
      showDate: true
    })
  },
  // 日期-更改
  dateConfirm(e) {
    const value = e.detail.value
    this.setData({
      dateValue: value
    })
    this.queryYzhToWxPayList()
  },
  // 查询提现列表
  queryYzhToWxPayList() {
    let { years, months, dateValue, currentTab, employeeInfo, } = this.data;
    let y = years[dateValue[0]], m = months[dateValue[2]] < 10? '0' + months[dateValue[2]] : months[dateValue[2]];
    apiRequest.queryYzhToWxPayList({
      orderStatus: currentTab,// 订单状态 00：全部 01：提现中；02：提现成功；03：提现失败
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
      empId: employeeInfo[0].tseId,// 销售人员主键id
      time: y + '' + m,// 时间yyyyMM
    })
      .then(res => {
          let { yzhWxpayList } = res.obj;
          this.setData({
            yzhWxpayList: yzhWxpayList.map(item => {
              item.ctime = day(item.ctime).format('YYYY.MM.DD HH:mm')
              item.utime = day(item.utime).format('YYYY.MM.DD HH:mm')
              return item
            })
          })
      })
      .catch(error => {

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