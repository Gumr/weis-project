// pages/solution/historyDetail/historyDetail.js
const app = getApp();
const day = require('../../../libs/day');
import apiRequest from '../../../service/index'


Page({

  /**
   * 页面的初始数据
   * selectWeek 0代表的本周  1代表下一周  -1代表上一周   
   * timeBean 传递给组件的数据，数据的格式在一开始的工具类中明确
   */
  data: {
    tabList: [{ name: '综合比例法', index: 0 }, { name: '固定蛋白法', index: 1 }],
    tabIndex: 0,
    navStatusHeight: '',
    selectVal: day().format('YYYY/MM/DD'),
    defaultValue: day().format('YYYY/MM/DD'),
    showCalendar: false,
    existDate: [],
    dietPlanData: '',
    segmentId: '',
    categoryKind: {
      '01': {
        name: '早餐',
        src: '/images/scheme_breakfast.png'
      },
      '02': {
        name: '午餐',
        src: '/images/scheme_lunch.png'
      },
      '03': {
        name: '晚餐',
        src: '/images/scheme_dinner.png'
      },
    },
    aimstatus: {
      '01': '减脂',
      '02': '增肌',
      '03': '保持体型',
      '04': '控糖',
    },
    calendarConfig: {
      showLunar: false,
      multi: false,
      highlightToday: true,
      onlyShowCurrentMonth: true,
      // disableIsToday: true,//今天之前的不能选
      disablePastDay: true,
      markToday: '今',
      inverse: true, // 单选模式下是否支持取消选中,
      hideBackToday: true,
      showSure: true,
    },
    selectIndex: 0,
    intoView: 'scroll-0',
    activityDateList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        supId: options.id
      }, () => {
        this.queryPlanUsageSituation();//查询该方案历史列表
        this.existActivityPlan();
      })
    }
    this.setData({
      navStatusHeight: wx.getStorageSync('navStatusHeight')
    })
  },

  onShow: function () {

  },


  queryPlanUsageSituation: function () {

    var that = this;
    apiRequest.queryPlanUsageSituation({
      planId: that.data.supId
    })
      .then(res => {
        let timeList = res.obj.usageSituation;
        timeList.forEach((item, index) => {
          item.time = day(item.dateStime).format('YYYY-MM-DD')
        })
        that.setData({
          timeList,
          segmentId: timeList[0].id
        }, () => {
          that.getTimeList();
        })
      })
      .catch(error => {

      })

  },

  tab: function (e) {
    let { id, index } = e.currentTarget.dataset;
    this.setData({
      selectIndex: index,
      segmentId: id,
      intoView: 'scroll-' + (index == 0 ? '0' : String(index - 1))
    }, () => {
      this.getTimeList()
    })
  },


  getTimeList: function () {
    var that = this;
    apiRequest.queryProgrammeList({
      isMainPlan: 0,
      supId: that.data.segmentId
    })
      .then(res => {
        if (res.errCode == '0' && res.obj && res.obj.dietPlanList.length > 0) {
          // console.log('11')
          let list = res.obj.dietPlanList;
          let existDate = [];
          list.forEach(function (item, index) {
            existDate.push(item.dateTime.substring(0, 4) + '/' + item.dateTime.substring(4, 6) + '/' + item.dateTime.substring(6, 8))
          })
          that.setData({
            existDate: existDate,
            defaultValue: existDate[0],
            selectVal: existDate[0],
            // list: list,
            planStt: list[0].planStt,
          }, () => {
            // onload先加载 避免switchtab跳转不刷新数据
            that.getDetail(existDate[0]);
            that.setData({
              apply: true
            }, () => {
              that.selectComponent("#weekCalendar").tiaotime(existDate[0]);
              that.queryCal();
            })
          })
        } else {
          that.setData({
            apply: true,
            existDate: [],
          }, () => {
            that.getDetail(that.data.selectVal);
            that.queryCal();
          })
        }
      })
      .catch(error => {

      })
  },


  getDetail: function (time) {
    var that = this;
    apiRequest.queryUserProgramme({
      dateTime: day(time).format('YYYYMMDD'),
      isMainPlan: '0',
      planStt: that.data.planStt,
      supId: that.data.segmentId,
      needGoods: true,
    })
      .then(res => {
        if (res.errCode == '0' && res.obj && res.obj.planDetailList) {
          let planDetailList = res.obj.planDetailList;
          planDetailList.forEach((item, index) => {
            let energyDvalue = 0;
            let proteinDvalue = 0;
            let fatDvalue = 0;
            let carbonWaterDvalue = 0;
            item.customProgramme.forEach((item1, index1) => {
              energyDvalue = energyDvalue + item1.energy;
              proteinDvalue = proteinDvalue + item1.protein;
              fatDvalue = fatDvalue + item1.fat;
              carbonWaterDvalue = carbonWaterDvalue + item1.carbonwater;

              item.energyDvalue = parseInt(energyDvalue - item.totalKcal)
              item.proteinDvalue = (proteinDvalue - item.proteinTotal).toFixed(1)
              item.fatDvalue = (fatDvalue - item.fatTotal).toFixed(1)
              item.carbonWaterDvalue = (carbonWaterDvalue - item.carbohydrateTotal).toFixed(1)
            })
          })
          that.setData({
            dataList: planDetailList,
            dietPlan: res.obj.dietPlan,
            planType: res.obj.planType
          })
          if (res.obj.dietPlan.calculationMethod == '01') {
            that.setData({
              tabIndex: 0
            })
          } else {
            that.setData({
              tabIndex: 1
            })
          }
        } else {
          that.setData({
            dataList: [],
            dietPlan: {},
          })
        }
      })
      .catch(error => {

      })
  },


  // 展开
  shrink: function (e) {
    this.data.dataList[e.currentTarget.dataset.index].checked = !this.data.dataList[e.currentTarget.dataset.index].checked;
    this.setData({
      dataList: this.data.dataList
    })
  },



  mydata: function (e) {
    var that = this;
    that.setData({
      selectVal: e.detail.data,
    })
    if (e.detail.type == 'click') {
      that.getDetail(e.detail.data);
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    }
  },

  use: function () {
    this.setData({
      showMultiSelect: true
    })
  },


  getId: function () {
    var that = this;
    apiRequest.queryProgrammeList({
      isMainPlan: 1,
      planStt: '01'
    })
      .then(res => {
        var planId = res.obj && res.obj.dietPlan && res.obj.dietPlan.id ? res.obj.dietPlan.id : '';
        if (planId) {
          that.getTime(planId);
        }
      })
      .catch(error => {

      })
  },

  getTime: function (planId) {
    var that = this;
    apiRequest.queryProgrammeList({
      isMainPlan: 0,
      planStt: '01',
      supId: planId ? planId : '0',
      planRestrict: false
    })
      .then(res => {
        let list = res.obj.dietPlanList;
        let existArr = [];
        list.forEach(function (item, index) {
          existArr.push(day(item.dateTime).format('YYYY/MM/DD'))
        })
        that.toDo(existArr)
      })
      .catch(error => {

      })
  },

  toDo: function (existArr) {
    var that = this;
    let days = [];
    existArr.forEach((item, index) => {
      let date = {};
      date.year = item.split('/')[0];
      date.month = item.split('/')[1];
      date.day = item.split('/')[2];
      days.push(date)
    })
    that.calendar['setTodoLabels']({
      // 待办点标记设置
      pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
      dotColor: '#fb892d', // 待办点标记颜色
      // circle: true, // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
      showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字），在 circle 为 true 及当日历配置 showLunar 为 true 时，此配置失效
      days: days
    });
  },

  afterCalendarRender() {
    if (this.data.activityDateList.length > 0) {
      this.calendar.disableDay(this.data.activityDateList);
    }
    this.getId(); //标记方案
  },

  existActivityPlan() {
    apiRequest
      .existActivityPlan({

      })
      .then((res) => {
        if (res.errCode === 0) {
          const today = day().startOf('day');
          let activityDateList = res.obj.activityDateList.filter((i) => day(i) >= today);
          let dateList = [];
          activityDateList.forEach((item) => {
            let date = {
              year: item.substring(0, 4),
              month: item.substring(4, 6),
              day: item.substring(6, 8)
            }
            dateList.push(date)
          })
          if (day().get('hour') >= 18) {
            let tomorrow = day().add(1, 'day').format('YYYY/MM/DD');
            let date = {
              year: day(tomorrow).format('YYYY'),
              month: day(tomorrow).format('MM'),
              day: day(tomorrow).format('DD'),
            }
            dateList.push(date)
          }
          this.setData({
            activityDateList: dateList
          });
        }
      });
  },

  cancelSelect: function () {
    this.setData({
      showMultiSelect: false
    })
  },

  sureSelect: function () {
    var that = this;
    let selectDay = that.calendar.getSelectedDay();
    let checkSTime = String(selectDay[0].year) + (selectDay[0].month < 10 ? ('0' + selectDay[0].month) : selectDay[0].month) + (selectDay[0].day < 10 ? ('0' + selectDay[0].day) : selectDay[0].day);
    let activityDateList = this.data.activityDateList;
    let unTime = activityDateList && activityDateList.length > 0 ? `${activityDateList[activityDateList.length - 1].year}/${activityDateList[activityDateList.length - 1].month}/${activityDateList[activityDateList.length - 1].day}` : '';
    let unEndTime = unTime ? day(unTime).add(6, 'day').startOf('day') : day().add(6, 'day').startOf('day');
    if (selectDay.length > 0) {
      // 开始时间太晚
      if (day(checkSTime).startOf('day') >= unEndTime) {
        wx.showToast({
          title: '开始时间太晚啦，瘦身要趁早',
          icon: 'none',
        });
        this.setData({
          showMultiSelect: false,
        })
        return
      }
      apiRequest.checkIsCustomizePlan({
        date: checkSTime,
        cycle: that.data.existDate.length
      })
        .then(res => {
          if (res.errCode !== 0) {
            res.errMsg && (wx.showToast({
              title: res.errMsg,
              icon: 'none'
            }))
            return;
          }

          if (res.obj.result) {
            this.setData({
              showMultiSelect: false,
              checkSTime,
              showCover: true
            })
          } else {
            this.setData({
              showMultiSelect: false,
              checkSTime
            }, () => {
              if (this.data.planType == '02') {
                this.addRecommendPlan()
              } else {
                this.applicationNetRedPlan()
              }
            })
          }
        })
    }
  },

  cancelPlan: function () {
    this.setData({
      showCover: false
    })
  },

  confirmPlan: function () {
    this.cancelPlan()
    if (this.data.planType == '02') {
      this.addRecommendPlan()
    } else {
      this.applicationNetRedPlan();
    }
  },

  applicationNetRedPlan: function () {
    var that = this;
    apiRequest.applicationNetRedPlan({
      quoteId: that.data.supId,
      dateSTime: that.data.checkSTime,
      planType: that.data.dietPlan.quoteId ? '02' : '01'
    })
      .then(res => {
        if (res.obj.saveMainId) {
          wx.showToast({
            title: '使用成功',
            icon: 'success',
            success: (result) => {
              wx.redirectTo({
                url: `/pages/packageDiscover/planDetail/planDetail?id=${res.obj.saveMainId}`,
              });
            },
          });
        }
      })
      .catch(error => {

      })
  },

  addRecommendPlan() {
    let that = this;
    apiRequest.addRecommendPlan({
      fid: that.data.dietPlan.quoteId,
      startTime: that.data.checkSTime
    })
      .then(res => {
        if (res.obj.success) {
          // 跳转地址
          let planState = {
            caseId: res.obj.id,
            date: that.data.checkSTime,
            start: 1,
            type: 'celebrityPlan'
          };
          wx.navigateTo({
            url: '/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=celebrityPlan',
            success: ({ eventChannel }) => {
              eventChannel.emit('ai-state', planState);
            },
          });
        } else if (res.obj.hasActivity) {
          wx.showToast({
            title: '方案日期冲突，无法覆盖',
            icon: 'none'
          })
        }
      })
      .catch(error => {

      })
  },

  // 查看
  check: function () {
    let supId = this.data.supId;
    let index = this.data.selectIndex;
    // planSource 04 代表ai减脂方案  跳转ai减脂方案 结果页
    if (this.data.dietPlan.planSource === '04') {
      apiRequest.queryNavigationReport({

      }).then((res) => {
        if (res.errCode === 0) {
          if (res.obj.fatReducingEffect) {
            wx.navigateTo({
              url: '/pages/datas/bluetoothBalanceResult/bluetoothBalanceResult',
            });
          } else {
            wx.navigateTo({
              url: `/pages/solution/recordCheck/recordCheck?id=${supId}&index=${index}`,
            });
          }
        }
      })
    } else {
      wx.navigateTo({
        url: `/pages/solution/recordCheck/recordCheck?id=${supId}&index=${index}`,
      });
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onPageScroll: function (e) {
    if (e.scrollTop > this.cladarTop - this.data.navStatusHeight) {
      this.setData({
        cladarFixed: true
      })
    } else {
      this.setData({
        cladarFixed: false
      })
    }
  },

  queryCal: function () {
    var query = wx.createSelectorQuery();
    var that = this;
    //选择id
    var that = this;
    query.select('.cladar').boundingClientRect(function (rect) {
      that.cladarTop = rect.top
    }).exec();
  },



})