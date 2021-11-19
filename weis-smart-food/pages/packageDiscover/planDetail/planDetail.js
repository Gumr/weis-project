// pages/scheme/scheme.js
const app = getApp();
let echatObj = {};
var location = require('../../../libs/location');
import apiRequest from "../../../service/index"
import * as echarts from '../../../libs/echarts';
import day from '../../../libs/day';


Page({
  /**
   * 页面的初始数据
   * selectWeek 0代表的本周  1代表下一周  -1代表上一周
   * timeBean 传递给组件的数据，数据的格式在一开始的工具类中明确
   */
  data: {
    showMethod: false,
    methodValue: [],
    methods: ['综合比例法', '固定蛋白法'],
    hideLoad: false,
    showCompleteAiDialog: false,
    consumeData: {
      0: [],
      1: [],
      2: [],
    },
    fixData: {
      0: [],
      1: [],
      2: [],
      3: [],
    },
    fixedProtein: false,
    flag: false, //展开
    tabList: [{
      name: '综合比例法',
      index: 0,
    },
    {
      name: '固定蛋白法',
      index: 1,
    },
    ],
    tabIndex: '',
    navStatusHeight: '',
    disableValue: day(new Date()).format('YYYYY/MM/DD'),
    selectDate: '',
    existDate: [],
    shortD: 0,
    shortZ: 0,
    shortT: 0,
    mealIndex: '',
    isAiPlan: false, // 是否ai减脂方案
    aiPlanState: {}, // ai减脂方案状态
    aimList: [{
      name: '减脂',
      id: '01',
    },
    {
      name: '增肌',
      id: '02',
    },
    {
      name: '保持体型',
      id: '03',
    },
    ],
    aimstatus: {
      '01': '减脂',
      '02': '增肌',
      '03': '保持体型',
      '04': '控糖',
    },
    id: '',
    symbolIndex: 0,
    categoryKind: {
      '01': {
        name: '早餐',
        src: '/images/scheme_breakfast.png',
        url: '/api/mini/programme_breakfast_picture.png',
      },
      '02': {
        name: '午餐',
        src: '/images/scheme_lunch.png',
        url: '/api/mini/programme_lunch_picture.png',
      },
      '03': {
        name: '晚餐',
        src: '/images/scheme_dinner.png',
        url: '/api/mini/programme_dinner_picture.png',
      },
    },
    showAiDialog: false,
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
    disabledDate: (timestamp) => {
      return timestamp < new Date(day().format('YYYY/MM/DD')).getTime();
    },
    showList: [{
      name: '图表方案',
    },
    {
      name: '数据方案',
    },
    ],
    showIndex: 0,
    ec: {
      lazyLoad: true,
    },
    fixList: [{
      key: 'totalRatio',
      value: 'totalKcal',
      name: '热量三餐分配',
      src: '/images/programme_heat.png',
      url: '',
    },
    {
      key: 'fixedProteinRatio',
      value: 'fixedProteinTotal',
      name: '蛋白/每日总蛋白三餐分配',
      src: '/images/programme_protein.png',
      url: '/api/mini/programme_egg_picture.png',
    },
    {
      key: 'fatRatio',
      value: 'fatTotal',
      name: '脂肪三餐分配',
      src: '/images/programme_fat.png',
      url: '/api/mini/programme_chicken_picture.png',
    },
    {
      key: 'carbohydrateRatio',
      value: 'carbohydrateTotal',
      name: '碳水化合物三餐分配',
      src: '/images/programme_carbohydrates.png',
      url: '/api/mini/programme_dumplings_picture.png',
    },
    ],
    IMG_URL: app.globalData.IMG_URL,
    dateIconColor: {
      iconColor: 'rgba(216, 216, 216, 1)',
      bgColor: 'rgba(247, 247, 247, 1)',
      border: 'none',
      font: 'rgba(51, 51, 51, 1)'
    },
    activityDateList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navStatusHeight: wx.getStorageSync('navStatusHeight'),
      planId: options.id,
      delFlag: options.delFlag || false,
    },
      () => {
        // this.getProgramData().then(() => {
        //   // _planId 是 getProgramData取回来的id, 没有就用options.id
        //   const {
        //     planId
        //   } = this.data;
        //   this.getTimeList(planId || options.id);
        // });
        this.queryPlanUsageSituation();//查询该方案历史列表
        // this.existActivityPlan();
      }
    );
    echatObj = {};
  },
  goMultiMeal: function() {
    const now = day().hour() // 用于判断当天是否超过18点
    // 当天不超过18点，默认开始为明天，超过则为后天
    const startDate = now >= 18 ? day().add(2, 'day').format('YYYYMMDD') : day().add(1, 'day').format('YYYYMMDD'),
      endDate = day(startDate).add(5, 'day').format('YYYYMMDD')
    // console.log(startDate, endDate);
    let planState = {
      caseId: this.data.dietPlan.id,
      startDate,
      endDate,
      type: 'customPlan'
    }
    wx.navigateTo({
      url: "/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=customPlan",
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('ai-state', planState)
      }
    })
  },
  queryPlanUsageSituation: function () {
    var that = this;
    apiRequest.queryPlanUsageSituation({
      planId: that.data.planId
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
          that.getTimeList(this.data.planId);
        })
      })
      .catch(error => {

      })
  },
  getTimeList: function (id) {
    var that = this;
    apiRequest
      .queryProgrammeList({
        isMainPlan: 0,
        planStt: '01',
        supId: id ? id : '0',
        planRestrict: false,
      })
      .then((res) => {
        if (res.errCode == '0' && res.obj && res.obj.dietPlanList.length > 0) {
          let list = res.obj.dietPlanList;
          let existDate = [];
          list.forEach(function (item, index) {
            if (item.dateEtime && new Date(day(item.dateTime).format('YYYY/MM/DD')).getTime() >= new Date(day(new Date()).format('YYYY/MM/DD')).getTime()) {
              existDate.push(day(item.dateTime).format('YYYY/MM/DD'));
            }
          });
          let val = new Date(day(new Date()).format('YYYY/MM/DD')).getTime() < new Date(existDate[0]).getTime() ?
            existDate[0] :
            day(new Date()).format('YYYY/MM/DD');
          that.setData({
            existDate,
            selectDate: val,
          },
            () => {
              if (that.data.dataList && that.data.dataList.length > 0) {
                // 把展开的选项带过去
                let checkedList = [];
                that.data.dataList.forEach(function (item, index) {
                  if (item.checked) {
                    checkedList.push(index);
                  }
                });
                that.getDetail(that.data.selectDate, checkedList);
              } else {
                that.getDetail(that.data.selectDate);
              }
              that.setData({
                apply: true,
              });
            }
          );
        } else {
          that.setData({
            apply: true,
            existDate: [],
            selectDate: that.data.selectDate ? that.data.selectDate : day(new Date()).format('YYYY/MM/DD'),
          },
            () => {
              that.getDetail(that.data.selectDate);
            }
          );
        }
      })
      .catch((error) => { });
  },

  getDetail: function (time, checkedList) {
    var that = this;
    apiRequest
      .queryUserProgramme({
        id: that.data.planId,
        isMainPlan: '1',
        planStt: '01',
        needGoods: true,
        delFlag: this.data.delFlag ? '1' : undefined
      })
      .then((res) => {
        if (res.errCode == '0' && res.obj && res.obj.planDetailList && res.obj.planDetailList.length > 0) {
          if (checkedList && checkedList.length > 0) {
            let dataList = res.obj.planDetailList;
            for (var i = 0; i < checkedList.length; i++) {
              dataList[checkedList[i]].checked = true;
            }
            dataList.forEach((item, index) => {
              let energyDvalue = 0;
              let proteinDvalue = 0;
              let fatDvalue = 0;
              let carbonWaterDvalue = 0;
              item.customProgramme.forEach((item1, index1) => {
                energyDvalue = energyDvalue + item1.energy;
                proteinDvalue = proteinDvalue + item1.protein;
                fatDvalue = fatDvalue + item1.fat;
                carbonWaterDvalue = carbonWaterDvalue + item1.carbonwater;

                item.energyDvalue = parseInt(energyDvalue - item.totalKcal);
                item.proteinDvalue = (proteinDvalue - item.proteinTotal).toFixed(1);
                item.fatDvalue = (fatDvalue - item.fatTotal).toFixed(1);
                item.carbonWaterDvalue = (carbonWaterDvalue - item.carbohydrateTotal).toFixed(1);
              });
            });
            res.obj.dietPlan.continue = day(res.obj.dietPlan.dateEtime) - day(res.obj.dietPlan.dateStime)
            that.setData({
              dataList: dataList,
              dietPlan: res.obj.dietPlan,
              overdue: !res.obj.isModifiable,
              canDelete: that.data.existDate.indexOf(time) == -1 ? false : true,
            });
          } else {
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

                item.energyDvalue = parseInt(energyDvalue - item.totalKcal);
                item.proteinDvalue = (proteinDvalue - item.proteinTotal).toFixed(1);
                item.fatDvalue = (fatDvalue - item.fatTotal).toFixed(1);
                item.carbonWaterDvalue = (carbonWaterDvalue - item.carbohydrateTotal).toFixed(1);
              });
            });
            const oneday = 24 * 60 * 60 * 1000
            res.obj.dietPlan.continue = day(res.obj.dietPlan.dateEtime).diff(day(res.obj.dietPlan.dateStime)) / oneday + 1
            that.setData({
              dataList: planDetailList,
              dietPlan: res.obj.dietPlan,
              overdue: !res.obj.isModifiable,
              canDelete: that.data.existDate.indexOf(time) == -1 ? false : true,
            });
          }
          if (res.obj.dietPlan.calculationMethod == '01') {
            that.setData({
              tabIndex: 0,
            },
              () => {
                that.data.dataList.forEach((item, index) => {
                  that.todayConsumeChart(item, index);
                });
              }
            );
          } else {
            that.setData({
              tabIndex: 1,
            },
              () => {
                setTimeout(() => {
                  that.data.fixList.forEach((item, index) => {
                    that.fixKey(item, index);
                  });
                }, 1000);
              }
            );
          }
        } else {
          that.setData({
            dataList: [],
            dietPlan: {},
          });
        }
        if (!that.data.hideLoad) {
          that.setData({
            hideLoad: true
          });
        }
      })
    // .catch((error) => { });
  },
  // 使用方案
  use: function () {
    this.getTime()
    this.setData({
      showMultiSelect: true
    })
  },
  onShow: function () { },
  // aiOrderTap() {
  //   wx.navigateTo({
  //     url: '/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=ai',
  //     success: ({
  //       eventChannel
  //     }) => {
  //       eventChannel.emit('ai-state', this._aiPlanRaw);
  //     },
  //   });
  // },
  // // 网红方案
  // goOrder() {
  //   let planState = {
  //     caseId: this.data._planId,
  //     date: day().format('YYYYMMDD'),
  //     start: 0,
  //     type: 'celebrityPlan'
  //   };
  //   wx.navigateTo({
  //     url: '/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=celebrityPlan',
  //     success: ({
  //       eventChannel
  //     }) => {
  //       eventChannel.emit('ai-state', planState);
  //     },
  //   });
  // },

  // getProgramData: function () {
  //   var that = this;
  //   return apiRequest
  //     .queryProgrammeList({
  //       isMainPlan: 1,
  //       planStt: '01',
  //       planId: that.data.planId || undefined,
  //     })
  //     .then((res) => {
  //       var planId = res.obj && res.obj.dietPlan && res.obj.dietPlan.id ? res.obj.dietPlan.id : '';

  //       if (res.errCode === 0) {
  //         const {
  //           obj: planData
  //         } = res;
  //         const isAiPlan = planData.dietPlan && planData.dietPlan.soureUid === 0 && planData.dietPlan.planSource === '04';

  //         this.setData({
  //           isAiPlan: Boolean(isAiPlan),
  //         });
  //         if (isAiPlan) {
  //           // 判断他是ai减脂方案
  //           const {
  //             dietPlan
  //           } = planData; // 取出dietPlan的数据
  //           delete planData.dietPlan; // 删掉它的property

  //           this._aiPlanRaw = planData;
  //           this.setData({
  //             showAiBar: planData.next || planData.startStt === 0 || planData.repair,
  //             _planId: planId,
  //             aiPlanRaw: planData,
  //             aiPlanState: {
  //               ...planData,
  //               _stageNo: {
  //                 1: '一',
  //                 2: '二',
  //                 3: '三',
  //               }[planData.stageNo],
  //               _dateStime: dietPlan.dateStime,
  //               _planName: dietPlan.planName,
  //               _planDate: day(dietPlan.dateStime).format('M月D日'),
  //             },
  //           });

  //           if (planData.next === 3 || planData.next === 1) { // 方案已结束 但是没有点餐
  //             this.setData({
  //               showAiDialog: true,
  //             });
  //           } else if (planData.isAchieved) {
  //             this.setData({
  //               showCompleteAiDialog: true
  //             })
  //           }
  //         } else {
  //           this.setData({
  //             showPlanBar: planData.next == '1' ? true : false,
  //             _planId: planId,
  //           })
  //         }
  //       }
  //     })
  //     .catch((error) => { });
  // },

  todayConsumeChart(data, index) {

    const consumeItem = [{
      name: 'proteinRatio',
      value: 0,
      color: '#41C48C',
    },
    {
      name: 'fatRatio',
      value: 0,
      color: '#EEEEEE',
    },
    {
      name: 'carbohydrateRatio',
      value: 0,
      color: '#FE5E0F',
    },
    ];
    // 设置数据每项的value
    consumeItem.forEach((item) => {
      item.value = data[item.name];
    });

    this.setData({
      [`consumeData[${index}]`]: consumeItem,
    });
  },

  fixKey(data, subscript) {
    const fixData = [{
      name: '早餐',
      value: 0,
      color: '#41C48C',
    },
    {
      name: '午餐',
      value: 0,
      color: '#EEEEEE',
    },
    {
      name: '晚餐',
      value: 0,
      color: '#FE5E0F',
    },
    ];
    // 设置数据每项的value
    let all = (this.data.dataList[0][data.value] + this.data.dataList[1][data.value] + this.data.dataList[2][data.value]).toFixed(2);
    // console.log(all)
    fixData.forEach((item, index) => {
      // item.value = this.data.dataList[index][data.key]
      if (index == 2) {
        item.value = 100 - fixData[0].value - fixData[1].value;
        // console.log(item.value)
      } else {
        item.value = parseInt((this.data.dataList[index][data.value] / all) * 100);
        // console.log(item.value)
      }
    });

    // console.log(subscript, 'subscript');
    this.setData({
      [`fixData[${subscript}]`]: fixData,
    });
  },

  // initChart(id) {
  //   return new Promise((resolve) => {
  //     if (echatObj[id]) {
  //       resolve(echatObj[id]);
  //     } else {
  //       this.selectComponent(id).init((canvas, width, height) => {
  //         let chart = echarts.init(canvas, null, {
  //           width,
  //           height,
  //         });
  //         echatObj[id] = chart;
  //         resolve(echatObj[id]);
  //         return chart;
  //       });
  //     }
  //   });
  // },


  // create: function () {
  //   wx.navigateTo({
  //     url: '../solution/solutionSet/solutionSet?id=' + this.data.id,
  //   });
  // },

  // 删除方案
  delete: function () {
    this.setData({
      title: '删除方案',
      confirmText: '确定',
      cancelText: '取消',
      content: '确定删除？',
      deleteFlag: true
    })
  },
  confirm: function () {
    var that = this;
    let planList = [];
    planList.push(String(that.data.dietPlan.id));
    apiRequest
      .delHistoryPlan({
        planList
      })
      .then((res) => {
        if (res.obj.delStt) {
          this.setData({
            deleteFlag: false
          }, () => {
            wx.showToast({
              title: '成功删除',
              icon: 'none',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack()
                }, 1000)
              }
            })
          })
        }
      })
      .catch((error) => { });
  },

  getTime: function () {
    const that = this
    const {planId} = this.data
    apiRequest.queryProgrammeList({
      isMainPlan: 1,
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
        toDo(existArr)
      })
      .catch(error => {

      })
      function toDo(existArr) {
        let days = []
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
      }
  },
  // existActivityPlan() {
  //   apiRequest
  //     .existActivityPlan({})
  //     .then((res) => {
  //       if (res.errCode === 0) {
  //         const today = day().startOf('day');
  //         let activityDateList = res.obj.activityDateList.filter((i) => day(i) >= today);
  //         let dateList = [];
  //         activityDateList.forEach((item) => {
  //           let date = {
  //             year: item.substring(0, 4),
  //             month: item.substring(4, 6),
  //             day: item.substring(6, 8)
  //           }
  //           dateList.push(date)
  //         })
  //         if (day().get('hour') >= 18) {
  //           let tomorrow = day().add(1, 'day').format('YYYY/MM/DD');
  //           let date = {
  //             year: day(tomorrow).format('YYYY'),
  //             month: day(tomorrow).format('MM'),
  //             day: day(tomorrow).format('DD'),
  //           }
  //           dateList.push(date)
  //         }
  //         this.setData({
  //           activityDateList: dateList
  //         });
  //       }
  //     });
  // },

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
  cancel: function () {
    this.dialog.hide();
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
      quoteId: that.data.planId,
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
  afterTapDay(e) {
    let {
      year,
      month,
      date
    } = e.detail;
    this.setData({
      selectDate: `${year}/${month}/${date}`,
      showCalendar: false,
    });
    let selectDate = this.data.selectDate;
    this.getDetail(selectDate);
  },

  // goAhead(e) {
  //   this.setData({
  //     selectDate: e && e.detail ? day(e.detail).format('YYYY/MM/DD') : day().format('YYYY/MM/DD'),
  //   });
  //   let selectDate = this.data.selectDate;
  //   this.calendar.jump(day(selectDate).format('YYYY'), day(selectDate).format('MM'), day(selectDate).format('DD')); // 跳转至某日
  //   this.getDetail(selectDate);
  // },

  // backToday() {
  //   this.goAhead()
  //   this.setData({
  //     showCalendar: false,
  //   });
  // },


  // custom: function () {
  //   wx.navigateTo({
  //     url: '../solution/history/history?from=history',
  //   });
  // },

  edit: function (e) {
    if (this.data.overdue) {
      return;
    }
    const {index} = e.currentTarget.dataset
    const {dietPlan: {planDetailList}, dataList} = this.data
    this.setData({
      showPara: true,
      shortT: planDetailList[index].carbohydrateRatio,
      shortD: planDetailList[index].proteinRatio,
      shortZ: planDetailList[index].fatRatio,
      mealIndex: index,
      category: dataList[index].category,
    });
  },

  cancelEnergy: function () {
    this.setData({
      heat: false,
      energyDifference: false,
    });
  },

  input: function (e) {
    this.setData({
      shortData: e.detail.value,
    });
  },

  // 修改当餐总能量
  sure: function (e) {
    if (this.data.shortData <= 0) {
      wx.showToast({
        title: '数据不合法',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return;
    }
    var that = this;
    apiRequest
      .updateUserPlanDetailRatio({
        totalRatio: that.data.shortData,
        pId: that.data.dataList[that.data.mealIndex].pid,
        dId: that.data.dataList[that.data.mealIndex].id,
        category: that.data.category,
        dataStt: '01',
      })
      .then((res) => {
        if (res.obj && res.obj.updateStt) {
          // that.data.dataList[that.data.mealIndex].totalRatio = that.data.shortData;
          that.setData({
            shortData: '',
            heat: false,
          });
          // 把展开的选项带过去
          let checkedList = [];
          that.data.dataList.forEach(function (item, index) {
            if (item.checked) {
              checkedList.push(index);
            }
          });
          that.getDetail(that.data.selectDate, checkedList);
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
      .catch((error) => { });
  },

  goal: function (e) {
    if (e.currentTarget.dataset.index === '0') {
      if (Number(e.detail.value) + Number(this.data.shortT) + Number(this.data.shortZ) > 100) {
        this.setData({
          warn: true,
          shortD: e.detail.value,
        });
      } else {
        this.setData({
          warn: false,
          shortD: e.detail.value,
        });
      }
    }
    if (e.currentTarget.dataset.index === '1') {
      if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortZ) > 100) {
        this.setData({
          warn: true,
          shortT: e.detail.value,
        });
      } else {
        this.setData({
          warn: false,
          shortT: e.detail.value,
        });
      }
    }
    if (e.currentTarget.dataset.index === '2') {
      if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortT) > 100) {
        this.setData({
          warn: true,
          shortZ: e.detail.value,
        });
      } else {
        this.setData({
          warn: false,
          shortZ: e.detail.value,
        });
      }
    }
    if (Number(this.data.shortZ) + Number(this.data.shortD) + Number(this.data.shortT) == 100) {
      this.setData({
        shortGoal: true,
      });
    } else {
      this.setData({
        shortGoal: false,
      });
    }
  },

  editPara: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    if (!pattern.test(this.data.shortT) || !pattern.test(this.data.shortD) || !pattern.test(this.data.shortZ)) {
      wx.showToast({
        title: '数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return;
    }
    if (this.data.shortGoal) {
      var that = this;
      let detailList = {
        carbohydrateRatio: this.data.shortT,
        proteinRatio: this.data.shortD,
        fatRatio: this.data.shortZ,
        pId: this.data.dataList[this.data.mealIndex].pid,
        dId: this.data.dataList[this.data.mealIndex].id,
        category: this.data.category,
        dataStt: '01',
      };
      apiRequest
        .updateUserProgrammeDetail(detailList)
        .then((res) => {
          if (res.obj && res.obj.updateStt) {
            // that.data.dataList[that.data.mealIndex].carbohydrateRatio = that.data.shortT;
            // that.data.dataList[that.data.mealIndex].proteinRatio = that.data.shortD;
            // that.data.dataList[that.data.mealIndex].fatRatio = that.data.shortZ;
            that.setData({
              showPara: false,
              shortT: 0,
              shortD: 0,
              shortZ: 0,
            });
            // 把展开的选项带过去
            let checkedList = [];
            that.data.dataList.forEach(function (item, index) {
              if (item.checked) {
                checkedList.push(index);
              }
            });
            that.getDetail(that.data.selectDate, checkedList);
          } else {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });
          }
        })
        .catch((error) => { });
    } else {
      wx.showToast({
        title: '三项之和需等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },
  // changeTap() {
  //   wx.navigateTo({
  //     url: '/pages/packageDiscover/aiMeal/aiPlanEdit/aiPlanEdit'
  //   })
  // },
  // 固蛋法
  fixed: function (e) {
    // if (this.data.overdue) {
    //   return;
    // }
    // 蛋白质总量
    if (e.currentTarget.dataset.type == '1') {
      this.setData({
        fixedProtein: true,
        placeholder: '蛋白质总量',
        title: '蛋白质总量',
        unit: 'g/kg',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
        mealIndex: 0,
        category: this.data.dataList[0].category,
      },
        () => {
          if (this.data.showIndex == 0) {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0,
            });
          }
        }
      );
    }
    // 蛋白质总量
    if (e.currentTarget.dataset.type == '2') {
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title: '蛋白量/每日总蛋白',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: '',
        mealIndex: e.currentTarget.dataset.index,
      });
    }
    // 能量总占比
    if (e.currentTarget.dataset.type == '3') {
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title: '能量总占比',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: '',
        mealIndex: e.currentTarget.dataset.index,
      });
    }
    // 脂肪
    if (e.currentTarget.dataset.type == '4') {
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title: '脂肪',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: '',
        mealIndex: e.currentTarget.dataset.index,
      });
    }
    // 方案参数 能量差
    if (e.currentTarget.dataset.type == '5') {
      this.setData({
        fixedProtein: true,
        placeholder: '能量差',
        title: '能量差',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
        symbol: true,
        symbolIndex: 0,
      });
    }
    // 计划运动消耗
    if (e.currentTarget.dataset.type == '6') {
      this.setData({
        fixedProtein: true,
        placeholder: '计划运动消耗',
        title: '计划运动消耗',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
      });
    }
    // 应摄入
    if (e.currentTarget.dataset.type == '7') {
      this.setData({
        fixedProtein: true,
        placeholder: '应摄入',
        title: '应摄入',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
      },
        () => {
          if (this.data.showIndex == 0) {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0,
            });
          }
        }
      );
    }
  },

  // 键盘高度
  keyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },

  bindblur() {
    this.setData({
      keyboardheight: 0
    })
  },

  inputFixed: function (e) {
    this.setData({
      shortFixedData: e.detail.value,
    });
  },

  cancelFixed: function () {
    this.setData({
      fixedProtein: false,
    },
      () => {
        this.setData({
          symbol: false,
        });
      }
    );
  },

  // 能量差符号选择
  symbol: function (e) {
    this.setData({
      symbolIndex: e.detail,
    });
  },
  editMethod: function() {
    this.setData({
      showMethod: true,
      methodValue: this.data.dietPlan.calculationMethod == '01' ? [0] : [1]
    })
  },
  // 日常活动消耗
  methodChange: function (e) {
    const val = e.detail.value
    this.setData({
      methodValue: val
    })
  },
  methodConfirm: function () {
    const {dietPlan: {dateTime, id, totalIntake, supId, planName}, methodValue} = this.data
    apiRequest.updateUserProgramme({
      id,
      supId,
      dateTime,
      isMainPlan: 1,
      planName,
      totalIntake,
      calculationMethod: methodValue == 0 ? '01' : '02'
    })
      .then(res => {
        if(res.errCode === 0) {
          this.setData({
            showMethod: false,
            ['dietPlan.calculationMethod']: methodValue == 0 ? '01' : '02'
          })
        }
      })
      .catch(error => {

      })
  },
  editName: function() {
    this.setData({
      nameFlag: true,
      tempName: this.data.dietPlan.planName
    })
  },
  sureName: function() {
    const {dietPlan: {dateTime, id, totalIntake, supId, calculationMethod}, tempName} = this.data
    apiRequest
     .updateUserProgramme({
      id,
      supId,
      dateTime,
      isMainPlan: 1,
      calculationMethod,
      planName: tempName,
      totalIntake
     }).then(res => {
       if(res.errCode === 0 && res.obj.updateStt) {
         this.setData({
           ['dietPlan.planName']: tempName
         })
       }
     })

  },
  // 更改能量差运动消耗
  editParam: function () {
    var that = this;
    if (that.data.type == 5 && that.data.shortFixedData > 3000) {
      wx.showToast({
        title: '不能超过最大值3000',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return;
    }
    if (that.data.type == 7 && that.data.shortFixedData < that.data.dietPlan.basalMetabolism / 0.85) {
      wx.showToast({
        title: '每日应摄入能量不能低于基础代谢' + parseInt(that.data.dietPlan.basalMetabolism / 0.85) + 'kcal',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
    // 修改蛋白质总量 带蛋白比例
    var fixedProteinRatioList = [];
    var dataList = this.data.dataList;
    dataList.forEach((item, index) => {
      let childArr = {};
      childArr.category = item.category;
      childArr.proteinRatio = item.fixedProteinRatio;
      fixedProteinRatioList.push(childArr);
    });
    apiRequest
      .updateUserProgramme({

        sportsConsume: that.data.type == 6 ? that.data.shortFixedData : that.data.dietPlan.sportsConsume,
        energyDifference: that.data.type == 5 ?
          that.data.symbolIndex == 0 ?
            '-' + that.data.shortFixedData :
            that.data.shortFixedData : that.data.dietPlan.energyDifference,
        totalIntake: that.data.type == 7 ? that.data.shortFixedData : that.data.dietPlan.totalIntake,
        calculationMethod: that.data.tabIndex === 0 ? '01' : '02',
        dataStt: '01',
        dateTime: that.data.dietPlan.dateTime,
        id: that.data.dietPlan.id,
        energyRatio: that.data.dataList[0].energyRatio,
        fixedProteinRatioList: fixedProteinRatioList && fixedProteinRatioList.length > 0 ? fixedProteinRatioList : undefined,
        isMainPlan: 1,
        quoteId: that.data.dietPlan.quoteId ? that.data.dietPlan.quoteId : 0,

      })
      .then((res) => {
        if (res.obj && res.obj.updateStt) {
          that.setData({
            shortFixedData: '',
            fixedProtein: false,
          },
            () => {
              that.setData({
                symbol: false,
              });
            }
          );
          // 把展开的选项带过去
          let checkedList = [];
          that.data.dataList.forEach(function (item, index) {
            if (item.checked) {
              checkedList.push(index);
            }
          });
          that.getDetail(that.data.selectDate, checkedList);
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch((error) => { });
  },

  para: function () {
    this.setData({
      showPara: false,
      shortT: 0,
      shortD: 0,
      shortZ: 0,
    });
  },
  // 当餐总能量修改三餐
  editAll: function (e) {
    if (this.data.overdue) {
      return;
    }
    let categoryRatioList = [];
    let dataList = this.data.dataList;
    dataList.forEach((item, index) => {
      let childArr = {};
      childArr.category = item.category;
      childArr.totalRatio = item.totalRatio;
      categoryRatioList.push(childArr);
    });

    this.setData({
      showParaEnergy: true,
      shortGoalEnergy: true,
      warnEnergy: false,
      categoryRatioList,
      // shortTb: this.data.dataList[1].totalRatio,//午餐
      // shortDl: this.data.dataList[0].totalRatio,//早餐
      // shortZd: this.data.dataList[2].totalRatio,//晚餐
    });
  },

  goalEnergy: function (e) {
    let index = e.currentTarget.dataset.index;
    let categoryRatioList = 'categoryRatioList[' + index + '].totalRatio';
    this.setData({
      [categoryRatioList]: e.detail.value,
    });
    let totalValue = 0;
    this.data.categoryRatioList.forEach((item, index) => {
      totalValue += Number(item.totalRatio);
    });
    this.setData({
      warnEnergy: totalValue > 100 ? true : false,
      shortGoalEnergy: totalValue == 100 ? true : false,
    });
  },

  editParaEnergy: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    for (var i = 0; i < this.data.categoryRatioList.length; i++) {
      if (!pattern.test(this.data.categoryRatioList[i].totalRatio)) {
        wx.showToast({
          title: '数值不合法',
          icon: 'none',
          duration: 1500,
        });
        return;
      }
    }
    if (this.data.shortGoalEnergy) {
      var that = this;
      let categoryRatioList = this.data.categoryRatioList;
      apiRequest
        .updateUserPlanDetailRatio({
          pId: that.data.dataList[0].pid,
          categoryRatioList: categoryRatioList,
        })
        .then((res) => {
          if (res.obj && res.obj.updateStt) {
            that.setData({
              showParaEnergy: false,
              // shortTb: 0,
              // shortDl: 0,
              // shortZd: 0,
              categoryRatioList: [],
            });
            // 把展开的选项带过去
            let checkedList = [];
            that.data.dataList.forEach(function (item, index) {
              if (item.checked) {
                checkedList.push(index);
              }
            });
            that.getDetail(that.data.selectDate, checkedList);
          } else {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
            });
          }
        })
        .catch((error) => { });
    } else {
      wx.showToast({
        title: '当日之和需等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },

  paraEnergy: function () {
    // console.log('1')
    this.setData({
      showParaEnergy: false,
      // shortTb: 0,
      // shortDl: 0,
      // shortZd: 0,
      categoryRatioList: [],
    });
  },

  // 当餐总蛋白修改三餐
  heatFixed: function (e) {
    if (this.data.overdue) {
      return;
    }
    let fixedProteinRatioList = [];
    let dataList = this.data.dataList;
    dataList.forEach((item, index) => {
      let childArr = {};
      childArr.category = item.category;
      childArr.proteinRatio = item.fixedProteinRatio;
      fixedProteinRatioList.push(childArr);
    });

    this.setData({
      showParaFixed: true,
      warnFixed: false,
      shortGoalFixed: true,
      fixedProteinRatioList,
    });
  },

  goalFixed: function (e) {
    let index = e.currentTarget.dataset.index;
    let fixedProteinRatioList = 'fixedProteinRatioList[' + index + '].proteinRatio';
    this.setData({
      [fixedProteinRatioList]: e.detail.value,
    });
    let totalValue = 0;
    this.data.fixedProteinRatioList.forEach((item, index) => {
      totalValue += Number(item.proteinRatio);
    });
    this.setData({
      warnFixed: totalValue > 100 ? true : false,
      shortGoalFixed: totalValue == 100 ? true : false,
    });
  },

  editParaFixed: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    for (var i = 0; i < this.data.fixedProteinRatioList.length; i++) {
      if (!pattern.test(this.data.fixedProteinRatioList[i].proteinRatio)) {
        wx.showToast({
          title: '数值不合法',
          icon: 'none',
          duration: 1500,
        });
        return;
      }
    }
    if (this.data.shortGoalFixed) {
      var that = this;
      let fixedProteinRatioList = this.data.fixedProteinRatioList;
      apiRequest
        .updateUserProgramme({
          sportsConsume: that.data.dietPlan.sportsConsume,
          energyDifference: that.data.dietPlan.energyDifference,
          totalIntake: that.data.dietPlan.totalIntake,
          calculationMethod: '02',
          dataStt: '01',
          dateTime: that.data.dietPlan.dateTime,
          id: that.data.dietPlan.id,
          energyRatio: that.data.dataList[0].energyRatio,
          fixedProteinRatioList: fixedProteinRatioList,
          isMainPlan: 1,
          quoteId: that.data.dietPlan.quoteId ? that.data.dietPlan.quoteId : 0,

        })
        .then((res) => {
          if (res.obj && res.obj.updateStt) {
            that.setData({
              showParaFixed: false,
              fixedProteinRatioList: [],
            });
            // 把展开的选项带过去
            let checkedList = [];
            that.data.dataList.forEach(function (item, index) {
              if (item.checked) {
                checkedList.push(index);
              }
            });
            that.getDetail(that.data.selectDate, checkedList);
          } else {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });
          }
        })
        .catch((error) => { });
    } else {
      wx.showToast({
        title: '当日总蛋白之和需等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },

  paraFixed: function () {
    this.setData({
      showParaFixed: false,
      fixedProteinRatioList: [],
    });
  },

  // 展开
  shrink: function (e) {
    this.data.dataList[e.currentTarget.dataset.index].checked = !this.data.dataList[e.currentTarget.dataset.index].checked;
    this.setData({
      dataList: this.data.dataList,
    });
  },

  energyDifference: function () {
    this.setData({
      energyDifference: true,
    });
  },

  inputEnergy: function (e) {
    this.setData({
      shortEnergy: e.detail.value,
    });
  },
  sureEnergy: function() {
    
  },
  sureFixed: function () {
    var that = this;
    if (this.data.type == 5 || this.data.type == 6 || this.data.type == 7) {
      that.editParam(); //更改能量差运动消耗
      return;
    }
    let detailList = {
      pId: this.data.dataList[this.data.mealIndex].pid,
      dId: this.data.dataList[this.data.mealIndex].id,
      category: this.data.category,
      dataStt: '01',
    };
    if (this.data.type == 1) {
      // detailList[0].totalRatio = this.data.shortFixedData
      // 修改蛋白质总量 带蛋白比例
      if (that.data.shortFixedData > 4) {
        wx.showToast({
          title: '数值不合法，最大值为4',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
        });
        return;
      }
      var fixedProteinRatioList = [];
      var dataList = this.data.dataList;
      dataList.forEach((item, index) => {
        let childArr = {};
        childArr.category = item.category;
        childArr.proteinRatio = item.fixedProteinRatio;
        fixedProteinRatioList.push(childArr);
      });
      apiRequest
        .updateUserProgramme({
          sportsConsume: that.data.type == 6 ? that.data.shortFixedData : that.data.dietPlan.sportsConsume,
          energyDifference: that.data.type == 5 ?
            that.data.symbolIndex == 0 ?
              '-' + that.data.shortFixedData :
              that.data.shortFixedData : that.data.dietPlan.energyDifference,
          totalIntake: that.data.type == 7 ? that.data.shortFixedData : that.data.dietPlan.totalIntake,
          // calculationMethod: that.data.tabIndex === 0 ? '01' : '02',
          calculationMethod: this.data.dietPlan.calculationMethod,
          dataStt: '01',
          dateTime: that.data.dietPlan.dateTime,
          id: that.data.dietPlan.id,
          energyRatio: that.data.shortFixedData,
          fixedProteinRatioList: fixedProteinRatioList && fixedProteinRatioList.length > 0 ? fixedProteinRatioList : undefined,
          isMainPlan: 1,
          quoteId: that.data.dietPlan.quoteId ? that.data.dietPlan.quoteId : 0,
        })
        .then((res) => {
          if (res.obj && res.obj.updateStt) {
            that.setData({
              shortFixedData: '',
              fixedProtein: false,
            },
              () => {
                that.setData({
                  symbol: false, //取消符号选择+-
                });
              }
            );
            // 把展开的选项带过去
            let checkedList = [];
            that.data.dataList.forEach(function (item, index) {
              if (item.checked) {
                checkedList.push(index);
              }
            });
            that.getDetail(that.data.selectDate, checkedList);
          } else {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });
          }
        })
        .catch((error) => { });
      return;
    } else if (this.data.type == 2) {
      detailList.fixedProteinRatio = this.data.shortFixedData;
    } else if (this.data.type == 3) {
      detailList.energyRatio = this.data.shortFixedData;
    } else if (this.data.type == 4) {
      detailList.fatRatio = this.data.shortFixedData;
    }
    apiRequest
      .updateUserProgrammeDetail(detailList)
      .then((res) => {
        if (res.obj && res.obj.updateStt) {
          that.setData({
            shortFixedData: '',
            fixedProtein: false,
          },
            () => {
              that.setData({
                symbol: false,
              });
            }
          );
          // 把展开的选项带过去
          let checkedList = [];
          that.data.dataList.forEach(function (item, index) {
            if (item.checked) {
              checkedList.push(index);
            }
          });
          that.getDetail(that.data.selectDate, checkedList);
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch((error) => { });
  },
  inputName: function(e) {
    this.setData({
      tempName: e.detail.value
    })
  },
  hideDialog() {
    this.setData({
      nameFlag: false,
      heat: false,
      showParaEnergy: false,
      showParaFixed: false,
      showPara: false
    })
  },

  onPageScroll: function (e) {
    if (e.scrollTop > this.cladarTop - this.data.navStatusHeight) {
      this.setData({
        cladarFixed: true,
      });
    } else {
      this.setData({
        cladarFixed: false,
      });
    }
  },

  queryCal: function () {
    var query = wx.createSelectorQuery();
    var that = this;
    //选择id
    var that = this;
    query
      .select('.cladar')
      .boundingClientRect(function (rect) {
        that.cladarTop = rect.top;
      })
      .exec();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获得dialog组件
    this.dialog = this.selectComponent('#dialog');
  },
});