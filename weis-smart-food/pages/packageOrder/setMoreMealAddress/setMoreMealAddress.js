// pages/packageOrder/setMoreMealAddress/setMoreMealAddress.js
let app =  getApp();
import apiRequest from '../../../service/index';
import {
  getCity
} from '../../../libs/location';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shortTime: [0],
    canSure: true,
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
    }, ],
    shipWithColdList: [{
      value: '00',
      text_1: '热食配送',
      text_2: '热食自取',
    }, {
      value: '01',
      text_1: '冷链配送',
      text_2: '冷链自取',
    }, ],
    mealList: [{
      name: '午餐',
      meal: '02',
      // checked: true,
    }, {
      name: '晚餐',
      meal: '03',
      // checked: true
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const mealList = this.data.mealList;
    const pages = getCurrentPages();
    this.prePage = pages.find(page => page.route === 'pages/packageOrder/moreMealDetail/moreMealDetail');
    this.setData({
      dataInfo: this.prePage.data.dataInfo
    })
    mealList.forEach((item)=>{
      if(this.data.dataInfo.tmfcMealNum == 2){
        item.checked = true;
      }else{
        if(item.meal == '02'){
          item.checked = true;
        }
      }
    })
    this.setData({
      mealList
    })
    getCity((res) => {
      this.queryHpidList(res.latitude,res.longitude)
    })
    this.updateStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 选择配送方式
  itemTap(evt) {
    const {
      key,
      value,
      disabled
    } = evt.currentTarget.dataset;
    let {form, mealList} = this.data;
    if (disabled) return;
    if(form.selfTaking == '0'){
      let notMealHot = mealList.filter((item) => {
        return item.heatPoint && !item.heatPoint.hotFlag
      });
      let notMealCold = mealList.filter((item) => {
        return item.heatPoint && !item.heatPoint.coldFlag
      });
      if(notMealHot.length > 0 && key == 'shipWithCold' && value == '00'){
        wx.showToast({
          title: '当前地址不支持热食配送',
          icon: 'none',
        }); 
        return
      }
      if(notMealCold.length > 0 && key == 'shipWithCold' && value == '01'){
        wx.showToast({
          title: '当前地址不支持冷链配送',
          icon: 'none',
        }); 
        return
      }
    }
    // 自取切换配送
    if(form.selfTaking == '1'){
      let mealCold = mealList.filter((item) => {
        return item.heatPoint && !item.heatPoint.hotFlag
      });
      if(key == 'selfTaking' && value == '0' && mealCold.length > 0 && form.shipWithCold == '00'){
        this.setData({
          [`form.shipTimes`]: '01',
          [`form.shipWithCold`]: '01',
        })
      }
    }

    this.setData({
      [`form.${key}`]: value
    })
    this.updateDisabled();
    this.updateStatus();
  },
  updateDisabled() {
    const {
      form
    } = this.data;
    this.setData({
      'shipTimesList[1].disabled': form.shipWithCold === '00', // 热食 都不能一日一次配送
      'shipTimesList[0].disabled': form.selfTaking === '0' && form.shipWithCold === '01' // 冷链 配送 不能餐餐送
    })
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
  },
  // 选择餐别
  select(e){
    let {index} = e.currentTarget.dataset;
    let {mealList, dataInfo} = this.data;
    if(dataInfo.tmfcMealNum == 1){
      mealList.forEach((item)=>{
        item.checked = false;
      })
      mealList[index].checked = true;
      this.setData({
        mealList,
      })
    }
    this.updateStatus();
  },

  selectAddress(e){
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=sevenMeal`,
    });
    this.setData({
      mealIndex: index,
    })  
  },

  async setAddress(address){
    let {mealIndex, mealList} = this.data;
    const result = await this.queryHpid(address)
    if(!result){
      return 'pause'
    }
    // 请求送达时间
    await this.queryHeatingPointConf('address');
    this.updateStatus();
  },

  queryHpid(addr) {
    let { mealList, mealIndex, form} = this.data
    return apiRequest.heatingPointListForRange({
      userLat: addr.lat,
      userLng: addr.lon,
      key: 'moreMeal'
    })
      .then(res => {
        let heatPoint = null;
        if(form.selfTaking == 0 && form.shipWithCold == '00'){
          heatPoint = res.obj.dtos.filter((item) => {
            return item.hotFlag
          })[0]
        }else if(form.selfTaking == 0 && form.shipWithCold == '01'){
          heatPoint = res.obj.dtos.filter((item) => {
            return item.coldFlag
          })[0]
        }else{
          heatPoint = res.obj.dtos[0]
        }
        if(!heatPoint){
          wx.showToast({
            title: form.selfTaking == 0 ? (form.shipWithCold == '00' ? '不支持热配' : '不支持冷配') : '不支持当前配送方式',
            icon: 'none',
          });
          return
        }
        this.setData({
          ['mealList['+ mealIndex +'].heatPoint']: heatPoint,
          ['mealList['+ mealIndex +'].address']: addr
        })
        if(form.shipWithCold == '00' && form.shipTimes == '00' && !heatPoint.hotFlag){
          form.shipWithCold = '01';
          form.shipTimes = '01';
          this.setData({
            form,
          })
        }
        this.updateDisabled();
        return res
      })
      .catch(error => {

      })
  },

  queryHeatingPointConf(type){
    let {mealList, mealIndex, form} = this.data;
    return apiRequest.queryHeatingPointConf({
      hId: form.selfTaking == '0' ? mealList[mealIndex].heatPoint.hpId : mealList[mealIndex].selfHeatpoint.hpId,
      category: mealIndex == 0 ? '02' : '03',
      dataStt: '00',
      orderMethod: '01',
      selfTaking: form.selfTaking == '0' ? '0' : '1',
      dateTime: this.prePage.data.dateList[0].date,
      mergeFlag: '00', //00 普通
    }).then((res)=>{
      let timeList = res.obj.selfTakingTimes;
      if(!mealList[mealIndex].time && type == 'address'){
        this.setData({
          ['mealList['+ mealIndex +'].time']: res.obj.defaultSetTakingTime
        })
      }
      this.setData({
        timeList,
        timeSelectTitle: form.selfTaking == '0' ? '预计到达时间' : '预计取餐时间', // 根据时间类型 设置 时间选择弹窗的title
      })
    })
  },

  // 查询加热点
  queryHpidList(lat, lon){
    let {mealList} = this.data;
    apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      showScope: true,
      showAll: true,
      key: '2',
      userAddr: (app.globalData.userAddr && app.globalData.userAddr.address) || '',
    }).then((res)=>{
      let heatList = res.obj.dtos;
      heatList.forEach((item, index) => {
        item.distance = item.shipDistance;
        item.id = item.hpId;
        item.name = item.hpName;
        item.shopAddress = item.address;
      })
      mealList.forEach((item,index)=>{
        item.selfHeatpoint = heatList[0]
      })
      this.setData({
        heatList,
        mealList
      })
    })
  },

  async editTime(e) {
    let index = e.currentTarget.dataset.index;
    let {mealList, mealIndex, form} = this.data;
    if(form.selfTaking == '0' && !mealList[index].address){
      wx.showToast({
        title: '请先选择送餐地址',
        icon: 'none',
      });
      return
    }
    this.setData({
      mealIndex: index,
    })
    await this.queryHeatingPointConf();
    this.setData({
      showGetTime: true,
    })
    if(mealList[index].time){
      if(this.data.timeList.indexOf(mealList[index].time) >= 0){
        this.setData({
          shortTime: [this.data.timeList.indexOf(mealList[index].time)]
        })
      }else{
        this.setData({
          shortTime: '',
          canSure: false,
        })
      }
    }
  },

  cancelTime() {
    this.setData({
      showGetTime: false
    })
  },

  selectTime: function (e) {
    console.log(e)
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
    let {mealList, mealIndex} = this.data;
    if (!that.data.canSure) {
      return
    }
    let mealTakingTime = that.data.timeList[that.data.shortTime[0]]
    this.setData({
      showGetTime: false,
      ['mealList['+ mealIndex +'].time']: mealTakingTime
    })
    this.updateStatus();
  },

  sure(){
    let {mealList, mealIndex, form, tip, canNext} = this.data;
    if(!canNext){
      wx.showToast({
        title: tip,
        icon: 'none',
      });
      return
    }
    let {dateList, dataObj} = this.prePage.data;
    mealList = mealList.filter((item) => {
      return item.checked
    });
    let skuList = {};
    dataObj.skuList.forEach((item1, index1)=>{
      let arr = [];
      mealList.forEach((item2, index2)=>{
        let obj = {
          categoryType: item2.name,
          strDate: dateList[index1].date,
          getCategoryList: item1.list[index2].list.getCategoryList.map(({ cid }) => cid),
          tatolPrice: item1.list[index2].list.discountPrice,
          addressId: item2.address && item2.address.id || 0,
          mealTakingTime: item2.time,
          hpid: form.selfTaking == 0 ? item2.heatPoint.hpId : item2.selfHeatpoint.hpId,
        }
        arr.push(obj);
      })
      skuList[dateList[index1].date] = arr;
    })
    apiRequest.singleCreateSevenOrder({
      hpid: form.selfTaking == 0 ? mealList[0].heatPoint.hpId : mealList[0].selfHeatpoint.hpId,
      planType: '07',
      dateList: dateList.map(({ date }) => date),
      selfTaking: form.selfTaking,
      shipTimes: form.shipTimes,
      shipWithCold: form.shipWithCold,
      skuList,
      totalOrderId: this.totalOrderId || 0,
    }).then((res)=>{
      if (res.errCode === 0) {
        // this.totalOrderId = res.obj.totalOrderId;
        wx.navigateTo({
          url: `/pages/packageDiscover/aiMeal/submitOrderMenu/submitOrderMenu?fromPage=moreMeal&totalOrderId=${res.obj.totalOrderId}&shipWithCold=${form.shipWithCold}&planType=07`
        })
      }
    })
  },

  updateStatus(){
    let {mealList, mealIndex, form} = this.data;
    let canNext = true;
    mealList = mealList.filter((item) => {
      return item.checked
    });
    for(var i = 0; i < mealList.length; i++){
      if(form.selfTaking == '0' && (!mealList[i].address || !mealList[i].time)){
        canNext = false;
        this.setData({
          tip: !mealList[i].address ? `请填写${mealList[i].name}配送地址` : `请填写${mealList[i].name}送达时间`
        })
        break
      }else if(form.selfTaking == '1' && !mealList[i].time){
        canNext = false;
        this.setData({
          tip: `请填写${mealList[i].name}取餐时间`
        })
        break
      }
    }
    this.setData({
      canNext,
    })
  },
  
  heatPointTap(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      showHeatPointDialog: true,
      mealIndex: index,
    })
  },

  handleHeatPointClose() {
    this.setData({
      showHeatPointDialog: false
    })
  },

  handleHeatPointSelect(evt) {
    const index = evt.detail;
    const {mealIndex, heatList, } = this.data;
    if (heatList[index].selfTaking == '0') {
      wx.showToast({
        title: '当前加热点不支持自取',
        icon: 'none',
      });
      return
    }
    this.setData({
      showHeatPointDialog: false,
      ['mealList['+ mealIndex +'].selfHeatpoint']: heatList[index]
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