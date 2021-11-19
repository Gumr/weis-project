// pages/packageDiscover/tenMeal/slimMeal/slimMeal.js
// import ReserveService from "../../../../service/ReserveService";
// const reserveService = new ReserveService();
import requests from "../../../../service/index";
import { setStorage } from '../../../../utils/storage'
import { round, t } from '../../../../utils/common'
const utils = require('../../../../utils/week-utils.js');
const util = require('../../../../utils/util');
// const app = getApp();
Page({

  weekText: ['日', '一', '二', '三', '四', '五', '六'],

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    calHeight: t(100),
    tomorrow: utils.formatTime2(new Date(new Date().setDate(new Date().getDate() + 1))),
    selectIndex: 0,
    dayMealIndex: {},
    categoryArr: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐'
    },
    showChangeSkuDialog: false,
    selectedSku: {},
    currentMealData: {},
    changeableSkuList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isIpx: getApp().globalData.isIpx
    })

    this.fromPage = options.fromPage || '';
    this.orderDeliveryPage = getCurrentPages().find(page => page.route === 'pages/packageDiscover/aiMeal/orderDelivery/orderDelivery')
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.once('date-list', (dateList) => {

      this.dateList = dateList.date;
      this.checkMeal = dateList.checkMeal;
      this.needWeekend = dateList.needWeekend;
      this.caseId = dateList.caseId
      this.times = dateList.times;
      this.mortime = dateList.mortime;
      this.luntime = dateList.luntime;
      this.dintime = dateList.dintime;
      this.moraddress = dateList.moraddress;
      this.lunaddress = dateList.lunaddress;
      this.dinaddress = dateList.dinaddress;
      let date = [];
      this.dateList.forEach((item) => {
        date.push({
          date: item,
          meal: this.checkMeal
        })
      })
      if (this.fromPage === 'celebrityPlan') {
        this.planType = '01';
        this.mainPlanId = dateList.caseId;
        this.cratePlanDetail(date)
          .then(() => {
            this.setData({
              hideLoad: true
            })
          })
      } else if (this.fromPage === 'onLineFat' || this.fromPage === 'aiFat') {
        this.planType = this.fromPage === 'onLineFat' ? '05' : '01';
        this.mainPlanId = dateList.caseId;
        this.setData({
          isSlimmingCamp: true
        })
        this.cratePlanDetail(date)
          .then(() => {
            this.setData({
              hideLoad: true
            })
          })

        setStorage('teamUpDate', {
          dateList: this.dateList,
          checkMeal: this.checkMeal
        });
      } else if (this.fromPage === 'multiMeal' || this.fromPage === 'netRedPlan' || this.fromPage === 'customPlan') {
        this.planType = this.fromPage === 'multiMeal' ? '04' : '02'
        this.getMultiMealSkuList(date)
          .then(res => {
            this.setData({
              hideLoad: true
            })
          })
      } else {
        this.planType = '00';
        this.queryNavigationInfo()
          .then(() => {
            this.cratePlanDetail(date)
              .then(() => {
                this.setData({
                  hideLoad: true
                })
              })
          })

      }
    })
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
  changePlanMenu(params) {
   
    return requests.changePlanMenu(params)
  },
  cratePlanDetail(dateList) {
    const params = {
      planType: this.planType,
      hpid: 0,
      dateList,
      needWeekend: this.needWeekend,
      mainPlanId: this.mainPlanId,
      times: this.times,
    }

    const orderDeliveryData = this.orderDeliveryPage.data;
    if (orderDeliveryData.form.selfTaking === '1') { // 自取
      params.hpid = orderDeliveryData.heatPoint.hpId;
    }
    if (orderDeliveryData.form.selfTaking === '0') { // 配送
      params.addressId = orderDeliveryData.moraddress.id || orderDeliveryData.lunaddress.id || orderDeliveryData.dinaddress.id || 0;
    }
 
    return requests.cratePlanSkuList(params).then((res) => {
      if (res.errCode === 0) {
        this.dateList = res.obj.dataList;
        this.planName = res.obj.planName
        const dateList = res.obj.dataList.map((item, index) => {
          let dateTime = new Date(util.dateUtil.dateSwitch(item.date));
          let day = {};
          day.raw = item.date;
          day.date = this.timeFormat(dateTime);
          day.year = dateTime.getFullYear();
          day.month = this.zero(dateTime.getMonth() + 1);
          day.day = this.zero(dateTime.getDate());
          day.week = this.weekText[dateTime.getDay()];

          return day
        })

        this.skuList = res.obj.skuList
        // 给每天的每餐set 一个index 给以后换一套菜品的时候使用 默认使用第一套菜品
        const dayMealIndex = Object.keys(this.skuList).reduce((map, key) => {
          const sku = this.skuList[key];
          map[key] = sku.reduce((m, category) => {
            m[category.categoryType] = 0
            return m
          }, {})

          return map
        }, {})
        // dateList 的key是以dateList中的项作为key的
        const date = dateList[this.fromPage === 'multiMeal' ? 1 : this.data.selectIndex]

        this.$discount = res.obj.discount || 1;
        this.setData({
          discount: round(res.obj.discount * 10, 1),
          dateList,
          dayMealIndex,
          healthyMenus: this.skuList[date.raw].map((mealItem) => this.transformHealthyMenu(mealItem, 0))
        })
      }

    })
  },
  // 获取快速点多餐推荐菜品
  getMultiMealSkuList(dateList) {
    const that = this
    const params = {
      planType: this.planType,
      hpid: 0,
      dateList,
      needWeekend: this.needWeekend,
      times: this.times,
    }
    this.fromPage === 'netRedPlan' || this.fromPage === 'customPlan' && (params.mainPlanId = this.caseId)
    this.fromPage === 'netRedPlan' && (params.fromType = '00')
    this.fromPage === 'customPlan' && (params.fromType = '01')
    const orderDeliveryData = this.orderDeliveryPage.data;
    if (orderDeliveryData.form.selfTaking === '1') { // 自取
      params.hpid = orderDeliveryData.heatPoint.hpId;
    }
    if (orderDeliveryData.form.selfTaking === '0') { // 配送
      params.addressId = orderDeliveryData.moraddress.id || orderDeliveryData.lunaddress.id || orderDeliveryData.dinaddress.id || 0;
    }

    return requests.querySkuListByPlan(params)
      .then(res => {
        if (res.errCode === 0) {
          let { skuInfoList, skuList } = res.obj
          this.dateList = res.obj.dataList;
          const dateList = res.obj.dataList.map((item, index) => {
            let dateTime = new Date(util.dateUtil.dateSwitch(item.date));
            let day = {};
            day.raw = item.date;
            day.date = this.timeFormat(dateTime);
            day.year = dateTime.getFullYear();
            day.month = this.zero(dateTime.getMonth() + 1);
            day.day = this.zero(dateTime.getDate());
            day.week = this.weekText[dateTime.getDay()];

            return day
          })
          this.matchSku(skuList, skuInfoList)
          this.skuList = res.obj.skuList
          this.skuInfoList = skuInfoList
          // 给每天的每餐set 一个index 给以后换一套菜品的时候使用 默认使用第一套菜品
          const dayMealIndex = Object.keys(this.skuList).reduce((map, key) => {
            const sku = this.skuList[key];
            map[key] = sku.reduce((m, category) => {
              m[category.categoryType] = 0
              return m
            }, {})

            return map
          }, {})
          // dateList 的key是以dateList中的项作为key的
          const date = dateList[this.fromPage === 'multiMeal' ? 1 : this.data.selectIndex]

          this.$discount = res.obj.discount || 1;
          this.setData({
            discount: round(res.obj.discount * 10, 1),
            dateList,
            dayMealIndex,
            healthyMenus: this.skuList[date.raw].map((mealItem) => this.transformHealthyMenu(mealItem, 0))
          })
          // console.log(this.data.healthyMenus);
        }
      })
  },
  selectSkuTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const selectedSku = this.data.changeableSkuList[index];
    let { currentMealData } = this.data;
    currentMealData = {
      ...currentMealData,
      energy: currentMealData._baseEnergy + selectedSku.energy,
      protein: currentMealData._baseProtein + selectedSku.protein,
      fat: currentMealData._baseFat + selectedSku.fat,
      carbonwater: currentMealData._baseCarbonwater + selectedSku.carbonwater,
    };
    this.setData({
      selectedSku,
      currentMealData: {
        ...currentMealData,
        ...this.computePercent(currentMealData, currentMealData.planDetail)
      }
    })
  },
  // 根据skuList返回的菜品id，从skuInfoList获取菜品信息
  matchSku(skuList, skuInfoList) {
    this.dateList.map(item => {
      const key = item.date
      skuList[key].forEach(eachDay => {
        eachDay.list.forEach(meal => {
          meal.getCategoryList = meal.getCategoryListStr.reduce((result, sku) => {
            result.push(skuInfoList.find(skuInfo => sku === skuInfo.cid))
            return result
          }, [])
          delete meal.getCategoryListStr
        })
      })
    })
  },
  queryNavigationInfo() {
    return requests.queryNavigationInfo({
    }).then((res) => {
      if (res.errCode === 0) {
        const { userRecord } = res.obj;
        this.mainPlanId = userRecord.csId;
        this.date = userRecord.stime;
      }
    })
  },
  genMealItem(meal, planMeal) {

    // 计算每个菜品加起来的摄入数据，聚合成一个对象
    const categoryData = meal.getCategoryList.reduce((data, category) => {
      data.energy = (data.energy || 0) + category.energy
      data.protein = (data.protein || 0) + category.protein
      data.fat = (data.fat || 0) + category.fat
      data.carbonwater = (data.carbonwater || 0) + category.carbonwater
      return data;
    }, {})
    return {
      tatolPrice: round(meal.tatolPrice, 2),
      priceAfterDiscount: this.data.isSlimmingCamp || this.fromPage === 'multiMeal' || this.fromPage === 'netRedPlan' || this.fromPage === 'customPlan' ? round(meal.tatolPrice * this.$discount, 2) : round(meal.tatolPrice, 2),
      getCategoryList: meal.getCategoryList,
      ...categoryData,
      ...this.computePercent(categoryData, planMeal)
    };
  },
  computePercent(meal, plan) { // 计算当餐实际能量 和 计划能量 算出百分比
    const result = {};
    result.energyDifference = parseInt(meal.energy - plan.totalKcal);
    result.energyPercent = parseInt((meal.energy / plan.totalKcal) * 100);
    result.proteinPercent = parseInt((meal.protein / plan.proteinTotal) * 100);
    result.fatPercent = parseInt((meal.fat / plan.fatTotal) * 100);
    result.carbonwaterPercent = parseInt((meal.carbonwater / plan.carbohydrateTotal) * 100);
    result.proteinDifference = (meal.protein - plan.proteinTotal).toFixed(1)
    result.fatDifference = (meal.fat - plan.fatTotal).toFixed(1)
    result.carbonwaterDifference = (meal.carbonwater - plan.carbohydrateTotal).toFixed(1)
    return result;
  },
  // list是一个sku组合的数组 index是当前选择的sku组合
  transformHealthyMenu(menu, index) {
    const meal = menu.list[index]
    const mealItem = this.genMealItem(meal, menu.planDetail)
    return {
      ...menu,
      ...mealItem
    }
  },
  closeDialogTap() {
    this.setData({
      showChangeSkuDialog: false
    })
  },
  confirmChangeSkuTap(evt) {

   
    const { changeable } = evt.currentTarget.dataset;
    if (!changeable) return;
    const { currentMealData, selectedSku, dateList, selectIndex } = this.data;

    currentMealData.getCategoryList[this.skuIndex] = selectedSku;
    currentMealData.tatolPrice = round(currentMealData._basePrice + selectedSku.price, 2);

    currentMealData.priceAfterDiscount = this.data.isSlimmingCamp || this.fromPage === 'multiMeal' || this.fromPage === 'netRedPlan' || this.fromPage === 'customPlan' ? round(currentMealData.tatolPrice * this.$discount, 2) : round(currentMealData.tatolPrice, 2)

    currentMealData.list[this.categoryIndex].getCategoryList = currentMealData.getCategoryList
    currentMealData.list[this.categoryIndex].tatolPrice = currentMealData.tatolPrice

    const date = dateList[selectIndex].raw; // 拿到今天的时间
    this.skuList[date][this.categoryIndex] = currentMealData;
    const { mortime, luntime, dintime } = this
    const params = this.getParams(Boolean(this.$totalOrderId));
    if (this.$totalOrderId) { // 有id 证明从支付页回退回来的
      params.totalOrderId = this.$totalOrderId;
      params.skuList = {
        [date]: [{
          categoryType: currentMealData.categoryType,
          getCategoryList: currentMealData.getCategoryList.map(({ cid }) => cid),
          tatolPrice: currentMealData.tatolPrice,
          priceAfterDiscount: currentMealData.priceAfterDiscount,
          mealTakingTime :  currentMealData.categoryType == '早餐' ? mortime : currentMealData.categoryType == '午餐' ? luntime : dintime

        }]
      }
      params.cancelFlag = '0'
      this.changePlanMenu(params)
        .then((res) => {
          if (res.errCode === 0) {
            this.setData({
              [`healthyMenus[${this.categoryIndex}]`]: currentMealData,
              showChangeSkuDialog: false
            })
          }
        })
    } else {
      this.setData({
        [`healthyMenus[${this.categoryIndex}]`]: currentMealData,
        showChangeSkuDialog: false
      })
    }
  },
  changeSingleSkuTap(evt) {
    const data = evt.currentTarget.dataset;
    this.categoryIndex = data.categoryIndex;
    this.skuIndex = data.skuIndex;
    const currentMealData = this.data.healthyMenus[data.categoryIndex];
    console.log(currentMealData, 'data')
    const skuData = currentMealData.getCategoryList[data.skuIndex]
    console.log(skuData, 'data')
    console.log(data, 'data')
    this.changeSingleSku(data)
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            showChangeSkuDialog: true,
            currentMealData: {
              ...currentMealData,
              // 记录减掉这个sku的价钱 和营养数据
              _baseEnergy: currentMealData.energy - skuData.energy,
              _baseProtein: currentMealData.protein - skuData.protein,
              _baseFat: currentMealData.fat - skuData.fat,
              _baseCarbonwater: currentMealData.carbonwater - skuData.carbonwater,
              _basePrice: currentMealData.tatolPrice - skuData.price
            },
            selectedSku: null,
            changeableSkuList: res.obj.resultSkuList
          })
        }
      });
  },
  timeFormat: function (date) {
    if (!date || typeof (date) === "string") {
      this.error("参数异常，请检查...");
    }
    var y = date.getFullYear(); //年
    var m = date.getMonth() + 1; //月
    var d = date.getDate(); //日
    return y + "/" + this.zero(m) + "/" + this.zero(d);
  },

  //补全0
  zero: function (i) {
    return i >= 10 ? i : '0' + i;
  },

  onPageScroll: function (e) {
    // if (e.scrollTop > (this.cladarTop ? this.cladarTop - this.data.navStatusHeight : 97)) {
    //   if (!this.data.cladarFixed) {
    //     this.setData({
    //       cladarFixed: true
    //     })
    //   }
    // } else {
    //   if (this.data.cladarFixed) {
    //     this.setData({
    //       cladarFixed: false
    //     })
    //   }
    // }
  },

  select(e) {
    const { index } = e.currentTarget.dataset;
    if (index == this.data.selectIndex) {
      return
    }
    const date = this.data.dateList[index];
    // if(this.fromPage === 'multiMeal') {
    //   this.matchSku(this.skuList, this.skuInfoList)
    // }
    // console.log(this.skuList);
    this.setData({
      selectIndex: index,
      healthyMenus: this.skuList[date.raw].map((mealItem) => {
        // 读当餐换到了哪一餐 如 date 20200730 早餐
        const mealIndex = this.data.dayMealIndex[date.raw][mealItem.categoryType];
        return this.transformHealthyMenu(mealItem, mealIndex)
      }),
    })
  },
  changeSingleSku(params) {
    const baseParams = this.getParams();

    params = Object.assign(params, {
      dateTime: this.data.dateList[this.data.selectIndex].raw,
      hpid: baseParams.hpid,
      addressId: baseParams.addressId,
      planType: baseParams.planType,
      mainPlanId: baseParams.mainPlanId,
    });
    return requests.changeSingleSku(params)
  },
  change(e) {

    const date = this.data.dateList[this.data.selectIndex].raw; // 拿到今天的时间
    const todayMealIndex = this.data.dayMealIndex[date]; // 拿到当天每餐对应的index
    const { index, categoryType } = e.currentTarget.dataset; // 这餐的index
   
    wx.showLoading({
      title: '更换中',
      mask: true,
    });
    const healthyMenu = this.data.healthyMenus[index];
    const newIndex = (todayMealIndex[categoryType] + 1) % healthyMenu.list.length; // 有几套菜品就取模 + 1 % n 循环修改;
    todayMealIndex[categoryType] = newIndex;
    const healthyMenuItem = this.transformHealthyMenu(healthyMenu, newIndex);
    const params = this.getParams(!!this.$totalOrderId);
    const { mortime, luntime, dintime } = this
   
    if (this.$totalOrderId) {
      params.totalOrderId = this.$totalOrderId;
      params.skuList = {
        [date]: [{
          categoryType: healthyMenuItem.categoryType,
          getCategoryList: healthyMenuItem.getCategoryList.map(({ cid }) => cid),
          tatolPrice: healthyMenuItem.tatolPrice,
          mealTakingTime :  healthyMenuItem.categoryType == '早餐' ? mortime : healthyMenuItem.categoryType == '午餐' ? luntime : dintime
        }]
      }
     
      params.cancelFlag = '0'

      this.changePlanMenu(params)
        .then((res) => {
          if (res.errCode === 0) {
            this.setData({
              [`healthyMenus[${index}]`]: healthyMenuItem,
              [`dayMealIndex.${date}.${categoryType}`]: newIndex
            })
          }
          wx.hideLoading();
        })
    } else {
      this.setData({
        [`healthyMenus[${index}]`]: healthyMenuItem,
        [`dayMealIndex.${date.raw}.${categoryType}`]: newIndex
      })
      wx.hideLoading();
    }
  },
  freeOrder(e) {
    const { index, categoryType } = e.currentTarget.dataset,
      { healthyMenus, selectIndex: dayIndex } = this.data,
      key = healthyMenus[index].planDetail.category
    // console.log(this.fromPage);
    wx.navigateTo({
      url: `/pages/packageDiscover/aiMeal/aiFreeOrder/aiFreeOrder?category=${key}&index=${index}&dayIndex=${dayIndex}`
    })
  },
  sure() {
    const params = this.getParams()

    this.singleCreateSevenOrder(params)
  },
  singleCreateSevenOrder(params) {
    params.totalOrderId = this.$totalOrderId || 0;
    requests.singleCreateSevenOrder(params).then((res) => {
      if (res.errCode === 0) {
        this.$totalOrderId = res.obj.totalOrderId;
        wx.navigateTo({
          url: `/pages/packageDiscover/aiMeal/submitOrderMenu/submitOrderMenu?fromPage=${this.fromPage}&totalOrderId=${res.obj.totalOrderId}&shipWithCold=${params.shipWithCold}&planType=${this.planType}&mainPlanId=${this.mainPlanId}&discount=${this.data.discount}&times=${this.times}`
        })
      }
    })
  },
  noop() { },
  getParams(notSkuList) {
    if (this.orderDeliveryPage) {
      const orderDeliveryData = this.orderDeliveryPage.data;
      const params = {
        hpid: 0,
        planType: this.planType,
        dateTime: this.date,
        mainPlanId: this.mainPlanId,
        dateList: this.dateList.map(({ date }) => date),
        ...orderDeliveryData.form,
      }

      if (!notSkuList) { // 不用生成skuList
        params.skuList = this.getSkuListByDate();
      }

      if (orderDeliveryData.form.selfTaking === '1') { // 自取
        params.hpid = orderDeliveryData.heatPoint.hpId;
      }
      if (orderDeliveryData.form.selfTaking === '0') { // 配送
        params.addressId = orderDeliveryData.moraddress.id || orderDeliveryData.lunaddress.id || orderDeliveryData.dinaddress.id || 0;
      }

      return params;
    }
  },
  getSkuListByDate() {
    const skuList = { ...this.skuList }
    const { dayMealIndex, } = this.data;
    const { mortime, luntime, dintime, moraddress, lunaddress, dinaddress } = this

    const orderDeliveryData = this.orderDeliveryPage.data;



    function genItemByDate(key) {
     
      const map = dayMealIndex[key];
      return skuList[key].map((sku) => {
        sku = { ...sku };
        // debugger
        const index = map[sku.categoryType]; // 从换餐map对象中读取index
        sku.getCategoryList = sku.list.filter((_, i) => i === index)[0].getCategoryList.map((category) => category.cid);
        sku.tatolPrice = sku.list.filter((_, i) => i === index)[0].tatolPrice;
        sku.addressId = (sku.categoryType == '早餐' ? moraddress : sku.categoryType == '午餐' ? lunaddress : dinaddress) || 0;
        sku.mealTakingTime = sku.categoryType == '早餐' ? mortime : sku.categoryType == '午餐' ? luntime : dintime;
        if (orderDeliveryData.form.selfTaking == '0') {
          sku.hpid = (sku.categoryType == '早餐' ? orderDeliveryData.moraddress.hpid : sku.categoryType == '午餐' ? orderDeliveryData.lunaddress.hpid : orderDeliveryData.dinaddress.hpid) || 0
        } else {
          sku.hpid = (sku.categoryType == '早餐' ? orderDeliveryData.psmoraddress.hpId : sku.categoryType == '午餐' ? orderDeliveryData.pslunaddress.hpId : orderDeliveryData.psdinaddress.hpId) || 0
        }

        delete sku.planDetail;
        delete sku.list;

        return sku;

      })
    }

    const dates = Object.keys(skuList);
    return dates.reduce((result, $date) => {
      result[$date] = genItemByDate($date);
      return result;
    }, {})
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