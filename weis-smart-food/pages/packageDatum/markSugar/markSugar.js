// pages/record/markSugar/markSugar.js
import { formatNumber } from '../../../utils/util'
import { t } from '../../../utils/common';
import day from '../../../libs/day';
import requests from '../../../service/index'
// import requests from '../../../service/RecordService'

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navDate: Date.now(),
    showRightIcon: false,
    disabledDate: (timestamp) => {
      return timestamp > Date.now();
    },
    showWhite: true,
    tab: [{ name: '凌晨', bdKey: '1' },
    { name: '早餐前', bdKey: '2' },
    { name: '早餐后', bdKey: '3' },
    { name: '午餐前', bdKey: '4' },
    { name: '午餐后', bdKey: '5' },
    { name: '晚餐前', bdKey: '6' },
    { name: '晚餐后', bdKey: '7' },
    { name: '睡前', bdKey: '8' }
    ],
    keyObj: {
      '1': '凌晨',
      '2': '早餐前',
      '3': '早餐后',
      '4': '午餐前',
      '5': '午餐后',
      '6': '晚餐前',
      '7': '晚餐后',
      '8': '睡前',
    },
    tabIndex: 0,
    intoView: 'view0',
    cursorSpacing: t(256),
    calendarConfig: {
      markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
      highlightToday: true, // 是否高亮显示当天，区别于选中样式（初始化时当天高亮并不代表已选中当天）
      onlyShowCurrentMonth: true, // 日历面板是否只显示本月日期
      autoChoosedWhenJump: true, // 跳转到指定日期后是否需要自动选中
      // defaultDate: day().format('YYYY-MM-DD'), // 默认选中指定某天，如需选中需配置 autoChoosedWhenJump: true
      disableMode: {
        // 禁用某一天之前/之后的所有日期
        type: 'after', // [‘before’, 'after']
        date: day().format('YYYY-MM-DD') // 无该属性或该属性值为假，则默认为当天
      },
    },
    today: day().format('YYYY/MM/DD'),
    selectDate: day().format('YYYY/MM/DD'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryBloodSugarByTime()
    this.queryTime()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      navBarHeight: app.globalData.navStatusHeight
    })
    this.calendar = this.selectComponent('#calendar');
  },

  tab(e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      tabIndex: index,
      intoView: index - 3 >= 0 ? `view${index - 3}` : 'view0'
    })
  },

  onOpen(e) {
    console.log('onOpen', e)
    this.setData({
      selectIndex: e.currentTarget.dataset.index
    })
  },

  onClose(e) {
    const { position, instance } = e.detail;
    if (position == 'right') {
      let { id, index } = e.currentTarget.dataset;
      this.delete(id, index)
      instance.close();
    }
    this.setData({
      selectIndex: ''
    })
  },
  chartTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/bodyLine/bodyLine?type=glu'
    })
  },
  delete(id, index) {
    let date = this.data.selectDate;
    let { bodyDataInfoList } = this.data;
    requests.deleteBodyDataInfo({
      id: id
    }).then(res => {
      if (res.obj.result) {
        bodyDataInfoList[index].bdValue = 0;
        this.setData({
          bodyDataInfoList
        }, () => {
          this.checkRecord()
        })
      }
    })
      .catch(error => {

      })
  },

  // 检测有无记录
  checkRecord() {
    let bodyDataInfoList = this.data.bodyDataInfoList;
    let showWhite = true;
    for (var i = 0; i < bodyDataInfoList.length; i++) {
      if (bodyDataInfoList[i].bdValue > 0) {
        showWhite = false;
        break
      }
    }
    this.setData({
      showWhite
    })
  },

  showDia() {
    let { bodyDataInfoList, tabIndex } = this.data;
    this.setData({
      showDialog: true,
      sugarVal: bodyDataInfoList[tabIndex].bdValue > 0 ? bodyDataInfoList[tabIndex].bdValue : ''
    })
  },

  hide() {
    this.setData({
      showDialog: false
    })
  },


  afterCalendarRender(e) {
    let date = new Date(this.data.selectDate);
    this.calendar.setCalendarConfig(this.data.calendarConfig);
    this.calendar.jump(date.getFullYear(), date.getMonth() + 1, date.getDate()).then((res) => {
      this.setData({
        initCal: true
      })
    });
  },

  afterTapDay(e) {
    let date = `${e.detail.year}/${this.zero(e.detail.month)}/${this.zero(e.detail.day)}`

    this.hideCal();
    this.setData({
      navDate: date,
      selectDate: date,
      showRightIcon: date == this.data.today ? false : true
    }, () => {
      this.queryBloodSugarByTime()
    })
  },

  hideCal() {
    this.setData({
      showCalendar: !this.data.showCalendar
    }, () => {
      if (!this.data.showCalendar) {
        this.setData({
          initCal: false
        })
      }
    })
  },

  backToday() {
    let date = new Date();
    this.calendar.jump(date.getFullYear(), date.getMonth() + 1, date.getDate())
    this.setData({
      navDate: +date,
      selectDate: `${date.getFullYear()}/${formatNumber(date.getMonth() + 1)}/${formatNumber(date.getDate())}`,
      showRightIcon: `${date.getFullYear()}/${formatNumber(date.getMonth() + 1)}/${formatNumber(date.getDate())}` == this.data.today ? false : true
    }, () => {
      this.queryBloodSugarByTime()
    })
    this.hideCal()
  },

  goAhead(evt) {
    let date = day(evt.detail);
    this.setData({
      selectDate: date.format('YYYY/MM/DD'),
      showRightIcon: date.format('YYYY/MM/DD') == this.data.today ? false : true
    }, () => {
      this.queryBloodSugarByTime()
    })
    if (this.data.showCalendar) {
      this.setData({
        showCalendar: false,
        initCal: false
      })
    }
  },

  tapTitle() {
    this.hideCal();
  },

  goForward() {
    let date = day(day(this.data.selectDate) + 86400000);
    this.setData({
      selectDate: date.format('YYYY/MM/DD'),
      showRightIcon: date.format('YYYY/MM/DD') == this.data.today ? false : true
    }, () => {
      this.queryBloodSugarByTime()
    })
    if (this.data.showCalendar) {
      this.setData({
        showCalendar: false,
        initCal: false
      })
    }
  },

  //补全0
  zero: function (i) {
    return i >= 10 ? i : '0' + i;
  },

  queryBloodSugarByTime() {
    let date = this.data.selectDate;
    requests.queryBloodSugarByTime({
      time: day(date).format('YYYYMMDD')
    }).then(res => {
      let body = [{ bdKey: 1 }, { bdKey: 2 }, { bdKey: 3 }, { bdKey: 4 }, { bdKey: 5 }, { bdKey: 6 }, { bdKey: 7 }, { bdKey: 8 }]
      let bodyDataInfoList = res.obj.bodyDataInfoList;

      bodyDataInfoList.forEach((item1, index1) => {
        body.forEach((item2, index2) => {
          if (item1.bdKey == item2.bdKey) {
            body[index2] = item1;
          }
        })
      })
      this.setData({
        bodyDataInfoList: body,
      }, () => {
        this.checkRecord()
      })
    })
      .catch(error => {

      })
  },

  // 血糖值
  sugarVal(e) {
    console.log(e)
    console.log(Math.floor(1.25 * 10) / 10)
    let value = e.detail.value;
    if (value.split('.')[1] && value.split('.')[1].length >= 2) {
      value = Math.floor(value * 10) / 10
    } else if (value.split('.')[0] && value.split('.')[0].length >= 3) {
      value = value.substr(0, 2)
    }
    this.setData({
      sugarVal: value
    })
  },

  recordSugar() {
    let date = this.data.selectDate;
    let { tab, tabIndex, sugarVal, bodyDataInfoList, showWhite } = this.data;
    if (!sugarVal) {
      return
    }
    requests.addBodyDataInfo({
      time: day(date).format('YYYYMMDD'),
      bdValue: sugarVal,
      bdKey: tab[tabIndex].bdKey
    }).then(res => {
      if (res.obj.id) {
        wx.vibrateShort();
        bodyDataInfoList[tabIndex].bdValue = sugarVal;
        bodyDataInfoList[tabIndex].id = res.obj.id;
        this.setData({
          bodyDataInfoList
        }, () => {
          this.checkRecord()
        })
        this.hide()
      }
    })
      .catch(error => {

      })
  },

  history() {
    wx.navigateTo({
      url: '/pages/record/historyBlood/historyBlood',
    });
  },

  // 查询当前时间
  queryTime() {
    let date = new Date();
    let keyList = [{ start: 0, end: 6 }, { start: 6, end: 9 }, { start: 9, end: 11 }, { start: 11, end: 12 }, { start: 12, end: 16 }, { start: 16, end: 19 }, { start: 19, end: 22 }, { start: 22, end: 24 }]
    let curtTime = date.getHours() + Number((date.getMinutes() / 60).toFixed(1))
    for (var i = 0; i < keyList.length; i++) {
      if (curtTime >= keyList[i].start && curtTime < keyList[i].end) {
        this.setData({
          tabIndex: i,
          intoView: i - 3 >= 0 ? `view${i - 3}` : 'view0'
        })
        break
      }
    }
  },
  goHistory() {
    wx.navigateTo({
      url: '/pages/record/historyBlood/historyBlood'
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
})