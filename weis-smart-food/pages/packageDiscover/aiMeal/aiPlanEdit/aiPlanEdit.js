import day from '../../../../libs/day'
import requests from '../../../../service/index'

// pages/solution/aiMeal/aiPlanEdit/aiPlanEdit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUnfeasibleDialog: false,
    showDateDialog: false,
    plan: {
      weight: '',
      type: '',
    },
    date: '',
    maxCycleWeight: 0,
    disabled: true,
    disableDate: (date) => {
      const now = day();
      if (now.get('hour') >= 16) {
        // 大于4点方案只能后天开始 否则从明天开始
        return date < now.add(1, 'day').valueOf();
      } else {
        return date < now.valueOf();
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
        image: 'https://prodstatic.weis1606.cn/api/solution/7day_bj.png',
      },
      {
        value: 14,
        text: '14天达成目标',
        image: 'https://prodstatic.weis1606.cn/api/solution/14day_bj.png',
      },
      {
        value: 21,
        text: '21天达成目标',
        image: 'https://prodstatic.weis1606.cn/api/solution/28day_bj.png',
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isIpx: getApp().globalData.isIpx
    })

    this.queryNavigationInfo();
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
  completeAiPlan() {
    return requests.completeAiPlan({})
  },
  queryNavigationInfo() {
    requests.queryNavigationInfo({})
      .then((res) => {
        if (res.errCode === 0) {
          const hasRecord = Boolean(res.obj.userRecord);
          if (hasRecord) {
            this.setData({
              plan: {
                weight: res.obj.userRecord.weightDiff,
                type: Number(res.obj.userRecord.cycle)
              }
            })
          }
        }
      })
  },
  queryMaxSubtractWeight() { // 请求判断体重和周期是否能完成
    const { plan } = this.data;
    return requests.queryMaxSubtractWeight({
      days: plan.type,
      targetWeight: plan.weight
    }).then(res => res.errCode === 0 ? res.obj : Promise.reject(res))
  },
  async createNavigation(targetWeight) {
    const completeRes = await this.completeAiPlan();
    if (completeRes.errCode !== 0) return Promise.reject();
    const createRes = await requests.createNavigation({
      targetWeight,
      type: '00',
      cycle: this.data.plan.type,
      sdateTime: day(this.data.date).format('YYYYMMDD')
    })
    if (createRes.errCode !== 0) return Promise.reject();
    wx.reLaunch({
      url: `/pages/packageDiscover/planDetail/planDetail?id=${createRes.obj.saveId}`,
    });
  },
  handleUnfeasibleCancel() {
    if (this.data.plan.type === 21) {
      wx.navigateBack({
        delta: 2
      });
    } else {
      this.setData({
        showUnfeasibleDialog: false
      })
    }
  },
  handleUnfeasibleConfirm() {
    this.createNavigation(this.data.maxCycleWeight);
  },
  deleteTap() {
    wx.showModal({
      title: '提示',
      content: '是否删除该方案？',
      success: (res) => {
        if (res.confirm) {
          this.completeAiPlan()
            .then((response) => {
              if (response.errCode === 0) {
                wx.reLaunch({
                  url: '/pages/packageDiscover/aiMeal/aiDetail/aiDetail',
                });
              }
            });
        }
      }
    })
  },
  completeTap() {
    if (this.data.disabled) return;
    this.queryMaxSubtractWeight()
      .then((obj) => {
        if (!obj.result) {
          this.setData({
            maxCycleWeight: obj.maxCycleWeight,
            showUnfeasibleDialog: true
          })
        } else {
          this.createNavigation(Number(this.data.plan.weight))
        }
      })
  },
  handleUnfeasibleCancel() {
    if (this.data.plan.type === 21) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      this.setData({
        showUnfeasibleDialog: false
      })
    }
  },
  handleUnfeasibleConfirm() {
    this.createNavigation(this.data.maxCycleWeight);
  },
  calendarConfirmTap() {
    this.setData({
      date: day(this.selectDate).format('YYYY/M/D'),
      showDateDialog: false
    })

    this.updateDisabled()
  },
  updateDisabled() {
    this.setData({
      disabled: !this.data.date || !this.data.plan.type || !this.data.plan.weight
    })
  },
  typeItemTap(evt) {
    this.setData({
      'plan.type': evt.currentTarget.dataset.value
    })
    this.updateDisabled()
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
    this.updateDisabled()
  },
  nextTap(evt) {
    if (evt.currentTarget.dataset.able) {
      wx.navigateTo({
        url: `/pages/solution/aiMeal/aiCycle/aiCycle?weight=${this.data.plan.weight}`
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
  },

})