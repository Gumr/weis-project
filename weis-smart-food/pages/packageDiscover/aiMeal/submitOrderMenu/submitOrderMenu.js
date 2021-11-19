// pages/solution/tenMeal/placeOrder/placeOrder.js
const app = getApp();

import requests from '../../../../service/index';
const util = require('../../../../utils/util');
import { round, genDispatchTag, tablewareList, filterTablewareSku, buyAndActiveCard, isDoubleEleven, toTimeRangeList } from '../../../../utils/common';
import day from '../../../../libs/day';
var location = require('../../../../libs/location');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    balance: 0, // 余额
    rechargeCardList: [], // 充值卡列表
    tablewareList,
    orderPrice: 0,
    actualPrice: 0,
    totalPrice: 0,
    discounts: 0, // 优惠价格
    hideColdOrders: true, // 冷配是否只显示1天的数据
    deliveryType: [
      {
        name: '外卖配送',
        selfTaking: '0',
      },
      {
        name: '到店自取',
        selfTaking: '1',
      },
    ],
    categoryArr: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
    },
    rechargeCard: null, // 选择的优惠券
    loading: true,
    orders: [],
    showPay: false,
    // hotFoodsRecords: [{}],
    distributionMode: {
      //00 01 每餐 每日 
      //00 01 02 03 热食配送 冷链配送 热食自取 冷链自取
      '00': {
        '00': '热链每餐达',
        '01': '冷链每餐达',
        '02': '热食每餐取',
        '03': '冷链每餐取',
      },
      '01': {
        '01': '冷链每日达',
        '03': '冷链日自取',
      }
    },
    payConfig: {
      balanceSupport: false,
      protocol: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.totalOrderId) {
      this.totalOrderId = options.totalOrderId;
      this.planType = options.planType;
      this.mainPlanId = options.mainPlanId;
      this.discount = options.discount;
      this.times = options.times;
    }
    this.fromPage = options.fromPage || '';
    if(this.fromPage == 'coachMeal'){
      this.coachMealPage = getCurrentPages().find(page => page.route === 'pages/packSubAccount/coachMeal/coachMeal');
      this.subToken = this.coachMealPage.data.subInfo.subToken || '';
    }
    this.checkLat()
    this.setData({
      planType: options.planType,
      fromPage: this.fromPage,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    this.setData({
      isDoubleEleven: isDoubleEleven()
    })
    if (this._beyondAddress) {
      this._beyondAddress = false;
      wx.showToast({
        title: '该收货地址超出餐餐热食配送范围,请选择冷链配送',
        icon: 'none',
      });
    }

    // 教练点餐 优惠券
    if (!Array.isArray(this.data.couponUserVos) && (this.fromPage == 'coachMeal' || this.fromPage == 'moreMeal')){
      await this.queryCoupon();
    }

    this.getSevenNoPayOrder().then(() => {
      this.setData({
        loading: false,
      });
    });
    this.checkBalance();
    this.getBuyCardForGoods();
    this.updateDiscountsOrActualPrice();
  },

  // 查询卡券
  queryCoupon: function () {
    var that = this;
    return requests.queryCouponList({
      stt: '01'
    }).then(res => {
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : [];
        couponUserVos.forEach((item, index) => {
          item.tcuAmount = Number(item.tcuAmount);
          item.tcuRestrictAmount = Number(item.tcuRestrictAmount)
        })
        that.setData({
          couponUserVos: couponUserVos
        })
      })
      .catch(error => {

      })
  },

  // 查询经纬度
  checkLat: function () {
    var that = this;
    if (!app.globalData.lat || app.globalData.lon) {
      location.getCity(function (res) {
        app.globalData.lat = res.latitude;
        app.globalData.lon = res.longitude;
      })
    }
  },
  rechargeCardTap(evt) {
    const { index, disabled } = evt.currentTarget.dataset
    if (disabled) return;
    const { rechargeCardList, rechargeCard } = this.data;
    const tapRechargeCard = rechargeCardList[index];

    this.setData({
      rechargeCard: tapRechargeCard.cardModelBean.id === (rechargeCard && rechargeCard.cardModelBean.id)
        ? null
        : tapRechargeCard
    }, () => {
      this.updateTotalPrice();
    })
  },
  updateTotalPrice() {
    const { actualPrice, rechargeCard } = this.data;
    this.setData({
      totalPrice: rechargeCard ? rechargeCard.cardModelBean.amount : actualPrice
    })
  },
  // 查询余额
  checkBalance: function () {
    var that = this;
    requests.detailsBalance({
      pageSize: 1,
      pageNo: 1
    })
      .then(res => {
        const balance = res.obj
          ? res.obj.totalBalance
          : 0
        that.setData({
          balance
        }, () => {
          this.updateRechargeCardList();
        })
      })
      .catch(error => {

      })
  },
  getBuyCardForGoods() {
    requests.getBuyCardForGoods().then((res) => {
      const cardList = res.errCode === 0 ? res.obj.cardList : [];
      this.setData({
        rechargeCardList: cardList.map((card) => {
          card.$present = card.totalAmount - card.cardModelBean.amount;
          return card;
        })
      }, () => {
        this.updateRechargeCardList();
      })
    })
  },
  updateRechargeCardList() {
    let { balance, actualPrice, rechargeCardList } = this.data;
    rechargeCardList = rechargeCardList.map((card) => {
      card.$disabled = actualPrice > (balance + card.totalAmount)
      return card
    })
    this.setData({
      rechargeCardList,
      rechargeCardDisabled: rechargeCardList.every(card => card.$disabled)
    })
  },
  viewColdOrdersTap() {
    this.setData({
      hideColdOrders: false,
    });
  },
  tablewareTap(evt) {
    let { orderIndex
      , mealIndex, checked, cid } = evt.currentTarget.dataset;
    checked = !checked;
    const order = this.data.orders[orderIndex]
    const meal = order.list[mealIndex]

    let cidList = meal.dietOrderDetails.map(({ cid }) => cid);
    cidList = checked
      ? cidList.concat(cid)
      : cidList.filter(id => id !== cid)

    this.changePlanMenu({
      cancelFlag: '1',
      hpid: order.hpid,
      planType: this.planType,
      dateTime: order.data,
      mainPlanId: this.mainPlanId,
      dateList: this.data.orders.map(({ data }) => data),
      selfTaking: order.distributionMode,
      shipTimes: order.tpscShipTimes,
      shipWithCold: order.tpscShipWithCold,
      totalOrderId: this.totalOrderId,
      skuList: {
        [order.data]: [{
          categoryType: meal._categoryText,
          getCategoryList: cidList
        }]
      },
      subToken: this.subToken || '',
    }).then((res) => {
      if (res.errCode === 0) {
        this.getSevenNoPayOrder();
      }
    })
  },
  changePlanMenu(params) {
    return requests.changePlanMenu(params)
  },
  getSevenNoPayOrder() {
    return requests
      .getSevenNoPayOrder({
        planType: this.planType,
        totalOrderId: this.totalOrderId,
        times: this.times,
        // 字段更改
        flag: true,
        subToken: this.subToken || '',
      })
      .then((res) => {
        if (res.errCode === 0) {
          const list = res.obj.dietOrderTransferReposeList;
          let mealNum = 0;
          this.setData(
            {
              orders: list.map((item) => {
                item._date = day(item.data).format('M月D日');
                const first = item.list[0];
                item.timeChangeable = true;
                // item.timeChangeable = first.shipTime != '01' // 每日一次

                item.receivingAddress = first.receivingAddress; // 把三个字段往外一层
                item.consignee = first.consignee; // 把三个字段往外一层
                item.contactNumber = first.contactNumber; // 把三个字段往外一层
                item.distributionMode = first.distributionMode;
                item.mealTakingTime = first.mealTakingTime;
                item._dispatchTag = genDispatchTag(item.tpscShipWithCold, item.tpscShipTimes, item.distributionMode)
                item.list = item.list.map((meal) => {
                  meal._date = day(meal.date).format('M月D日');
                  meal._categoryText = {
                    '01': '早餐',
                    '02': '午餐',
                    '03': '晚餐',
                  }[meal.category];
                  meal.$dietOrderDetails = filterTablewareSku(meal.dietOrderDetails);
                  mealNum++
                  return meal;
                });

                return item;
              }),
              tablewarePrice: res.obj.tablewarePrice,
              tablewareSum: res.obj.tablewareSum,
              // shipWithCold: this._shipWithCold,
              totalPriceSum: res.obj.totalPriceSum, //总价
              shipDeliveryFee: res.obj.shipDeliveryFee, //原配送费
              discountsDeliveryFee: res.obj.discountsDeliveryFee, //补贴配送费
              currDiscount: round(res.obj.currDiscount, 2), // 折扣价格
              mealNum,
              totalPackageNum: res.obj.totalPackageNum,// 包装袋数量
              totalPackageFee: res.obj.totalPackageFee,// 包装袋价格
              // 字段更改
              actualPriceSum: res.obj.actualPriceSum,// 实际付款
              afterDiscountPrice: res.obj.actualPriceSum,// 折扣后金额
              currTotalDiscount: res.obj.currTotalDiscount,// 已优惠
              advanceRewards: res.obj.advanceRewards || 0,//预订奖励金
            }
          );
          this.updateDiscountsOrActualPrice();
          if(this.fromPage == 'coachMeal' || this.fromPage == 'moreMeal'){
            this.checkCoupon();
          }
        }
      });
  },
  updateDiscountsOrActualPrice() {
    const { data } = this;
    const orderPrice = round(data.totalPriceSum + data.tablewarePrice - data.currDiscount - data.discountsDeliveryFee, 2); // 总计金额-折扣-补贴配送费=订单金额
    // let actualPrice = round(orderPrice + data.shipDeliveryFee, 2); // 订单金额 + 配送费 = 实付
    let actualPrice = round(orderPrice + data.shipDeliveryFee + data.totalPackageFee, 2); // 订单金额 + 配送费 + 保温袋 = 实付

    let discounts = (data.currDiscount || 0) + data.discountsDeliveryFee;

    this.setData({
      discounts: round(discounts, 2),
      actualPrice,
      orderPrice
    }, () => {
      this.updateRechargeCardList();
      this.updateTotalPrice();
    });
  },

  // 卡券使用
  checkCoupon: function () {
    let {
      afterDiscountPrice,
      shipDeliveryFee,
      couponUserVos,
      orders
    } = this.data;
    let couponLimitPrice = afterDiscountPrice - shipDeliveryFee;//优惠券使用门槛 扣除运费
    this.goodsIdArr = [];
    let canUseCoupon = [];
    let currentDate = new Date().getTime();
    orders.forEach((item1,index1)=>{
      item1.list.forEach((item2,index2)=>{
        item2.dietOrderDetails.forEach((item3,index3)=>{
          if(this.goodsIdArr.indexOf(item3.cid) == -1){
            this.goodsIdArr.push(item3.cid)
          }
        })
      })
    })
    // 筛选出可使用的卡券
    couponUserVos.forEach((item,index)=>{
      if (item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime && couponLimitPrice >= Number(item.tcuRestrictAmount) && couponLimitPrice > Number(item.tcuAmount)) {
        if(item.tcuUseType == '00'){
          // 普通券
          if(item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01')){
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
              if(item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01')){
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
    console.log(this.data.coupon)
    const actualPriceSum = round(Number(afterDiscountPrice) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0), 2);
    
    this.setData({
      actualPriceSum,
      useCouponNum
    })
  },

  toCoupon: function () {
    let {afterDiscountPrice, shipDeliveryFee} = this.data;
    let couponLimitPrice = afterDiscountPrice - shipDeliveryFee; //优惠券使用门槛 扣除运费
    wx.navigateTo({
      url: `/pages/mineBox/coupon-valid/coupon-valid?from=coupon&price=${couponLimitPrice}&existReserve=true`,
    });
  },

  rechargeTap() {
    wx.navigateTo({
      url: `/pages/mineBox/balance/balance?source=packages`,
    });
  },
  pay(payType) {
    // 字段更改
    // const { orders, actualPrice } = this.data,
    const { orders, actualPriceSum } = this.data,
      { fromPage } = this
    function pay(payWay) {
      const wayBillForms = orders.map((order) => {
        const form = {};
        form.dateTime = order.data;
        form.mealTakingTime = order.mealTakingTime;
        form.shipWithCold = order.tpscShipWithCold
        form.distributionMode = order.distributionMode;
        form.deliveryFrequency = order.tpscShipTimes;
        form.contactNumber = order.receivingAddress;
        form.hpId = order.heatingPoint.id;
        form.addressId = order.addressId;
        form.address = order.receivingAddress
        form.consignee = order.consignee
        form.lat = order.lat;
        form.lon = order.lon;
        form.transferForms = order.list.map(meal => {
          const tsfForm = {};
          tsfForm.tdotDate = meal.date;
          tsfForm.mealTakingTime = meal.mealTakingTime;
          tsfForm.category = meal.category;
          tsfForm.detailForms = meal.dietOrderDetails.map(sku => {
            const dtForm = {};
            dtForm.tdodCid = sku.cid;
            dtForm.tdodNum = sku.num;
            // dtForm.tdodType = '01';
            return dtForm;
          })
          return tsfForm;
        })

        return form;
      });
      const fromArr = ['multiMeal', 'netRedPlan', 'customPlan']
      const postData = {
        // planType: that.planType,
        // orderMethod: '01', // 点餐方式
        isDrawBill: '0', // 是否需要支票
        // activityId: '',
        aiPlanId: fromArr.findIndex(item => item === fromPage) == -1 ? this.mainPlanId : '',
        couponId: 0,
        couponAmount: 0,
        // 字段更改
        // payAmount: actualPrice,
        payAmount: actualPriceSum,
        payWay, // 支付渠道
        payChannel: 'mina', // 支付渠道
        activityType: this.planType || '01',
        wayBillForms,
        subToken: this.subToken || '',
        couponAmount: this.data.coupon && this.data.coupon.tcuAmount || 0,
        couponId: this.data.coupon && this.data.coupon.tcuId || 0,
        // totalOrderId: that.totalOrderId, //订单id
      }
      if (fromPage === 'netRedPlan' || fromPage === 'customPlan') postData.planType = this.planType
      return requests.makeOrder(postData)
    }


    return pay.call(this, payType)
      .then((res) => {
        if (res.errCode !== 0) {
          wx.showToast({
            icon: 'none',
            title: res.errMsg
          })
          return;
        }
        const { orderNumber } = res.obj;
        let playNunmber = res.obj.wayBillDTOList ? res.obj.wayBillDTOList[0].transferDTOList[0].orderId : null;
        let shareprice = (this.data.actualPriceSum - this.data.shipDeliveryFee).toFixed(2);
        // 字段更改
        // const navigateUrl = `/pages/packageOrder/payStatus/payStatus?status=true&mode=${this.planType === '05' ? 'slimmingCamp' : this.planType === '01' ? 'aiFat' : this.planType === '04' ? 'multiMeal' : 'sevenMeal'}&payPrice=${this.data.totalPrice}&discount=${this.discount}&orderId=${orderNumber}`
        const navigateUrl = `/pages/packageOrder/payStatus/payStatus?status=true&mode=${this.planType === '05' ? 'slimmingCamp' : this.planType === '01' ? 'aiFat' : this.planType === '04' ? 'multiMeal' :  this.planType === '06' || this.planType === '07' ? '' : 'sevenMeal'}&payPrice=${this.data.actualPriceSum}&discount=${this.discount}&orderId=${orderNumber}&playNunmber=${playNunmber}&shareprice=${shareprice}&existReserve=true`

        switch (payType) {
          case 'wechat':
            requests.payment(res.obj).then((data) => {
              switch (data.errMsg) {
                case 'requestPayment:fail cancel':
                  if (this.fromPage == 'onLineFat') {
                    wx.redirectTo({
                      // 字段更改
                      // url: `/pages/packageDiscover/onLineFat/payStatus/payStatus?orderId=${orderNumber}&payPrice=${this.data.totalPrice}`
                      url: `/pages/packageDiscover/onLineFat/payStatus/payStatus?orderId=${orderNumber}&payPrice=${this.data.actualPriceSum}`
                    });
                  } else if (this.fromPage == 'multiMeal') {
                    wx.redirectTo({
                      // 字段更改
                      // url: `/pages/packageOrder/payStatus/payStatus?orderId=${orderNumber}&payPrice=${this.data.totalPrice}&mode=multiMeal`
                      url: `/pages/packageOrder/payStatus/payStatus?orderId=${orderNumber}&payPrice=${this.data.actualPriceSum}&mode=multiMeal`
                    })
                  } else {
                    wx.redirectTo({
                      url: `/pages/packageOrder/payStatus/payStatus?orderId=${orderNumber}&mode=${this.planType === '05' ? 'slimmingCamp' : this.planType === '01' ? 'aiFat' : this.planType === '04' ? 'multiMeal' : this.planType === '06' || this.planType === '07' ? '' :  'sevenMeal'}&payPrice=${this.data.actualPriceSum}&orderId=${orderNumber}&playNunmber=${playNunmber}&shareprice=${shareprice}&existReserve=true`
                    });
                  }
                  break;
                case 'requestPayment:ok':
                  app.globalData.gio('track', 'n_AIbuyuser', {
                    packageType: this.fromPage || '',
                    payType: 'wechat',
                    mealNum: this.data.mealNum,
                  })
                  // 订单微信支付成功后 通知后端
                  if(orderNumber){
                    requests.queryOrderPayStt({
                      orderNumber,
                      subToken: this.subToken || '',
                    })
                  }
                  // 清空套餐数据
                  this.clearUserPlanShoppingCart(this.totalOrderId);
                  if (this.fromPage == 'onLineFat') {
                    wx.redirectTo({
                      url: `/pages/packageDiscover/onLineFat/payStatus/payStatus?status=true&orderId=${orderNumber}`,
                    });
                  } else {
                    wx.reLaunch({
                      url: navigateUrl
                    });
                  }
                  break;
                case 'requestPayment:fail (detail message)':
                  wx.showToast({
                    title: '支付失败',
                    icon: 'none',
                  })
                  break;
              }
            });
            break;
          case 'balance':
            app.globalData.gio('track', 'n_AIbuyuser', {
              packageType: this.fromPage || '',
              payType: 'balance',
              mealNum: this.data.mealNum,
            })
            // 清空套餐数据
            this.clearUserPlanShoppingCart(this.totalOrderId);
            if (this.fromPage == 'onLineFat') {
              wx.redirectTo({
                url: `/pages/packageDiscover/onLineFat/payStatus/payStatus?status=true&orderId=${orderNumber}`,
              });
            } else {
              wx.reLaunch({
                url: navigateUrl
              });
            }
            break;
        }
      })
  },
  clearUserPlanShoppingCart(orderNumber) {
    requests.clearUserPlanShoppingCart({
      pSoid: orderNumber,
      subToken: this.subToken || '',
    })
  },
  payConfirm(evt) {
    const { type, done } = evt.detail;
    if (this.data.rechargeCard) {
      buyAndActiveCard(this.data.rechargeCard.cardModelBean.id)
        .then((res) => {
          return res.errCode === 0 ? this.pay('balance') : res;
        })
        .then(done, done);
    } else {
      this.pay(type)
        .then(done, done)
    }
  },

  changePs: function (e) {
    let { index, taking } = e.currentTarget.dataset;
    const item = this.data.orders[index];
    const that = this;

    if (taking == '1') {
      requests.heatingPointListForRange({
        userLat: app.globalData.lat,
        userLng: app.globalData.lon,
        hpId: item.hpid != 0 ? item.hpid : undefined,
        key: '4'
      })
        .then(res => {
          let heat = res.obj.dtos[0];
          if (heat.selfTaking == '0') {
            wx.showToast({
              title: '当前加热点不支持自取',
              icon: 'none',
            });
          } else {
            that.switchShipOrderAddressForSeven({
              item,
              selfTaking: taking, // 把配送方式切换 自取变配送 配送变自取
            }).then((res) => {
              if (res.errCode === 0) {
                that.getSevenNoPayOrder();
              }
            });
          }
        })
        .catch(error => {

        })
    } else {
      this.switchShipOrderAddressForSeven({
        item,
        selfTaking: taking, // 把配送方式切换 自取变配送 配送变自取
      }).then((res) => {
        if (res.errCode === 0) {
          this.getSevenNoPayOrder();
        }
      });
    }


    // let { date, category, addressId, hpid, mealTakingTime, phone } = that.data.hotFoodsRecords[index];
    // requests.changeFatOrderHotFoodRecord({
    //   params: [{
    //     fatPackId: that.saveId,
    //     dateTime: date,
    //     category: category,
    //     addressId: addressId,
    //     hpid: hpid,
    //     // mealTakingTime: mealTakingTime,
    //     selfTaking: taking,
    //     phone: phone,
    //   }]
    // })
    //   .then(res => {
    //     if (res.errCode == 0) {
    //       that.init()
    //     } else if (res.errCode == 1009) {
    //       wx.showToast({
    //         title: res.errMsg,
    //         icon: 'none',
    //         image: '',
    //         duration: 1500,
    //         mask: false,
    //       });
    //     }
    //   })
    //   .catch(error => {

    //   })
  },

  changeAddress(e) {
    let { index } = e.currentTarget.dataset;
    this.addressIndex = index;

    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=aiMeal&businessType=01`,
      success: ({ eventChannel }) => {
        eventChannel.once('beyond-address', () => {
          this._beyondAddress = true;
        });
      },
    });
  },
  viewGoodsTap(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.orders[index];

    wx.setStorageSync('showAllList', {
      date: '餐单详情',
      cateList: item.list.map((item) => {
        item._date = day(item.date).format('MM月DD日');
        item.detailMapList = item.dietOrderDetails;
        return item;
      }),
    });

    wx.navigateTo({
      url: '/pages/packageOrder/showCateList/showCateList?mode=ai',
    });
  },
  updateAddress(addressId) {
    const item = this.data.orders[this.addressIndex];

    return this.switchShipOrderAddressForSeven({
      addressId,
      item,
    }).then((res) => {
      if (res.errCode === 0) {
        this.getSevenNoPayOrder();
      }
      return res;
    });
  },
  switchShipOrderAddressForSeven({
    mealTakingTime,
    selfTaking, // 自取配送
    addressId, // 收货地址id
    item,
  }) {
    const itemData = item.list[0];
    const params = {
      shipWithCold: itemData.shipWithCold,
      shipOid: itemData.shipOid,
      dateTime: itemData.date,
      category: itemData.category,
      followUpStt: '00',
      mealTakingTime: itemData.mealTakingTime,
      subToken: this.subToken || '',
    };
    params.mealTakingTime = mealTakingTime || '0';
    params.addressId = addressId || 0;
    params.selfTaking = selfTaking || itemData.distributionMode;

    return requests.switchShipOrderAddressForSeven(params);
  },

  changeTime(e) {
    var that = this;
    let { index, disabled } = e.currentTarget.dataset;
    if (disabled) return;
    let { data: date, category, heatingPoint, distributionMode, mealTakingTime } = that.data.orders[index];
    const hpid = heatingPoint.id;
    that.timeIndex = index;
    console.log(distributionMode, 'distributionMode')
    requests
      .queryHeatingPointConf({
        hId: hpid,
        category: category,
        dataStt: '00',
        orderMethod: '01',
        selfTaking: distributionMode,
        dateTime: date,
      })
      .then((res) => {
        if (distributionMode == '0') {
          // let mt = util.dateUtil.format(new Date(), 'Y/M/D');
          // let start = mt + ' ' + res.obj.supplyConf.stime.substring(0, 2) + ':' + res.obj.supplyConf.stime.substring(2, 4);
          // let end = mt + ' ' + res.obj.supplyConf.etime.substring(0, 2) + ':' + res.obj.supplyConf.etime.substring(2, 4);
          const timeList = res.obj.selfTakingTimes;
          this.setData(
            {
              timeList,
              shortTime: mealTakingTime || timeList[0],
              timeSelectTitle: '预计到达时间',
            },
            () => {
              this.setData({
                showMealTakingTime: true,
              });
            }
          );
        } else {
          const timeList = res.obj.selfTakingTimes;
          this.setData(
            {
              timeList,
              shortTime: mealTakingTime || timeList[0],
              timeSelectTitle: '预计取餐时间',
            },
            () => {
              this.setData({
                showMealTakingTime: true,
              });
            }
          );
        }
      })
      .catch((error) => { });
  },

  selectTime: function (e) {
    this.setData({
      shortTime: e.currentTarget.dataset.time,
    });
  },

  sureTime: function () {
    var that = this;
    let index = that.timeIndex;
    this.switchShipOrderAddressForSeven({
      mealTakingTime: this.data.shortTime,
      item: that.data.orders[index]
    })
      .then((res) => {
        if (res.errCode != 0) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return;
        }
        that.setData({
          showMealTakingTime: false,
        });
        that.getSevenNoPayOrder();
      })
  },

  cancelTime: function () {
    this.setData({
      showMealTakingTime: false,
    });
  },

  blurPhone: function (e) {
    var that = this;
    let { index } = e.currentTarget.dataset;
    let { date, category, addressId, hpid, mealTakingTime, selfTaking } = that.data.hotFoodsRecords[index];
    if (e.detail.value.length < 11) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: true,
      });
      that.init();
      return;
    }

    requests
      .changeFatOrderHotFoodRecord({
        fatPackId: that.saveId,
        dateTime: date,
        category: category,
        addressId: addressId,
        hpid: hpid,
        mealTakingTime: mealTakingTime,
        selfTaking: selfTaking,
        phone: e.detail.value,
        subToken: this.subToken || '',
      })
      .then((res) => {
        if (res.errCode == 0) {
          let hotFoodsRecords = that.data.hotFoodsRecords;
          hotFoodsRecords[index].phone = e.detail.value;
          that.setData({
            hotFoodsRecords,
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch((error) => { });
  },

  submit() {
    const hasAddress = this.data.orders
      .filter(item => item.distributionMode == '0')
      .every(item => Boolean(item.receivingAddress));

    const tomorrowStr = day().add(1, 'day').format('YYYYMMDD');
    // item.data YYYYMMDD格式的字符串
    const hasTomorrow = this.data.orders.some(item => item.data === tomorrowStr);
    if (hasTomorrow && day().get('hour') >= 18) { // 有明天的订单 且当前时间大于18点 则提示无法支付
      wx.showToast({
        title: '18点以后不能订购明天的餐',
        icon: 'none'
      })
      return;
    }

    if (!hasAddress) {
      wx.showToast({
        title: '请选择送餐地址',
        icon: 'none'
      })
      return;
    }
    if (this.data.rechargeCard) {
      this.setData({
        showPay: true,
        payConfig: {
          balanceSupport: false,
          protocol: true
        }
      })
    } else {
      this.setData({
        payConfig: {
          balanceSupport: true,
          protocol: false
        }
      }, () => {
        // 字段更改
        // this.selectComponent('#pay').pay(this.data.actualPrice);
        this.selectComponent('#pay').pay(this.data.actualPriceSum);
      })
    }
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
  onShareAppMessage: function () { },
});
