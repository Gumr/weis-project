// pages/packSubAccount/coachMeal/coachMeal.js
import day from '../../../libs/day';
import apiRequest from '../../../service/index';
import {
  getCity
} from '../../../libs/location';
let app =  getApp();
  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shipWithColdList: [
      {
        text: '热食配送',
        value: '00'
      },
      {
        text: '冷链配送',
        value: '01'
      }
    ],
    shipTimesList: [
      {
        text: '每餐送',
        value: '00',
      },
      {
        text: '一日一送',
        value: '01'
      }
    ],
    form: {
      shipWithCold: '00',
      shipTimes: '00',
    },
    // 选择午餐晚餐
    mealList: [
      {
        category: '02',
        name: '午餐',
        selected: false,
      },
      {
        category: '03',
        name: '晚餐',
        selected: false,
      },
    ],
    mealIndex: 0,
    subInfo: {},
    disableDay: ['2021/10/01', '2021/10/02', '2021/10/03', '2021/10/04', '2021/10/05', '2021/10/06', '2021/10/07',],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      subToken: wx.getStorageSync("subToken") || '',
    })
    this.updateDisabled()
    await this.queryUserInfo();
    await this.queryCoachComboList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initDate();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  queryUserInfo: function () {
    return apiRequest.queryUserInfo({
      mainUid: this.data.subToken ? false : true
    })
      .then(res => {
        let info = res.obj;
        this.setData({
          info: info
        })
      })
      .catch(error => {

      })
  },

  queryCoachComboList(){
    const {info, subInfo} = this.data;
    apiRequest.queryCoachComboList({
      subToken: subInfo && subInfo.subToken || ''
    }).then((res)=>{
      let coachComboList = res.obj.coachComboList || [];
      let defCoachComboArr = coachComboList.filter((item) => {
        return item.defCoachCombo;
      });
      const defCoachCombo = defCoachComboArr[0] || coachComboList[0] || {}
      this.setData({
        coachComboList,
        defCoachCombo
      })
      this.checkCategory()
    })
  },

  selectCom(e){
    let {coachComboList, } = this.data;
    let index = e.currentTarget.dataset.index;
    this.setData({
      defCoachCombo: coachComboList[index],
      showKcal: false,
    })
  },

  switch(){
    wx.navigateTo({
      url: '/pages/packSubAccount/switchAccount/switchAccount?from=coachMeal',
      success: (result) => {
        
      },
    });
  },


  tapKcal(){
    let coachComboList = this.data.coachComboList || [];
    if(coachComboList.length == 0){
      return
    }
    this.setData({
      showKcal: !this.data.showKcal,
    })
  },

  select(e){
    let {shipWithColdList, shipTimesList, mealList, mealIndex, } = this.data;
    let index = e.currentTarget.dataset.index;
    let notMealCold = mealList.filter((item) => {
      return item.heatPoint && !item.heatPoint.coldFlag
    });
    if(index == 1 && notMealCold.length > 0){
      wx.showToast({
        title: '当前地址不支持冷链配送',
        icon: 'none',
      });
      return
    }
    this.setData({
      ['form.shipWithCold']: shipWithColdList[index].value,
      ['form.shipTimes']: shipTimesList[index].value,
    })
    this.updateDisabled();
    if(index == 1 && mealList[0].selected && mealList[0].address){
      this.setData({
        ['mealList[1].address']: mealList[0].address,
        ['mealList[1].heatPoint']: mealList[0].heatPoint,
        ['mealList[1].time']: mealList[0].time,
      })
    }
    this.checkCategory();
  },

  updateDisabled() {
    const {form, } = this.data;
    this.setData({
      'shipTimesList[1].disabled': form.shipWithCold === '00', // 热食 都不能一日一次配送
      'shipTimesList[0].disabled': form.shipWithCold === '01' // 冷链 配送 不能餐餐送
    })
  },

  // 不可预订的组件方法
  initDate() {
    const disableDay = this.data.disableDay;
    const now = day().hour(); // 用于判断当天是否超过18点
    // 当天不超过18点，默认开始为明天，超过则为后天
    const startDate = now >= 18 ? day().add(2, 'day').format('YYYYMMDD') : day().add(1, 'day').format('YYYYMMDD');
    const dateList = [];

    for (var i = 0; dateList.length < 3; i++) {
      let curDate = day(startDate).add(i, 'day').format('YYYY/MM/DD');
      if (!disableDay.includes(curDate)) {
        dateList.push(curDate)
      }
    }

    const calendarComp = this.selectComponent('#calendar');
    calendarComp.selectDate(dateList);
    if (calendarComp.data.month < day(dateList[0]).get('month') + 1) {
      // 如果今天是这个月最后一天 切到下个月显示日历
      calendarComp.next();
    }

    this.setData({
      disableDate: (d) => {
        return (
          d < new Date(day(startDate)) || disableDay.includes(day(d).format('YYYY/MM/DD')) || d > new Date(day(startDate).add(15, 'day'))
        );
      },
      startDate,
      dateList,
    });
  },

  tapMeal(e){
    let mealIndex = this.data.mealIndex;
    let index = e.currentTarget.dataset.index;
    if(index == mealIndex){
      return
    }
    this.setData({
      mealIndex: index
    })
  },

  // 选中该餐别
  selectMeal(e){
    let {mealIndex, mealList} = this.data;
    let index = e.currentTarget.dataset.index >= 0 ? e.currentTarget.dataset.index : mealIndex;
    this.setData({
      ['mealList['+ index +'].selected']: !mealList[index].selected
    })
    this.checkCategory();
  },

  // 完善收件信息
  selectAdd() {
    const {
      mealIndex, mealList
    } = this.data;
    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=sevenMeal&businessType=00&adrId=${mealList[mealIndex].address && mealList[mealIndex].address.id}`,
      events: {
        delete: () => {
          
        }
      }
    });     
  },

  setAddress(data){
    return this.queryHpid(data);
  },

  queryHpid(addr) {
    let { mealList, mealIndex, form: {shipWithCold,} } = this.data
    return apiRequest.heatingPointListForRange({
      userLat: addr.lat,
      userLng: addr.lon,
      key: '3'
    })
      .then(res => {
        let heatPoint = res.obj.dtos.filter((item) => {
          return shipWithCold == '00' ? item.hotFlag : item.coldFlag
        })[0];
        if(!heatPoint){
          wx.showToast({
            title: shipWithCold == '00' ? '不支持热配' : '不支持冷配',
            icon: 'none',
          });
          return 'pause'
        }
        if(shipWithCold == '00'){
          this.setData({
            ['mealList['+ mealIndex +'].heatPoint']: heatPoint,
            ['mealList['+ mealIndex +'].address']: addr,
          })
        }else{
          mealList.forEach((item)=>{
            item.heatPoint = heatPoint;
            item.address = addr;
          })
          this.setData({
            mealList
          })
        }
        this.queryHeatingPointConf()
        this.checkCategory();
      })
      .catch(error => {

      })
  },

  queryHeatingPointConf(){
    let { mealList, mealIndex, startDate,form: {shipWithCold,} } = this.data
    apiRequest.queryHeatingPointConf({
      hId: mealList[mealIndex].heatPoint.hpId,
      category: mealList[mealIndex].category,
      dataStt: '00',
      orderMethod: '01',
      selfTaking: '00',
      dateTime: startDate,
      mergeFlag: '00', //00 普通
    })
      .then(res => {
        if(shipWithCold == '00'){
          this.setData({
            ['mealList['+ mealIndex +'].time']: res.obj.defaultSetTakingTime,
            selfTakingTimes: res.obj.selfTakingTimes,
          })
        }else{
          mealList.forEach((item)=>{
            item.time = mealList[0].selected && mealList[0].time ? mealList[0].time : res.obj.defaultSetTakingTime
          })
          this.setData({
            mealList,
            selfTakingTimes: res.obj.selfTakingTimes
          })
        }
      })
  },

  cancelTime() {
    this.setData({
      showGetTime: false
    })
  },

  editTime() {
    let { mealList, mealIndex, selfTakingTimes } = this.data
    this.setData({
      shortTime: [selfTakingTimes.indexOf(mealList[mealIndex].time)],
      canSure: true,
      showGetTime: true,
    })
  },

  selectTime: function (e) {
    console.log(e)
    let { mealList, mealIndex, } = this.data
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

  sureTime(){
    let { mealList, mealIndex,form: {shipWithCold,}, shortTime, selfTakingTimes } = this.data
    if(shipWithCold == '00'){
      this.setData({
        ['mealList['+ mealIndex +'].time']: selfTakingTimes[shortTime[0]],
        showGetTime: false,
      })
    }else{
      mealList.forEach((item)=>{
        item.time = selfTakingTimes[shortTime[0]]
      })
      this.setData({
        mealList,
        showGetTime: false
      })
    }
  },

  handleCalendarSelect(e) {
    let dateList = e.detail;
    dateList = dateList.sort((a, b) => day(a) - day(b));
    this.setData({
      dateList,
    })
    this.checkCategory();
  },

  tapSelectMeal(){
    let {dateList, mealList, defCoachCombo} = this.data;
    let subInfo = this.data.subInfo || {};
    let categoryIsOk = true;
    for(var i = 0; i < mealList.length; i++){
      if(mealList[i].selected && !mealList[i].address){
        categoryIsOk = false;
        break
      }
    }
    if(!mealList[0].selected && !mealList[1].selected){
      categoryIsOk = false;
    }
    if(!dateList || dateList.length == 0 || !categoryIsOk || !defCoachCombo.tgccId){
      if(!defCoachCombo.tgccId){
        wx.showToast({
          title: '暂无套餐，请选择其他账号',
          icon: 'none',
        });
      }else if(!dateList || dateList.length == 0){
        wx.showToast({
          title: '请选择点餐日期',
          icon: 'none',
        });  
      }else{
        wx.showToast({
          title: '请选择餐别地址',
          icon: 'none',
        });  
      }
      return
    }
    wx.navigateTo({
      url: '/pages/packSubAccount/coachPackage/coachPackage',
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('data', {
          dateList,
          mealList,
          tgccId: defCoachCombo.tgccId,
          subToken: subInfo.subToken || '',
        });
      },
    });
  },

  // 校验餐别格式
  checkCategory(){
    let mealList = this.data.mealList;
    let categoryIsOk = true; //餐别格式正确
    let num = 0;
    for(var i = 0; i < mealList.length; i++){
      if(mealList[i].selected && !mealList[i].address){
        categoryIsOk = false;
        break;
      }
      if(!mealList[i].selected){
        num ++
      }
    }
    if(categoryIsOk && num == mealList.length){
      categoryIsOk = false;
    }
    this.setData({
      categoryIsOk,
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

  }
})