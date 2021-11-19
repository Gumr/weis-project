// pages/record/markSugar/markSugar.js
import { formatNumber } from '../../../utils/util'
import { t } from '../../../utils/common';
import day from '../../../libs/day';
import requests from '../../../service/index'
// import requests from '../../../service/requests'

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navDate: Date.now(),
    showWhite: true,
    showRightIcon: false,
    showRecord: false,
    recordDisabled: true,
    tab: [{ name: '清晨空腹', bdKey: ['15', '10'] },
    { name: '上午', bdKey: ['16', '11'] },
    { name: '下午', bdKey: ['17', '12'] },
    { name: '晚上', bdKey: ['18', '13'] },
    { name: '睡前空腹', bdKey: ['19', '14'] }
    ],
    keyObj: {
      '10': '清晨空腹',
      '15': '清晨空腹',
      '16': '上午',
      '11': '上午',
      '17': '下午',
      '12': '下午',
      '18': '晚上',
      '13': '晚上',
      '19': '睡前空腹',
      '14': '睡前空腹'
    },
    bodyDataInfoList: [],
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
    this.queryBloodPressure()
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
  // 记录
  record(evt) {
    if (evt.currentTarget.dataset.disabled) return;
    let date = this.data.selectDate;
    let { tab, tabIndex, highVal, lessVal, bodyDataInfoList, showWhite } = this.data;
    if (!highVal || !lessVal) return
    var vals = [highVal, lessVal]
    vals.map((item, index) => {
      requests.addBodyDataInfo({
        time: day(date).format('YYYYMMDD'),
        bdValue: item,
        bdKey: tab[tabIndex].bdKey[index]
      }).then(res => {
        if (res.obj.id) {
          wx.vibrateShort();
          let obj = {
            high: bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex].high : {},
            less: bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex].less : {}
          }
          bodyDataInfoList[tabIndex] = bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex] : {}
          var key = index === 0 ? 'high' : 'less'
          obj[key].bdKey = index === 0 ? tab[tabIndex].bdKey[0] : tab[tabIndex].bdKey[1]
          obj[key].bdValue = item
          obj[key].id = res.obj.id
          Object.assign(bodyDataInfoList[tabIndex], obj)
          this.setData({
            bodyDataInfoList,
            showRecord: false
          }, () => {
            this.checkRecord()
          })
        }
      })
    })
  },
  chartTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/bodyLine/bodyLine?type=bp'
    })
  },
  queryBloodPressure: function () {
    const date = this.data.selectDate
    requests.queryBloodPressure({
      time: day(date).format('YYYYMMDD')
    }).then(res => {
      let bodyDataInfoList = res.obj.bodyDataInfoList;
      let Arr = []
      bodyDataInfoList.reduce((ret, next) => {
        let obj = {}
        const index = next.bdKey == 15 || next.bdKey == 10 ? 0 : next.bdKey == 16 || next.bdKey == 11 ? 1 : next.bdKey == 17 || next.bdKey == 12 ? 2 : next.bdKey == 18 || next.bdKey == 13 ? 3 : 4
        const key = next.bdKey == 15 || next.bdKey == 16 || next.bdKey == 17 || next.bdKey == 18 || next.bdKey == 19 ? 'high' : 'less'
        obj[key] = next
        if (!Arr[index]) {
          Arr[index] = obj
          ret.key = key
        } else {
          if (obj[key].bdKeyNote.slice(3) === Arr[index][ret.key].bdKeyNote.slice(3)) {
            Object.assign(Arr[index], obj)
          }
        }
        return ret
      }, {})
      // console.log(Arr);
      // 过滤掉空值
      let newArr = Arr.map((item, index) => {
        if (!item) {
          item = {
            high: {},
            less: {}
          }
        }
        return item
      })
      this.setData({
        bodyDataInfoList: newArr,
      }, () => {
        this.checkRecord()
      })
    })
  },
  showDia() {
    let { bodyDataInfoList, tabIndex } = this.data;
    var high = bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex].high : null
    var less = bodyDataInfoList[tabIndex] ? bodyDataInfoList[tabIndex].less : null
    this.setData({
      showRecord: true,
      highVal: high ? high.bdValue : '',
      lessVal: less ? less.bdValue : '',
      recordDisabled: true
      // sugarVal: datas[tabIndex].bdValue > 0 ? datas[tabIndex].bdValue : ''
    })
  },

  onOpen(e) {
    this.setData({
      selectIndex: e.currentTarget.dataset.index
    })
  },

  onClose(e) {
    const { position, instance } = e.detail;
    if (position == 'right') {
      let { index } = e.currentTarget.dataset
      this.delete(index)
      instance.close();
    }
    this.setData({
      selectIndex: ''
    })
  },

  delete(index) {
    let { bodyDataInfoList } = this.data;
    const target = bodyDataInfoList[index]
    for (var key in target) {
      requests.deleteBodyDataInfo({
        id: target[key].id
      }).then(res => {
        if (res.obj.result) {
          bodyDataInfoList[index].high.bdValue = ''
          bodyDataInfoList[index].less.bdValue = ''
          this.setData({
            bodyDataInfoList
          }, () => {
            this.checkRecord()
          })
        }
      })
    }
  },

  // 检测有无记录
  checkRecord() {
    let bodyDataInfoList = this.data.bodyDataInfoList;
    let showWhite = true;
    for (var i = 0; i < bodyDataInfoList.length; i++) {
      if (bodyDataInfoList[i] && bodyDataInfoList[i].high.bdValue > 0 && bodyDataInfoList[i].less.bdValue > 0) {
        showWhite = false;
        break
      }
    }
    this.setData({
      showWhite
    })
  },

  hideModal() {
    this.setData({
      showRecord: false
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
      this.queryBloodPressure()
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
      this.queryBloodPressure()
    })
    this.hideCal()
  },

  goAhead(evt) {
    let date = day(evt.detail);
    this.setData({
      selectDate: date.format('YYYY/MM/DD'),
      showRightIcon: date.format('YYYY/MM/DD') == this.data.today ? false : true
    }, () => {
      this.queryBloodPressure()
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
      this.queryBloodPressure()
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

  // 血糖值
  iptFn(e) {
    var value = e.detail.value
    var type = e.currentTarget.dataset.type
    var key = type === 'high' ? 'highVal' : 'lessVal'
    if (value.split('.')[1] && value.split('.')[1].length >= 3) {
      value = Math.floor(value * 10) / 10
    } else if (value.split('.')[0] && value.split('.')[0].length >= 3) {
      value = value.substr(0, 3)
    }


    this.setData({
      [key]: value
    })
    const { highVal, lessVal } = this.data;
    const recordDisabled = !highVal || !lessVal || (+highVal <= +lessVal)

    this.setData({
      recordDisabled
    })
  },
  history() {
    wx.navigateTo({
      url: '/pages/record/historyPressure/historyPressure',
    });
  },

  // 查询当前时间
  queryTime() {
    let date = new Date();
    let keyList = [{ start: 3, end: 9 }, { start: 9, end: 12 }, { start: 12, end: 19 }, { start: 19, end: 22 }, { start: 22, end: 3 }]
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