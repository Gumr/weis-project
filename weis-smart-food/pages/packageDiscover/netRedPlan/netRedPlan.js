// pages/solution/netRedPlan/netRedPlan.js
const app = getApp();
import {
  round
} from '../../../utils/common'
import apiRequest from '../../../service/index'
import * as echarts from '../../../libs/echarts';
import day from '../../../libs/day';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tcComputingMethod: {
      '01': '综合比例法',
      '02': '固蛋法'
    },
    aimstatus: {
      '01': {
        name: '减脂',
        bg: '#50D2CF',
        img: 'https://prodstatic.weis1606.cn/api/mini/template_reduction_chart.png',
        btnBg: '#FFFFFF',
        btnColor: '#21C4C0',
        title: '怎么瘦？',
        type: '体重',
        tagColor: '#333333',
      },
      '02': {
        name: '增肌',
        bg: '#36373C',
        img: 'https://prodstatic.weis1606.cn/api/mini/template_muscles_chart.png',
        btnBg: '#21C4C0',
        btnColor: '#FFFFFF',
        title: '怎么增加肌肉？',
        type: '脂肪',
        tagColor: '#FFFFFF',
      },
      '03': {
        name: '保持体型',
        bg: 'linear-gradient(181deg,rgba(255,255,255,1) 0%,rgba(236,233,227,1) 100%)',
        img: 'https://prodstatic.weis1606.cn/api/mini/template_keep_chart.png',
        btnBg: '#21C4C0',
        btnColor: '#FFFFFF',
        title: '怎么保持体型？',
        type: '脂肪',
        tagColor: '#333333',
      },
      '04': {
        name: '控糖',
        bg: '#64C9F2',
        img: 'https://prodstatic.weis1606.cn/api/solution/programme_sugar_bj.png',
        btnBg: '#FFFFFF',
        btnColor: '#2288E5',
        title: '怎么控糖？',
        type: '体重',
        tagColor: '#2288E5',
      },
    },
    ec: {
      lazyLoad: true // 延迟加载
    },
    sex: {
      '01': {
        name: '男生',
        img: '/images/boy.png'
      },
      '02': {
        name: '女生',
        img: '/images/girl.png'
      },
      '03': {
        name: '通用',
      },
    },
    // enableArea
    calendarConfig: {
      showLunar: false,
      multi: false,
      highlightToday: true,
      onlyShowCurrentMonth: true,
      disableMode: {
        // 禁用某一天之前/之后的所有日期
        type: 'before', // [‘before’, 'after']
        // date: '2020-12-17' // 无该属性或该属性值为假，则默认为当天
      },
      markToday: '今',
      chooseAreaMode: false,
      hideBackToday: true,//隐藏回到今天
    },
    showMultiSelect: false,
    IMG_URL: app.globalData.IMG_URL,
    categoryObj: {
      'breakfast': '早餐',
      'lunch': '午餐',
      'supper': '晚餐',
    },
    showReserve: false, // 显示预约入营按钮
    colorArr: [{
      color: '#DE6D00',
      bg: '#FFCD9D',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_1.png',
    }, {
      color: '#39A778',
      bg: '#ACD6C4',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_2.png',
    }, {
      color: '#FF7D00',
      bg: '#FFE6CE',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_3.png',
    }, {
      color: '#5092BA',
      bg: '#B5D6EA',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_4.png',
    }, {
      color: '#FF6F68',
      bg: '#FBD6D4',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_5.png',
    }, {
      color: '#D178C8',
      bg: '#E9D4E7',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_6.png',
    }, {
      color: '#899E5E',
      bg: '#D4E2B7',
      img: 'https://prodstatic.weis1606.cn/api/mini/day_7.png',
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      from: options.from,
      check: options.check ? options.check : false,
    })
    this.activityId = options.activityId;
    this.queryCampCaseId();
    if (this.data.from === 'slimmingCamp') {
      this.queryCurrActivity();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    this.getDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  init: function (category, circle) {
    this.initChart(category, circle); //初始化图表
  },

  initChart: function (category, circle) {
    let that = this;
    let Chart = null;
    that.selectComponent(circle ? '#mychart-dom-pie-' + circle : '#mychart-dom-pie-' + category).init((canvas, width, height) => {
      // 初始化图表
      Chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      that.setOption(Chart, category, circle);
      return Chart;
    });
  },
  queryCurrActivity() {
    return apiRequest.queryCurrActivity({
      activityId: this.activityId
    })
      .then((res) => {
        if (res.errCode === 0) {
          const {
            activity
          } = res.obj;

          // 方案开始时间需要至少是明天， 判断下瘦身营方案开始时间
          const startTime = Math.max(day().add(1, 'day'), day(String(activity.startTime).slice(0, 8)));

          this.$area = [
            day(startTime).format('YYYY-MM-DD'),
            day(String(activity.endTime).slice(0, 8)).subtract(5, 'day').format('YYYY-MM-DD')
          ]
        }
      })
  },
  queryCampCaseId() {
    return apiRequest.queryCampCaseId()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            showReserve: this.data.id == res.obj.caseId && this.data.from !== 'slimmingCamp',
            caseId: res.obj.caseId
          })
        }
      })
  },
  setOption: function (Chart, category, circle) {
    var that = this;
    Chart.clear(); // 清除
    Chart.setOption(circle ? this.getOptionCircle(category) : this.getOption(category)); //获取新数据
    if (!circle) {
      Chart.dispatchAction({
        type: 'highlight',
        // seriesIndex: 2,
        dataIndex: 2
      })
    }
    // 绘制完成生成图片
    Chart.on('finished', function () {
      that.translateImg(circle ? circle : category);
    });
  },

  getOption: function (category) {
    var option = {
      // backgroundColor: "#ffffff",
      color: ["#41C48C", "#EEEEEE", "#FE5E0F"],
      series: [{
        type: 'pie',
        silent: true,
        hoverOffset: 5,
        center: ['50%', '50%'],
        // radius: ['100%', '75%'],
        itemStyle: {
          borderWidth: 1,
        },
        label: {
          show: false,
        },
        data: [{
          value: this.data.detail.case.eachMealMap[category].protein,
          name: '蛋白质'
        }, {
          value: this.data.detail.case.eachMealMap[category].carbohydrate,
          name: '碳水化合物'
        }, {
          value: this.data.detail.case.eachMealMap[category].fat,
          name: '脂肪'
        }]
      }]
    };
    return option
  },

  getOptionCircle: function (category) {
    var option = {
      // backgroundColor: "#ffffff",
      color: ['#57BF9C', '#FFFFFF', '#E55855',],
      series: [{
        type: 'pie',
        legendHoverLink: false,
        hoverAnimation: false,
        center: ['50%', '50%'],
        radius: [0, '100%'],
        label: {
          show: true,
          position: 'inside',
          fontSize: 8,
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#fff',
        },
        data: [{
          value: this.data.detail.case.eachMealMap[category].protein,
          name: this.data.detail.case.eachMealMap[category].protein + '%',
        }, {
          value: this.data.detail.case.eachMealMap[category].carbohydrate,
          name: this.data.detail.case.eachMealMap[category].carbohydrate + '%',
          label: {
            color: '#21C4C0'
          }
        }, {
          value: this.data.detail.case.eachMealMap[category].fat,
          name: this.data.detail.case.eachMealMap[category].fat + '%',
          itemStyle: {
            color: '#E55855'
          }
        }]
      }]
    };
    return option
  },

  translateImg: function (category) {
    let that = this;

    that.selectComponent('#mychart-dom-pie-' + category).canvasToTempFilePath({
      success: res => {
        that.setData({
          [category]: res.tempFilePath,
        });
      },
    });
  },

  use: function () {
    if (this.data.from == 'slimmingCamp') {
      this.addRecommendPlan();
      return;
    }
    this.setData({
      showMultiSelect: true
    })
  },
  goMultiMeal: function() {
    const now = day().hour() // 用于判断当天是否超过18点
    // 当天不超过18点，默认开始为明天，超过则为后天
    const startDate = now >= 18 ? day().add(2, 'day').format('YYYYMMDD') : day().add(1, 'day').format('YYYYMMDD'),
      endDate = day(startDate).add(5, 'day').format('YYYYMMDD')
    // console.log(startDate, endDate);
    let planState = {
      caseId: this.data.caseId,
      startDate,
      endDate,
      type: 'netRedPlan'
    }
    wx.navigateTo({
      url: "/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=netRedPlan",
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('ai-state', planState)
      }
    })
  },

  afterCalendarRender() {
    this.setData({
      canClick: false
    })
    if (this.$area) {
      this.calendar.enableArea(this.$area)
    }
    if (this.data.activityDateList.length > 0) {
      this.calendar.disableDay(this.data.activityDateList);
    }
  },

  afterTapDay() {
    this.setData({
      canClick: true
    })
  },

  cancelSelect: function () {
    this.setData({
      showMultiSelect: false
    })
  },

  sureSelect: function () {
    var that = this;
    if (!that.data.canClick) {
      return
    }
    let selected = that.calendar['getSelectedDay']();
    let activityDateList = this.data.activityDateList;
    let unTime = activityDateList && activityDateList.length > 0 ? `${activityDateList[activityDateList.length - 1].year}/${activityDateList[activityDateList.length - 1].month}/${activityDateList[activityDateList.length - 1].day}` : '';
    let unEndTime = unTime ? day(unTime).add(6, 'day').startOf('day') : day().add(6, 'day').startOf('day');

    let dateList = [];

    selected.forEach((item, index) => {
      item.month = Number(item.month) < 10 ? '0' + item.month : item.month;
      item.day = Number(item.day) < 10 ? '0' + item.day : item.day;
      dateList.push(String(item.year) + String(item.month) + String(item.day))
    })
    that.startTime = dateList[0];
    if (!selected || !selected.length) {
      return
    }
    that.setData({
      showMultiSelect: false
    })
    // 开始时间太晚
    if (this.data.from !== 'slimmingCamp' &&
      day(that.startTime).startOf('day') >= unEndTime) {
      wx.showToast({
        title: '开始时间太晚啦，瘦身要趁早',
        icon: 'none',
      });
      return
    }

    apiRequest.checkIsCustomizePlan({
      date: that.startTime,
      cycle: that.data.detail.case.tcPeriod
    }).then((res) => {
      if (res.obj.result) {
        wx.showModal({
          title: '提示',
          content: '当前已有正在执行的方案，是否要覆盖？',
          confirmText: '不覆盖',
          cancelText: '是',
          cancelColor: '#FE5E0F',
          confirmColor: '#000000',
          success: function (res) {
            if (res.cancel) {
              that.addRecommendPlan()
            }
          }
        })
      } else {
        that.addRecommendPlan()
      }
    }).catch(() => {

    })
  },

  addRecommendPlan() {
    let that = this;
    apiRequest.addRecommendPlan({
      fid: that.data.id,
      startTime: that.data.from == 'slimmingCamp' ? day(this.$area[0]).format('YYYYMMDD') : that.startTime
    })
      .then(res => {
        if (res.obj.success) {
          // 跳转地址
          let planState = {
            caseId: res.obj.id,
            date: that.data.from == 'slimmingCamp' ? day(this.$area[0]).format('YYYYMMDD') : that.startTime,
            start: 1,
            type: 'celebrityPlan'
          };

          let corpId = wx.getStorageSync('corpId', corpId)
          let tgcaId = wx.getStorageSync('tgcaId', tgcaId)

          if (!this.data.from && !corpId) {
            wx.switchTab({
              url: '/pages/index/index',
            });
            return
          }
          else if (corpId) { //企业团餐
            wx.navigateBack({
              delta: 2
            });

            wx.removeStorageSync('corpId');
            wx.removeStorageSync('tgcaId');
            return
          }
          wx.navigateTo({
            url: `/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=${this.data.from ? this.data.from : 'celebrityPlan'}`,
            success: ({
              eventChannel
            }) => {
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
  reverseTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/slimmingCamp/slimmingCamp/slimmingCamp'
    })
  },
  existActivityPlan() {
    apiRequest
      .existActivityPlan({
        cycle: this.data.detail.case.tcPeriod
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
            let tomorrow = day().add(1, 'day').format('YYYY/MM/DD')
            let date = {
              year: new Date(tomorrow).getFullYear(),
              month: new Date(tomorrow).getMonth() + 1,
              day: new Date(tomorrow).getDate()
            }
            dateList.push(date)
          }
          this.setData({
            activityDateList: dateList
          });
        }
      });
  },

  getDetail: function () {
    var that = this;
    apiRequest.queryRecommendCaseById({
      tcFid: that.data.id
    })
      .then(res => {
        let data = res.obj;
        data.case.dietician.tcdIntroduce = res.obj.case.dietician.tcdIntroduce.split(';');
        data.energyDifference = round(data.energyDifference, 1)
        if (data.case.tcPlanType == '00') {
          Object.keys(data.case.eachMealMap).forEach((item) => {
            that.handleCategory(data.case.eachMealMap[item])
          })
          data.case.keyArr = ['breakfast', 'lunch', 'supper'];
          // console.log(Object.keys(data.case.eachMealMap))
        } else {
          data.caseList.forEach((item) => {
            item.keyArr = ['breakfast', 'lunch', 'supper'];
            Object.keys(item.eachMealMap).forEach((key) => {
              that.handleCategory(item.eachMealMap[key])
            })
          })
        }

        that.setData({
          detail: data
        }, () => {
          that.existActivityPlan();
        })
      })
      .catch(error => {

      })
  },

  handleCategory(category) {
    category.pieData = [{ // 处理生成饼图用的数据
      key: 'fat',
      color: '#FE5E0F'
    }, {
      key: 'carbohydrate',
      color: '#EEEEEE',
    }, {
      key: 'protein',
      color: '#41C48C'
    }].map((it) => {
      it.value = category[it.key]
      return it
    }).filter((it) => Boolean(it.value))

    return category
  },
  selectDate(e) {
    const { selectDates } = e.detail
  },
  closeFn() {
    this.setData({
      showMultiSelect: false
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