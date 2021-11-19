// pages/packSubAccount/coachPackage/coachPackage.js
import day from '../../../libs/day';
import apiRequest from '../../../service/index';
import { round, t } from '../../../utils/common'
Page({
  weekText: ['日', '一', '二', '三', '四', '五', '六'],
  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: 0,
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    calHeight: t(100),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.prePage = getCurrentPages().find(page => page.route === 'pages/packSubAccount/coachMeal/coachMeal')
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.once('data', (data) => {
      const mealList = data.mealList;
      const mealArr = [];
      this.luntime = mealList[0].time;
      this.dintime = mealList[1].time;
      mealList.forEach((item)=>{
        if(item.selected){
          mealArr.push(item.category)
        }
      })
      const dateArr = [];
      const dateList = data.dateList;
      dateList.forEach((item)=>{
        const obj = {
          date: day(item).format('YYYYMMDD'),
          meal: mealArr
        }
        dateArr.push(obj)
      })
      this.setData({
        dateArr,
        tgccId: data.tgccId,
        subToken: data.subToken || '',
      })
      this.queryCoachSkuList().then(()=>{
        this.setData({
          hideLoad: true
        })
      })
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

  queryCoachSkuList(){
    let {tgccId, dateArr, subToken} = this.data;
    return apiRequest.queryCoachSkuList({
      tgccId,
      dateList: dateArr,
      planType: '06',
      subToken: subToken || '',
      totalOrderId: this.$totalOrderId || 0,
    }).then((res)=>{
      if (res.errCode === 0) {
        this.dateList = res.obj.dataList;
        this.planName = res.obj.planName;
        this.skuList = res.obj.skuList;
        const dateList = res.obj.dataList.map((item, index) => {
          let dayObj = {};
          dayObj.raw = item.date;
          dayObj.date = day(item.date).format('YYYY/MM/DD');
          dayObj.year = day(item.date).format('YYYY');
          dayObj.month = day(item.date).format('MM');
          dayObj.day = day(item.date).format('DD');
          dayObj.week = this.weekText[day(item.date).day()];
          return dayObj
        })
        // dateList 的key是以dateList中的项作为key的
        const date = dateList[this.data.selectIndex]
        this.$discount = res.obj.discount || 1;
        this.setData({
          discount: round(res.obj.discount * 10, 1),
          dateList,
          healthyMenus: this.skuList[date.raw].map((mealItem) => this.transformHealthyMenu(mealItem, 0))
        })
      }
    })
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

  genMealItem(meal, planMeal) {
    // 计算每个菜品加起来的摄入数据，聚合成一个对象
    const categoryData = meal.getCategoryList.reduce((data, category) => {
      data.energy = (data.energy || 0) + category.energy * category.num
      data.protein = (data.protein || 0) + category.protein * category.num
      data.fat = (data.fat || 0) + category.fat * category.num
      data.carbonwater = (data.carbonwater || 0) + category.carbonwater * category.num
      return data;
    }, {})
    return {
      tatolPrice: round(meal.tatolPrice, 2),
      priceAfterDiscount: round(meal.tatolPrice * this.$discount, 2),
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

  // 切换日期
  select(e) {
    const { index } = e.currentTarget.dataset;
    if (index == this.data.selectIndex) {
      return
    }
    const date = this.data.dateList[index];
    this.setData({
      selectIndex: index,
      healthyMenus: this.skuList[date.raw].map((mealItem) => {
        return this.transformHealthyMenu(mealItem, 0)
      }),
    })
  },

  // 换一套
  change(e){
    let {tgccId, dateArr, selectIndex, healthyMenus, subToken} = this.data;
    let {index, categoryType} = e.currentTarget.dataset;
    let category = healthyMenus[index].planDetail.category;
    const pages = getCurrentPages(),
        prePage = pages[pages.length - 2];
    const form = prePage.data.form;    
    wx.showLoading({
      title: '更换中',
      mask: true,
    });
    apiRequest.queryCoachSkuList({
      tgccId,
      dateList: [{date: dateArr[selectIndex].date, meal: [category]}],
      planType: '06',
      shipWithCold: form.shipWithCold,
      selfTaking: 0,
      shipTimes: form.shipTimes,
      subToken: subToken || '',
      totalOrderId: this.$totalOrderId || 0,
    }).then((res)=>{
      if (res.errCode === 0) {
        const date = dateArr[selectIndex].date;
        this.skuList[date][index] = res.obj.skuList[date][0];
        this.setData({
          healthyMenus: this.skuList[date].map((mealItem) => this.transformHealthyMenu(mealItem, 0))
        })
      }
      setTimeout(()=>{
        wx.hideLoading();
      },200)
    }).catch(()=>{
      setTimeout(()=>{
        wx.hideLoading();
      },200)
    })
  },

  // 自由点餐
  freeOrder(e) {
    const { index, categoryType } = e.currentTarget.dataset,
      { healthyMenus, selectIndex: dayIndex } = this.data,
      key = healthyMenus[index].planDetail.category
    wx.navigateTo({
      url: `/pages/packageDiscover/aiMeal/aiFreeOrder/aiFreeOrder?category=${key}&index=${index}&dayIndex=${dayIndex}&fromPage=coachMeal`
    })
  },

  // 提交
  sure() {
    const params = this.getParams()
    params.totalOrderId = this.$totalOrderId || 0;
    params.subToken = this.data.subToken || '';
    apiRequest.singleCreateSevenOrder(params).then((res) => {
      if (res.errCode === 0) {
        this.$totalOrderId = res.obj.totalOrderId;
        wx.navigateTo({
          url: `/pages/packageDiscover/aiMeal/submitOrderMenu/submitOrderMenu?fromPage=coachMeal&totalOrderId=${res.obj.totalOrderId}&shipWithCold=${params.shipWithCold}&planType=06&mainPlanId=${this.mainPlanId || ''}&discount=${this.data.discount}&times=${this.times || ''}`
        })
      }
    })
  },

  getParams() {
    const prePageData = this.prePage.data;
      const params = {
        hpid: 0,
        planType: '06',
        // dateTime: this.date,
        dateList: this.dateList.map(({ date }) => date),
        ...prePageData.form,
        selfTaking: 0,
      }

      params.skuList = this.getSkuListByDate();

      params.addressId = prePageData.mealList[0].selected && prePageData.mealList[0].address.id || prePageData.mealList[1].selected && prePageData.mealList[1].address.id || 0;

      return params;
  },

  getSkuListByDate() {
    const skuList = { ...this.skuList }
    const prePageData = this.prePage.data;
    const { mealList } = prePageData;

    function genItemByDate(key) {
      return skuList[key].map((sku) => {
        sku = { ...sku };
        sku.getCategoryList = sku.list[0].getCategoryList.map((category) => category.cid);
        sku.tatolPrice = sku.list[0].tatolPrice;
        sku.addressId = (sku.categoryType == '午餐' ? mealList[0].address.id : mealList[1].address.id) || 0;
        sku.mealTakingTime = sku.categoryType == '午餐' ? mealList[0].time : mealList[1].time;
        sku.hpid = (sku.categoryType == '午餐' ? mealList[0].heatPoint.hpId : mealList[1].heatPoint.hpId) || 0
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