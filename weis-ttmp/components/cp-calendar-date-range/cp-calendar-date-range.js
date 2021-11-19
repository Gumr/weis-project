// /Users/weis/Desktop/miniprogram/weis-ttmp/components/calendar-date-range/calendar-date-range.js
Component({

  data: {
    weeks: [{ text: '日' }, { text: '一' }, { text: '二' }, { text: '三' }, { text: '四' }, { text: '五' }, { text: '六' },],
    months: [],
    current: 0,
  },
  properties: {
    startYear: { type: Number, value: 2020 },
    startMonth: {
      type: Number, value: 1, observer: function (newVal, oldVal) {
        console.log('observers startMonth');
        this.init();
      }
    },
    endYear: { type: Number, value: 2021 },
    endMonth: { type: Number, value: 12 },
    selecteds: {
      type: Array, observer: function (newVal, oldVal) {
        console.log('observers selecteds');
        this.init();
      }
    },
    selectRange:{type:Number,value:30},
    width: { type: Number, value: 690 },//根据宽度缩放控件
    // 没有生效？？
    // 目前在disableDate方法中写死30天
    // disableDate:{type:Function,observer:function(newVal,oldVal){
    //   this.init();
    //   console.log('observers disableDate');
    // }},
  },
  lifetimes: {
    ready: function () {
      // this.init();
    }
  },
  methods: {
    init: function () {
      console.log(`开始年份：${this.data.startYear}  开始月份：${this.data.startMonth}`)
      let today = new Date();
      //计算当前月份index
      let now = (today.getFullYear() - this.data.startYear) * 12 + today.getMonth() + 1 - this.data.startMonth;
      console.log(`当前日历页：${now}`);
      let endYear = this.data.endYear < today.getFullYear() ? today.getFullYear() : this.data.endYear;
      let endMonth = this.data.endYear < today.getFullYear() ? 12 : this.data.endMonth < today.getMonth() + 1 ? today.getMonth() + 1 : this.data.endMonth;
      // 计算有多少个月
      let count = (endYear - this.data.startYear) * 12 + endMonth - this.data.startMonth;
      console.log(`多少个月份展示：${count}`);
      let months = new Array(count);
      for (var i = 0; i <= count; i++) {

        var date = new Date(this.data.startYear, this.data.startMonth + i - 1);
        // console.log(date)
        // console.log(`${date.getFullYear()} ${date.getMonth()+1}星期${firstDayWeek}`);
        // 当月第一天星期几？星期日为0
        var firstDayWeek = (date.getUTCDay() + 1) % 7;
        // 当月多少天
        var dayCount = new Date(date.getFullYear(), date.getMonth() + 1).getUTCDate();
        // console.log(dayCount);
        // 当月最后一天星期几？星期日为0
        var endDayWeek = (new Date(date.getFullYear(), date.getMonth(), dayCount).getUTCDay() + 1) % 7;
        // 最后一星期加上下个月的,最后一天为星期六则不用加
        endDayWeek = endDayWeek == 6 ? 0 : 6 - endDayWeek

        var month = [];
        //上一个月天数
        // console.log(`上个月天数${date.getUTCDate()}`)
        // 用上一个月最后几天补齐
        for (var j = firstDayWeek - 1; j >= 0; j--) {
          var d = new Date(date.getFullYear(), date.getMonth() - 1, date.getUTCDate() - j);
          // console.log(d);
          // console.log(this.data.disableDate);
          // month.push({ date: d.getDate(), selected: false });
          month.push({ year: d.getFullYear(), month: d.getMonth() + 1, date: d.getDate(), disable: this.disableDate(d), selected: this.isDefaultSel(d) });
        }
        for (var k = 1; k <= dayCount + endDayWeek; k++) {
          var d = new Date(date.getFullYear(), date.getMonth(), k);
          // console.log(d.getDate());
          // month.push({ date: d.getDate(), selected: false });
          // if(i==now&&today.getDate()==k){//匹配当天
          month.push({ year: d.getFullYear(), month: d.getMonth() + 1, date: d.getDate(),text:i == now && today.getDate() == k ? '今' :'', disable: this.disableDate(d), selected: this.isDefaultSel(d) });
          // }else{
          //   month.push({ date: k <= dayCount ? k : k % dayCount});
          // }
        }
        months[i] = month;
      }
      //计算当前月份index
      // let now = (today.getFullYear() - this.data.startYear) * 12 + today.getMonth() + 1 - this.data.startMonth;
      this.setData({
        months,
        current: now,
      })
      // console.log(months)
    },
    disableDate: function (date) {
      let now = new Date();
      //当前时间
      //hour归零
      if (now.getHours() >= 18) {//下午6点后只能预定后天
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
      } else {
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
      }
      let last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 + this.data.selectRange);
      // console.log(`now:${now}   last:${last}   date:${date}`)
      if (date.getTime() - now.getTime() >= 0 && last.getTime() - date.getTime() > 0) {
        return false;
      }
      return true;
    },
    isSameDay: function (d1, d2) {
      return d1.year == d2.getFullYear() && d1.month == d2.getMonth()+1 && d1.date == d2.getDate();
    },
    isDefaultSel: function (d) {
      // console.log(d);
      // console.log(this.data.selecteds);
      if (!this.data.selecteds)
        return false;
      for (let i in this.data.selecteds) {
        // console.log(this.data.selecteds[i]);
        // console.log(d);
        if (this.isSameDay(this.data.selecteds[i], d)) {
          return true;
        }
      }
      return false;
    },
    tapPrev: function (e) {
      if (this.data.current > 0) {
        this.setData({
          current: this.data.current - 1,
        })
      }
    },
    tapNext: function (e) {
      if (this.data.current < this.data.months.length - 1)
        this.setData({
          current: this.data.current + 1,
        })
    },
    tapDate: function (e) {
      let { date, index } = e.currentTarget.dataset;
      if (date.disable) {
        return
      }
      // console.log(date)

      let list = this.data.months;
      list[this.data.current][index].selected = !list[this.data.current][index].selected;
      this.setData({
        months: list,
      });
      let selecteds = [];
      for (var m in list) {
        for (var d in list[m]) {
          if (list[m][d].selected) {
            selecteds.push(list[m][d]);
          }
        }
      }
      console.log(`triggerEvent list:${selecteds}`)
      this.triggerEvent('select', selecteds);
    },
    change: function (e) {
      this.setData({
        current: e.detail.current,
      });
    },
  },
})