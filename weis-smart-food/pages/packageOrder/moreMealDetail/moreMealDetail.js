// pages/packageOrder/moreMealDetail/moreMealDetail.js
import {
  getStorage,
} from '../../../utils/storage'
import apiRequest from '../../../service/index';
import day from '../../../libs/day';
import {
  round,
} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disableDate: null,
    showDate: true,
    selectIndex: 0,
    categoryMap: {
      '午餐': '02',
      '晚餐': '03',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const navStatusHeight = getStorage('navStatusHeight');
    this.setData({
      navStatusHeight,
      tmfcId: options.id
    })
    await this.queryAllMuchFoodConfig();
    this.init();
  },

  init() {
    const dateList = [];
    const addDay = day().get('hour') >= 18 ? 2 : 1;
    const startDay = day().add(addDay, 'day').format('YYYY/MM/DD');
    for (var i = 0; i < this.data.dataInfo.tmfcDayNum; i++) {
      dateList.push(day(startDay).add(i, 'day').format('YYYY/MM/DD'))
    }
    this.setData({
      disableDate: (d) => {
        return d < new Date(startDay) || d > new Date(day().add(30, 'day').format('YYYY/MM/DD'))
      },
      dateList,
    })
    setTimeout(() => {
      const calendarComp = this.selectComponent('#calendar');
      calendarComp.clear();
      calendarComp.selectDate(this.data.dateList);
      if (day(this.data.dateList[0]).get('month') == calendarComp.data.month) {
        // 默认选中在下月 日历跳转下月
        calendarComp.next();
      }
    },500)
  },

  queryAllMuchFoodConfig() {
    return apiRequest.queryAllMuchFoodConfig({

    }).then((res) => {
      const muchFoodConfigBeans = res.obj && res.obj.muchFoodConfigBeans || [];
      const info = muchFoodConfigBeans.filter((item) => {
        return item.tmfcId == this.data.tmfcId
      })
      this.setData({
        dataInfo: info[0]
      })
    })
  },

  handleCalendarSelect(e) {
    const dateList = e.detail.sort(function (a, b) {
      return day(a) - day(b)
    });
    this.setData({
      dateList,
    })
  },
  closeFn() {
    this.setData({
      showDate: false
    }, () => {
      wx.navigateBack()
    })
  },
  sure() {
    const {
      dateList,
      dataInfo: {
        tmfcDayNum,
        tmfcMealNum
      }
    } = this.data;
    const dateArr = [];
    if (!dateList || (dateList.length < tmfcDayNum)) {
      wx.showToast({
        title: `所选天数错误，需选择${tmfcDayNum}天`,
        icon: 'none'
      });
      return
    }
    this.setData({
      showDate: false
    })
    dateList.forEach((item, index) => {
      const obj = {
        date: day(item).format('YYYYMMDD'),
        meal: tmfcMealNum == 2 ? ['02', '03'] : ['02']
      }
      dateArr.push(obj)
    })
    this.setData({
      dateList: dateArr
    })
    this.queryMuchFoodList();
  },

  select(e) {
    let index = e.currentTarget.dataset.index;
    let selectIndex = this.data.selectIndex;
    if (index == selectIndex) {
      return
    }
    this.setData({
      selectIndex: index
    })
  },

  queryMuchFoodList() {
    const dateList = this.data.dateList;
    apiRequest.queryMuchFoodList({
      dateList: dateList,
      hpid: 100000,
      planType: '04',
    }).then((res) => {
      let obj = res.obj;
      let skuList = [];
      Object.keys(obj.skuList).forEach((key) => {
        let list = obj.skuList[key];
        list.forEach((item, index) => {
          item.list = item.list[0];
          item.circleData = this.getCircleData(item.list.getCategoryList, item.planDetail);
          item.num = item.list.getCategoryList.reduce((num, item) => {
            num += item.num
            return num;
          }, 0);
        })
        skuList.push({
          date: day(key).format('MM月DD日'),
          list,
        })
      })
      let dataObj = {
        countPrice: obj.countPrice,
        totalAmount: obj.totalAmount,
        skuList: skuList,
      };
      this.setData({
        dataObj
      })
    })
  },

  getCircleData(listCategory, planDetail) {
    const circleData = listCategory.reduce((result, item) => {
      result.energySupply = round(result.energySupply + item.energy * item.num, 1)
      result.carbonwaterSupply = round(result.carbonwaterSupply + item.carbonwater * item.num, 1)
      result.proteinSupply = round(result.proteinSupply + item.protein * item.num, 1)
      result.fatSupply = round(result.fatSupply + item.fat * item.num, 1)
      return result;
    }, {
      energySupply: 0, // 能量
      carbonwaterSupply: 0, // 碳水
      proteinSupply: 0, // 蛋白质
      fatSupply: 0, // 脂肪
    });
    circleData.totalEnergy = planDetail.totalKcal;
    circleData.totalCarbonwater = planDetail.carbohydrateTotal;
    circleData.totalProtein = planDetail.proteinTotal;
    circleData.totalFat = planDetail.fatTotal;
    return circleData
  },

  // 换套餐
  changeMeal(e) {
    console.log(e)
    let {
      selectIndex,
      dateList,
      categoryMap
    } = this.data;
    let {
      cateIndex,
      category,
      type
    } = e.currentTarget.dataset;
    this.setData({
      cateIndex,
    })
    if (type == '00') {
      // 单品
      wx.navigateTo({
        url: `/pages/packageOrder/replaceSku/replaceSku?date=${dateList[selectIndex].date}&category=${categoryMap[category]}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/packageOrder/replaceMeal/replaceMeal?date=${dateList[selectIndex].date}&category=${categoryMap[category]}`,
      });
    }
  },

  // 更换sku 套餐
  changeSku(allSku, totalNum, countPrice, totalAmount) {
    let {
      selectIndex,
      cateIndex,
      dataObj
    } = this.data;
    let filterAllSku = [];
    allSku.forEach((item1,index1)=>{
      for(var i = 0; i < item1.num; i++){
        let obj = {...item1};
        obj.num = 1;
        filterAllSku.push(obj);
      }
    })
    let skuObj = dataObj.skuList[selectIndex].list[cateIndex];
    skuObj.list.getCategoryList = filterAllSku;
    skuObj.num = totalNum;
    skuObj.list.tatolPrice = totalAmount;
    skuObj.list.discountPrice = countPrice;
    skuObj.circleData = this.getCircleData(skuObj.list.getCategoryList, skuObj.planDetail);
    this.setData({
      dataObj
    })
    // 计算总价格
    this.getMuchFoodTotalPrice();
  },

  getMuchFoodTotalPrice() {
    let {
      dateList,
      categoryMap,
      dataObj
    } = this.data;
    let skuList = dataObj.skuList;
    let cateringShoppingCart = [];
    skuList.forEach((item1, index1) => {
      item1.list.forEach((item2) => {
        item2.list.getCategoryList.forEach((item3) => {
          let obj = {
            cid: item3.cid,
            num: item3.num,
            date: dateList[index1].date,
            category: categoryMap[item2.categoryType],
          }
          cateringShoppingCart.push(obj)
        })
      })
    })
    apiRequest.getMuchFoodTotalPrice({
      cateringShoppingCart,
    }).then((res) => {
      dataObj.countPrice = res.obj.countPrice;
      dataObj.totalAmount = res.obj.totalAmount;
      this.setData({
        dataObj,
      })
    })
  },

  // 已选好菜品
  buy() {
    wx.navigateTo({
      url: '/pages/packageOrder/setMoreMealAddress/setMoreMealAddress',
    });
  },

  update() {
    let dateList = this.data.dateList;
    this.setData({
      showDate: true,
      dateList: dateList.map(({
        date
      }) => day(date).format('YYYY/MM/DD'))
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