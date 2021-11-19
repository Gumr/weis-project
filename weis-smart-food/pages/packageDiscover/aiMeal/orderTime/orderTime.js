import day from '../../../../libs/day';
import requests from '../../../../service/index';

// pages/solution/aiMeal/orderTime/orderTime.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    deliverWeek: false,
    disableDate: null,
    selectedDate: [],
    mealList: [{
      name: '早餐',
      title: '一天的开始',
      meal: '01',
      checked: true
    }, {
      name: '午餐',
      title: '最重要的一餐',
      meal: '02',
      checked: true,
    }, {
      name: '晚餐',
      title: '少吃不胖',
      meal: '03',
      checked: true
    }],
    checkMeal: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fromPage: options.fromPage || '',
      isIpx: getApp().globalData.isIpx,
    })
    if (this.data.fromPage === 'slimmingCamp') { // 如果是瘦身营方案 最少选择两餐
      this.setData({
        'mealList[2].checked': true
      })
    }
    this.updateCheckMeal()
    this.getUserPlan();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.once('state', (state) => {
      if (state.startStt === 0) {
        state.next = 2;
      }
      this._state = state;
      if (state.type == 'celebrityPlan') {
        // 网红方案点餐
        this.checkPlanOrderDatelist()
      } else {
        this.checkAiDatelist();
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

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

  selectMeal(e) {
    const { index, disabled } = e.currentTarget.dataset;
    if (disabled) return;
    const mealList = [...this.data.mealList];

    mealList[index] = {
      ...mealList[index],
      checked: !mealList[index].checked
    }
    // 瘦身营页面 要做判断
    if (this.data.fromPage === 'slimmingCamp') {
      const checkMeal = mealList.filter(({ checked }) => checked);
      if (checkMeal.length < 2) {
        wx.showToast({
          title: '坚持才有效，每日至少需选择两餐！',
          icon: 'none'
        })
        return;
      }
    }

    this.setData({
      mealList
    })
    this.updateCheckMeal()
  },
  updateCheckMeal() {
    this.setData({
      checkMeal: this.data.mealList
        .filter(({ checked }) => checked)
        .map(({ meal }) => meal)
    })
  },
  week() {
    const deliverWeek = !this.data.deliverWeek;
    this.setData({
      deliverWeek
    });
    const calendarComp = this.selectComponent('#calendar');
    calendarComp.clear();
    if (this._state.type == 'celebrityPlan') {
      this.checkPlanOrderDatelist()
        .then((dateList) => {
          this.setData({
            btnDisabled: dateList.length < 5
          })
          if (this.data.fromPage === 'slimmingCamp'
            && this.data.btnDisabled) { // 处于瘦身营且方案日期小于3天
            wx.showToast({
              title: '订餐不足5日，请返回调整方案最早开始时间！',
              icon: 'none'
            })
            return;
          }
        })
    } else {
      this.checkAiDatelist();
    }
  },

  // 网红方案点餐日期列表
  checkPlanOrderDatelist() {
    const params = this._state || {};
    // 周末不配送 传1
    params.skipWeek = this.data.deliverWeek ? 1 : undefined;
    return requests.checkPlanOrderDatelist({
      caseId: params.caseId,
      isFullDate: (this.data.deliverWeek && this.data.fromPage === 'slimmingCamp')
        ? '01'
        : undefined,
      isCamp: (this.data.fromPage === 'slimmingCamp')
        ? '01'
        : undefined,
      date: params.date,
      start: params.start,
      skipWeek: params.skipWeek,
    }).then((res) => {
      let dateList = [];
      if (res.errCode === 0) {
        dateList = res.obj.dateList.map(item => day(item).format('YYYY/MM/DD'));
        this.initDate(dateList);
      }
      return dateList;
    });
  },

  // AI
  checkAiDatelist() {
    const params = this._state || {};

    // 周末不配送 传1
    params.skipWeek = this.data.deliverWeek ? 1 : undefined;

    return requests.checkAiDatelist(params).then((res) => {
      if (res.errCode === 0) {
        const dateList = res.obj.dateList.map(item => day(item).format('YYYY/MM/DD'));
        this.initDate(dateList);
      }
    });
  },
  getUserPlan() {
    return requests
      .queryNavigationInfo({
      })
      .then((res) => {
        if (res.errCode === 0) {
          const userRecord = res.obj.userRecord || '';
          this.setData({
            cycle: userRecord.cycle || '',
          });
        }
      });
  },
  initDate(dateList) {
    this.setData(
      {
        disableDate: (d) => {
          return (
            d < new Date(dateList[0]) ||
            d > new Date(dateList[dateList.length - 1])
          );
        },
      },
      () => {
        this._dateList = dateList;
        const calendarComp = this.selectComponent('#calendar');
        calendarComp.clear();
        calendarComp.selectDate(dateList);

        if (calendarComp.data.month !== day(dateList[0]).get('month') + 1) {
          // 如果今天是这个月最后一天 切到下个月显示日历
          calendarComp.next();
        }
      }
    );
  },
  orderTap(evt) {
    if (evt.currentTarget.dataset.disabled) return;
    wx.navigateTo({
      url: `/pages/packageDiscover/aiMeal/previewOrderMenu/previewOrderMenu?fromPage=${this.data.fromPage}`,
      success: ({ eventChannel }) => {
        const dateList = this._dateList.map((item) => item.split('/').join(''));
        if (this.data.fromPage) {
          eventChannel.emit('date-list', {
            date: dateList,
            checkMeal: this.data.checkMeal,
            caseId: this._state.caseId,
            needWeekend: this.data.deliverWeek ? '99' : '00'
          });
        } else {
          eventChannel.emit('date-list', {
            date: dateList,
            checkMeal: ['01', '02', '03'],
            needWeekend: this.data.deliverWeek ? '99' : '00'
          });
        }
      },
    });
  },
});
