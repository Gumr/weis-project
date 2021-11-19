// pages/packSubAccount/member/member.js
import {
  setStorage,
  getStorage,
} from '../../../utils/storage'
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  round,
  isLoginClick,
  loginPromise,
} from '../../../utils/common'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
    lat: app.globalData.lat,
    lon: app.globalData.lon,
    // lat: app.globalData.lat || 22.53332,
    // lon: app.globalData.lon || 113.93041,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const loginInfo = getStorage('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
    this.setData({
      isLogin,
    })
    this.matchHpid(this.data.lat, this.data.lon, 0)
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
  
  // 匹配加热点
  matchHpid(lat, lon, address) {
    return apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      showAll: false,
      showScope: false,
      showInfo: true,
      key: 'match',
      userAddr: address
    }).then((res) => {
      this.setData({
        matchHpid: res.obj.dtos[0],
      })
      this.getMenu()
    })
  },
  // 获取菜品列表
  getMenu: function (type) {
    let {
      isLogin,
      matchHpid,
    } = this.data;
    apiRequest.getGenerateSingleMeal({
      indexRules: 'intakeCategory',
      orderMethod: '01',
      hpid: matchHpid.hpid || 100000,
      version: "01",
      isLogin: isLogin,
      refreshStt: false,
      shopType: '10',
      })
      .then(res => {
        let couponUserVos = res.obj.couponUserVos || [];
        let dietSetMeals = res.obj.dietSetMeals || [];
        // 优惠券
        couponUserVos.forEach((item, index) => {
          item.tcuAmount = Number(item.tcuAmount);
          item.tcuRestrictAmount = Number(item.tcuRestrictAmount)
          item.num = 1
        })
        this.setData({
          couponUserVos,
        })
        
        // 套餐
        dietSetMeals.forEach(item => {
          item.packageForm = item.setMealDateils.map(main => main.name).join('+')
          item.select = false
          item.discountPrice = this.checkCoupon(item)
        })
        this.setData({
          dietSetMeals: dietSetMeals.length >0 && dietSetMeals.sort((a,b)=>{ return a.discountPrice-b.discountPrice}) || []
        })
        if(this.data.dietSetMeals.length == 0){
          this.toIndex();
        }
      })
      .catch(error => {

      })
  },
  // 筛选能使用的卡券
  checkCoupon (order) {
    this.setData({
      coupon: ''
    })
    let { couponUserVos, } = this.data;
    this.goodsIdArr = [];
    let canUseCoupon = [];
    let currentDate = new Date(day(order.date).format('YYYY-MM-DD')).getTime();
    let afterDiscountPrice = order.price;
    let existReserve = currentDate != new Date().getTime()
    order.setMealDateils.forEach(item => {
      this.goodsIdArr.push(item.cid)
    })
    // --以下没动--
    // 筛选出可使用的卡券
    couponUserVos.forEach((item,index)=>{
      if (item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime && afterDiscountPrice >= Number(item.tcuRestrictAmount) && afterDiscountPrice > Number(item.tcuAmount)) {
        if(item.tcuUseType == '00'){
          // 普通券
          if(item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01' && this.existReserve)){
            // 非预定券 || （预定券 && 存在预定日期）
            canUseCoupon.push(item)
          }
        }else if(item.tcuUseType == '02'){
          // 菜品券
          let skuArr = item.couponSys.map((v) => {
            return v.skuCid
          })
          for(var i = 0; i < skuArr.length; i++){
            if(this.goodsIdArr.indexOf(skuArr[i]) >= 0){
              if(item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01' && this.existReserve)){
                // 非预定券 || （预定券 && 存在预定日期）
                canUseCoupon.push(item);
                break;
              }
            }
          }
        }   
      }
    })

    let useCouponNum = canUseCoupon.length;
    
    let canUseId = canUseCoupon.map((v) => {
      return v.tcuId
    });

    if (this.data.coupon) {
      if (canUseId.indexOf(this.data.coupon.tcuId) == -1) {
        this.setData({
          coupon: ''
        })
      }
    } else {
      // 筛选出最大卡券值
      let maxCoupon = Math.max.apply(Math, canUseCoupon.map(function (o) {
        return o.tcuAmount
      }));
      let index = canUseCoupon.map(item => item.tcuAmount).indexOf(maxCoupon)
      this.setData({
        coupon: canUseCoupon.length > 0 ? canUseCoupon[index] : ''
      })
    }

    const payPrice = round(Number(order.price) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0), 2);
    return payPrice
  },
  // 菜品-增/减（已过）
  add: isLoginClick(function (e) {
    let { item } = e.currentTarget.dataset;
    let { matchHpid } = this.data;
    apiRequest.addShoppingCart({
        cid: item.id,
        dateTime: item.date,
        category: item.category,
        orderMethod: '01',
        num: 1,
        selfTaking: 0,
        addressId: 0,
        hpid: matchHpid.hpid || 100000,
        type: '01',
        version: '01',
        comboId: 0,
        shipType: '00',
        shopType: '10',
      })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        // 跳转点餐页
        setStorage('showRecommendCart', true)
        setStorage('planMealDate', {
          date: item.date,
          category: item.category,
        })
        wx.switchTab({
          url: '/pages/index/index',
        });
      })
      .catch(error => {

      })

  }),
  // 跳过
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  // 优惠套餐
  skuTap(e) {
    let { index } = e.currentTarget.dataset;
    let { dietSetMeals } = this.data;
    dietSetMeals[index].select = !dietSetMeals[index].select
    this.setData({
      dietSetMeals
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