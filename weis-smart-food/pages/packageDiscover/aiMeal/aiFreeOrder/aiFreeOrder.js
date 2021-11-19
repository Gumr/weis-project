// pages/packageDiscover/aiMeal/aiFreeOrder/aiFreeOrder.js
import {
  isLoginClick,
  loginPromise,
  t,
  confObj,
  round,
  judgeSubAccount
} from '../../../../utils/common'
import {
  getStorage,
  setStorage, removeStorage
} from '../../../../utils/storage'
const location = require('../../../../libs/location.js');
import apiRequest from '../../../../service/index';
import {
  debounce,
  throttle
} from '../../../../utils/throttle';
import day from '../../../../libs/day'
var utils = require('../../../../utils/week-utils.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    leftIndex: 0,
    px2rpx: app.globalData.px2rpx,
    cart: {
      '00': '全部',
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
    smallSize: {
      title: 20,
      value: 40,
      unit: 18,
      label: 20,
    },
    lineWidth: {
      dark: 6, // 内圆宽度
      light: 10 // 外圆宽度
    },
    allCart: {
      fat: 0,
      energy: 0,
      protein: 0,
      carbonwater: 0,
      skuList: [],
    }, // 已选择菜品购物车数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await this.init(options);
    const category = options.category,
      todayArr = day(this.data.orderDate).format('MM/DD').split('/') // 月日数组，如03/13 ['03', '13']
    this.setData({
      dayIndex: options.dayIndex, // 哪一天
      changeIndex: options.index, // 区分当天哪餐
      fromPage: options.fromPage || '',//来自于哪个页面 coachMeal 教练点餐
      heatPoint: this.orderDeliveryPage.data.heatPoint,
      category,
      dateTime: day(this.data.orderDate).format('MM月DD日'),
      confObj,
      title: `${Number(todayArr[0])}月${Number(todayArr[1])}日${this.data.cart[category]}`,
      navStatusHeight: wx.getStorageSync('navStatusHeight')
    }, () => {
      this.getPlanData()
    })
  },
  // 获取点餐日期及折扣信息等
  init: function (options) {
    new Promise(resolve => {
      const pages = getCurrentPages(),
        prePage = pages[pages.length - 2],
        { dateList, selectIndex } = prePage.data;
      // 教练点餐 带过来sku
      if(options.fromPage == 'coachMeal'){
        this.orderDeliveryPage = getCurrentPages().find(page => page.route === 'pages/packSubAccount/coachMeal/coachMeal');
        this.categorySkuList = prePage.data.healthyMenus[options.index].getCategoryList;
        this.subToken = this.orderDeliveryPage.data.subInfo.subToken || '';
      }else{
        this.orderDeliveryPage = getCurrentPages().find(page => page.route === 'pages/packageDiscover/aiMeal/orderDelivery/orderDelivery')
      }
      this.$prePage = prePage
      this.$discount = prePage.$discount
      this.setData({
        orderDate: dateList[selectIndex].raw,
      }, async () => {
        await this.clean()
        this.getSaleGoods(options.fromPage == 'coachMeal' ? this.categorySkuList : '')
        resolve()
      })
    })
  },

  clean(){
    return apiRequest.addShoppingCart({
      category: 'all',
      orderMethod: '01',
      dataStt: '99',
      version: '01',
      subToken: this.subToken || '',
    }).then(()=>{

    })
  },

  // 获取售卖商品
  getSaleGoods: function (categorySkuList) {
    // debugger
    const { moraddress, lunaddress, dinaddress, heatPoint, form: { selfTaking }, mealList } = this.orderDeliveryPage.data
    const { orderDate, category, fromPage } = this.data
    apiRequest
      .querySaleGoodsForThree({
        dateTime: orderDate,
        category: category,
        indexRules: 'intakeCategory',
        orderMethod: '01',
        addressId: fromPage == 'coachMeal' ? (category == '02' ? mealList[0].address.id : mealList[1].address.id) : selfTaking === '0' && category == '01' ? moraddress.id : selfTaking === '0' && category == '02' ? lunaddress.id : selfTaking === '0' && category == '03' ? dinaddress.id : '',
        hpid: fromPage == 'coachMeal' ? (category == '02' ? mealList[0].heatPoint.hpId : mealList[1].heatPoint.hpId) : heatPoint.id,
        version: '01',
        isLogin: true,
        subToken: this.subToken || '',
      })
      .then((res) => {
        let resultList = res.obj.resultList
        resultList = resultList.filter(
          (item) => item.skuCatalog !== '新人专享' && item.skuCatalog !== '推荐配餐'
        )
        resultList.forEach((item1, index1) => {
          item1.detailList &&
            item1.detailList.forEach((item2, index2) => {
              // 判断是否校验库存
              if (
                day(orderDate) <= day() ||
                (orderDate ==
                  day().add(1, 'day').format('YYYY/MM/DD') &&
                  day() >
                  day(
                    `${day().format('YYYY/MM/DD')} ${this.data.confObj.orderTimeLimit
                    }`
                  ))
              ) {
                item2.checkStock = true
              }
              if (Array.isArray(item2.dietaryIntakes)) {
                item2.dietaryIntakes = item2.dietaryIntakes.filter(
                  (label) => label.type === '02'
                )
              } else if (Array.isArray(item2.dietLabelList)) {
                item2.dietLabelList = item2.dietLabelList.filter(
                  (label) => label.type === '02'
                )
              }
              if (item2.type == '01') {
                item2.cid = item2.id
              }
            })
        })
        this.setData({
          goodsList: resultList,
          hideLoad: true
        })
        // 教练点餐 带sku数据过来
        if(categorySkuList){
          this.fillSku();
        }
      })
  },

  //回填sku数据
  async fillSku() {
    let {goodsList, allCart} = this.data;
    let categorySkuList = this.categorySkuList;
    let fat = 0, energy = 0, protein = 0, carbonwater = 0, tatolPrice = 0;
    let data = {
      fat: 0,
      energy: 0,
      protein: 0,
      carbonwater: 0
    };
    for(var i = 0; i < categorySkuList.length; i++){
     good: for(var j = 0; j < goodsList.length; j++){
        for(var k = 0; k < goodsList[j].detailList.length; k++){
          if(categorySkuList[i].cid == goodsList[j].detailList[k].cid){
            goodsList[j].detailList[k].num += categorySkuList[i].num;
            allCart.skuList.push({ ...goodsList[j].detailList[k] })
            break good
          }
        }
      }
    }

    if (allCart.skuList.length === 0) {
      allCart.tatolPrice = 0
    } else {
      allCart.skuList.forEach(item => {
        fat = round(fat + item.fat * item.num, 1)
        energy = round(energy + item.energy * item.num, 1)
        protein = round(protein + item.protein * item.num, 1)
        carbonwater = round(carbonwater + item.carbonwater * item.num, 1)
        tatolPrice = round(tatolPrice + item.price * item.num, 1)
        data = {
          fat,
          energy,
          protein,
          carbonwater,
          tatolPrice,
          priceAfterDiscount: round(tatolPrice * this.$discount, 2),
        }
      })
    }
    if(!this.data.plan){
      await this.getPlanData()
    }
    Object.assign(allCart, data, this.computePercent(data, this.data.plan))
    
    this.setData({
      goodsList,
      allCart
    })
  },

  selectKind: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      leftIndex: index,
      intoIndex: `scroll_${index}`
    })
  },
  // 增加(菜品列表)
  add: function (e) {
    let {
      wrapindex,
      index,
      combo,
      comboid,
      cid,
      type,
    } = e.currentTarget.dataset
    let { goodsList } = this.data
    type === 'add' ? goodsList[wrapindex].detailList[index].num++ : goodsList[wrapindex].detailList[index].num--
    this.setData({
      goodsList
    }, () => {
      // if (combo == '01') {
      //   this.comboSku =
      //     goodsList[wrapindex].detailList[index].setMealDateils
      //   // this.autoCombo()
      // } else {
      //   let autoNum = goodsList[wrapindex].detailList[index].num
      //   // 同步同一sku数量
      //   this.autoNum(autoNum, cid)
      // }
      this.freshCart(type, goodsList[wrapindex].detailList[index])
    })
  },
  addFromCart: function (e) {
    let {
      category,
      index,
      type,
      combo,
      cid,
    } = e.currentTarget.dataset
    let { goodsList } = this.data

    if (combo == '01') {
      this.comboSku =
        goodsList[wrapindex].detailList[index].setMealDateils
      // this.autoCombo()
    } else {
      goodsList.map((item, wrapIndex) => {
        item.detailList.map((subItem, subIndex) => {
          if (cid === subItem.cid) {
            type === 'add' ? subItem.num++ : subItem.num--
            this.freshCart(type, subItem)
          }
        })
      })
      this.setData({
        goodsList
      })
    }

    // type === 'add' ? allCart.skuList[index].num++ : allCart.skuList[index].num--
    // this.setData({
    //   allCart
    // }, () => {
    //   if (combo == '01') {
    //     this.comboSku =
    //       goodsList[wrapindex].detailList[index].setMealDateils
    //     this.autoCombo()
    //   } else {
    //     goodsList.map((item, wrapIndex) => {
    //       item.detailList.map((subItem, subIndex) => {
    //         if(allCart.skuList.length > 0 && allCart.skuList[index].cid === subItem.cid) {
    //           type === 'add' ? item.num++ : item.num--
    //           this.freshCart(type, goodsList[wrapIndex].detailList[subIndex])
    //         }
    //       })
    //     })
    //     this.setData({
    //       goodsList
    //     })
    //   }
    // })
  },
  // 同步同一sku数量
  autoNum: function (autoNum, cid) {
    let { goodsList } = this.data
    goodsList.forEach((item1, index1) => {
      item1.detailList.forEach((item2, index2) => {
        if (item2.cid == cid) {
          item2.num = autoNum
        }
      })
    })
    this.setData({
      goodsList
    })
  },

  // 同步套餐
  // autoCombo: function () { 
  //   let {comboSku, goodsList} = this.data
  //   for (var i = 0; i < comboSku.length; i++) {
  //     combo: for (var j = 0; j < goodsList.length; j++) {
  //       for (var h = 0; h < goodsList[j].detailList.length; h++) {
  //         if (
  //           comboSku[i].cid == goodsList[j].detailList[h].cid &&
  //           goodsList[j].detailList[h].type != '01'
  //         ) {
  //           goodsList[j].detailList[h].num += comboSku[i].num
  //           break combo
  //         }
  //       }
  //     }
  //   }
  //   this.goodsList = goodsList
  // },
  // 更新购物车
  freshCart: function (type, good) {
    const that = this
    let fat = 0, energy = 0, protein = 0, carbonwater = 0, tatolPrice = 0
    let { allCart } = this.data
    switch (type) {
      case 'add':
        let hasSame = false // 判定购物车是否已存在该菜品
        allCart.skuList.forEach(item => {
          if (item.cid === good.cid) {
            hasSame = true
            Object.assign(item, { ...good })
          }
        })
        if (!hasSame) {
          allCart.skuList.push({ ...good })
        }
        break
      default:
        const index = allCart.skuList.findIndex(item => item.cid === good.cid)
        if (allCart.skuList[index].num >= 1) {
          allCart.skuList[index].num--
        } else {
          allCart.skuList.splice(index, 1)
        }
        console.log('11');
        break
    }
    syncData()
      .then(res => {
        this.setData({
          allCart
        })
      })
    // 更新总价及摄入数据
    function syncData() {
      return new Promise(resolve => {
        console.log('22');
        let data = {
          fat: 0,
          energy: 0,
          protein: 0,
          carbonwater: 0
        }
        if (allCart.skuList.length === 0) {
          allCart.tatolPrice = 0
        } else {
          allCart.skuList.forEach(item => {
            fat = round(fat + item.fat * item.num, 1)
            energy = round(energy + item.energy * item.num, 1)
            protein = round(protein + item.protein * item.num, 1)
            carbonwater = round(carbonwater + item.carbonwater * item.num, 1)
            tatolPrice = round(tatolPrice + item.price * item.num, 1)
            data = {
              fat,
              energy,
              protein,
              carbonwater,
              tatolPrice,
              priceAfterDiscount: round(tatolPrice * that.$discount, 2),
            }
            // Object.assign(allCart, data, that.computePercent(data, that.data.plan))
          })
        }
        Object.assign(allCart, data, that.computePercent(data, that.data.plan))
        resolve()
      })
    }
  },
  changePlanMenu(params) {
    return apiRequest.changePlanMenu(params)
  },
  confirmChangeFn: function () {
    
    const { dayIndex, changeIndex, category, allCart, plan, cart, fromPage } = this.data,
      prePage = this.$prePage,
      { healthyMenus, dateList, dayMealIndex } = prePage.data,
      {mortime, luntime, dintime} = prePage,
      date = dateList[dayIndex].raw
    allCart.planDetail = plan
    allCart.categoryType = cart[category]
    const catIndex = fromPage == 'coachMeal' ? 0 : dayMealIndex[date][cart[category]]; //费教练点餐catIndex为随机， 教练点餐catIndex取0
    // allCart.getCategoryList = allCart.skuList
    allCart.list = JSON.parse(JSON.stringify(healthyMenus[changeIndex].list))
    allCart.list[catIndex].getCategoryList = []
    let tatolPrice = 0;
    allCart.skuList.forEach(item => {
      tatolPrice += item.num * item.price;
      for (var i = 0; i < item.num; i++) {
        allCart.list[catIndex].getCategoryList.push(item)
      }
    })
    allCart.list[catIndex].tatolPrice = round(tatolPrice,1);
    delete allCart.skuList
    allCart.getCategoryList = allCart.list[catIndex].getCategoryList
    allCart.mealTakingTime =cart[category] == '早餐' ? mortime :  cart[category] == '午餐' ? luntime : dintime

    // 已生成订单号的，换套餐要调用
    if (prePage.$totalOrderId) {
      changePlanMenu.call(this, {})
    } else {
      prePage.setData({
        [`healthyMenus[${changeIndex}]`]: allCart,
      })
      prePage.skuList[date][changeIndex].list[catIndex] = {
        categoryType: cart[category],
        getCategoryList: allCart.getCategoryList,
        tatolPrice: allCart.tatolPrice,
        mealTakingTime : cart[category] == '早餐' ? mortime :  cart[category] == '午餐' ? luntime : dintime
      }
    }
    // console.log(this.$prePage.skuList);
    // console.log(allCart);
    wx.navigateBack({
      delta: 1
    })
    // 已生成订单号的，换套餐要调用
    function changePlanMenu() {
      if (prePage.$totalOrderId) { // 有id 证明从支付页回退回来的
        let params = {
          totalOrderId: prePage.$totalOrderId, 
          skuList: {
            [date]: [{
              categoryType: allCart.categoryType,
              getCategoryList: allCart.getCategoryList.map(({ cid }) => cid),
              tatolPrice: allCart.tatolPrice,
              priceAfterDiscount: allCart.priceAfterDiscount,
              mealTakingTime : allCart.categoryType == '早餐' ? mortime :  allCart.categoryType == '午餐' ? luntime : dintime
            }]
          },
          cancelFlag: '0',
          subToken: this.subToken || '',
        }
        this.changePlanMenu(params)
          .then((res) => {
            if (res.errCode === 0) {
              prePage.setData({
                [`healthyMenus[${changeIndex}]`]: allCart,
                showChangeSkuDialog: false
              })
              prePage.skuList[date][changeIndex].list[catIndex] = {
                categoryType: cart[category],
                getCategoryList: allCart.getCategoryList,
                tatolPrice: allCart.tatolPrice,
                mealTakingTime : cart[category] == '早餐' ? mortime :  cart[category] == '午餐' ? luntime : dintime
              }
            }
          })
      }
    }
  },
  getPlanData() {
    new Promise(resolve => {
      const { changeIndex, category } = this.data
      let { healthyMenus } = this.$prePage.data,
        { planDetail: { carbohydrateTotal, totalKcal, proteinTotal, fatTotal, planName } } = healthyMenus[changeIndex]
      this.setData({
        plan: {
          fatTotal,
          totalKcal,
          proteinTotal,
          carbohydrateTotal,
          category,
          planName: this.$prePage.fromPage === 'onLineFat' ? this.$prePage.planName : planName
        }
      })
      resolve()
    })
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
  // 编辑购物车
  editCart: function () {
    this.setData({
      showCart: !this.data.showCart
    })
  },
  hideCart: function () {
    this.setData({
      showCart: false
    })
  },
  // 清空购物车
  clearCartFn: function (e) {
    let { allCart } = this.data
    allCart.tatolPrice = 0
    allCart.skuList = []
    Object.assign(allCart, {
      fat: 0,
      energy: 0,
      protein: 0,
      carbonwater: 0,
      energyDifference: 0,
      energyPercent: 0,
      proteinDifference: 0,
      proteinPercent: 0,
      fatDifference: 0,
      fatPercent: 0,
      carbonwaterDifference: 0,
      carbonwaterPercent: 0
    })
    this.setData({
      allCart,
      showCart: false
    }, () => {
      this.getSaleGoods()
      this.sureClear = false
      wx.showToast({
        title: '购物车已清空',
        icon: 'none'
      })
    })
  },
  scroll: throttle(100, function (e) {
    let that = this;
    let {
      isLogin,
      navStatusHeight
    } = that.data;
    let wrapTop = t(isLogin ? 410 : 454) + navStatusHeight;
    var query = wx.createSelectorQuery();
    query.selectAll('.wrap-box').boundingClientRect(function (rect) {
      let domList = rect;
      for (var i = 0; i < domList.length; i++) {
        if (domList[i].top <= wrapTop && domList[i + 1] && domList[i + 1].top > wrapTop) {
          that.setData({
            leftIndex: i
          })
          break
        } else if (domList[i].top <= wrapTop && i == domList.length - 1) {
          that.setData({
            leftIndex: i
          })
          break
        }
      }
    }).exec();
  }),
  calculat: function () {
    // 减去状态栏高度 减去上部高度
    let mobileInfo = this.mobileInfo ? this.mobileInfo : wx.getSystemInfoSync();
    let {
      px2rpx,
      isLogin,
      navStatusHeight
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - t(isLogin ? 410 : 454) - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mobileInfo = wx.getSystemInfoSync();
    this.calculat();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const loginInfo = getStorage('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
    this.setData({
      isLogin
    })
    if (this.mobileInfo) {
      this.calculat()
    }
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