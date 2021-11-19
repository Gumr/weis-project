import day from '../../../../libs/day'
import requests from '../../../../service/index'

// pages/solution/aiLossWeight/aiLossWeight.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showDateDialog: false,
    plan: {
      weight: '',
      type: '',
    },
    date: '',
    infeasible: false,
    disableDate: (date) => {
      const now = day();
      if (now.get('hour') >= 16) {
        return date < now.add(1, 'day').valueOf()
      } else {
        return date < now.valueOf()
      }
    },
    startDate: day().add(1, 'day').format('YYYY-MM-DD'),
    step: 1,
    title: '你想瘦多少',
    keyboardHeight: 0,
    dateList: [
      {
        value: 7,
        text: '7天达成目标',
        image: 'https://prodstatic.weis1606.cn/api/solution/7day_bj.png'
      },
      {
        value: 14,
        text: '14天达成目标',
        image: 'https://prodstatic.weis1606.cn/api/solution/14day_bj.png'
      },
      {
        value: 21,
        text: '21天达成目标',
        image: 'https://prodstatic.weis1606.cn/api/solution/28day_bj.png'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.calendarComp = this.selectComponent('#calendar')

    this.setData({
      navHeight: getApp().globalData.navStatusHeight
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  handleCalendarSelect(evt) {
    this.selectDate = evt.detail[0].date;
  },
  closeCalendarTap() {
    this.setData({
      showDateDialog: false
    })
  },
  dateTap() {
    if (this.data.date) {
      this.calendarComp.selectDate(day(this.data.date).format('YYYY/MM/DD'))

    }
    this.setData({
      showDateDialog: true
    })
  },
  createNavigation() {
    return requests.createNavigation({
      params: [{
        targetWeight: Number(this.data.plan.weight),
        type: '00',
        cycle: this.data.plan.type,
        sdateTime: day(this.data.date).format('YYYYMMDD')
      }]
    })
  },

  completeTap() {
    if (this.data.date && this.data.plan.type) {
      this.createNavigation()
        .then((res) => {
          if (res.errCode === 0) {
            this.saveId = res.obj.saveId;
            wx.navigateTo({
              url: '/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery'
            })
          } else if (res.errCode === 1009) { // 时间短或者目标值过大 无法完成
            wx.showToast({
              title: res.errMsg,
              icon: 'none'
            })
            this.setData({
              feasible: false
            })
          }
        })
    }
  },
  calendarConfirmTap() {
    this.setData({
      date: day(this.selectDate).format('YYYY/M/D'),
      showDateDialog: false
    }, () => {
      this.updateFeaible()
    })
  },
  updateFeaible() {
    this.setData({
      feasible: this.data.date && this.data.plan.type
    })
  },
  typeItemTap(evt) {
    this.setData({
      'plan.type': evt.currentTarget.dataset.value
    }, () => {
      this.updateFeaible()
    })
  },
  setStep(step) {
    const title = {
      1: '你想瘦多少',
      2: '日期设置'
    }[step];

    this.setData({
      title,
      step
    })
  },
  handleWeightInput(evt) {
    this.setData({
      'plan.weight': evt.detail.value
    })
  },
  nextTap(evt) {
    if (evt.currentTarget.dataset.able) {
      wx.navigateTo({
        url: `/pages/packageDiscover/aiMeal/aiCycle/aiCycle?weight=${this.data.plan.weight}`
      })
    }

  },
  handleKeyboardheightchange(evt) {
    this.setData({
      keyboardHeight: evt.detail.height
    })
  },
  bannerTap() {
    wx.navigateTo({
      url: '/pages/mineBox/wallet/wallet'
    })
  }
})