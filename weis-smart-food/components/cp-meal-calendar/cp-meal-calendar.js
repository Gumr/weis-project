// components/mealCalendar/mealCalendar.js
var startX, endX;
var moveFlag = true; // 判断执行滑动事件
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    maxDay: {
      type: Number,
      value: 0,
    },
    style:{
      type: String,
      value: ''
    },
    valueType: {
      type: String,
      value: 'object',
    },
    disableDate: {
      type: Function,
    },
    complete: {
      type: Boolean,
      value: false,//true 显示完整日历 false 日历从当天开始
    },
    expand: {//展开日期
      type: Boolean,
      value: false,
    },
    multiply: {
      type: Boolean,
      value: true,
    },
    selectable: {
      // 是否可以选中
      type: Boolean,
      value: true,
    },
    lastable: {
      type: Boolean,
      value: false,
    }
  },
  observers: {
    disableDate(func) {
      if (this.inited && func) {
        this.getList();
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    weekText: ['日', '一', '二', '三', '四', '五', '六'],
    cart: {
      '01': '早',
      '02': '午',
      '03': '晚',
    },
    dateList: [],
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear(),
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },

  ready() {
    this.selectList = [];
    this.init();
    this.setData({
      today: this.timeFormat(new Date()),
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(param) {
      this.inited = true;
      let { year, month } = this.data;
      let currentMonth = new Date().getMonth() + 1;
      let currentYear = new Date().getFullYear();

      if (this.data.complete) {
        this.firstDay = new Date(
          year +
          '/' +
          this.zero(month) +
          '/' +
          this.zero(this.getFirstDay(year, month))
        );
      } else {
        this.firstDay =
          month == currentMonth && year == currentYear
            ? new Date()
            : new Date(
              year +
              '/' +
              this.zero(month) +
              '/' +
              this.zero(this.getFirstDay(year, month))
            );
      }
      this.lastDay = new Date(
        year +
        '/' +
        this.zero(month) +
        '/' +
        this.zero(this.getLastDay(year, month))
      );
      this.getList(param);
    },

    timeFormat: function (date) {
      var y = date.getFullYear(); //年
      var m = date.getMonth() + 1; //月
      var d = date.getDate(); //日
      return y + '/' + this.zero(m) + '/' + this.zero(d);
    },

    getLastDay(year, month) {
      var new_year = year; //取当前的年份
      var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）
      if (month > 12) {
        new_month -= 12; //月份减
        new_year++; //年份增
      }
      var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天
      return new Date(new_date.getTime() - 1000 * 60 * 60 * 24).getDate(); //获取当月最后一天日期
    },

    getFirstDay(year, month) {
      return new Date(year, month, 1).getDate();
    },

    currentMonth: function (date) {
      var weekday = date.getDay(); //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。
      date.setDate(date.getDate() - weekday); //往前算（weekday-1）天，年份、月份会自动变化
      return this.timeFormat(date);
    },

    getList: function (param) {
      let firstDay = this.firstDay;
      let lastDay = this.lastDay;

      // 上月格子
      let lastMonth = [];

      for (let i = 1; i <= firstDay.getDay(); i++) {
        let day = {};
        let dateTime = new Date(
          new Date(firstDay).getTime() - i * 24 * 60 * 60 * 1000
        );
        day.date = this.timeFormat(dateTime);
        day.year = dateTime.getFullYear();
        day.month = this.zero(dateTime.getMonth() + 1);
        day.day = this.zero(dateTime.getDate());
        day.week = this.data.weekText[dateTime.getDay()];
        day.unable = true;
        day.belong = 'lastMonth';
        lastMonth.push(day);
      }
      lastMonth.reverse();

      // 当月格子
      let currentMonth = [];

      for (let i = 0; i <= lastDay.getDate() - firstDay.getDate(); i++) {
        let day = {};
        let dateTime = new Date(
          new Date(firstDay).getTime() + i * 24 * 60 * 60 * 1000
        );
        day.date = this.timeFormat(dateTime);
        day.year = dateTime.getFullYear();
        day.month = this.zero(dateTime.getMonth() + 1);
        day.day = this.zero(dateTime.getDate());
        day.week = this.data.weekText[dateTime.getDay()];
        day.unable = this.data.disableDate
          ? this.data.disableDate(dateTime)
          : false;
        day.belong = 'currentMonth';
        currentMonth.push(day);
      }

      // 下月格子
      let nextMonth = [];
      for (let i = 1; i <= 6 - lastDay.getDay(); i++) {
        let day = {};
        let dateTime = new Date(
          new Date(lastDay).getTime() + i * 24 * 60 * 60 * 1000
        );
        day.date = this.timeFormat(dateTime);
        day.year = dateTime.getFullYear();
        day.month = this.zero(dateTime.getMonth() + 1);
        day.day = this.zero(dateTime.getDate());
        day.week = this.data.weekText[dateTime.getDay()];
        day.unable = true;
        day.belong = 'nextMonth';
        nextMonth.push(day);
      }

      let dateList = lastMonth.concat(currentMonth, nextMonth);

      if (this.data.expand) {
        this.setData(
          {
            dateList,
            showBtn: false,
            showIndex: dateList.length,
          },
          () => {
            // 根据选中selectList 为datelist添加checked
            this.appendCheck();
          }
        );
      } else {
        this.setData(
          {
            dateList,
            showBtn: dateList.length > 14 ? true : false,
            showIndex:
              dateList.length <= 14
                ? 14
                : this.data.showIndex
                  ? this.data.showIndex == 14
                    ? 14
                    : dateList.length
                  : 14,
          },
          () => {
            // 根据选中selectList 为datelist添加checked
            this.appendCheck();
            // 已点餐
            if (this.alreadyBuy && param) {
              this.queryOrderDataList(this.alreadyBuy);
            }
          }
        );
      }
    },

    drop() {
      let { dateList, showIndex } = this.data;
      this.setData({
        showIndex: showIndex == 14 ? dateList.length : 14,
      });
    },
    DateTime(time) {
      let day = {};
      let dateTime = new Date(time);
      day.date = this.timeFormat(dateTime);
      day.year = dateTime.getFullYear();
      day.month = this.zero(dateTime.getMonth() + 1);
      day.day = this.zero(dateTime.getDate());
      day.week = this.data.weekText[dateTime.getDay()];

      return day;
    },
    //补全0
    zero: function (i) {
      return i >= 10 ? i : '0' + i;
    },

    next() {
      let { year, month } = this.data;
      month++;
      if (month > 12) {
        month -= 12; //月份减
        year++; //年份增
      }
      this.setData(
        {
          year,
          month,
        },
        () => {
          this.init('next');
        }
      );
    },

    last() {
      let { year, month, lastable } = this.data;
      if (!lastable && (year == new Date().getFullYear() && month == new Date().getMonth() + 1)) {
        return
      }
      month--;
      if (month < 1) {
        month += 12; //月份减
        year--; //年份增
      }
      this.setData(
        {
          year,
          month,
        },
        () => {
          this.init('last');
        }
      );
    },

    appendCheck() {
      let selectList = this.selectList || [];
      let dateList = this.data.dateList;
      let dateArr = dateList.map((v) => {
        return v.date;
      });
      dateList.forEach((item) => {
        item.checked = false;
      });
      for (var i = 0; i < selectList.length; i++) {
        let index = dateArr.indexOf(String(selectList[i]));
        if (index >= 0 && !dateList[index].unable) {
          dateList[index].checked = true;
        }
      }
      this.setData({
        dateList,
      });
    },
    clear() {
      this.selectList = [];
      const { dateList } = this.data;
      this.setData({
        dateList: dateList.map((date) => {
          date.checked = false;
          return date;
        })
      })
    },
    select: function (e) {
      let maxDay = this.data.maxDay;
      let dateList = this.data.dateList;
      let selectList = this.selectList || [];
      let { index, unable, current } = e.currentTarget.dataset;
      let select = dateList[index];
      let selectArr = selectList;
      if (!this.data.selectable) return;
      if(maxDay > 0 && selectList.length == maxDay && !dateList[index].checked){
        return
      }
      // .map((v) => {
      //   return v.date
      // });
      let { year, month } = this.data;
      if ((!this.data.multiply && unable) || (year == new Date().getFullYear() && month == new Date().getMonth() + 1 && unable && current == 'lastMonth')) {
        return;
      }

      if (this.data.multiply) {
        // 多选可点击
        if (!unable) {
          if (dateList[index].checked) {
            selectList.splice(selectArr.indexOf(String(dateList[index].date)), 1);
            dateList[index].checked = false;
          } else {
            selectList.push(dateList[index].date);
            dateList[index].checked = true;
          }
        } else {
          // 选择不能点击的置灰日期 跳转下个月或上个月
          // if (selectList.indexOf(dateList[index].date) == -1) {
          //   selectList.push(dateList[index].date);
          // }
          // current == 'lastMonth' ? this.last() : (current == 'nextMonth' ? this.next() : '')
        }
      } else {
        // 单选
        dateList.forEach((date) => {
          date.checked = date.date === select.date;
        });
        selectList = [select.date];
      }

      this.selectList = selectList;

      this.setData(
        {
          dateList,
        },
        () => {
          // 筛选选中日期
          this.filterDate();
        }
      );
    },
    selectDate(dates) { // yyyy/mm/dd 形式的字符串
      dates = Array.isArray(dates) ? dates : [dates]; // 参数统一成数组

      const { dateList } = this.data;

      // dateList里面找到匹配dateTimes某一个的项，且那一项的unable不为true
      // const matchList = dateList.filter((date) => !date.unable && dateTimes.some((dateTime) => date.date === dateTime))
      // if (!matchList) return;

      if (this.data.multiply) {
        // 去重
        const compareList = dates.filter(
          (d) => this.selectList.indexOf(d) === -1
        );
        this.selectList = this.selectList.concat(compareList);
      } else {
        this.selectList = [dates[0]];
      }
      dateList.forEach((date) => {
        if (date.unable) return;

        date.checked = this.selectList.includes(date.date);
      });

      this.setData({
        dateList,
      });
    },
    filterDate: function () {
      let select = this.selectList;

      switch (this.data.valueType) {
        case 'object':
          select = select.map((s) => this.DateTime(s));
          break;
      }

      this.triggerEvent('select', select);
    },

    queryOrderDataList(arr) {
      let dateList = this.data.dateList;
      this.alreadyBuy = arr;
      // 初始化未获取到datelist
      if (dateList.length == 0) {
        this.init('init');
        return;
      }
      for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < dateList.length; j++) {
          if (arr[i].date == dateList[j].date) {
            dateList[j].category = arr[i].category;
            break;
          }
        }
      }
      this.setData({
        dateList,
      });
    },

    touchStart: function (e) {
      startX = e.touches[0].pageX; // 获取触摸时的原点
      moveFlag = true;
    },
    // 触摸移动事件
    touchMove: function (e) {
      endX = e.touches[0].pageX; // 获取触摸时的原点
      if (moveFlag) {
        if (endX - startX > 50) {
          this.last();
          moveFlag = false;
        }
        if (startX - endX > 50) {
          this.next();
          moveFlag = false;
        }
      }
    },
    // 触摸结束事件
    touchEnd: function (e) {
      moveFlag = true; // 回复滑动事件
    },
  },
});
