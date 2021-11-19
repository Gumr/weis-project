// pages/navBar/navBar.js
var app = getApp();
import day from '../../libs/day';
import { setStorage } from '../../utils/storage'
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
  },
  properties: {
    cutAddress: {//切换加热点
      type: Boolean,
      value: false
    },
    zIndex: {
      type: Number,
      value: 100
    },
    native: {//true cover-view标题 false view标题
      type: Boolean,
      value: false
    },
    preventBack: {
      type: Boolean,
      value: false
    },
    statusStyle: {
      type: String,
      value: ''
    },
    navBarStyle: {
      type: String,
      value: ''
    },
    titleStyle: {
      type: String,
      value: ''
    },
    mode: {
      type: String
    },
    background: {
      type: String,
      value: 'rgba(255, 255, 255, 1)'
    },
    color: {
      type: String,
      value: 'rgba(0, 0, 0, 1)'
    },
    navSettingColor: String,
    navBgImg: String,
    icontext:String,
    titleText: String,
    achievement: String,
    lefticon: String,
    righticon: String,
    righticon:String,
    lefticonUrl:String,
    lefticonTip:Boolean,
    userInfo: Object,
    backIconColor: {
      type: String,
      value: 'black'
    },
    homeIcon: String,
    fontSize: {
      type: Number,
      value: 18
    },
    custom: {
      type: Boolean,
      value: false
    },
    customText: {
      type: String,
      value: ''
    },
    customStyle: String,
    date: {
      type: [String, Number],
    }, // 请传入时间毫秒
    dateIconColorObj: {
      type: Object,
      value: {
        iconColor: '#fff',
        bgColor: '#dd6a1d',
        border: '#ff9752',
        font: '#fff'
      }
    },
    left: String,
    disabledDate: { // 接收一个函数 (timestamp: 毫秒时间戳) => 返回一个boolean值 判断时间 返回为true的时间会被禁用
      type: Function,
      value: null
    },
    hideHome: {
      type: Boolean,
      value: false,//隐藏回到首页按钮
    },
    // 星期标题
    week: {
      type: Number,
      value: 1
    },
    theme: {
      type: String,
      value: ''
    },
    hpName: String,
  },
  attached: function () {
    this.readied = true;
    this.setNavSize();
    this.setStyle();
    const { mode, date } = this.data;

    if (mode === 'date' && !date) {
      this.setData({
        date: Date.now()
      })
    }
  },
  observers: {
    'background,color'() {
      if (this.readied) {
        this.setStyle()
      }
    },
    date(date) {
      // console.log(this.data.dateIconColorObj)
      date = day(date).startOf('day');
      const isToday = date.valueOf() === day().startOf('day').valueOf();
      const { disabledDate } = this.data;

      const setData = {
        dateTitle: isToday ? '今天' : date.format('M月D日')
      }
      if (disabledDate) {
        setData.disabledYesterday = disabledDate(date.valueOf() - 86400000);
        setData.disabledTomorrow = disabledDate(date.valueOf() + 86400000);
      }
      this.setData(setData)
    },
    // 星期标题
    week(week) {
      // 一个星期的日期
      let dateList = []
      for(let i = 1;i<=7;i++) {
        let date = day().add(week, 'week').set('day', i).format('YYYYMMDD')
        dateList.push(date)
      }
      // 星期的标题
      let start = dateList[0].slice(4,6) + '月' + dateList[0].slice(6,8) + '日';
      let end = dateList[dateList.length - 1].slice(4,6) + '月' + dateList[dateList.length - 1].slice(6,8) + '日';
      this.setData({
        weekTitle: start + '-' + end,
        disabledPrev: dateList[0] == '20210524',
        disabledNext: week >= 1
      })
      this.triggerEvent('week-change', dateList)
    },
  },

  data: {
    disabledYesterday: false,
    disabledTomorrow: false,
    // date: Date.now(),
    dateTitle: '', // mode date 显示的title
  },
  methods: {
    characterTap() {
      this.triggerEvent('character-tap')
    },
    yesterdayTap({ currentTarget }) {
      if (currentTarget.dataset.disabled) return;
      const date = new Date(day(this.data.date)).getTime() - 86400000;
      this.setData({
        date
      })
      this.triggerEvent('date-change', date)
    },
    tomorrowTap({ currentTarget }) {
      if (currentTarget.dataset.disabled) return;
      const date = new Date(day(this.data.date)).getTime() + 86400000;
      this.setData({
        date
      })
      this.triggerEvent('date-change', date)
    },
    titleTap() {
      this.triggerEvent('title-tap')
    },
    // 星期标题-上个星期
    prevTap({ currentTarget }) {
      let { week, disabledPrev } = this.data;
      if(disabledPrev) {
        return
      }
      this.setData({
        week: week - 1
      })
    },
    // 星期标题-下个星期
    nextTap({ currentTarget }) {
      let { week, disabledNext } = this.data;
      if(disabledNext) {
        return
      }
      this.setData({
        week: week + 1
      })
    },
    // 通过获取系统信息计算导航栏高度
    setNavSize: function () {
      var that = this,
        sysinfo = wx.getSystemInfoSync(),
        statusHeight = sysinfo.statusBarHeight,
        isiOS = sysinfo.system.indexOf('iOS') > -1,
        navHeight;
      if (!isiOS) {
        navHeight = 48;
      } else {
        navHeight = 44;
      }
      // console.log(sysinfo)
      const pages = getCurrentPages();
      const tabArr = ['pages/index/index', 'pages/welfare/welfare', 'pages/discover/discover', 'pages/datum/datum', 'pages/my/my'];
      that.setData({
        status: statusHeight,
        navHeight: navHeight,
        pages: pages,
        isTabbar: tabArr.includes(pages[0].route),
      });
      app.globalData.navStatusHeight = statusHeight + navHeight;
      setStorage('navStatusHeight', statusHeight + navHeight);
    },
    setStyle: function () {
      var that = this,
        containerStyle,
        dateIconStyle,
        textStyle;
      let menuInfo = wx.getMenuButtonBoundingClientRect();//胶囊按钮信息
      containerStyle = ['background:' + that.data.background].join(';');
      let dateIconColorObj = that.data.dateIconColorObj;
      textStyle = [
        'color:' + that.data.color,
        'font-size:' + that.data.fontSize + 'px',
        'font-weight:' + '500'
      ].join(';');
      dateIconStyle = [
        'background:' + dateIconColorObj.bgColor,
        'border:' + dateIconColorObj.border,
        'color:' + dateIconColorObj.font,
      ].join(';');
      let menuStyle = [
        `width:${menuInfo.width}px`,
        `height:${menuInfo.height}px`,
        `border-radius:${menuInfo.height/2}px`,
        `border: 2rpx solid rgba(233, 233, 233, 0.7);`,
      ].join(';')
      that.setData({
        containerStyle: containerStyle,
        textStyle: textStyle,
        dateIconStyle,
        menuStyle
      });
    },
    // 返回事件
    back: function () {
      this.triggerEvent('back', {
        back: 1
      });
      if (this.data.preventBack) {
        return
      }
      wx.navigateBack({
        delta: 1
      });
    },
    // 自定义事件
    tapcustom() {
      this.triggerEvent('tapcustom');
    },
    home: function () {
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    // 标题点击
    titleTextTap() {
      this.triggerEvent('titleTextTap');
    },
  }
});