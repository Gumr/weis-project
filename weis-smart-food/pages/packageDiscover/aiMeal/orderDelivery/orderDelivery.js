// pages/solution/tenMeal/chooseDeliver/chooseDeliver.js
import {
  getCity
} from '../../../../libs/location';
// import { getLocation } from '../../../../utils/common'
import day from '../../../../libs/day';
import requests from '../../../../service/index'
let app =  getApp();

  

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showHeatPointDialog: false,
    heatList: [],
    buttonHeight: 0,
    form: {
      selfTaking: '0',
      shipTimes: '00',
      shipWithCold: '00'
    },
    selfTakingList: [{
      value: '0',
      text: '外卖配送'
    },
    {
      value: '1',
      text: '到店自取'
    }
    ],
    shipTimesList: [{
      text_1: '每餐送',
      text_2: '每餐取',
      value: '00',
      disabled: false,
    }, {
      text_1: '一日一送',
      text_2: '一日一取',
      value: '01',
      disabled: true,
    },],
    shipWithColdList: [{
      value: '00',
      text_1: '热食配送',
      text_2: '热食自取',
    }, {
      value: '01',
      text_1: '冷链配送',
      text_2: '冷链自取',
    },],
    undeliverable: false,
    hpDistance: 0, // 默认为10哪里都能送
    address: null,
    deliverWeek: false,
    disableDate: null,
    selectedDate: [],
    mealList: [{
      name: '早餐',
      // title: '一天的开始',
      meal: '01',
      checked: true
    }, {
      name: '午餐',
      // title: '最重要的一餐',
      meal: '02',
      checked: true,
    }, {
      name: '晚餐',
      // title: '少吃不胖',
      meal: '03',
      checked: true
    }],
    mealIndex: 0,
    checkMeal: [],
    dateList: [],
    showGetTime: false,
    mortime: '',
    luntime: '',
    dintime: '',
    moraddress: '',
    lunaddress: '',
    dinaddress: '',
    psAddressList: [],
    disableDay: ['2021/05/01', '2021/05/02', '2021/05/03', '2021/05/04', '2021/05/05', '2021/10/01', '2021/10/02', '2021/10/03', '2021/10/04', '2021/10/05', '2021/10/06', '2021/10/07',],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { fromPage = '' } = options
    this.clearUserPlanShoppingCart()
    this.setData({
      fromPage,
    }, () => {
      this.updateCheckMeal()
      if (fromPage !== 'multiMeal' && fromPage !== 'netRedPlan' && fromPage !== 'customPlan') {
        this.queryCampCaseId();
      }
    })
    getCity((res) => {
      this.queryHpidList({
        lat: res.latitude,
        lon: res.longitude
      })
    })
    this.clearUserPlanShoppingCart()

    this.setData({
      joinRuleOrderDays: Number(options.joinRuleOrderDays) > 0 ? Number(options.joinRuleOrderDays) : 5, // 点餐天数
      joinRuleOrderOrder: Number(options.joinRuleOrderOrder) || 2, // 点餐餐数
      orderDiscount: options.orderDiscount * 10 // 折扣

    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.once('ai-state', (state) => {
      if (state.startStt === 0) {
        state.next = 2;
      }
      this._state = state;
      this.setData({
        times: state.times
      })
      if (state.type == 'celebrityPlan' || state.type == 'multiMeal') {
        // 网红方案点餐
        this.init()

      } else if (state.type === 'netRedPlan' || state.type === 'customPlan') {
        this.setData({
          caseId: state.caseId
        }, () => {
          this.init()
        })
      } else {
        this.checkAiDatelist();
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.updateUndeliverable();
    if (this.data.undeliverable && this.data.moraddress && this.data.lunaddress && this.data.dinaddress) {
      wx.showToast({
        title: '该收货地址超出餐餐热食配送自取范围,请选择冷链配送',
        icon: 'none',
      });
    }
  },


  // 查询fid
  queryCampCaseId() {
    requests.queryCampCaseId()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            caseId: res.obj.caseId
          })
        }
      })
  },


  queryHpidList: function ({
    lat,
    lon
  }) {
    var that = this;

    requests.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      showScope: true,
      showAll: true,
      key: '2',
      userAddr: (app.globalData.userAddr && app.globalData.userAddr.address) || '',
    })
      .then(res => {
        let heatList = res.obj.dtos;
        heatList.forEach((item, index) => {
          item.distance = item.shipDistance;
          item.id = item.hpId;
          item.name = item.hpName;
          item.shopAddress = item.address;
        })
        let heatPoint = heatList.filter((item) => {
          return (item.selfTaking == '1' || item.selfTaking == '2')
        })[0]
        that.setData({
          heatList,
          heatPoint: heatPoint,
          psmoraddress: heatPoint,
          pslunaddress: heatPoint,
          psdinaddress: heatPoint
        })
        that.queryTimeList('first')

      })
      .catch(error => {

      })
  },
  initDate(dateList) {
    let {
      startDate,
      endDate
    } = this._state;
    let weekList = [];
    let disableDay = this.data.disableDay;
    const { fromPage, deliverWeek } = this.data // deliverWeek为true，周末不配送
    for (var sDate = startDate; day(sDate) <= day(endDate);) {
      if (new Date(day(sDate)).getDay() == 0 || new Date(day(sDate)).getDay() == 6) {
        weekList.push(day(sDate).format('YYYY/MM/DD'))
      }
      sDate = day(sDate).add(1, 'day').format('YYYY/MM/DD')
    }
    // console.log(weekList)
    this.setData({
      disableDate: (d) => {
        // aiFat为AI智能减脂
        if (fromPage === 'aiFat') {

          if (deliverWeek) {
            return (
              d < new Date(day(startDate)) ||
              day(d).day() == 6 || day(d).day() == 0 || disableDay.includes(day(d).format('YYYY/MM/DD')) //小于日期不能选 周末不能选
            );
          } else {
            return (
              d < new Date(day(startDate)) || disableDay.includes(day(d).format('YYYY/MM/DD')) //小于日期不能选
            );
          }
        } else if (fromPage === 'multiMeal' || fromPage === 'netRedPlan' || fromPage === 'customPlan') { // 快速点多餐
          const continueday = fromPage === 'multiMeal' ? 28 : 13 // 最大连续点餐天数
          if (deliverWeek) {
            return (
              d < new Date(day(startDate))) || (d > new Date(day(startDate).add(continueday, 'day')) ||
                day(d).day() == 6 || day(d).day() == 0 || disableDay.includes(day(d).format('YYYY/MM/DD')) //小于等于日期不能选 周末不能选
              )
          } else {
            return (
              d < new Date(day(startDate))) || (d > new Date(day(startDate).add(continueday, 'day')) || disableDay.includes(day(d).format('YYYY/MM/DD'))
              )
          }
        } else {
          if (deliverWeek) {
            return (
              d < new Date(day(startDate)) ||
              d > new Date(day(endDate)) || weekList.includes(day(d).format('YYYY/MM/DD')) || disableDay.includes(day(d).format('YYYY/MM/DD')) //小于日期不能选 大于日期不能选
            );
          } else {
            return (
              d < new Date(day(startDate)) ||
              d > new Date(day(endDate)) || disableDay.includes(day(d).format('YYYY/MM/DD')) //小于日期不能选 大于日期不能选
            );
          }
        }
      },

    },
      () => {

        const calendarComp = this.selectComponent('#calendar');
        calendarComp.clear();
        calendarComp.selectDate(dateList);
        if (calendarComp.data.month < day(dateList[0]).get('month') + 1) {
          // 如果今天是这个月最后一天 切到下个月显示日历
          calendarComp.next();
        }
      }
    );
  },
  handleCalendarSelect(e) {
    let dateList = e.detail;
    dateList = dateList.sort((a, b) => day(a) - day(b));
    this.setData({
      dateList,
    })
  },
  getForm() {
    const {
      from
    } = this.data;
    switch (this.formPage) {
      case 'ai':
        return {
          distributionMode: from.type,

        }
    }
  },
  updateCheckMeal() {
    this.setData({
      checkMeal: this.data.mealList
        .filter(({
          checked
        }) => checked)
        .map(({
          meal
        }) => meal)
    })
    this.updateUndeliverable()
  },
  selectMeal(e) {
    this.setData({
      mealIndex: e.currentTarget.dataset.index
    })
    this.queryTimeList()
  },
  // checkMeal(e) {
  //   const {
  //     index,
  //     disabled
  //   } = e.currentTarget.dataset;
  //   if (disabled) return;
  //   const {mealList, fromPage} = this.data

  //   mealList[index] = {
  //     ...mealList[index],
  //     checked: !mealList[index].checked
  //   }
  //   // aiFat为AI智能减脂
  //   // 瘦身营页面 要做判断
  //   if (fromPage === 'onLineFat' || fromPage === 'aiFat' || fromPage === 'multiMeal' || fromPage === 'netRedPlan') {
  //     const checkMeal = mealList.filter(({
  //       checked
  //     }) => checked);
  //     if (checkMeal.length < 2 && fromPage !== 'multiMeal' && fromPage !== 'netRedPlan') {
  //       wx.showToast({
  //         title: '坚持才有效，每日至少需选择两餐！',
  //         icon: 'none'
  //       })
  //       return;
  //     } else if(checkMeal.length < 1 && (fromPage === 'multiMeal' || fromPage === 'netRedPlan')) {
  //       wx.showToast({
  //         title: '最少选中一个餐别',
  //         icon: 'none'
  //       })
  //       return
  //     }
  //   }

  //   this.setData({
  //     mealList
  //   })
  //   this.updateCheckMeal()
  // },

  checkMeal(e) {
    const {
      index,
      disabled
    } = e.currentTarget.dataset;
    if (disabled) return;
    const { mealList, fromPage } = this.data

    mealList[index] = {
      ...mealList[index],
      checked: !mealList[index].checked
    }
    const checkMeal = mealList.filter(({
      checked
    }) => checked);
    // aiFat为AI智能减脂
    // 瘦身营页面 要做判断
    if (fromPage === 'onLineFat' || fromPage === 'aiFat' || fromPage === 'multiMeal' || fromPage === 'netRedPlan' || fromPage === 'customPlan') {


      if (checkMeal.length < this.data.joinRuleOrderOrder) {
        wx.showToast({
          title: '坚持才有效，每日至少需选择' + this.data.joinRuleOrderOrder + '餐！',
          icon: 'none'
        })

      }
    }

    this.setData({
      mealList,
      checkMealLength: checkMeal.length
    })
    this.updateCheckMeal()
  },
  week() {
    const deliverWeek = !this.data.deliverWeek;
    this.setData({
      deliverWeek
    });
    const calendarComp = this.selectComponent('#calendar');
    calendarComp.clear();
    if (this._state.type == 'celebrityPlan' || this._state.type == 'multiMeal' || this._state.type == 'netRedPlan' || this._state.type == 'customPlan') {
      this.init()
        .then((dateList) => {
          this.setData({
            btnDisabled: dateList.length < this.data.joinRuleOrderDays
          })
          if (this.data.fromPage === 'onLineFat' &&
            this.data.btnDisabled) { // 处于瘦身营且方案日期小于3天
            wx.showToast({
              title: '坚持才有效，至少需选择' + this.data.joinRuleOrderDays + '天！',
              icon: 'none'
            })
            return;
          }
        })
    } else {
      this.checkAiDatelist();
    }
  },
  // 网红方案点餐日期列表
  init() {
    return new Promise((resolve, reject) => {
      let dateList = [];
      let disableDay = this.data.disableDay;
      // aiFat为AI智能减脂
      let startDate = this.data.dateList[0] || this._state.startDate;
      let endDate = this._state.endDate;
      // console.log(endDate)
      let maxLength = this.data.fromPage === 'aiFat' ? (this.data.dateList.length || this._state.days) : (this.data.dateList.length || this.data.joinRuleOrderDays);
      let deliverWeek = this.data.deliverWeek; //true 跳过周末
      for (var i = 0; dateList.length < maxLength; i++) {
        let curDate = day(startDate).add(i, 'day').format('YYYY/MM/DD');
        if (!disableDay.includes(curDate)) {
          if (!deliverWeek) {
            dateList.push(curDate)
          } else {
            if (new Date(curDate).getDay() != 0 && new Date(curDate).getDay() != 6) {
              dateList.push(curDate)
            }
          }
        }
      }
      if(endDate){
        dateList = dateList.filter((item)=>{
          return day(item) <= day(day(endDate).format('YYYY/MM/DD'))
        })
      }
      this.setData({
        dateList
      })
      this.initDate(dateList);
      resolve(dateList)
    })
  },
  // AI
  checkAiDatelist() {
    const params = this._state || {};

    // 周末不配送 传1
    params.skipWeek = this.data.deliverWeek ? 1 : undefined;

    return requests.checkAiDatelist(params).then((res) => {
      if (res.errCode === 0) {
        const dateList = res.obj.dateList.map(item => day(item).format('YYYY/MM/DD'));
        this.initDate(dateList);
      }
    });
  },
  heatPointTap() {
    this.setData({
      showHeatPointDialog: true
    })
  },
  updateUndeliverable() {

    const {
      form,
      moraddress,
      lunaddress,
      dinaddress,
      joinRuleOrderOrder,
      mealList,
      checkMealLength,
    } = this.data;


    const checkMeal = mealList.filter(({
      checked
    }) => checked);
    let unaddress = false
    for (let index = 0; index < checkMeal.length; index++) {
      if (checkMeal[index].meal == '01' && !moraddress) {
        unaddress = true
      } else if (checkMeal[index].meal == '02' && !lunaddress) {
        unaddress = true
      } else if (checkMeal[index].meal == '03' && !dinaddress) {
        unaddress = true
      }
    }

    this.setData({
      unaddress: unaddress,
      undeliverable: (form.selfTaking === '0' && (unaddress || (form.shipWithCold === '00' && !this.psHeatPoint.hotFlag))) || checkMeal.length < joinRuleOrderOrder  // dispatch === 0代表是配送 // 地址不为空 || 热食 且 配送距离大于5公里的 都无法配送
    })
  },
  cancelTime() {
    this.setData({
      showGetTime: false
    })

  },

  itemTap(evt) {
    const {
      key,
      value,
      disabled
    } = evt.currentTarget.dataset;
    if (disabled) return;

    this.setData({
      [`form.${key}`]: value
    })
    this.updateUndeliverable();
    this.updateDisabled();
  },
  updateDisabled() {
    const {
      form
    } = this.data;
    this.setData({
      'shipTimesList[1].disabled': form.shipWithCold === '00', // 热食 都不能一日一次配送
      'shipTimesList[0].disabled': form.selfTaking === '0' && form.shipWithCold === '01' // 冷链 配送 不能餐餐送
    }, () => {
      const {
        shipTimesList
      } = this.data;
      // 找下当前 配送频率 是否被禁用了
      const disabled = shipTimesList.find((item) => (item.value === this.data.form.shipTimes) && item.disabled);
      if (disabled) { // 被禁用了就找出一个可用的 重新赋值
        const usableRate = shipTimesList.find((item) => !item.disabled);
        this.setData({
          'form.shipTimes': usableRate.value
        })
      }
    })
  },
  handleHeatPointSelect(evt) {


    const index = evt.detail;
    if (this.data.heatList[index].selfTaking == '0') {
      wx.showToast({
        title: '当前加热点不支持自取',
        icon: 'none',
      });

      return
    }

    let { psmoraddress, pslunaddress, psdinaddress, mealIndex, heatList, form } = this.data


    if (form.shipWithCold == '00') {
      if (mealIndex == 0) {
        psmoraddress = heatList[index]
      } else if (mealIndex == 1) {
        pslunaddress = heatList[index]
      } else {
        psdinaddress = heatList[index]
      }

    }
    else {// 冷链
      psmoraddress = heatList[index]
      pslunaddress = heatList[index]
      psdinaddress = heatList[index]
    }

    this.setData({
      // address: addr,
      psmoraddress: psmoraddress,
      pslunaddress: pslunaddress,
      psdinaddress: psdinaddress,
      heatPoint: heatList[index]
    });
    this.setData({
      showHeatPointDialog: false,
    })
    this.queryTimeList()
  },
  handleHeatPointClose() {
    this.setData({
      showHeatPointDialog: false
    })
  },
  detectUserAddress(addr) {
    let { moraddress, lunaddress, dinaddress, mealIndex, form } = this.data
    return requests.heatingPointListForRange({
      userLat: addr.lat,
      userLng: addr.lon,
      key: '3'
    })
      .then(res => {
        let heatList = res.obj.dtos;
        this.psHeatPoint = heatList.filter((item) => {
          return form.shipWithCold == '00' ? item.hotFlag : item.coldFlag
        })[0];
        if(!this.psHeatPoint){
          wx.showToast({
            title: form.shipWithCold == '00' ? '不支持热配' : '不支持冷配',
            icon: 'none',
          });
          return 'pause'
        }
        let heatPoint = this.psHeatPoint;
        


        if (form.shipWithCold == '00') {
          if (mealIndex == 0) { // 热送
            moraddress = addr
          } else if (mealIndex == 1) {
            lunaddress = addr
          } else if (mealIndex == 2) {
            dinaddress = addr
          }
        }else {// 冷链
          moraddress = addr
          lunaddress = addr
          dinaddress = addr
        }

        if (mealIndex == 0) {
          moraddress.hpid = heatPoint.hpId
        } else if (mealIndex == 1) {
          lunaddress.hpid = heatPoint.hpId
        } else {
          dinaddress.hpid = heatPoint.hpId
        }
        this.setData({
          heatPoint: heatPoint,
          moraddress: moraddress,
          lunaddress: lunaddress,
          dinaddress: dinaddress
        })


        this.queryTimeList()
      })
      .catch(error => {

      })
  },

  // 完善收件信息
  edit() {
    const {
      address,
      form
    } = this.data;
    if (form.selfTaking === '1') {
      this.heatPointTap()
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=sevenMeal&businessType=00&adrId=${address && address.id}`,
      events: {
        delete: () => {
          this.setData({
            address: null
          })
        }
      }
    });     
  },
  sure() {
    const { fromPage, dateList, caseId, checkMeal, deliverWeek, moraddress, lunaddress, dinaddress, form, disableDay, joinRuleOrderOrder, heatPoint } = this.data
 

    if (this.data.unaddress && form.selfTaking == '0') {
      wx.showToast({
        title: '请分别填写选中餐别地址',
        icon: 'none'
      })
      return
    }
    if (joinRuleOrderOrder && checkMeal.length < joinRuleOrderOrder) {
      wx.showToast({
        title: '坚持才有效，每日至少需选择' + joinRuleOrderOrder + '餐',
        icon: 'none'
      })
      return
    }
    if(!this.data.unaddress && form.selfTaking == '0' && form.shipWithCold == '00' && !heatPoint.hotFlag){
      wx.showToast({
        title: '该收货地址超出餐餐热食配送自取范围,请选择冷链配送',
        icon: 'none'
      })
    }
    if (this.data.undeliverable) return;
    // 判断日期之间是否有断层
    let sT = dateList[0];
    let eT = dateList[dateList.length - 1];
    let allList = []; //选中开始 结束 中间的时间列表
    for (var i = sT; day(i) <= day(eT);) {
      allList.push(day(i).format('YYYY/MM/DD'))
      i = day(i).add(1, 'day').format('YYYY/MM/DD')
    }

    for (var i = allList.length - 1; i >= 0; i--) {
      if (dateList.includes(allList[i]) || disableDay.includes(allList[i])) {
        allList.splice(i, 1) //选中开始和结束时间 中间未选中的时间列表
      }
    }

    if (!deliverWeek && allList.length > 0) { //周末配送 
      wx.showToast({
        title: '日期必须要连续',
        icon: 'none',
      });
      return
    } else if (deliverWeek) { //周末不配送
      let forbiden = false;
      for (var i = 0; i < allList.length; i++) {
        if (new Date(allList[i]).getDay() != 0 && new Date(allList[i]).getDay() != 6) {
          forbiden = true;
          break
        }
      }
      if (forbiden) {
        wx.showToast({
          title: '日期必须要连续',
          icon: 'none',
        });

        return
      }
    }
    // aiFat为AI智能减脂
    if (this.data.fromPage === 'aiFat') {
      if (dateList.length < this._state.days) {
        if (this._state.days < 5) {
          wx.showToast({
            title: '坚持才有效，点餐天数不得少于你的减脂天数',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '坚持才有效，至少需选择5天！',
            icon: 'none'
          })
        }
        return;
      }
    } else if (fromPage === 'multiMeal' || fromPage === 'netRedPlan' || fromPage === 'customPlan') {
      if (dateList.length < 3) {
        wx.showToast({
          title: '最少连续选3天',
          icon: 'none'
        })
        return
      } else if (dateList.length > 14) {
        wx.showToast({
          title: '选择天数不得多于14天',
          icon: 'none'
        })
        return
      }
    } else {
      if (dateList.length < this.data.joinRuleOrderDays) {
        wx.showToast({
          title: '坚持才有效，至少需选择' + this.data.joinRuleOrderDays + '天！',
          icon: 'none'
        })
        return;
      }
    }
    if (fromPage !== 'multiMeal' && fromPage !== 'netRedPlan' && fromPage !== 'customPlan') {
      // aiFat为AI智能减脂
      let requestObj = fromPage === 'aiFat' ? {} : {
        fid: caseId,
        activityId: this._state.activityId,
      }

      requests[fromPage === 'aiFat' ? 'addNavigationPlan' : 'addActivityCampPlan']({
        dateList: dateList.map((item) => item.split('/').join('')),
        ...requestObj
      })
        // requests.addActivityCampPlan({
        //   dateList: dateList.map((item) => item.split('/').join('')),
        //   fid: this.data.caseId
        // })
        .then((res) => {
          wx.navigateTo({
            url: `/pages/packageDiscover/aiMeal/previewOrderMenu/previewOrderMenu?fromPage=${fromPage}`,
            success: ({
              eventChannel
            }) => {
              if (fromPage) {
                eventChannel.emit('date-list', {
                  date: dateList.map((item) => item.split('/').join('')),
                  checkMeal: checkMeal,
                  caseId: res.obj.id,
                  needWeekend: deliverWeek ? '99' : '00',
                  times: res.obj.times.times,
                  moraddress: this.data.moraddress.id,
                  lunaddress: this.data.lunaddress.id,
                  dinaddress: this.data.dinaddress.id,
                  mortime: this.data.mortime,
                  luntime: this.data.luntime?this.data.luntime:this.data.mortime,
                  dintime: this.data.dintime?this.data.dintime:this.data.mortime,
                });
                // this.setData({
                //   times: res.obj.times.times
                // })
              } else {
                eventChannel.emit('date-list', {
                  date: dateList.map((item) => item.split('/').join('')),
                  checkMeal: ['01', '02', '03'],
                  needWeekend: deliverWeek ? '99' : '00',
                  moraddress: this.data.moraddress.id,
                  lunaddress: this.data.lunaddress.id,
                  dinaddress: this.data.dinaddress.id,
                  mortime: this.data.mortime,
                  luntime: this.data.luntime?this.data.luntime:this.data.mortime,
                  dintime: this.data.dintime?this.data.dintime:this.data.mortime,
                });
              }
            },
          });
        })
    } else {
      wx.navigateTo({
        url: `/pages/packageDiscover/aiMeal/previewOrderMenu/previewOrderMenu?fromPage=${fromPage}`,
        success: ({
          eventChannel
        }) => {
          eventChannel.emit('date-list', {
            date: dateList.map((item) => item.split('/').join('')),
            checkMeal: checkMeal,
            caseId: fromPage === 'netRedPlan' || fromPage === 'customPlan' ? caseId : '1297528',
            needWeekend: deliverWeek ? '99' : '00',
            times: 0,
            moraddress: this.data.moraddress.id,
            lunaddress: this.data.lunaddress.id,
            dinaddress: this.data.dinaddress.id,
            mortime: this.data.mortime,
            luntime: this.data.luntime?this.data.luntime:this.data.mortime,
            dintime: this.data.dintime?this.data.dintime:this.data.mortime,
          });
        },
      });
    }
  },
  emptyAddress() {
    this.setData({
      // address: addr,
      moraddress: null,
      lunaddress: null,
      dinaddress: null
    });


  },
  setAddress(addr) {
    let { moraddress, lunaddress, dinaddress, mealIndex, form } = this.data
    return this.detectUserAddress(addr);
  },
  clearUserPlanShoppingCart() {
    requests
      .clearUserPlanShoppingCart({}).then(res => { })
  },
  editTime() {
    this.setData({
      showGetTime: true
    })
  },
  queryTimeList(e) {
    let { heatPoint, mealIndex, form, dateList, mortime, luntime, dintime } = this.data

    // let {
    //   dayIdx,
    //   category,
    //   time
    // } = e.currentTarget.dataset;

    if (form.shipWithCold == '01') {
      this.setData({
        mortime: mortime,
        luntime: mortime,
        dintime: mortime
      })
      return
    }

    requests.queryHeatingPointConf({
      hId: heatPoint.hpId,
      category: mealIndex == 0 ? '01' : mealIndex == 1 ? '02' : '03',
      dataStt: '00',
      orderMethod: '01',
      selfTaking: form.selfTaking == '0' ? '0' : '1',
      dateTime: dateList[0].split('/').join(''),
      mergeFlag: '00', //00 普通
    })
      .then(res => {
        if (res.errCode == '1009') {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        } else {
          let timeList = res.obj.selfTakingTimes

          if (timeList && timeList.length > 0) {
            this.setData({
              timeList,
              shortTime: timeList[0],
              timeSelectTitle: form.selfTaking == '0' ? '预计到达时间' : '预计取餐时间', // 根据时间类型 设置 时间选择弹窗的title
              canSure: true,
            })
          }
          
          // if(e) {
          //   mortime = res.obj.defaultSetTakingTime
          //   luntime=res.obj.defaultSetTakingTime
          //   dintime=res.obj.defaultSetTakingTime 
          // } else {
     
            // if (form.selfTaking == '1') {
              if (mealIndex == 0) {
                mortime = !mortime ? res.obj.defaultSetTakingTime : mortime
              } else if (mealIndex == 1) {
                luntime = !luntime ? res.obj.defaultSetTakingTime : luntime
              } else {
                dintime = !dintime ? res.obj.defaultSetTakingTime : dintime
              }
            // } 
          // }
          this.setData({
            mortime: mortime,
            luntime: luntime,
            dintime: dintime

          })
        }

      })

  },
  selectTime: function (e) {
    this.setData({
      shortTime: e.detail.value
    })
  },
  bindpickstart() {
    this.setData({
      canSure: false
    })
  },

  bindpickend() {
    this.setData({
      canSure: true
    })
  },
  sureTime: function () {

    var that = this;
    if (!that.data.canSure) {
      return
    }
    let mealTakingTime = that.data.timeList[that.data.shortTime[0]]

    if (that.data.form.shipWithCold == '00') {
      if (that.data.mealIndex == 0) {
        that.data.mortime = mealTakingTime
      } else if (that.data.mealIndex == 1) {
        that.data.luntime = mealTakingTime
      } else {
        that.data.dintime = mealTakingTime
      }
    } else {
      that.data.mortime = mealTakingTime
      that.data.luntime = mealTakingTime
      that.data.dintime = mealTakingTime
    }
    this.setData({
      mortime: that.data.mortime,
      luntime: that.data.luntime,
      dintime: that.data.dintime,
      showGetTime: false
    })


  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () { },
});