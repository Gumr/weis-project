// components/calendarWeek/calendarWeek.js
const dayjs = require('../../libs/day');
var util = require('../../utils/util');
var weekUtils = require('./week-utils.js');
Component({
  /**
  * 组件的属性列表
  */
  properties: {
    dateCurrent: { // 
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型） 
      value: weekUtils.formatTime2(new Date())
    },
    // 存在重合日期
    existDate: {
      type: Array,
      value: []
    },
    // 是否校验非重合时间
    verifytime: {
      type: Boolean,
      value: true
    },
    // 今天以前日期不能点击
    beforeToday: {
      type: Boolean,
      value: false
    },
    // 每日有数
    dayData: {
      type: Boolean,
      value: false,
    },
    // 回到今天
    backToToday: {
      type: Boolean,
      value: true,
    },
  },

  /**
  * 组件的初始数据
  */
  data: {
    todayId: dayjs().format('YYYY/MM/DD'),
    valtime: 8,
    dateList: [], // 日历数据数组
    swiperCurrent: 0, // 日历轮播正处在哪个索引位置
    dateCurrentStr: '', // 正选择日期的 id
    dateMonth: '1月', // 正显示的月份
    dateListArray: ['一', '二', '三', '四', '五', '六', '日'],
  },
  ready: function () {
    var that = this;
    var today = weekUtils.formatTime2(new Date());
    this.setData({
      today,
    });
    var d = new Date(that.data.dateCurrent);
    this.initDate(-5, 2, d); // 日历组件程序 -4左表示过去4周 右1表示过去一周

  },
  /**
  * 组件的方法列表
  */
  methods: {
    tiaotime(date) {
      let data = date.split("/")
      var d = new Date(Number(data[0]), Number(data[1]) - 1, Number(data[2]));
      this.setData({
        dateList: []
      })
      this.initDate(-5, 2, d); // 日历组件程序 -4左表示过去4周 右1表示过去一周
    },
    onShow: function (e) {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            windowHeight: res.windowHeight,
            windowWidth: res.windowWidth,
          });
        }
      });
    },

    // 日历传时间到周日历
    jump: function (e, type) {
      var d = new Date(e);
      this.setData({
        dateList: []
      })
      this.initDate(-5, 2, d, type); // 日历组件程序 -4左表示过去4周 右1表示过去一周
    },

    // 日历组件部分
    // ----------------------------
    initDate(left, right, d, type) {
      var month = weekUtils.addZero(d.getMonth() + 1),
        year = weekUtils.addZero(d.getFullYear()),
        day = weekUtils.addZero(d.getDate());
      for (var i = left; i <= right; i++) {
        this.updateDate(weekUtils.DateAddDay(d, i * 7));//多少天之后的
      }
      const { dateList } = this.data;
      const todayId = dayjs().format('YYYY/MM/DD')
      let swiperCurrent = 0;
      for (var i = 0; i < dateList.length; i++) {
        if (dateList[i].days.some(({ id }) => id === todayId)) {
          swiperCurrent = i;
          break;
        }
      }
      // console.log(this.data.dateList, 'datelist')
      this.setData({
        swiperCurrent,
        dateCurrent: d,
        dateCurrentStr: d.getFullYear() + '/' + month + '/' + day,
        dateMonth: month + '月',
        dateYear: year + '年',
        dateCurrentStr: year + "/" + month + "/" + day,
      });
      this.triggerEvent('mydata', { data: year + "/" + month + "/" + day, type: type ? type : '' })
    },
    // 获取这周从周日到周六的日期
    calculateDate(_date) {
      var first = weekUtils.FirstDayInThisWeek(_date);
      first = new Date(first.valueOf() + 86400000);

      var d = {
        'month': first.getMonth() + 1,
        'days': [],

      };
      for (var i = 0; i < 7; i++) {
        var dd = weekUtils.DateAddDay(first, i);
        var day = weekUtils.addZero(dd.getDate()),
          year = weekUtils.addZero(dd.getFullYear()),
          month = weekUtils.addZero(dd.getMonth() + 1);

        d.days.push({
          'day': day,
          'id': dd.getFullYear() + '/' + month + '/' + day,
          'ids': dd.getFullYear() + ',' + month + ',' + day,
          'month': util.Arabia_To_SimplifiedChinese(Number(month)),
        });
      }

      return d;
    },
    // 更新日期数组数据
    updateDate(_date, atBefore) {
      var week = this.calculateDate(_date);
      if (atBefore) {
        this.setData({
          dateList: [week].concat(this.data.dateList),
        });
      } else {
        this.setData({
          dateList: this.data.dateList.concat(week),
        });
      }
      if (this.data.dateList[5]) {
        if (this.data.existDate.length > 0) {
          let existDate = this.data.existDate;
          let showList = this.data.dateList[5].days;
          for (var i = 0; i < existDate.length; i++) {
            for (var j = 0; j < showList.length; j++) {
              if (weekUtils.addZero(new Date(existDate[i]).getFullYear()) == showList[j].ids.split(',')[0] && weekUtils.addZero(new Date(existDate[i]).getMonth() + 1) == showList[j].ids.split(',')[1] && weekUtils.addZero(new Date(existDate[i]).getDate()) == showList[j].ids.split(',')[2]) {
                showList[j].exist = true;
                break
              }
            }
          }
          this.setData({
            dateList: this.data.dateList
          })
        } else {
          let showList = this.data.dateList[5].days;
          for (var j = 0; j < showList.length; j++) {
            showList[j].exist = false;
          }
          this.setData({
            dateList: this.data.dateList
          })
        }
      }
    },
    // 日历组件轮播切换
    dateSwiperChange(e) {
      const lastIndex = this.data.swiperCurrent
        , currentIndex = e.detail.current
        , dateList = this.data.dateList
        , dateListlen = this.data.dateList.length
      let flag = false
        , key = 'lastMonth' //判断是左划还是右
      // console.log(lastIndex , currentIndex)
      if (lastIndex > currentIndex) {
        lastIndex === 7 && currentIndex === 0
          ? flag = true
          : null

      } else {
        lastIndex === 0 && currentIndex === 7
          ? null
          : flag = true
      }
      if (flag) {
        key = 'nextMonth'
      }
      if (key == 'lastMonth') {
        let nowindex = currentIndex - 3;
        let uptime = currentIndex - 4;
        let a = 0;
        if (nowindex < 0) { nowindex = nowindex + 8; a = 0 }
        if (uptime < 0) { uptime = uptime + 8 }

        let seltime = dateList[nowindex].days[a].id
        var week = this.calculateDate(weekUtils.formatTime(weekUtils.DateAddDay(seltime, -1)));

        dateList[uptime] = week
        this.setData({
          dateList: dateList
        })
      }
      if (key == 'nextMonth') {
        let indexne = 0
        let aa = 0
        if (currentIndex == 7) { //要更新的下标
          indexne = 0
          aa = 1
        } else {
          indexne = currentIndex + 1
          aa = currentIndex + 2
        }
        if (aa == 8) {
          aa = 0
        }
        //aa 要更新的数组下标 datanex要往后查询一周的日期 ids有bug 改为id
        let datanex = dateList[indexne].days[6].id
        //获取下一周的
        var week = this.calculateDate(weekUtils.formatTime(weekUtils.DateAddDay(datanex, 1)));
        dateList[aa] = week

        this.setData({
          dateList: dateList
        })
      }



      if (this.data.existDate.length > 0) {
        let existDate = this.data.existDate;
        let showList = this.data.dateList[currentIndex].days;
        for (var i = 0; i < existDate.length; i++) {
          for (var j = 0; j < showList.length; j++) {
            if (weekUtils.addZero(new Date(existDate[i]).getFullYear()) == showList[j].ids.split(',')[0] && weekUtils.addZero(new Date(existDate[i]).getMonth() + 1) == showList[j].ids.split(',')[1] && weekUtils.addZero(new Date(existDate[i]).getDate()) == showList[j].ids.split(',')[2]) {
              showList[j].exist = true;
              break
            }
          }
        }
        this.setData({
          dateList: this.data.dateList
        })
      } else {
        let showList = this.data.dateList[currentIndex].days;
        for (var j = 0; j < showList.length; j++) {
          showList[j].exist = false;
        }
        this.setData({
          dateList: this.data.dateList
        })
      }

      var d = this.data.dateList[currentIndex];
      let da = new Date(d.days[0].ids)
      this.setData({
        swiperCurrent: currentIndex,
        dateMonth: d.month + '月',
        dateYear: da.getFullYear() + "年",
      }, () => {
        const titleData = { dateMonth: this.data.dateMonth, dateYear: this.data.dateYear }
        this.triggerEvent('mytitle', { data: titleData })
      })
    },
    // 获得日期字符串
    getDateStr: function (arg) {
      if (weekUtils.type(arg) == 'array') {
        return arr[0] + '/' + arr[1] + '/' + arr[2] + ' 00:00:00';
      } else if (weekUtils.type(arg) == 'date') {
        return arg.getFullYear() + '/' + (arg.getMonth() + 1) + '/' + arg.getDate() + ' 00:00:00';
      } else if (weekUtils.type(arg) == 'object') {
        return arg.year + '/' + arg.month + '/' + arg.day + ' 00:00:00';
      }
    },
    backTodayTap() {
      const { todayId } = this.data;
      this.tiaotime(todayId);
      this.setData({ dateCurrentStr: todayId });
      this.triggerEvent('mydata', { data: todayId, type: 'click' })
    },
    // 点击日历某日
    chooseDate(e) {
      if (this.data.beforeToday && (new Date(e.currentTarget.id).getTime() < new Date(weekUtils.formatTime2(new Date())).getTime())) {
        wx.showToast({
          title: '当前日期不能选择',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
        });
        return
      }
      if (this.data.existDate.length > 0 && this.data.verifytime && this.data.existDate.indexOf(e.currentTarget.id) <= -1) {
        wx.showToast({
          title: '所选时间不在周期范围',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
        });
        return
      }
      var str = e.currentTarget.id;
      // console.log(str, 'str')
      this.setData({ dateCurrentStr: str });
      this.triggerEvent('mydata', { data: str, type: 'click' })
    },
  }
})