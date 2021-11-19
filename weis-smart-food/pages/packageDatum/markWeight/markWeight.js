// pages/record/markSugar/markSugar.js
import { t, round } from '../../../utils/common';
import day from '../../../libs/day';
import requests from '../../../service/index'
import { formatNumber, formatDate, long2Timestamp } from '../../../utils/util'
const fullDate = formatDate('Y-M-D')
const long2Timestamp0 = long2Timestamp(0)

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navDate: Date.now(),
    showRightIcon: false,
    keyObj: {
      '9': '体重',
      '20': '体脂率'
    },
    activeTab: '9',
    tabs: [
      {
        label: '体重',
        value: '9'
      },
      {
        label: '体脂率',
        value: '20'
      }
    ],
    labels: {
      title: '体重',
      unit: 'kg'
    },
    showWhite: true,
    bodyDataVOList: [],
    bodyDataInfoList: [],
    tabIndex: 0,
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
    disabledDate: (timestamp) => {
      return timestamp > Date.now();
    },
    today: day().format('YYYY/MM/DD'),
    selectDate: day().format('YYYY/MM/DD'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.queryWeightByTime()
    this.queryHistoryWeight()
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
  updateUserProfile(weight) {
    requests.updateUserProfile({
      weight
    })
  },
  record() {
    let date = this.data.selectDate;
    let { activeTab, tabIndex, weightVal, bodyDataInfoList, showWhite } = this.data;
    if (!weightVal) {
      return
    }
    if (activeTab === '9' && date === day().format('YYYY/MM/DD')) { // 打卡体重且是今天体重
      this.updateUserProfile(round(weightVal, 2))
    }
    const dateDay = day(date);
    // requests.addRecord({
    //   weight: this.convertValue(weightVal),
    //   time: dateDay.valueOf()
    // });
    requests.addBodyDataInfo({
      time: dateDay.format('YYYYMMDD'),
      bdValue: this.convertValue(weightVal),
      bdKey: activeTab
    }).then(res => {
      if (res.obj.id) {
        wx.vibrateShort();
        bodyDataInfoList[tabIndex] = {
          bdValue: weightVal,
          id: res.obj.id
        }
        this.setData({
          bodyDataInfoList,
          bodyDataVOList: []
        }, () => {
          this.checkRecord()
          this.queryHistoryWeight()
        })
        this.hide()
      }
    })
  },
  convertValue(val) {
    return this.data.activeTab === '9' ? round(val, 2) : val;
  },
  tabTap(evt) {
    const { value, index } = evt.currentTarget.dataset;
    const labels = {
      9: {
        title: '体重',
        unit: 'kg'
      },
      20: {
        title: '体脂率',
        unit: '%'
      }
    }[value]
    this.$pageNo = 1;

    const date = day();
    this.setData({
      tabIndex: Number(index),
      navDate: date.valueOf(),
      selectDate: date.format('YYYY/MM/DD'),
      showRightIcon: date.format('YYYY/MM/DD') == this.data.today ? false : true,
      activeTab: value,
      bodyDataVOList: [],
      labels
    })

    this.queryWeightByTime();
    this.queryHistoryWeight();
  },
  onOpen(e) {
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

  delete(id, index) {
    let date = this.data.selectDate;
    let { bodyDataInfoList, bodyDataVOList, tabIndex } = this.data;
    requests.deleteBodyDataInfo({
      id: id
    }).then(res => {
      if (res.obj.result) {
        if (bodyDataVOList[index].id === (bodyDataInfoList[tabIndex] && bodyDataInfoList[tabIndex].id)) {
          bodyDataInfoList[tabIndex].bdValue = ''
        }
        bodyDataVOList.splice(index, 1)
        this.setData({
          bodyDataVOList,
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
    let bodyDataVOList = this.data.bodyDataVOList;
    let showWhite = true;
    for (var i = 0; i < bodyDataVOList.length; i++) {
      if (bodyDataVOList[i].bdValue > 0) {
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
      weightVal: bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex].bdValue : ''
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
      this.queryWeightByTime()
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
  chartTap() {
    const type = {
      9: 'weight',
      20: 'bfr'
    }[this.data.activeTab]
    wx.navigateTo({
      url: '/pages/packageDatum/bodyLine/bodyLine?type=' + type
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
      this.queryWeightByTime()
    })
    this.hideCal()
  },

  goAhead(evt) {
    const selectDate = evt.detail;
    let date = day(selectDate);
    this.setData({
      selectDate: date.format('YYYY/MM/DD'),
      showRightIcon: date.format('YYYY/MM/DD') == this.data.today ? false : true
    }, () => {
      this.queryWeightByTime()
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

  //补全0
  zero: function (i) {
    return i >= 10 ? i : '0' + i;
  },
  queryWeightByTime() {
    const { selectDate, activeTab, tabIndex } = this.data;
    requests.queryWeightByTime({
      time: day(selectDate).format('YYYYMMDD'),
      bdKey: activeTab
    }).then(res => {
      let { bodyDataInfoList } = res.obj
      if (bodyDataInfoList.length > 0 && activeTab === '9') {
        bodyDataInfoList[tabIndex].bdValue = round(bodyDataInfoList[this.data.tabIndex].bdValue, 1)
      }

      this.setData({
        [`bodyDataInfoList[${tabIndex}]`]: bodyDataInfoList[0] || {}
      })
    })
  },
  queryHistoryWeight() {
    requests.queryHistoryWeight({
      pageNo: this.$pageNo,
      pageSize: 20,
      bdKey: this.data.activeTab
    }).then(res => {
      let { bodyDataVOList } = this.data
      var list = res.obj.bodyDataVOList
      if (this.$pageNo > 1 && list.length == 0) {
        this.$pageNo--
        return
      }
      list.map(item => {
        item.time = fullDate(long2Timestamp0(item.time))

        item.bdValue = this.data.activeTab === '9'
          ? round(item.bdValue, 1)
          : item.bdValue
      })
      bodyDataVOList = bodyDataVOList.concat(list)
      this.setData({
        bodyDataVOList,
      }, () => {
        this.checkRecord()
      })
    })
      .catch(error => {

      })
  },

  // 体重值
  weightVal(e) {
    let value = e.detail.value;

    const reg = {
      9: /^(\d{0,3})$|^(\d{0,3}\.\d?)$/,
      20: /^(\d{0,2})$|^(\d{0,2}\.\d?)$/
    }[this.data.activeTab]
    this.setData({
      weightVal: reg.test(value) ? value : this.data.weightVal
    })
  },

  history() {
    wx.navigateTo({
      url: '/pages/record/historyBlood/historyBlood',
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
    this.queryHistoryWeight()
  },
})