import day from '../../../../libs/day';
import requests from '../../../../service/index';


// pages/solution/aiLossWeight/aiLossWeight.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    coverable: true, // 是否可覆盖
    showUnfeasibleDialog: false,
    showDateDialog: false,
    plan: {
      weight: '',
      type: '',
    },
    date: '',
    maxCycleWeight: 0,
    infeasible: false,
    disableDate: (date) => {
      const now = day();
      if (now.get('hour') >= 18) {
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
    if (options.weight) {
      this.setData({
        'plan.weight': options.weight
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.calendarComp = this.selectComponent('#calendar');

    const today = day();
    const startDate = today.get('hour') >= 18
      ? today.add(2, 'day')
      : today.add(1, 'day')

    if (day().get('month') !== startDate.get('month')) {
      // 如果今天是这个月最后一天 切到下个月显示日历
      this.calendarComp.next();
    }

    this.setData({
      navHeight: getApp().globalData.navStatusHeight,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  handleCalendarSelect(evt) {
    this.selectDate = evt.detail[0].date;
  },
  closeCalendarTap() {
    this.setData({
      showDateDialog: false,
    });
  },
  checkIsCustomizePlan() {
    const { date, plan } = this.data;
    requests.checkIsCustomizePlan({
      date: day(date).format('YYYYMMDD'),
      cycle: plan.type
    }).then((res) => {
      if (res.obj.result) {
        wx.showModal({
          title: '提示',
          content: '该日期已有方案，是否覆盖当前方案？',
          confirmText: '确定',
          cancelText: '取消',
          confirmColor: '#FE5E0F',
          success: (res) => {
            if (res.confirm) {
              this.setData({
                coverable: true
              })

            }

            if (res.cancel) {
              this.setData({
                coverable: false
              })
            }
            this.updateFeaible();
          }
        })
      } else {
        this.setData({
          coverable: true
        })
        this.updateFeaible();
      }
    })
  },
  dateTap() {
    if (this.data.date) {
      this.calendarComp.selectDate(day(this.data.date).format('YYYY/MM/DD'));
    }

    this.setData({
      showDateDialog: true,
    });
  },
  createNavigation(targetWeight) {
    return requests.createNavigation({
      targetWeight,
      type: '00',
      cycle: this.data.plan.type,
      sdateTime: day(this.data.date).format('YYYYMMDD'),
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          showUnfeasibleDialog: false
        });
        if (res.errCode === 0) {
          wx.reLaunch({
            url: `/pages/packageDiscover/planDetail/planDetail?id=${res.obj.saveId}`,
          });
        }
      }
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
  completeTap() {
    const { data } = this;
    if (!data.plan.type) {
      wx.showToast({
        title: '请选择周期',
        icon: 'none'
      })
      return;
    }
    if (!data.date) {
      wx.showToast({
        title: '请选择开始日期',
        icon: 'none'
      })
      return;
    }

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
  calendarConfirmTap() {
    this.setData(
      {
        date: day(this.selectDate).format('YYYY/M/D'),
        showDateDialog: false,
      },
      () => {
        this.checkIsCustomizePlan();
      }
    );
  },
  updateFeaible() {
    this.setData({
      feasible: this.data.date && this.data.plan.type && this.data.coverable,
    });
  },
  queryMaxSubtractWeight() { // 请求判断体重和周期是否能完成
    const { plan } = this.data;
    return requests.queryMaxSubtractWeight({
      days: plan.type,
      targetWeight: plan.weight
    }).then(res => res.errCode === 0 ? res.obj : Promise.reject(res))
  },
  typeItemTap(evt) {
    this.setData(
      {
        'plan.type': evt.currentTarget.dataset.value,
      },
      () => {
        this.updateFeaible();
      }
    );
  },
  setStep(step) {
    const title = {
      1: '你想瘦多少',
      2: '日期设置',
    }[step];

    this.setData({
      title,
      step,
    });
  },
  handleWeightInput(evt) {
    this.setData({
      'plan.weight': evt.detail.value,
    });
  },
  nextTap(evt) {
    if (evt.currentTarget.dataset.able) {
      this.setData({
        step: this.data.step + 1,
      });
    }
  },
  handleKeyboardheightchange(evt) {
    this.setData({
      keyboardHeight: evt.detail.height,
    });
  },
});
