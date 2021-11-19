// components/mask/mask.js
import {
  round,
  dateUtil
} from '../../utils/util'
const dayjs = require('../../libs/day')

const app = getApp()

Component({
  // 启用插槽
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    dateType: String,
    statusType: String, // 区分编辑还是创建
    selectDates: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    week: ['日', '一', '二', '三', '四', '五', '六'],
    toView: '_0', // 日历滚动位置，默认不滚动
    hasEmptyGrid: false,
    // selectDates: [],
    monthsArr: [], // 默认首次加载6个月数据，往后再加载6个月，最多加载12个月
    empytGrids: [],
    todayIndex: 0,
    cur_year: '',
    cur_month: '',
  },
  lifetimes: {
    created: function () {
      let date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1;
      this.initCalendar(year, month)
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {},
    hide: function () {},
    resize: function () {},
  },
  methods: {
    selectDate(e) {
      let {
        selectDates,
        monthsArr,
        statusType
      } = this.data
      const {
        monthIndex,
        dayIndex
      } = e.currentTarget.dataset
      if (monthsArr[monthIndex].days[dayIndex].disabled) return
      // 获取所选日期
      if (selectDates.length === 1 && statusType !== 'edit') { // 饭团编辑状态下，不可更改开始日期
        if (selectDates[0].timetamp == monthsArr[monthIndex].days[dayIndex].timetamp) {
          selectDates.splice(0, 1)
          monthsArr[monthIndex].days[dayIndex].selected = false
          this.setData({
            selectDates,
            monthsArr
          }, () => {
            this.triggerEvent('select', {
              selectDates
            })
          })
          return
        }
      }
      this._oldDate = selectDates[1] // 若选择了超过30天的，用oldDate还原
      selectDates[1] && selectDates.splice(1, 1)
      if (!selectDates[0] || selectDates[0].timetamp !== monthsArr[monthIndex].days[dayIndex].timetamp) selectDates = selectDates.concat(monthsArr[monthIndex].days[dayIndex])
      selectDates.sort(function (a, b) {
        return a.timetamp - b.timetamp
      })
      selectDates.length > 0 && this.fixDays(selectDates)
    },
    // 把所选时间段内的日期全部选中
    fixDays(selectDates) {
      if (!selectDates || selectDates.length === 0) return
      var onedaytime = 24 * 60 * 60 * 1000
      const {
        monthsArr,
        dateType
      } = this.data
      const start = selectDates[0].timetamp,
        end = selectDates[selectDates.length - 1].timetamp,
        howlong = (end - start) / onedaytime // 总天数
      if (howlong + 1 > 30) {
        wx.showToast({
          title: dateType === 'act' ? '活动时长不能多于30天' : '活动时长不能多于30天',
          icon: 'none'
        })
        selectDates.splice(selectDates.length - 1, 1)
        this._oldDate && selectDates.push(this._oldDate)
        this.setData({
          selectDates
        })
        return
        // monthsArr[monthIndex].days[dayIndex].selected = false
      }
      // 把所选时间段内的日期全部选中
      monthsArr.map(month => month.days.map(day => day.selected = false))
      for (var i = 0; i <= howlong; i++) {
        monthsArr.map(month => {
          month.days.map(day => {
            if (day.timetamp == (start + onedaytime * i)) {
              day.selected = true
            }
          })
        })
      }
      this.setData({
        selectDates,
        monthsArr
      })
    },
    confirmSelect() {
      const {
        selectDates
      } = this.data
      this.closeCalendar()
      // 确定所选日期
      this.triggerEvent('select', {
        selectDates: selectDates.length === 1 ? [] : selectDates
      })
    },
    async scrollFn(e) {
      const that = this
      const {
        scrollTop
      } = e.detail
      const {
        toView: index,
        monthsArr
      } = this.data
      const {
        height
      } = await selectorQuery(`#${index}`)
      const monthIndex = parseInt(scrollTop / (height + 5)),
        {
          cur_year,
          cur_month
        } = monthsArr[monthIndex]
      this.setData({
        current: `${cur_year}年${cur_month}月`
      })

      function selectorQuery(ele) {
        return new Promise(resolve => {
          const query = wx.createSelectorQuery().in(that)
          query.select(ele).boundingClientRect(res => {
            resolve(res)
          }).exec()
        })
      }
    },
    // 滚动到底部再加载6个月数据
    handleScrolltoLower(e) {
      if (this.data.monthsArr.length >= 12) {
        return
      }
      const date = new Date()
      let year = date.getFullYear()
      let month = date.getMonth() + 1 + 6
      if (month > 12) {
        year++
        month = cur_month - 12
      }
      this.initCalendar(year, month)
    },
    // 生成日历数据
    async initCalendar(year, month, callback) {
      let that = this
      const date = new Date()
      const todayIndex = date.getDate() - 1
      const weeks_ch = ['日', '一', '二', '三', '四', '五', '六']
      let monthsArr = this.data.monthsArr
      let mth = parseInt(month)
      this.setData({
        cur_year: year,
        cur_month: month
      })
      let obj = {
        empytGrids: [],
        days: [],
        cur_year: year,
        cur_month: month,
        weeks_ch: weeks_ch
      }
      for (let i = 0; i < 6; i++) {
        obj.empytGrids = []
        await this.calculateEmptyGrids(year, month)
          .then(resGrid => {
            if (resGrid.length > 0) {
              obj.cur_year = year
              obj.cur_month = month
              obj.empytGrids = resGrid
            }
            this.calculateDays(year, month)
              .then(res => {
                obj.cur_year = this.data.cur_year
                obj.cur_month = month
                obj.days = res
                monthsArr.push(JSON.parse(JSON.stringify(obj)))
                month++
                if (month > 12) {
                  month -= 12
                  year++
                }
                this.setData({
                  monthsArr,
                  cur_year: year,
                  cur_month: month,
                  todayIndex
                })
                callback && callback()
                wx.hideLoading()
              })
          })
      }
    },
    getThisMonthDays(year, month) {
      return new Date(year, month, 0).getDate();
    },
    getFirstDayOfWeek(year, month) {
      return new Date(Date.UTC(year, month - 1, 2)).getDay();
    },
    calculateEmptyGrids: function (year, month) {
      return new Promise(resolve => {
        let firstDayOfWeek = this.getFirstDayOfWeek(year, month);
        firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek
        let empytGrids = [];
        if (firstDayOfWeek > 0) {
          for (let i = 1; i < firstDayOfWeek; i++) {
            empytGrids.push(i);
          }
          this.setData({
            hasEmptyGrid: true
          })
          // this.empytGrids = empytGrids
          resolve(empytGrids)
        } else {
          this.setData({
            hasEmptyGrid: false
          })
          // this.empytGrids = []
          resolve([])
        }
      })
    },
    calculateDays: function (year, month) {
      month = dateUtil.formatNum(month)
      return new Promise(resolve => {
        let days = []
        var {
          dateType
        } = this.data
        let date = new Date(),
          Y = date.getFullYear(),
          M = dateUtil.formatNum(date.getMonth() + 1),
          D = dateUtil.formatNum(date.getDate()),
          datestr = `${Y}${M}${D}`,
          thisMonthDays = this.getThisMonthDays(year, month)
        for (let i = 1; i <= thisMonthDays; i++) {
          const targetDate = new Date(`${year}/${month}/${dateUtil.formatNum(i)}`)
          // 当天的毫秒值
          const day = {
            day: i,
            week: targetDate.getDay(),
            timetamp: targetDate.getTime(),
            selected: false,
            disabled: (dayjs(`${year}${month}${dateUtil.formatNum(i)}`) < dayjs(`${Y}${M}${D}`)) || (dateType === 'act' && dayjs(`${year}${month}${dateUtil.formatNum(i)}`) <= dayjs(this.data.selectDates[0].timetamp)) ? true : false, // 当天之前的日期不可选
            isnow: datestr === `${year}${month}${dateUtil.formatNum(i)}` ? true : false
          }
          days.push(day)
        }
        resolve(days)
      })
    },
    closeCalendar() {
      this.triggerEvent('close')
      // this.setData({
      //   show: false
      // })
    }
  }
})