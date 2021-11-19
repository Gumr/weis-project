// pages/packageDiscover/riceBall/establish/establish.js
const dayjs = require('../../../../libs/day')
import apiRequest from '../../../../service/index'
let app = getApp()
import {
  getStorage
} from '../../../../utils/storage'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
    showOperate: false,
    showConfirm: true,

    radioSelectIndex: 0,
    opts: [{
      value: '01',
      name: '体重'
    }, {
      value: '02',
      name: '血糖'
    }, {
      value: '03',
      name: '血压'
    }],
    showCalendar: false,
    selectDates: [],
    signDates: [],
    actDates: [],
    signDateStr: '', // 报名日期
    actDateStr: '', //活动日期
    date: '',
    userBallname: '',
    statusType: '',
    trrUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const userInfo = await this.queryUserInfo(),
      headImg = userInfo.headImgUrl.replace('/132', '/0')
    this.setData({
      userInfo,
      trrUrl: headImg,
      statusType: options.statusType,
      trrrTrrId: options.trrrTrrId,
      riceRallInfo: options.riceRallInfo ? JSON.parse(options.riceRallInfo) : {}
    }, () => {

      if (options.statusType) {
        this.getEditData()
        // const {
        //   riceRallInfo
        // } = this.data
        // let {
        //   opts
        // } = this.data;
        // for (let index = 0; index < opts.length; index++) {
        //   if (opts[index].value == riceRallInfo.trrDataPower[index]) {
        //     opts[index].checked = true
        //   }
        // }

        // this.setData({
        //   trrrTrrId: options.trrrTrrId,
        //   userBallname: riceRallInfo.trrName,
        //   opts,
        // }, () => {
        //   this.check()
        // })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.$calendar = this.selectComponent('#calendar')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 跳转上传封面
  uploadImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (/\.(jpg|jpeg|png|JPG|PNG)$/.test(res.tempFilePaths[0])) {
          const tempFilePaths = res.tempFilePaths[0]
          wx.navigateTo({
            url: `/pages/mineBox/cropImg/cropImg?type=riceball&src=${tempFilePaths}`
          })
          return
        }
        wx.showToast({
          title: '只能上传静态图片',
          icon: 'none'
        })
      }
    })
  },
  closeImg() {
    this.setData({
      trrUrl: ''
    })
  },
  preOperateFn() {
    this.setData({
      showOperate: !this.data.showOperate
    })
  },
  getEditData() {
    const {
      userInfo,
      riceRallInfo: {
        trrRegistrationBTime,
        trrRegistrationETime,
        trrActivityBTime,
        trrActivityETime,
        trrName,
        trrUrl
      }
    } = this.data

    let signBtime = dayjs(String(trrRegistrationBTime)),
      signEtime = dayjs(String(trrRegistrationETime)),
      signBtimetamp = +new Date(signBtime),
      signEtimetamp = +new Date(signEtime)

    let activityBTime = dayjs(String(trrActivityBTime)),
      activityETime = dayjs(String(trrActivityETime)),
      actBtimetamp = +new Date(activityBTime),
      actEtimetamp = +new Date(activityETime)

    this.setData({
      trrUrl: trrUrl ? trrUrl : userInfo.headImgUrl.replace('/132', '/0'),
      userBallname: trrName,
      signDates: [{
        day: signBtime.date(),
        week: signBtime.day(),
        timetamp: signBtimetamp,
        disabled: false,
        isnow: false
      }, {
        day: signEtime.date(),
        week: signEtime.day(),
        timetamp: signEtimetamp,
        disabled: false,
        isnow: false
      }],
      actDates: [{
        day: activityBTime.date(),
        week: activityBTime.day(),
        timetamp: actBtimetamp,
        disabled: false,
        isnow: false
      }, {
        day: activityETime.date(),
        week: activityETime.day(),
        timetamp: actEtimetamp,
        disabled: false,
        isnow: false
      }],
      signDateStr: signBtime.format('YYYY/MM/DD') + '-' + signEtime.format('YYYY/MM/DD'),
      actDateStr: activityBTime.format('YYYY/MM/DD') + '-' + activityETime.format('YYYY/MM/DD')
    })
    this.check()
  },
  showCalendarFn: function (e) {
    const {
      signDateStr,
      signDates,
      actDates
    } = this.data
    const {
      type
    } = e.currentTarget.dataset
    let date = new Date(),
      year = date.getFullYear(),
      month = date.getMonth() + 1
    if (type === 'act' && !signDateStr) {
      wx.showToast({
        title: '请先设置报名日期',
        icon: 'none'
      })
      return
    }
    if (type === 'sign') {
      this.$calendar.setData({
        selectDates: signDates,
        monthsArr: []
      }, () => {
        // console.log(signDates);
        this.$calendar.initCalendar(year, month, () => {
          signDates.length > 0 && this.$calendar.fixDays(signDates)
        })
      })
    } else {
      const start = dayjs(signDates[signDates.length - 1].timetamp).add(1, 'day')
      if (actDates.length > 0) {
        this.$calendar.setData({
          selectDates: actDates,
          monthsArr: []
        }, () => {
          this.$calendar.initCalendar(year, month, () => {
            actDates.length > 0 && this.$calendar.fixDays(actDates)
          })
        })

      } else {
        this.$calendar.setData({
          selectDates: [{ // 默认从活动日期创建的第二天开始
            day: start.date(),
            week: start.day(),
            timetamp: signDates[signDates.length - 1].timetamp + 24 * 60 * 60 * 1000,
            disabled: false,
            isnow: false
          }],
          monthsArr: []
        })
        this.$calendar.initCalendar(year, month, () => {
          this.$calendar.fixDays(this.$calendar.data.selectDates)
        })

      }


    }
    this.setData({
      showCalendar: true,
      dateType: type
    })
  },
  selectDate: function (e) {
    const {
      dateType
    } = this.data
    const {
      selectDates
    } = e.detail
    if (selectDates.length === 0) {
      const keyStr = dateType === 'sign' ? 'signDateStr' : 'actDateStr',
        key = dateType === 'sign' ? 'signDates' : 'actDates'
      this.setData({
        [`${keyStr}`]: '',
        [`${key}`]: []
      })
      return
    }
    const start = dayjs(selectDates[0].timetamp).format('YYYY/MM/DD'),
      end = dayjs(selectDates[selectDates.length - 1].timetamp).format('YYYY/MM/DD')
    if (dateType === 'sign') {
      this.setData({
        signDateStr: `${start}-${end}`,
        signDates: selectDates,
        actDateStr: '',
        actDates: []
      })
    } else {
      this.setData({
        actDateStr: `${start}-${end}`,
        actDates: selectDates
      })
    }
    selectDates.length >= 1 && this.check()
  },
  ballName(e) {
    this.setData({
      userBallname: e.detail.value
    }, () => {
      this.check()
    })
  },
  selSee(e) {
    let selindex = e.currentTarget.dataset.selindex
    let opts = this.data.opts
    this.setData({
      [`opts[${selindex}].checked`]: !opts[selindex].checked,
    }, () => {
      this.check()
    })
  },
  /*创建饭团 */
  setGroup() {
    let {
      opts,
      signDates,
      actDates,
      allCheck,
      trrUrl
    } = this.data;
    let trrDataPower = []
    if (!allCheck) return
    opts = opts.map((item) => {
      if (item.checked) {
        trrDataPower.push(item.value)
      }
    })
    apiRequest.createRiceBall({
      trrUrl,
      trrName: this.data.userBallname,
      trrRegistrationBTime: dayjs(signDates[0].timetamp).format('YYYYMMDD'),
      trrRegistrationETime: dayjs(signDates[signDates.length - 1].timetamp).format('YYYYMMDD'),
      trrActivityBTime: dayjs(actDates[0].timetamp).format('YYYYMMDD'),
      trrActivityETime: dayjs(actDates[actDates.length - 1].timetamp).format('YYYYMMDD'),
      trrDataPower,
      operationType: this.data.statusType ? '05' : '00',
      trrrTrrId: this.data.statusType ? this.data.trrrTrrId : undefined
    }).then((res) => {
      if (res.errCode === 0) {
        if (res.obj.saveFlg) {
          wx.showToast({
            title: this.data.statusType ? '编辑成功' : '创建成功',
            icon: 'none',
          })

          wx.redirectTo({
            url: `/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?trrrTrrId=` + res.obj.trrrTrrId,
          })
          app.globalData.gio('track', 'n_Riceroll', {
            desc: '创建成功',
          })
        }
      }
    })
  },
  check() {
    const {
      userBallname,
      signDateStr,
      actDateStr,
      opts,
      trrUrl
    } = this.data
    let allCheck = true // 是否全部填写
    // opts.map(item => {
    //   if (item.checked) {
    //     allCheck = true
    //   }
    // })
    if (!userBallname || !signDateStr || !actDateStr || !trrUrl) {
      allCheck = false
    }
    this.setData({
      allCheck
    })
  },
  closeFn() {
    this.setData({
      showCalendar: false
    })
  },
  queryUserInfo() {
    return new Promise(resolve => {
      apiRequest.queryUserInfo().then(res => {
        resolve(res.obj.userInfo)
      })
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
    // return {
    //   path: `/pages/packageDiscover/riceBall/establish/establish?shareType=true&trrrTrrId=${this.data.trrrTrrId}`,
    //   title: '快加入' + this.data.groupName + ',一起享受折扣吧',
    //   imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/meal_details_picture.png'
    // }
  }
})