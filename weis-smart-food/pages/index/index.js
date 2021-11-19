// pages/index/index.js
import {
  isLoginClick,
  loginPromise,
  t,
  confObj,
  round,
  judgeSubAccount,
  showDialog,
  saveUseLog,
} from '../../utils/common'
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../utils/storage'
const location = require('../../libs/location.js');
import apiRequest from '../../service/index';
import {
  debounce,
  throttle
} from '../../utils/throttle';
import day from '../../libs/day'
import {
  categoryMap,
  mealType
} from '../../utils/map'
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/signin/',
    showBookDialog: '', //预订送券
    showShre: false, //分享返利
    time: '',
    timeData: {},
    tcuEtime: null,
    px2rpx: app.globalData.px2rpx,
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
    leftIndex: 0, //默认选中种类
    cart: categoryMap,
    mealText: {
      '01': '早',
      '02': '午',
      '03': '晚',
    },
    mealIndex: 0,
    recomIndex: 0,
    list: [],
    showStopDialog: false,
    currentSlideshow: 0,
    dialData: {
      totalCarbonwater: 1, //计划碳水
      carbonwaterSupply: 0, //实际碳水
      totalProtein: 1, //计划蛋白质
      proteinSupply: 0, //实际蛋白质
      totalFat: 1, //计划脂肪
      fatSupply: 0, //实际脂肪
      totalEnergy: 1, //计划能量
      energySupply: 0, //实际能量
      totalSalt: 0, //计划盐量
      saltSupply: 0, //实际盐量
      foodTypeNum: 0, //食物多样性
      totalDiversity: 0, //计划食物多样性
      totalFiber: 0, //膳食纤维
      fiberSupply: 0, //实际膳食纤维
      nutritionHealthScore: 0, //健康分
    },
    // 拼单类型
    spellTypeList: [{
        img: 'https://prodstatic.weis1606.cn/api/smartFood/order_address.png',
        name: '同一地址，同一时间配送',
        tip: '免配送费'
      },
      {
        img: 'https://prodstatic.weis1606.cn/api/smartFood/order_discount.png',
        name: '发起折扣组，不需同地址同时间',
        tip: '越多人参与折扣组，返现越多'
      },
    ],
    // 套餐推荐 单品自选
    tab: [{
        name: '套餐推荐'
      },
      {
        name: '单品自选'
      },
      {
        name: '多餐优惠'
      },
    ],
    tabIndex: 0,
    pageNo: -1,
    more: true,
    recomMealList: [],
    // theme: 'pillars',
    scrollRecomTop: 0,
    requestComplete: true,
    mealType,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 更换仪表盘引导显示
    this.leadPanShow();
    if (options.invite) {
      app.globalData.inviteUid = options.invite;
    }
    loginPromise.then(async (res) => {
      console.table(res)
      const navStatusHeight = getStorage('navStatusHeight');
      this.setData({
        isIpx: app.globalData.isIpx,
        navStatusHeight,
        confObj,
        isNewUser: !(res.isAuthorized && res.isLogin && res.isPerProfile),
        isDouble11: options.isDouble11
      })
      if (options.tabIndex >= 0) {
        this.setData({
          tabIndex: options.tabIndex
        })
      } else if (confObj && confObj.homePageRevision == '02') {
        this.setData({
          tabIndex: 1
        })
      }

      // 双11红包
      // if (res.isLogin) {
      //   this.doubleElevenRedBag();
      // }

      // 注册流程的推荐套餐-加购-跳转点餐页后默认显示购物车弹窗
      const showRecommendCart = getStorage('showRecommendCart')
      if (showRecommendCart) {
        this.showRecommendCart = true; //显示购物车弹窗
      }
      removeStorage('showRecommendCart')

      const stopDialogShowed = getStorage('showDialogShowed')
      if (!stopDialogShowed) { // 春节期间不营业弹窗显示
        const today = Date.now()
        if ((day('2021-02-11').startOf('day').valueOf() <= today) && (today <= day('2021-02-18').endOf('day').valueOf())) {
          setStorage('showDialogShowed', true)
          this.setData({
            showStopDialog: true
          })
        }
      }
      this.getPokerData()
      this.queryReplaceRechargeLog();

      //分享送券
      setStorage('checkBook', true)
      // 扫描贩卖机二维码或门店二维码
      if (options.hpId) {
        // 查询当前位置
        await this.queryLocation()
        // 查询贩卖机详情
        await this.queryMachineInfo(options.hpId);
        this.cutShopCatHpid();
        this.queryDate();
        // 查询首页轮播图
        this.queryDietBanner();
        // 后台配置弹窗显示
        showDialog('02', this, options.hpId)
      } else {
        // 查询默认地址
        await this.queryAddress();
        if (this.defAddress) {
          // 查询地址匹配加热点
          await this.matchHpid(this.defAddress.lat, this.defAddress.lon, this.defAddress, );
          // 切换购物车商品到该加热点
          this.cutShopCatHpid(this.defAddress);
          //  查询时间
          this.queryDate(this.defAddress);
        } else {
          // 没默认地址 查询当前用户位置
          await this.queryLocation()
          // console.log(this.currentAddress)
          // 查询地址匹配加热点
          await this.matchHpid(this.currentAddress.location.lat, this.currentAddress.location.lng, this.currentAddress);
          this.cutShopCatHpid();
          this.queryDate(this.currentAddress);
        }
      }
      // 手动送券弹窗 短信链接渠道10276
      if (app.globalData.aldId == '10276') {
        this.queryCoupon('manual');
      }
      this.queryUserVipCouponMessage() // 维士会员状态
      this.queryAllMuchFoodConfig();
      this.bubble() //气泡
    })
    // 记录加载时间日志
    this.runTimeInfo = {
      path: this.route,
      starTime: new Date().valueOf(),
      desc: '首页加载时长'
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // let theme = 'pillars' || wx.getStorageSync('theme') || 'simple';
    // this.setData({
    //   theme, 
    // });
    loginPromise.then((res) => {
      // console.log(this.forbidloadShow)
      if (this.forbidloadShow) {
        this.forbidloadShow = false;
        return
      }

      const loginInfo = getStorage('loginInfo');
      const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
      this.setData({
        uid: res.uid,
        loginInfo,
        isLogin,
        showComponent: !(loginInfo.isAuthorized && loginInfo.isLogin),
        subToken: getStorage("subToken") || '',
        subInfo: getStorage('subInfo') || {},
      })
      this.mobileInfo ? this.calculat() : '';
      // 登录判断
      if (isLogin) {
        this.queryUserTarget();
        this.queryUserInfo();
        // 重新请求时间
        this.mobileInfo ? this.updatetime() : '';
        // 判断子账户是否有效
        judgeSubAccount(true).then((res) => {
          let subUserInfoList = res.obj.userSubUserInfos || [];
          let info = res.obj.userResult;
          this.setData({
            subUserInfoList,
            info
          })
        })
        // 查询最新未读
        app.checkUnread()
        app.checkUnread('vote')
      }
      // 从福利社点击“多餐优惠”跳转过来，默认选中“多餐优惠”
      const from = wx.getStorageSync('from');
      if (from == 'welfare') {
        this.setData({
          tabIndex: 2
        })
        wx.removeStorageSync('from')
      }
    })
  },

  // 选套餐推荐 单品自选
  tabType(e) {
    const index = e.currentTarget.dataset.index;
    const {
      tabIndex,
      recomList,
      list,
      recomIndex,
      mealIndex
    } = this.data;
    if (index == tabIndex) {
      return
    }
    wx.vibrateShort({});
    this.setData({
      tabIndex: index,
    })
    if (index == 1) {
      let idx = '';
      for (var i = 0; i < list.length; i++) {
        if (list[i].date == recomList[recomIndex].date && list[i].categoryType == recomList[recomIndex].categoryType) {
          console.log(i)
          idx = i;
          break;
        }
      }
      if (idx >= 0 && idx !== mealIndex) {
        this.setData({
          mealIndex: idx,
          leftIndex: 0,
          intoIndex: 'scroll_0',
        })
        this.getMenu()
      }
    }
    if (index == 0) {
      let idx = '';
      for (var i = 0; i < recomList.length; i++) {
        if (list[mealIndex].categoryType == '01' && recomList[i].date == list[mealIndex].date && recomList[i].categoryType == '02') {
          idx = i;
          break;
        } else if (list[mealIndex].categoryType != '01' && recomList[i].date == list[mealIndex].date && recomList[i].categoryType == list[mealIndex].categoryType) {
          idx = i;
          break;
        }
      }
      if (idx >= 0 && idx != recomIndex) {
        this.setData({
          recomIndex: idx,
        })
        this.initPageIndex();
        this.requestRecom()
      }
    }
    if (index == 2) {
      if (this.data.showBubble) {
        this.setData({
          showBubble: false,
        })
      }
      if (!this.data.muchFoodConfigBeans || this.data.muchFoodConfigBeans.length == 0) {
        this.queryAllMuchFoodConfig();
      }
    }
  },

  // 下拉刷新套餐推荐
  refresh() {
    setTimeout(() => {
      this.setData({
        triggered: false
      })
    }, 500)
    this.initPageIndex();
    this.requestRecom('', true)
  },

  queryAllMuchFoodConfig() {
    apiRequest.queryAllMuchFoodConfig({

    }).then((res) => {
      const muchFoodConfigBeans = res.obj && res.obj.muchFoodConfigBeans || [];
      this.setData({
        muchFoodConfigBeans,
        maxDiscount: res.obj && res.obj.maxDiscount || '',
        minDiscount: res.obj && res.obj.minDiscount || '',
      })
    })
  },

  // 去预定-明日的对应餐别
  reserve() {
    let {
      list,
      mealIndex
    } = this.data;
    let index = list.findIndex(item => day(item.date).format('YYYYMMDD') == day(list[mealIndex].date).add(1, 'day').format('YYYYMMDD') && item.categoryType == list[mealIndex].categoryType);
    if (index >= 0) {
      this.setData({
        mealIndex: index,
      })
    }
    this.getMenu()
  },
  // 获取翻牌返利数据
  getPokerData() {
    let cardList = wx.getStorageSync('cardList');
    if (cardList.type && cardList.type == 'sharePlay') {
      let couponInfo = cardList.couponInfo || {};
      couponInfo.tcuAmount = round(couponInfo.tcuAmount || 0, 0);
      couponInfo.tcuRestrictAmount = round(couponInfo.tcuRestrictAmount || 0, 0)
      this.setData({
        backimg: cardList.images,
        price: cardList.price,
        ctitle: cardList.ctitle,
        cbannerTitle: cardList.cbannerTitle,
        cdescription: cardList.cdescription,
        couponPrice: cardList.couponPrice,
        couponInfo,
        scoreImg: cardList.scoreImg,
      })
      this.queryCoupon()
      this.queryHealthScore()
      app.globalData.gio('track', 'n_Cardmoney', {
        n_Cardmoney: this.data.price,
      })
      setTimeout(() => {
        this.rotateFn()
        wx.removeStorageSync('cardList')
      }, 700)
    } else {
      // 查询卡券 可用卡券弹窗
      // this.queryCanUseCoupon()
    }
  },
  toHealthScore() {
    const oid = wx.getStorageSync('scoreOid')
    wx.removeStorageSync('scoreOid')
    wx.navigateTo({
      url: `/pages/packageOrder/healthScore/healthScore?page=index&oid=${oid}`
    })
  },
  // 换表盘引导
  leadPanShow() {
    let leadPanShow = wx.getStorageSync('leadPanShow');
    if (!leadPanShow && day() < day('2021/07/02')) {
      wx.setStorageSync('leadPanShow', true);
      this.setData({
        leadPanShow: true
      })
    }
  },

  loginCoupon(e) {
    this.setData({
      loginCoupon: e.detail
    })
  },

  hideLead() {
    this.setData({
      leadPanShow: false
    })
  },

  // 维士会员
  async queryUserVipCouponMessage() {
    apiRequest.queryUserVipCouponMessage({
        uid: this.data.uid
      })
      .then(res => {
        let obj = res.obj;
        setStorage('isVip', obj.joinVip)
      })
      .catch(error => {

      })
  },
  // 手动发券弹窗
  showCouponDialog(cpn) {
    let couponUserVos = cpn.filter((item) => {
      return item.tcuStt != '03' && new Date().getTime() <= item.tcuEtime //排除已使用 过期
    });
    // 显示过的卡券Id
    let showCouponIdArr = getStorage('showCouponIdArr') || [];
    // 只保留手动发券类型 && 没显示过卡券 sourceActivityType 01 手动发券
    couponUserVos = (couponUserVos.filter((item) => {
      return item.sourceActivityType == '01' && showCouponIdArr.indexOf(item.tcuId) == -1
    }))
    couponUserVos.forEach((item) => {
      item.tcuAmount = parseInt(item.tcuAmount);
      item.tcuEtime = day(Number(item.tcuEtime)).format('YYYY/MM/DD')
    })
    this.setData({
      manuallySendCoupon: couponUserVos
    })
    if (couponUserVos.length > 0) {
      setStorage('showCouponIdArr', showCouponIdArr.concat(couponUserVos.map((item) => {
        return item.tcuId
      })))
    }
  },

  close() {
    this.setData({
      manuallySendCoupon: [],
    })
  },

  queryDietBanner(hpidInfo) {
    let hpid = this.data.matchHpid && this.data.matchHpid.hpId || '';
    return apiRequest.queryDiscoverCarousel({
      type: '02',
      hpid: hpidInfo && hpidInfo.hpId || hpid,
    }).then((res) => {
      this.setData({
        dietBanners: res.obj && res.obj.discoverCarousels || []
      })
    })
  },

  slideshowTap(e) {
    const {
      url,
      type,
      id
    } = e.currentTarget.dataset;
    if (type == '01' || type == '02') {
      saveUseLog('01', id, '02');
    }
    if (type == '01') {
      wx.navigateTo({
        url,
        fail() {
          wx.switchTab({
            url
          })
        }
      })
    } else if (type == '02') {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${url}`,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then(() => {
      this.mobileInfo = wx.getSystemInfoSync();
      this.calculat();
    })
  },

  onHide: function () {
    // this.setData({
    //   disableUpdateRecom: true,
    // })
  },

  slideshowChange(evt) {
    this.setData({
      currentSlideshow: evt.detail.current
    })
  },

  queryUserInfo() {
    apiRequest.queryUserInfo({
      mainUid: this.data.subToken ? false : true
    }).then((res) => {
      if (res.obj.healthGoal.planningType == '04' && (res.obj.userProfile.appetite == 0 || res.obj.userProfile.bloodValue == 0)) {
        this.setData({
          showSugar: true
        })
      }
    })
  },
  // 双11红包领取弹窗（已过）
  doubleElevenRedBag: isLoginClick(function () {
    apiRequest.doubleElevenRedBag({})
      .then(res => {
        this.setData({
          showDouble11: res.obj.today1Login
        })
        if (!res.obj.today1Login && this.data.isDouble11) {
          wx.showToast({
            title: '您今日已经开过红包啦',
            duration: 1500
          })
        }
      })
  }),
  getDoubleElevenRedBag() {
    if (this.data.hbOpened) return
    if (!this.data.invited) this.subscribeMessage()
    this.openBtnAm()
    apiRequest.getDoubleElevenRedBag().then(res => {
      this.setData({
        redPacket: res.obj.redPacket[0]
      })
    })
  },
  closeDouble11(e) {
    this.setData({
      showDouble11: false,
    })
  },
  // 开启红包按钮点击动画
  openBtnAm() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this._animation = animation
    animation.rotateY(180).step()
    animation.rotateY(0).step()
    this.setData({
      amData: animation.export(),
    }, () => {
      setTimeout(() => {
        this.setData({
          hbOpened: true
        })
      }, 1500)
    })
  },
  subscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: ['tdGbyTy8VvLC0Wdp-7wDC7MnVApWCERLRBf9ZAdjSbg'],
      success(res) {},
      fail(res) {}
    })
  },
  // 大年三十放假提示弹窗-确定（已过）
  stopDialogConfirm() {
    this.setData({
      showStopDialog: false
    })
  },
  // 控糖算法升级(血糖值&主食)（已过）
  sugarConfirmDialog: function (e) {
    const val = e.detail.value
    apiRequest.updateUserProfile({
        bloodValue: val.sugarValue,
        appetite: val.foodValue
      })
      .then(res => {
        this.setData({
          showSugar: false
        })
        wx.showToast({
          title: '控糖方案已升级',
          image: '/images/my/success.png',
          duration: 1500
        });
      })
      .catch(error => {

      })
  },

  // 查询贩卖机详情
  queryMachineInfo(id) {
    let {
      lat,
      lng
    } = this.currentAddress.location;
    let address = this.currentAddress.title ? `${this.currentAddress.address}` : `${this.currentAddress.province}${this.currentAddress.city}${this.currentAddress.area}${this.currentAddress.detail}`;
    return apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lng,
      userAddr: address,
      hpId: id,
      showAll: false,
      key: 'machine'
    }).then((res) => {
      let dtos = res.obj.dtos;
      this.setData({
        matchHpid: res.obj.dtos[0],
      })
    })
  },

  // 匹配加热点
  matchHpid(lat, lon, address) {
    // console.log(address)
    return apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      showAll: false,
      showScope: false,
      showInfo: true,
      key: 'match',
      userAddr: address.title ? `${address.address}` : `${address.province}${address.city}${address.area}${address.detail}`, //address.title 为定位地址 无address.title为用户地址
    }).then((res) => {
      let dtos = res.obj.dtos;
      // 超出配送范围
      let outRange = true;
      for (let i = 0; i < dtos.length; i++) {
        if (dtos[i].hotFlag || dtos[i].coldFlag) {
          outRange = false;
          break;
        }
      }
      if (!this.data.matchHpid || this.data.matchHpid.hpId != res.obj.dtos[0].hpId) {
        // 查询首页轮播图
        this.queryDietBanner(res.obj.dtos[0]);
        // 后台配置弹窗显示
        showDialog('02', this, res.obj.dtos[0].hpId)
      }
      let matchHpid = res.obj.dtos[0];
      if (address.title && !matchHpid.hotFlag && (matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1)) {
        // 定位地址匹配加热点 改为热配
        matchHpid.hotFlag = true;
      }
      this.setData({
        matchHpid,
        outRange,
      })
    })
  },

  // 购物车里的商品切换为当前加热点
  cutShopCatHpid(address) {
    // console.log(address)
    let matchHpid = this.data.matchHpid;
    apiRequest.switchShopCatHpid({
      hpid: matchHpid.hpId,
      selfTaking: matchHpid.takeMeals == '01' ? 0 : matchHpid.takeMeals == '02' ? 1 : matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? 0 : 1,
      addressId: (address && address.id) || 0,
      shipType: matchHpid.takeMeals == '01' ? (matchHpid.hotFlag ? '00' : '01') : matchHpid.takeMeals == '02' ? '02' : matchHpid.hotFlag ? '00' : (matchHpid.coldFlag ? '01' : '02'),
      shopType: matchHpid.shopType,
    }).then((res) => {

    })
  },

  // 查询时间
  queryDate(address) {
    let matchHpid = this.data.matchHpid;
    apiRequest.queryGoodsDateList({
      beginTime: day().format('YYYYMMDD'),
      hpid: matchHpid.hpId,
      addTimes: 15,
      shopType: matchHpid.shopType,
    }).then((res) => {
      // console.log(address)
      let list = res.obj.resultDateList;
      setStorage('orderDateList', JSON.parse(JSON.stringify(res.obj.resultDateList)));
      list.forEach((item, idx) => {
        item.date = day(item.date).format('YYYY/MM/DD');
        item.month = day(item.date).format('MM');
        item.day = day(item.date).format('DD');
        if (item.date == day().format('YYYY/MM/DD')) {
          item.text = '今日'
        }
        if (matchHpid) {
          item.hpid = matchHpid.hpId;
          item.hpName = matchHpid.hpName;
          item.selfTaking = matchHpid.takeMeals == '01' && (matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1) ? 0 : matchHpid.takeMeals == '02' && (matchHpid.selfTaking == 1 || matchHpid.selfTaking == 2) ? 1 : matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? 0 : 1;
          item.shipType = matchHpid.takeMeals == '01' ? (matchHpid.hotFlag ? '00' : '01') : matchHpid.takeMeals == '02' ? '02' : matchHpid.hotFlag ? '00' : (matchHpid.coldFlag ? '01' : '02');
          item.addressId = address && address.id || 0;
          item.addressName = (address && (address.detail || address.title)) || ''
        }
      })
      // 套餐推荐日期
      const recomList = list.filter((item) => {
        return item.categoryType != '01'
      })
      this.setData({
        list,
        recomList
      })
      // 新的加热点或贩卖机返回的时间中不包含上次选中的时间
      if (this.data.mealIndex >= 0 && this.data.mealIndex >= list.length) {
        this.setData({
          mealIndex: list.length - 1
        })
      }
      // 请求套餐
      this.initPageIndex();
      this.getSetMealType()
      // this.requestRecom()
      this.requestMenu()
    })
  },

  initPageIndex() {
    this.setData({
      scrollRecomTop: 0,
      pageNo: -1,
      more: true,
      recomMealList: [],
    })
  },
  // ----------------推荐套餐改版-------------------
  //套餐推荐-目录列表
  getSetMealType() {
    apiRequest.getSetMealType().then((res) => {
      if (res.errCode == 0) {
        // 套餐内容
        const setMealTypes = res.obj && res.obj.setMealTypes || [];
        // 初始选中目录
        const initPosition = res.obj && res.obj.initPosition || setMealTypes[0].code;
        let leftIndex2 = setMealTypes.findIndex(item => item.code == initPosition);
        // 根据目录不同返回不同请求条数
        let pagesize = setMealTypes[leftIndex2].pageSize;
        this.setData({
          setMealTypes,
          leftIndex2,
          code: initPosition,
          pagesize,
        })
        this.requestRecom()
      }
    })
  },
  //套餐推荐-选择
  selectsetMeal(e) {
    let {
      index,
      code,
      pagesize,
    } = e.currentTarget.dataset;
    this.setData({
      leftIndex2: index,
      code,
      pagesize,
    })
    this.initPageIndex();
    this.requestRecom()
  },
  //套餐推荐-获取套餐
  requestRecom(skuFilters, refreshStt) {
    const {
      recomList,
      recomIndex,
      matchHpid,
      more,
      requestComplete
    } = this.data;
    if (!more) {
      return
    }
    // if(!more || !requestComplete){
    //   return
    // }
    this.setData({
      requestComplete: false,
    })
    this.data.pageNo++
    const currentAddress = this.currentAddress;
    const defAddress = this.defAddress;
    apiRequest.getSetMealByType({
      userLat: currentAddress && currentAddress.location.lat || (defAddress && defAddress.lat),
      userLng: currentAddress && currentAddress.location.lng || (defAddress && defAddress.lon),
      code: this.data.code, // 套餐推荐的目录code
      dateTime: day(recomList[recomIndex].date).format('YYYYMMDD'),
      category: recomList[recomIndex].categoryType,
      hpid: recomList[recomIndex].hpid || 100000,
      addressId: recomList[recomIndex].addressId || 0,
      shopType: matchHpid.shopType,
      pageNum: this.data.pageNo,
      pageSize: this.data.pagesize || 10,
      locationType: '01',
      refreshStt: skuFilters && Array.isArray(skuFilters) || refreshStt ? true : false,
      skuFilters: skuFilters && Array.isArray(skuFilters) ? skuFilters : undefined,
    }).then(async (res) => {
      if (res.errCode == 0) {
        const dietSetMeals = res.obj && res.obj.dietSetMeals || [];
        let recomMealList = this.data.recomMealList || [];
        dietSetMeals.forEach((item, index) => {
          item.allNum = item.setMealDateils.reduce((num, im) => (num + im.num), 0)
          if (recomMealList.length > 0) {
            recomMealList = recomMealList.concat(item)
          } else {
            recomMealList.push(item)
          }
        })
        this.setData({
          recomMealList,
        })
        // 返回数据过少不能触发上拉加载 重新请求数据
        if(recomMealList.length < 3 && dietSetMeals.length > 0){
          this.requestRecom();
        }
        if (dietSetMeals.length == 0) {
          this.setData({
            more: false,
          })
        }
        const personalityRecom = dietSetMeals.filter((item) => {
          return item.mealType == '00'
        })
        // 判断套餐推荐加热点是否和已选加热点一致
        // if (recomMealList.length > 0) {
        //   const {
        //     list,
        //     recomList,
        //     mealIndex,
        //     recomIndex
        //   } = this.data
        //   const recomHp = recomMealList[0].hpid
        //   const orderHp = list[mealIndex].addressId || list[mealIndex].hpid // 下单加热点
        //   if (recomHp && recomHp != orderHp) {
        //     const {
        //       hpId,
        //       hpName,
        //       takeMeals,
        //       selfTaking,
        //       hotFlag,
        //       coldFlag
        //     } = await this.queryInfo(recomHp)
        //     this.setData({
        //       matchHpid: {
        //         ...this.data.matchHpid,
        //         hpId,
        //         takeMeals,
        //         selfTaking,
        //         hotFlag,
        //         coldFlag
        //       },
        //       [`list[${mealIndex}]`]: {
        //         ...list[mealIndex],
        //         hpName,
        //         hpid: hpId,
        //         addressName: '',
        //         addressId: ''
        //       },
        //       [`recomList[${recomIndex}]`]: {
        //         ...recomList[recomIndex],
        //         hpName,
        //         hpid: hpId,
        //         addressName: '',
        //         addressId: ''
        //       },
        //     }, () => {
        //       this.cutShopCatHpid()
        //       this.getMenu()
        //     })
        //   }
        //   if (recomHp == orderHp) {
        //     this.setData({
        //       [`recomList[${recomIndex}]`]: {
        //         ...recomList[recomIndex],
        //         hpName: list[mealIndex].hpName,
        //         hpid: list[mealIndex].hpid,
        //         addressName: '',
        //         addressId: ''
        //       },
        //     })
        //   }
        // }
        // 判断是否全为不限的筛选条件
        let isNotFiletr; //筛选出代表用户选择了一定条件
        if (skuFilters && Array.isArray(skuFilters)) {
          isNotFiletr = skuFilters.filter((item) => {
            return item.dietaryIntakes.length > 0
          })
        }
        if (skuFilters && Array.isArray(skuFilters) && personalityRecom.length == 0 && isNotFiletr.length > 0) {
          wx.showToast({
            title: '不好意思，限制条件过多，不能推出合适套餐',
            icon: 'none',
            duration: 1500,
            mask: false,
            success: (result) => {

            },
            fail: () => {},
            complete: () => {}
          });
        }
      }
      setTimeout(() => {
        this.setData({
          requestComplete: true,
        })
      }, 300)
    }).catch((res) => {
      this.setData({
        requestComplete: true,
        recomMealList: '',
      })
      // errMsg request:fail timeout
      console.log(res)
    })
  },

  // requestRecom(skuFilters, refreshStt){
  //   const {recomList, recomIndex, matchHpid, more, requestComplete} = this.data;
  //   if(!more || !requestComplete){
  //     return
  //   }
  //   this.setData({
  //     requestComplete: false, 
  //   })
  //   this.data.pageNo++
  //   apiRequest.getGenerateSingleMeal({
  //     dateTime: day(recomList[recomIndex].date).format('YYYYMMDD'),
  //     category: recomList[recomIndex].categoryType,
  //     hpid: recomList[recomIndex].hpid || 100000,
  //     addressId: recomList[recomIndex].addressId || 0,
  //     shopType: matchHpid.shopType,
  //     pageNum: this.data.pageNo,
  //     pageSize: 10,
  //     locationType: '01',
  //     refreshStt: skuFilters && Array.isArray(skuFilters) || refreshStt ? true : false,
  //     skuFilters: skuFilters && Array.isArray(skuFilters) ? skuFilters : undefined,
  //   }).then((res)=>{
  //     if(res.errCode == 0){
  //       const dietSetMeals = res.obj && res.obj.dietSetMeals || [];
  //       let recomMealList = this.data.recomMealList || [];
  //       dietSetMeals.forEach((item,index)=>{
  //         let idx = recomMealList.findIndex( im => im.mealType == item.mealType);
  //         if(idx >= 0){
  //           recomMealList[idx].dietSetMeals = recomMealList[idx].dietSetMeals.concat(item.dietSetMeals)
  //         }else{
  //           item.mealTitle = this.data.mealType[item.mealType]
  //           recomMealList.push(item)
  //         }
  //       })
  //       this.setData({
  //         recomMealList,
  //       })
  //       if(dietSetMeals.length == 0){
  //         this.setData({
  //           more: false,
  //         })
  //       }
  //       const personalityRecom = dietSetMeals.filter((item)=>{
  //         return item.mealType == '00'
  //       })
  //       // 判断是否全为不限的筛选条件
  //       let isNotFiletr;//筛选出代表用户选择了一定条件
  //       if(skuFilters && Array.isArray(skuFilters)){
  //         isNotFiletr = skuFilters.filter((item)=>{
  //           return item.dietaryIntakes.length > 0
  //         })
  //       }
  //       if(skuFilters && Array.isArray(skuFilters) && personalityRecom.length == 0 && isNotFiletr.length > 0){
  //         wx.showToast({
  //           title: '不好意思，限制条件过多，不能推出合适套餐',
  //           icon: 'none',
  //           duration: 1500,
  //           mask: false,
  //           success: (result) => {

  //           },
  //           fail: () => {},
  //           complete: () => {}
  //         }); 
  //       }
  //     }
  //     setTimeout(()=>{
  //       this.setData({
  //         requestComplete: true, 
  //       })
  //     },300)
  //   }).catch((res)=>{
  //     this.setData({
  //       requestComplete: true,
  //       recomMealList: '',
  //     })
  //     // errMsg request:fail timeout
  //     console.log(res)
  //   })
  // },
  // ----------------推荐套餐改版-------------------
  bubble() {
    const bubbleDate = wx.getStorageSync('bubbleDate') || '';
    if (!bubbleDate || bubbleDate != day().format('YYYY/MM/DD')) {
      this.setData({
        showBubble: true
      })
      wx.setStorageSync('bubbleDate', day().format('YYYY/MM/DD'));
    }
    // 新版本弹窗 
    // if (wx.getStorageSync('showUpdate') != 'welfare') {
    //   this.setData({
    //     showUpdate: true
    //   })
    //   wx.setStorageSync('showUpdate', 'welfare');
    // } else {
    //   this.setData({
    //     showUpdate: false
    //   })
    // }
  },

  closeBubble() {
    this.setData({
      showBubble: false
    })
  },

  closeUpdate(e) {
    this.setData({
      showUpdate: false,
      showDayDialog: false,
    })
    if (e.currentTarget.dataset.type == 'jump') {
      wx.switchTab({
        url: '/pages/welfare/welfare',
      });
    }
  },

  // 查询会员得分
  queryHealthScore() {
    const scoreForms = wx.getStorageSync('scoreForms')
    const humanInfoWithScore = wx.getStorageSync('humanInfoWithScore')
    wx.removeStorageSync('scoreForms')
    wx.removeStorageSync('humanInfoWithScore')
    this.setData({
      scoreForms,
      humanInfoWithScore
    })
    if (!this.data.scoreImg) {
      this.calScore()
    }
  },

  calScore() {
    let scoreForms = this.data.scoreForms;
    let score = [{
        name: `热量可控`,
        index: 0,
        max: 30,
        value: scoreForms.intakeScore,
      },
      {
        name: '营养均衡',
        index: 1,
        max: 30,
        value: scoreForms.carbonwaterScore + scoreForms.proteinScore + scoreForms.fatScore,
      },
      {
        name: '食物多样',
        index: 2,
        max: 20,
        value: scoreForms.foodDiversityScore,
      },
      {
        name: '清淡少盐',
        index: 3,
        max: 10,
        value: scoreForms.saltScore,
      },
      {
        name: '纤维充足',
        index: 4,
        max: 10,
        value: scoreForms.dietaryFiberScore,
      }
    ];
    this.setData({
      score,
    })
  },

  // 更新点餐时间
  updatetime() {
    let {
      matchHpid,
    } = this.data;
    if (!matchHpid || !matchHpid.hpId) {
      return
    }
    apiRequest.queryGoodsDateList({
      beginTime: day().format('YYYYMMDD'),
      hpid: matchHpid.hpId,
      addTimes: 15,
      shopType: matchHpid.shopType,
    }).then((res) => {
      let originList = this.data.list;
      let curList = res.obj.resultDateList; //当前请求回的时间
      setStorage('orderDateList', JSON.parse(JSON.stringify(res.obj.resultDateList)));
      for (var i = 0; i < curList.length; i++) {
        last: for (var j = 0; j < originList.length; j++) {
          if (day(curList[i].date).format('YYYY/MM/DD') == originList[j].date && curList[i].categoryType == originList[j].categoryType) {
            let isCreateOrder = curList[i].isCreateOrder;
            curList[i] = originList[j];
            curList[i].isCreateOrder = isCreateOrder;
            break last
          }
        }
      }
      // 套餐推荐日期
      const recomList = curList.filter((item) => {
        return item.categoryType != '01'
      })
      this.setData({
        list: curList,
        recomList,
      })
      if (!this.data.disableUpdateRecom) {
        // 请求套餐
        this.initPageIndex();
        this.requestRecom()
      } else {
        this.setData({
          disableUpdateRecom: false,
        })
      }
      this.requestMenu()
    })
  },

  // 请求菜单
  requestMenu() {
    // 代点餐
    if (wx.getStorageSync('replaceOrder')) {
      this.getReplaceOrder();
    } else if (app.globalData.source == 'app') {
      // app 跳转过来 同步日期中的加热点
      this.syncAppOrder()
    } else if (getStorage('planMealDate')) {
      // 方案中跳转带过来日期
      this.judgeToDate();
    } else {
      this.getMenu()
    }
  },

  // 查询帮充值显示
  queryReplaceRechargeLog() {
    apiRequest.queryReplaceRechargeLog({

    }).then((res) => {
      if (res.obj.cardPurchaseRecords.length > 0) {
        let cardPurchaseRecords = res.obj.cardPurchaseRecords;
        let allCardPrice = 0;
        cardPurchaseRecords.forEach((item) => {
          allCardPrice += (item.cardPrice + item.payDonation);
        })
        let end = cardPurchaseRecords.pop();
        end.allCardPrice = round(allCardPrice, 2);
        this.setData({
          cardPurchaseRecords: end
        })
      }
    })
  },
  // 帮充值弹窗-去到充值页面（已过）
  goSee() {
    this.setData({
      cardPurchaseRecords: {},
    })
    wx.navigateTo({
      url: '/pages/mineBox/balance/balance',
    });
  },

  // 导航栏登录按钮 加热点
  tapcustom: isLoginClick(function () {
    if (this.data.clearCartTip) {
      return
    }
    let {
      mealIndex,
      list,
      matchHpid
    } = this.data;
    const that = this;

    wx.navigateTo({
      url: '/pages/packageOrder/switchHpid/switchHpid',
      events: {
        // 切换收货地址
        switchAdd: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          that.defAddress = data.data;
          // 查询地址匹配加热点
          await that.matchHpid(that.defAddress.lat, that.defAddress.lon, that.defAddress);
          // 切换购物车商品到该加热点
          that.cutShopCatHpid(that.defAddress);
          //  查询时间
          that.queryDate(that.defAddress);
        },
        // 切换定位地址
        switchLocation: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          let address = data.data;
          // address.detail = address.title;
          address.id = '';
          that.currentAddress = address;
          await that.matchHpid(that.currentAddress.location.lat, that.currentAddress.location.lng, that.currentAddress);
          that.cutShopCatHpid();
          that.queryDate(that.currentAddress);
        },
        // 切换加热点
        switchhpid: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          that.setData({
            matchHpid: data.data,
            outRange: false,
          })
          that.cutShopCatHpid();
          that.queryDate();
          // 查询首页轮播图
          that.queryDietBanner();
          // 后台配置弹窗显示
          showDialog('02', that, that.data.matchHpid.hpId)
        },
      },
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据 shopType 10 门店 20 机器
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          index: list[mealIndex].addressName ? 0 : matchHpid.shopType == '10' ? 1 : 2,
        });
      },
      fail: () => {},
      complete: () => {}
    });

  }),


  // 分享有礼弹窗-关闭（已过）
  closeshowShre() {
    this.setData({
      showShre: false
    })
  },

  // 登录状态组件
  loginClick: isLoginClick(function () {

  }),

  async queryAddress() {
    let that = this;
    try {
      const res = await apiRequest.queryAddressListForThree({
        sortNum: '',
        dataStt: '',
      });
      that.setData({
        addressList: res.obj.addressInfos || []
      });
      that.defAddress = that.data.addressList.filter((item) => {
        return item.tuaDef == '1';
      })[0];
    } catch (error) {}
  },

  // 查询用户地址
  queryLocation() {
    let that = this;
    let getLocationObj = {
      path: that.route,
      starTime: new Date().valueOf(),
      desc: '获取当前位置'
    }
    return new Promise((resolve) => {
      // console.log(app.globalData.userAddr)
      if (app.globalData.lat && app.globalData.lon && app.globalData.userAddr) {
        let address = app.globalData.userAddr.pois && app.globalData.userAddr.pois[0] || {
          address: app.globalData.userAddr.address,
          title: app.globalData.userAddr.address,
          location: app.globalData.userAddr.location
        };
        address.id = '';
        that.currentAddress = address;
        that.saveLocationTime(getLocationObj)
        resolve();
      } else {
        location.getCity(function (res) {
          let address = res.result.pois[0] || {
            address: res.result.address,
            title: res.result.address,
            location: res.result.location
          };
          // address.detail = address.title;
          address.id = '';
          that.currentAddress = address;
          that.saveLocationTime(getLocationObj)
          resolve();
        }, 'address')
      }
    })
  },

  // 记录获取位置时间
  saveLocationTime(param) {
    // 成功获取位置
    let getLocationObj = param;
    getLocationObj.readyTime = new Date().valueOf()
    getLocationObj.runTime = getLocationObj.readyTime - getLocationObj.starTime;
    apiRequest.saveRecord({
      eventKey: getLocationObj.desc,
      eventValue: getLocationObj,
    })
  },


  // 代点餐（已过）
  getReplaceOrder() {
    let list = this.data.list;
    let replaceOrder = wx.getStorageSync('replaceOrder');
    this.showReplaceCart = true; //显示购物车弹窗
    let index = '';

    for (var i = 0; i < replaceOrder.length; i++) {
      last: for (var j = 0; j < list.length; j++) {
        if (replaceOrder[i].date == list[j].date && replaceOrder[i].categoryType == list[j].categoryType) {
          replaceOrder[i].isCreateOrder = list[j].isCreateOrder;
          list[j] = replaceOrder[i];
          if (index === '') {
            index = j
          }
          break last
        }
      }
    }
    this.setData({
      list,
      mealIndex: index,
      leftIndex: 0,
      intoIndex: 'scroll_0',
    }, () => {
      this.getMenu()
      wx.removeStorage({
        key: 'replaceOrder'
      });
    })
  },
  // app 跳转过来 同步日期中的加热点 （已过）
  syncAppOrder() {
    app.globalData.source = '';
    let list = this.data.list;
    let appList = getStorage('orderInfo');
    let index = '';
    for (var i = 0; i < appList.length; i++) {
      last: for (var j = 0; j < list.length; j++) {
        if (appList[i].date == list[j].date && appList[i].category == list[j].categoryType) {
          if (list[j].hpid != appList[i].hpid) {
            list[j].addressId = 0;
          }
          list[j].hpid = appList[i].hpid;
          list[j].hpName = appList[i].hpName;
          list[j].selfTaking = appList[i].selfTaking;
          list[j].shipType = appList[i].shipType;
          if (index === '') {
            index = j
          }
          break last
        }
      }
    }
    this.setData({
      list,
      mealIndex: index,
      leftIndex: 0,
      intoIndex: 'scroll_0',
    })
    this.getMenu()
    removeStorage('orderInfo')
  },

  // 方案页跳转点餐携带日期
  judgeToDate() {
    let planMealDate = getStorage('planMealDate');
    let list = this.data.list;
    let index = list.findIndex(item => day(item.date).format('YYYYMMDD') == planMealDate.date && item.categoryType == planMealDate.category);
    if(this.data.tabIndex != 1){
      this.setData({
        tabIndex: 1
      })
    }
    if (index >= 0) {
      this.setData({
        mealIndex: index,
      })
    }
    this.getMenu()
    removeStorage('planMealDate')
  },

  // 更新页面登录状态（已过）
  updateLogin() {
    let loginInfo = getStorage('loginInfo');
    this.setData({
      loginInfo,
      isLogin: loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile,
    })
    if (this.data.isLogin) {
      this.calculat();
    }
  },

  // 选择套餐日期
  selectRecom(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      recomIndex
    } = this.data;
    if (index == recomIndex) {
      return
    }
    this.setData({
      recomIndex: index,
    })
    this.initPageIndex()
    this.requestRecom()
    this.allPrice()
  },

  // 选择餐别
  select: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      mealIndex
    } = this.data;
    if (index == mealIndex) {
      return
    }
    this.setData({
      mealIndex: index,
      leftIndex: 0,
      intoIndex: 'scroll_0',
    }, () => {
      this.getMenu();
    })
  },
  // 左边菜单-选中（已过）
  selectKind: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      leftIndex: index,
      intoIndex: `scroll_${index}`
    })
  },
  // 标签筛选-点击显示隐藏（已过）
  tapTag() {
    if (!this.data.showFilter && this.data.labelsTag) {
      let {
        labelsTag,
        tagList
      } = this.data;
      labelsTag.forEach((item1, index1) => {
        item1.list.forEach((item2, index2) => {
          if (tagList && tagList[item1.name] && tagList[item1.name].indexOf(item2.id) > -1) {
            labelsTag[index1].list[index2].checked = true
          } else {
            labelsTag[index1].list[index2].checked = false
          }
        })
      })
      this.setData({
        labelsTag
      })
    }
    this.setData({
      showFilter: !this.data.showFilter,
      selectAct: this.data.tagNum ? true : false
    })
  },
  // 筛选标签-重置（已过）
  reset() {
    if (!this.data.selectAct) {
      return
    }
    let labelsTag = this.data.labelsTag;
    labelsTag.forEach((item1, index1) => {
      item1.list.forEach((item2, index2) => {
        labelsTag[index1].list[index2].checked = false
      })
    })
    this.setData({
      labelsTag,
      tagList: {},
      tagNum: 0,
      selectAct: false,
      showFilter: false,
    }, () => {
      this.getMenu()
    })
  },

  // 筛选标签-处理数据（已过）
  getFoodLabel(flavor, dietaryIntakes, notLike) {
    let labelsTag = [];
    if (flavor.length > 0) {
      labelsTag.push({
        name: '口味',
        list: flavor
      })
    }
    if (dietaryIntakes.length > 0) {
      labelsTag.push({
        name: '过敏原',
        list: dietaryIntakes
      })
    }
    if (notLike.length > 0) {
      labelsTag.push({
        name: '筛除以下标签菜品',
        list: notLike
      })
    }
    this.setData({
      labelsTag,
      // showMoreTag: false
    })
  },
  // 筛选标签-更多选项（已过）
  // moreTag() {
  //   this.setData({
  //     showMoreTag: !this.data.showMoreTag
  //   })
  // },
  // 筛选标签-选择（已过）
  selectTag(e) {
    let {
      index1,
      index2
    } = e.currentTarget.dataset;
    let labelsTag = this.data.labelsTag;
    labelsTag[index1].list[index2].checked = !labelsTag[index1].list[index2].checked;
    let selectAct = false;
    filterTag:
      for (var i = 0; i < labelsTag.length; i++) {
        for (var j = 0; j < labelsTag[i].list.length; j++) {
          if (labelsTag[i].list[j].checked) {
            selectAct = true;
            break filterTag
          }
        }
      }
    this.setData({
      labelsTag,
      selectAct
    })
  },
  // 筛选标签-确定（已过）
  sureTag() {
    if (!this.data.selectAct) {
      return
    }
    let labelsTag = this.data.labelsTag;
    let tagList = {};
    let tagNum = 0;
    labelsTag.forEach((item1, index1) => {
      let list = [];
      item1.list.forEach((item2, index2) => {
        if (item2.checked) {
          tagNum++
          list.push(item2.id)
        }
      })
      if (list.length > 0) {
        tagList[item1.name] = list;
      }
    })
    this.setData({
      tagList,
      tagNum,
      showFilter: false
    }, () => {
      this.getMenu()
    })
  },
  cancel() {
    this.setData({
      showBookDialog: false
    })
  },
  BoolConfirm() {
    let {
      list,
      mealIndex
    } = this.data
    let cutindex = 0
    if (list[mealIndex].categoryType == '01') {
      cutindex = 4
    } else if (list[mealIndex].categoryType == '02') {
      cutindex = 3
    } else {
      cutindex = 2
    }
    this.setData({
      mealIndex: this.data.mealIndex + cutindex,
      leftIndex: 0,
      intoIndex: 'scroll_0',
      showBookDialog: false
    }, () => {
      this.getMenu();
    })
  },
  // 获取设备高度（已过）
  calculat: function () {
    // 减去状态栏高度 减去上部高度
    let mobileInfo = this.mobileInfo ? this.mobileInfo : wx.getSystemInfoSync();
    let {
      px2rpx,
      isLogin,
      navStatusHeight,
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - t(490) - navStatusHeight) * px2rpx;
    let mealHeight = (mobileInfo.windowHeight - t(isLogin ? 288 : 226) - navStatusHeight) * px2rpx;
    let moreHeight = (mobileInfo.windowHeight - t(108) - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight,
      mealHeight,
      moreHeight,
    })
  },

  // 换一换
  change() {
    this.getMenu('change');
  },

  // 默认类目
  categoryDefault() {
    let indexRules = wx.getStorageSync('indexRules');
    if (indexRules) {
      this.setData({
        indexRules
      })
      return
    }
    let {
      planningType
    } = this.data;
    if (planningType == 23) {
      indexRules = 'catalog'
    } else {
      indexRules = 'intakeCategory'
    }
    this.setData({
      indexRules
    }, () => {
      setStorage('indexRules', indexRules)
    })
  },
  // 切换类目
  category() {
    let indexRules = this.data.indexRules == 'catalog' ? 'intakeCategory' : 'catalog'
    this.setData({
      indexRules
    }, () => {
      setStorage('indexRules', indexRules)
      this.getMenu();
    })
  },
  // 获取菜品列表（已过）
  getMenu: function (type) {
    //type 换一换
    let {
      list,
      mealIndex,
      isLogin,
      outRange,
      indexRules,
      matchHpid,
      leftIndex
    } = this.data;
    apiRequest.querySaleGoodsForThree({
        dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
        category: list[mealIndex].categoryType,
        indexRules,
        orderMethod: '01',
        hpid: list[mealIndex].hpid || 100000,
        addressId: list[mealIndex].addressId || 0,
        version: "01",
        tagList: this.data.tagList || undefined,
        isLogin: isLogin,
        dataStt: '99',
        cleanCategory: '04', //清除加餐数据
        refreshStt: type == 'change' ? true : false,
        shopType: matchHpid.shopType,
      })
      .then(res => {
        let resultList = res.obj.resultList;
        let stockindex = 0
        let checkBook = getStorage('checkBook')
        resultList.forEach((item1, index1) => {
          // 添加换行符
          if (item1.lineBreakPosition > 0) {
            const skuCatalog = item1.skuCatalog;
            const skuCatalogArr = skuCatalog.split('');
            skuCatalogArr.splice(item1.lineBreakPosition, 0, '\n');
            item1.skuKind = skuCatalogArr.join('');
          } else {
            item1.skuKind = item1.skuCatalog;
          }
          item1.detailList && item1.detailList.forEach((item2, index2) => {
            // 判断是否校验库存 机器 校验库存 门店 点当天或超过18点点明日餐校验库存
            if (matchHpid.shopType == '20' || day(list[mealIndex].date) <= day() || (list[mealIndex].date == day().add(1, 'day').format('YYYY/MM/DD') && day() > day(`${day().format('YYYY/MM/DD')} ${this.data.confObj.orderTimeLimit}`))) {
              item2.checkStock = true
            }
            if (checkBook) { //预订送券
              if (item1.skuCatalog == '动物蛋白' || item1.skuCatalog == '蔬菜') {
                // console.log(item2.stock)
                if (item2.stock > 0) {
                  stockindex++
                }
              }
            }
            if (Array.isArray(item2.dietaryIntakes)) {
              item2.dietaryIntakes = item2.dietaryIntakes.filter(label => label.type === '02')
            } else if (Array.isArray(item2.dietLabelList)) {
              // item2.dietLabelList = item2.dietLabelList.filter(label => label.type === '02')
              item2.dietLabelList = item2.dietLabelList.filter(label => label.type === '12' || label.type === '14')
            }
            if (item2.type == '01') {
              item2.cid = item2.id;
              item2.packageForm = item2.setMealDateils.map(main => main.name).join('+');
            }
          })
        })
        // 筛选标签
        if (!this.data.labelsTag) {
          this.querySaleGoodsDietaryIntake().then((res) => {
            this.getFoodLabel(res.obj.flavor || [], res.obj.dietaryIntakes || [], res.obj.notLike || [])
          });
        }
        this.setData({
          nameList: resultList,
          ageType: res.obj.ageType,
          showBookDialog: indexRules == "intakeCategory" && stockindex < 6 && checkBook && !outRange && (matchHpid.shopType == '10') ? true : false,
        }, () => {
          this.countKindNum();
          removeStorage('checkBook');
          if (type == 'change') {
            return
          }
          this.allPrice();
        })
        if (leftIndex >= 0 && leftIndex >= resultList.length) {
          this.setData({
            leftIndex: 0
          })
        }
      })
      .catch(error => {

      })
  },

  // 统计菜单分类下菜品数量
  countKindNum() {
    let nameList = this.data.nameList;
    nameList.forEach((item) => {
      if (item.skuCatalog !== '我的最爱' && item.skuCatalog !== '新品') {
        if (item.detailList) {
          item.num = item.detailList.reduce((c, im) => (im.type ? c + 0 : c + im.num), 0) //type存在套餐
        }
      }
    })
    this.setData({
      nameList
    })
  },

  querySaleGoodsDietaryIntake() {
    return apiRequest.querySaleGoodsDietaryIntake({

    }).then((res) => {
      return res
    })
  },


  allPrice: function () {
    var that = this;
    let {
      tabIndex,
      recomList,
      recomIndex,
      list,
      mealIndex,
      isLogin
    } = that.data;
    if (!isLogin) {
      that.setData({
        hideLoad: true
      })
      return
    }
    apiRequest.queryShoppingCartCount({
        orderMethod: '01',
        dateTime: tabIndex == 0 ? day(new Date(recomList[recomIndex].date)).format('YYYYMMDD') : day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
        category: tabIndex == 0 ? recomList[recomIndex].categoryType : list[mealIndex].categoryType,
      })
      .then(res => {
        if (res.errCode == '0') {
          // g 转化 kcal 蛋白质 碳水 *4  脂肪*9
          let total = res.obj;
          total.totalPrice = round(total.totalPrice, 2);
          // total.energyPercent = round((total.energySupply / total.totalEnergy) * 100, 0); //能量
          // total.saltPercent = round((total.saltSupply / total.totalSalt) * 100, 0); //盐量
          // total.totalProteinPercent = round((total.proteinSupply / total.totalProtein) * 100, 0)
          // total.totalCarbonwaterPercent = round((total.carbonwaterSupply / total.totalCarbonwater) * 100, 0)
          // total.totalFatKcalPercent = round((total.fatSupply / total.totalFat) * 100, 0);
          total.discount = round((total.totalOriginalPrice - total.totalPrice), 2);

          let dialData = {
            totalCarbonwater: total.totalCarbonwater, //计划碳水
            carbonwaterSupply: total.carbonwaterSupply, //实际碳水
            totalProtein: total.totalProtein, //计划蛋白质
            proteinSupply: total.proteinSupply, //实际蛋白质
            totalFat: total.totalFat, //计划脂肪
            fatSupply: total.fatSupply, //实际脂肪
            totalEnergy: total.totalEnergy, //计划能量
            energySupply: total.energySupply, //实际能量
            totalSalt: total.totalSalt, //计划盐量
            saltSupply: total.saltSupply, //实际盐量
            foodTypeNum: total.foodTypeNum || 0, //食物多样性
            totalDiversity: total.totalDiversity || 0, //计划食物多样性
            totalFiber: total.totalFiber || 0, //膳食纤维
            fiberSupply: total.fiberSupply || 0, //实际膳食纤维
            nutritionHealthScore: total.nutritionHealthScore || 0, //健康分
          };
          Object.keys(dialData).forEach((key) => {
            dialData[key] = Number(dialData[key])
          })
          that.setData({
            total,
            dialData
          })
          // 注册流程的推荐套餐-加购-跳转点餐页后默认显示购物车弹窗
          if (that.showRecommendCart) {
            that.editCart();
            this.showRecommendCart = false;
          }
          // 显示代点餐购物车弹窗
          if (that.showReplaceCart) {
            that.showReplaceCart = false;
            wx.showModal({
              title: '支付时间提醒',
              content: `请于${day(list[mealIndex].date).subtract(1, 'day').format('YYYY/MM/DD')}日18：00点前完成调整并支付。让我们帮您准备好烹制食材`,
              confirmText: '知道了',
              confirmColor: '#FE5E0F',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.editCart();
                }
              }
            })
          }
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          that.setData({
            total: {
              piece: 0,
              totalPrice: 0
            }
          })
        }
        if (!this.data.hideLoad) {
          this.setData({
            hideLoad: true
          })
          // 记录加载时间
          this.runTimeInfo.readyTime = new Date().valueOf()
          this.runTimeInfo.runTime = this.runTimeInfo.readyTime - this.runTimeInfo.starTime;
          apiRequest.saveRecord({
            eventKey: this.runTimeInfo.desc,
            eventValue: this.runTimeInfo,
          })
          if (wx.canIUse('reportPerformance')) {
            wx.reportPerformance('2001', this.runTimeInfo.runTime)
          }
        }
      })
      .catch(error => {

      })
  },

  // 滚动菜品联动菜单（已过）
  scroll: throttle(200, function (e) {
    let that = this;
    let {
      isLogin,
      navStatusHeight,
    } = that.data;
    let wrapTop = t(isLogin ? 490 : 558) + navStatusHeight;
    var query = wx.createSelectorQuery();
    query.selectAll('.wrap-box').boundingClientRect(function (rect) {
      let domList = rect;
      for (var i = 0; i < domList.length; i++) {
        if (domList[i].top <= wrapTop && domList[i + 1] && domList[i + 1].top > wrapTop) {
          if (that.data.leftIndex != i) {
            that.setData({
              leftIndex: i
            })
          }
          break
        } else if (domList[i].top <= wrapTop && i == domList.length - 1) {
          if (that.data.leftIndex != i) {
            that.setData({
              leftIndex: i
            })
          }
          break
        }
      }
    }).exec();
  }),

  // 菜品-增/减（已过）
  add: isLoginClick(function (e) {
    let that = this;
    let {
      wrapindex,
      index,
      combo,
      comboid,
      cid,
      type
    } = e.currentTarget.dataset;
    let {
      list,
      mealIndex,
      selfTaking,
      hpid,
      shipType,
      nameList,
      matchHpid,
      recomList,
      recomIndex,
      tabIndex,
      recomMealList,
    } = that.data;
    app.globalData.gio('track', 'c_Addgoods', {
      goodsId: cid,
      goodsName: tabIndex == 0 ? recomMealList[index].name : nameList[wrapindex].detailList[index].skuname,
      // goodsName: tabIndex == 0 ? recomMealList[wrapindex].dietSetMeals[index].name : nameList[wrapindex].detailList[index].skuname,
      type,
    })
    if (type == 'add') {
      app.globalData.gio('track', 'goodsType', {
        c_type: tabIndex == 0 ? '套餐' : '单品',
      })
    }
    // debugger
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        cid: cid,
        dateTime: tabIndex == 0 ? day(new Date(recomList[recomIndex].date)).format('YYYYMMDD') : day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
        category: tabIndex == 0 ? recomList[recomIndex].categoryType : list[mealIndex].categoryType,
        orderMethod: '01',
        num: type == 'add' ? 1 : -1,
        selfTaking: tabIndex == 0 ? recomList[recomIndex].selfTaking : list[mealIndex].selfTaking,
        addressId: tabIndex == 0 ? recomList[recomIndex].addressId : list[mealIndex].addressId || that.addressId || 0,
        hpid: tabIndex == 0 ? recomList[recomIndex].hpid : list[mealIndex].hpid || hpid,
        type: combo,
        version: '01',
        comboId: comboid ? comboid : 0,
        shipType: tabIndex == 0 ? recomList[recomIndex].shipType : list[mealIndex].shipType || shipType,
        shopType: matchHpid.shopType,
      })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          if (tabIndex == 0) {
            // 套餐中sku库存不足 刷新套餐数据
            this.initPageIndex();
            this.requestRecom('', true)
          }
          return
        }
        // 新用户&&加购数量超过1-提示
        if (res.obj.isOverBuy) {
          wx.showToast({
            title: '专享价仅限购1份，第2份恢复原价',
            icon: 'none',
          });
        }
        if (res.obj.stt) {
          type == 'add' ? (tabIndex == 0 ? recomMealList[index].num++ : nameList[wrapindex].detailList[index].num++) : (tabIndex == 0 ? recomMealList[index].num-- : nameList[wrapindex].detailList[index].num--);
          // type == 'add' ? (tabIndex == 0 ? recomMealList[wrapindex].dietSetMeals[index].num++ : nameList[wrapindex].detailList[index].num++) : (tabIndex == 0 ? recomMealList[wrapindex].dietSetMeals[index].num-- : nameList[wrapindex].detailList[index].num--);
          if (tabIndex == 0) {
            that.setData({
              recomMealList,
              scale: true
            })
          } else {
            that.setData({
              nameList,
              scale: true
            })
          }
          if (combo == '01') {
            that.comboSku = recomMealList[index].setMealDateils;
            // that.comboSku = recomMealList[wrapindex].dietSetMeals[index].setMealDateils;
            that.autoCombo();
          } else {
            let autoNum = nameList[wrapindex].detailList[index].num;
            // 同步同一sku数量
            that.autoNum(autoNum, cid);
          }
          that.allPrice();
          setTimeout(function () {
            that.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })

  }),

  // 同步同一sku数量（已过）
  autoNum: function (autoNum, cid) {
    let nameList = this.data.nameList;
    nameList.forEach((item1, index1) => {
      item1.detailList.forEach((item2, index2) => {
        if (item2.cid == cid) {
          item2.num = autoNum
        }
      })
    })
    this.setData({
      nameList
    })
    this.countKindNum();
  },

  // 同步套餐到单品（已过）
  autoCombo: function () {
    let comboSku = this.comboSku;
    let nameList = this.data.nameList;
    for (var i = 0; i < comboSku.length; i++) {
      combo: for (var j = 0; j < nameList.length; j++) {
        for (var h = 0; h < nameList[j].detailList.length; h++) {
          if (comboSku[i].cid == nameList[j].detailList[h].cid && nameList[j].detailList[h].type != '01') {
            nameList[j].detailList[h].num += comboSku[i].num;
            break combo
          }
        }
      }
    }
    this.setData({
      nameList
    })
    this.countKindNum();
  },

  // 编辑购物车
  // 点击显示购物车&获取数据（已过）
  editCart: function () {
    var that = this;
    let {
      list,
      mealIndex,
      showCart
    } = that.data;
    if (showCart) {
      that.setData({
        showCart: false
      })
      return
    }
    apiRequest.queryShoppingCartCount({
        orderMethod: '01',
        category: 'all',
        dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
      })
      .then(res => {
        let allCart = res.obj.allCart;
        let categoryList = ['01', '02', '03'];
        allCart.forEach((item1, index1) => {
          item1.dateTime = day(item1.date).format('MM月DD日')
          item1.categoryCart = [{
            category: '01',
            list: []
          }, {
            category: '02',
            list: []
          }, {
            category: '03',
            list: []
          }];
          item1.skuList.forEach((item2, index2) => {
            item2.dietLabelList = (item2.dietLabelList || []).filter(label => label.type === '02')
            item1.categoryCart[categoryList.indexOf(item2.category)].list.push(item2)
          })
          item1.categoryCart = item1.categoryCart.filter(item => item.list.length > 0)
        })
        this.setData({
          allCart,
          showCart: true,
        })
      })
      .catch(error => {

      })
  },

  // 购物车-增/减（已过）
  edit: function (e) {
    let {
      category,
      index1,
      index2,
      index3,
      type,
      combo,
      cid
    } = e.currentTarget.dataset;
    let {
      allCart,
      list,
      mealIndex,
      matchHpid
    } = this.data;
    let date = allCart[index1].date;
    let skuInfo = allCart[index1].categoryCart[index2].list[index3];
    app.globalData.gio('track', 'c_Addgoods', {
      goodsId: cid,
      goodsName: skuInfo.skuname,
      type,
    })
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        cid: cid,
        dateTime: date,
        category: category,
        orderMethod: '01',
        num: type == 'reduce' ? -1 : 1,
        selfTaking: skuInfo.selfTaking,
        addressId: skuInfo.addressId || 0,
        hpid: skuInfo.heatingPointId,
        version: '01',
        comboId: 0,
        type: combo,
        shopType: matchHpid.shopType,
      })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        if (res.obj.stt) {
          if (res.obj.isOverBuy) {
            wx.showToast({
              title: '新用户专享商品限购一份，超过一份恢复原价',
              icon: 'none',
            })
          }
          type == 'reduce' ? skuInfo.num-- : skuInfo.num++;
          this.setData({
            allCart,
            scale: true
          })
          if (day(list[mealIndex].date).format('YYYYMMDD') == date && list[mealIndex].categoryType == category) {
            let autoNum = skuInfo.num;
            // 同步同一sku数量
            this.autoNum(autoNum, cid);
          }

          // 为0删除
          if (allCart[index1].categoryCart[index2].list[index3].num == 0) {
            allCart[index1].categoryCart[index2].list.splice(index3, 1);
            if (allCart[index1].categoryCart[index2].list.length == 0) {
              allCart[index1].categoryCart.splice(index2, 1)
              if (allCart[index1].categoryCart.length == 0) {
                allCart.splice(index1, 1);
              }
            }
            if (allCart.length == 0) {
              this.hideCart()
            }
            this.setData({
              allCart,
            })
          }
          this.allPrice();
          setTimeout(() => {
            this.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })
  },

  // 关闭购物车（已过）
  hideCart: function () {
    this.setData({
      showCart: false,
    })
  },
  // 清空购物车-取消（已过）
  cancelTap() {
    this.setData({
      clearCartTip: false
    })
  },

  // 清空购物车-确定（已过）
  clear: function (e) {
    if (e.currentTarget.dataset.type == 'tip') {
      this.setData({
        clearCartTip: true
      })
      return
    }

    this.setData({
      clearCartTip: false
    })

    let that = this;
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        category: 'all',
        orderMethod: '01',
        dataStt: '99',
        version: '01'
      })
      .then(res => {
        if (res.obj.stt) {
          that.getMenu();
          this.clearRecomNum();
          that.setData({
            showCart: false,
          }, () => {
            wx.showToast({
              title: '购物车已清空',
              icon: 'success',
            });
          })
        }
      })
      .catch(error => {

      })
  },

  // 套餐中已选状态更改
  clearRecomNum() {
    let recomMealList = this.data.recomMealList;
    recomMealList.forEach((item) => {
      item.num = 0
    })
    this.setData({
      recomMealList
    })
  },
  // // 套餐中已选状态更改
  // clearRecomNum() {
  //   let recomMealList = this.data.recomMealList;
  //   recomMealList.forEach((item) => {
  //     item.dietSetMeals.forEach((item2) => {
  //       item2.num = 0
  //     })
  //   })
  //   this.setData({
  //     recomMealList
  //   })
  // },

  // 菜品详情（已过）
  goodsDetail: function (e) {
    var that = this;
    let {
      index,
      id,
      combo,
      comboid,
      forbid
    } = e.currentTarget.dataset;
    let {
      list,
      mealIndex,
      ageType,
      recomList,
      recomIndex,
      tabIndex,
      matchHpid,
    } = that.data;
    if (combo == '00' && forbid) {
      return
    }
    let obj = {
      selectIndex: index,
      code: this.data.code, // 套餐推荐的目录code
      id: id,
      orderMethod: '01',
      category: tabIndex == 0 ? recomList[recomIndex].categoryType : list[mealIndex].categoryType,
      dateTime: tabIndex == 0 ? day(recomList[recomIndex].date).format('YYYYMMDD') : day(list[mealIndex].date).format('YYYYMMDD'),
      deliveryIndex: tabIndex == 0 ? recomList[recomIndex].selfTaking : list[mealIndex].selfTaking || 0,
      addressId: tabIndex == 0 ? recomList[recomIndex].addressId : list[mealIndex].addressId || 0,
      heatId: tabIndex == 0 ? recomList[recomIndex].hpid : list[mealIndex].hpid || 0,
      combo: combo,
      comboid: comboid || 0,
      shipType: tabIndex == 0 ? recomList[recomIndex].shipType : list[mealIndex].shipType || '',
      ageType: ageType || '',
      matchHpid,
      // spellOrder: true,
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`,
      success: (result) => {
        this.setData({
          disableUpdateRecom: true,
        })
        // 通过eventChannel向被打开页面传送数据
        // result.eventChannel.emit('acceptDataFromOpenerPage', {
        //   dialData: this.data.dialData
        // });
      },
    });
  },

  //去结算
  async buy() {
    this.buyType = 'buy'; //直接购买
    if (this.data.showCart) {
      this.setData({
        showCart: false
      })
    }
    // 判断是否显示更换菜品弹窗
    await this.judgeChangeSku();
    if (this.data.isChangeSkuInfo.showTip && !this.data.hideReplace) {
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=menu&code=${this.data.code}`,
    });
  },
  // 显示拼单类型-选择
  async spell() {
    // 是否可以拼单（菜品原价 >= 20元时才可以拼单）
    if (this.data.total.totalOriginalPrice < 20) {
      wx.showToast({
        title: '购物车中菜品原价大于等于20元才可发起拼单',
        icon: 'none',
      });
      return;
    }
    this.buyType = 'spell'; //拼单
    if (this.data.showCart) {
      this.setData({
        showCart: false
      })
    }
    // 判断是否显示更换菜品弹窗
    await this.judgeChangeSku();
    if (this.data.isChangeSkuInfo.showTip && !this.data.hideReplace) {
      return
    }
    this.setData({
      spellTypeShow: true
    })
  },

  // 判断是否更换菜品
  judgeChangeSku() {
    let shopType = this.data.matchHpid.shopType; //加热点类型
    let nutritionHealthScore = this.data.total.nutritionHealthScore; //营养健康分
    let packageArr = this.data.nameList.filter((item) => {
      return item.skuCatalog == '推荐配餐';
    }); //套餐
    let setMeal = packageArr.length > 0 && packageArr[0].detailList || []; //推荐套餐
    if (shopType == '10' && nutritionHealthScore > 0 && nutritionHealthScore < 80 && setMeal.length > 0 && !this.data.hideReplace) { //加热点类型 小于80分 有套餐更换
      const {
        subInfo,
        uid,
        list,
        mealIndex,
        total: {
          allCart,
        },
      } = this.data;
      const category = list[mealIndex].categoryType;
      const orderDate = list[mealIndex].date;
      const skuList = allCart.find(item => item.date == day(orderDate).format('YYYYMMDD')).skuList;
      let cidList = {};
      skuList.forEach((item) => {
        if (category == item.category) {
          cidList[item.cid] = item.num;
        }
      })
      return apiRequest.intelligenceChangeGoods({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || uid,
          payFlag: false,
          category,
          orderDate: day(orderDate).format('YYYYMMDD'),
          cidList,
        }]
      }).then((res) => {
        if (res.errCode == 0) {
          let isChangeSkuInfo = res.obj;
          if (isChangeSkuInfo.showTip) {
            isChangeSkuInfo.tip = `${isChangeSkuInfo.tip1}，${isChangeSkuInfo.tip2}，${isChangeSkuInfo.tip3}`;
            this.setData({
              setMeal,
              setMealIndex: this.data.setMealIndex && this.data.setMealIndex < setMeal.length ? this.data.setMealIndex : 0,
              refuseTip: false,
            })
          }
          this.setData({
            isChangeSkuInfo,
          })
        } else {
          this.setData({
            isChangeSkuInfo: {}
          })
        }
      })
    } else {
      return new Promise((reslove) => {
        this.setData({
          isChangeSkuInfo: {}
        })
        reslove();
      })
    }
  },

  changeSku() {
    let {
      setMeal,
      setMealIndex
    } = this.data;
    this.setData({
      setMealIndex: setMealIndex < setMeal.length - 1 ? setMealIndex + 1 : 0,
    })
  },

  // 不再提醒更换菜品
  refuse() {
    this.setData({
      refuseTip: !this.data.refuseTip
    })
  },

  // 关闭提醒弹窗
  closeChangeTip() {
    if (!this.data.refuseTip) {
      this.setData({
        ['isChangeSkuInfo.showTip']: false,
        hideReplace: true,
      })
    } else {
      apiRequest.replaceCateringShoppingCartGoods({
        code: this.data.code, // 套餐推荐的目录code
        showTip: false,
      }).then(() => {
        this.setData({
          ['isChangeSkuInfo.showTip']: false,
          hideReplace: true,
        })
      })
    }
    switch (this.buyType) {
      case 'buy':
        wx.navigateTo({
          url: `/pages/packageOrder/submit/submit?from=menu&code=${this.data.code}`,
        });
        break;
      case 'spell':
        this.setData({
          spellTypeShow: true
        })
        break;
    }
  },

  // 更换菜品
  replaceSku() {
    let {
      list,
      mealIndex,
      setMeal,
      setMealIndex,
      refuseTip
    } = this.data;
    let {
      categoryType,
      date,
      selfTaking,
      addressId,
      hpid,
      shipType
    } = list[mealIndex]
    apiRequest.replaceCateringShoppingCartGoods({
      code: this.data.code, // 套餐推荐的目录code
      cid: setMeal[setMealIndex].id,
      dateTime: day(new Date(date)).format('YYYYMMDD'),
      category: categoryType,
      orderMethod: '01',
      selfTaking: selfTaking,
      addressId: addressId || 0,
      hpid: hpid,
      shipType: shipType,
      showTip: !refuseTip,
    }).then((res) => {
      this.setData({
        ['isChangeSkuInfo.showTip']: false
      })
      this.getMenu();
      if (res.errCode == 0) {
        wx.showToast({
          title: '菜品更换成功',
          icon: 'success',
        });
      }
    })
  },

  // 拼单类型-选择
  spellTypeSelect(e) {
    this.setData({
      spellTypeShow: false,
      showCart: false
    })
    let {
      index
    } = e.currentTarget.dataset;
    if (index == 0) {
      this.spellOrder()
    } else {
      this.spellGroup()
    }
  },
  // 拼单
  async spellOrder() {
    if (this.data.total.allCart[0].skuList[0].selfTaking == 1) {
      const info = this.data.total.allCart[0].skuList[0];
      let hpid = info.heatingPointId;
      let date = info.date;
      let category = info.category;
      // 查询当前当热点信息
      const hpidInfo = await this.queryInfo(hpid)
      if (hpidInfo.selfTaking == 1) {
        //自取切换成配送
        await this.switchLogisticsWay(date, category, hpid)
        wx.navigateTo({
          url: `/pages/packageOrder/submit/submit?from=menu&spellOrder=true&code=${this.data.code}`,
        });
      } else {
        wx.showToast({
          title: '拼单不支持自取，请选择收货地址',
          icon: 'none',
        });
      }
    } else {
      wx.navigateTo({
        url: `/pages/packageOrder/submit/submit?from=menu&spellOrder=true&code=${this.data.code}`,
      });
    }
  },

  // 查询当前加热点信息
  queryInfo(id) {
    const currentAddress = this.currentAddress;
    const defAddress = this.defAddress;
    return apiRequest.heatingPointListForRange({
      userLat: currentAddress && currentAddress.location.lat || (defAddress && defAddress.lat),
      userLng: currentAddress && currentAddress.location.lng || (defAddress && defAddress.lon),
      showAll: false,
      showScope: false,
      showInfo: true,
      key: 'queryInfo',
      hpId: id,
    }).then((res) => {
      return res.obj.dtos[0]
    })
  },

  switchLogisticsWay(date, category, hpid) {
    return apiRequest.switchLogisticsWay({
      addressId: 0,
      dateTime: date,
      category: [category],
      hpid: hpid,
      orderMethod: '01',
      selfTaking: 0,
      shipTimes: '00',
      shipType: '00', // 把自取切配送
      allStt: true,
      apiFrom: '01',
    }).then((res) => {

    })
  },


  // 拼组
  spellGroup() {
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=menu&spellGroup=true&code=${this.data.code}`,
    });
  },

  // // 拼单
  // spell() {
  //   this.setData({
  //     showCart: false
  //   })
  //   if (this.data.total.allCart[0].skuList[0].selfTaking == 1) {
  //     wx.showToast({
  //       title: '拼单不支持自取，请选择收货地址',
  //       icon: 'none',
  //     });
  //     return
  //   }
  //   wx.navigateTo({
  //     url: `/pages/packageOrder/submit/submit?from=menu&spellOrder=true`,
  //   });
  // },
  adjust() {
    let {
      tabIndex,
      recomList,
      recomIndex,
      list,
      mealIndex,
    } = this.data;
    setStorage('toPlanDate', tabIndex == 0 ? recomList[recomIndex].date : list[mealIndex].date)
    wx.navigateTo({
      url: '/pages/packageOrder/plan/plan',
    });
  },

  // 获取用户目标（已过）
  queryUserTarget() {
    return apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            planningType: res.obj.healthGoal.planningType
          }, () => {
            this.categoryDefault()
          })
        }
      })
  },
  // 跳转方案
  toPlan() {
    const {
      planningType
    } = this.data;
    console.log(planningType, 'planningType')
    // 控制血糖 04
    switch (planningType) {
      case '01': // 减脂减重 01
        wx.navigateTo({
          url: '/pages/packageDiscover/schemeLibrary/schemeLibrary',
        });
        break;
      case '02': // 增肌增重 02
        wx.navigateTo({
          url: '/pages/packageDiscover/schemeLibrary/schemeLibrary?index=1',
        });
        break;
      case '03': // 保持体型 03
      case '10': // 营养均衡 10
        wx.navigateTo({
          url: '/pages/packageDiscover/planSet/planSet',
        });
        break;
    }
  },
  // 查询账户卡券
  queryCoupon: function (params) {
    var that = this;
    apiRequest.queryCouponList()
      .then(res => {
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : [];
        if (params == 'manual') {
          this.showCouponDialog(couponUserVos)
          return
        }
        this.setData({
          couponUserVos: couponUserVos,
          showShre: true,
        })
      })
      .catch(error => {

      })
  },

  // 查询可用卡券
  queryCanUseCoupon() {
    const dayDialog = wx.getStorageSync('dayDialog') || '';
    if (!dayDialog || dayDialog != day().format('YYYY/MM/DD')) {
      this.setData({
        showDayDialog: true
      })
      wx.setStorageSync('dayDialog', day().format('YYYY/MM/DD'));
    }
    if (this.data.showDayDialog) {
      apiRequest.queryCouponList({

      }).then((res) => {
        let couponList = res.obj.couponUserVos || [];
        let currentDate = new Date().getTime();
        couponList = couponList.filter((item) => {
          return item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime;
        });
        couponList.forEach((item) => {
          item.eTime = day(Number(item.tcuEtime)).format('YYYY.MM.DD HH:mm');
        })
        let couponAllPrice = couponList.reduce((price, item) => (price + (+item.tcuAmount)), 0)
        this.setData({
          couponList,
          couponAllPrice,
        })
      })
    }
  },

  closeCoupon() {
    this.setData({
      showDayDialog: false,
    })
  },
  getFl() {
    // 去福利社
    wx.switchTab({
      url: '/pages/welfare/welfare',
    });
    this.closeCoupon();
  },
  /*翻转卡片 */
  rotateFn() {
    this.animation_main = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    this.animation_back = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    this.animation_main.rotateY(180).step()
    this.animation_back.rotateY(0).step()
    this.setData({
      animationMain: this.animation_main.export(),
      animationBack: this.animation_back.export(),
    })
  },

  // 切换账号
  switchAccount() {
    if (this.data.subUserInfoList.length == 0) {
      return
    }
    this.setData({
      showAccount: !this.data.showAccount
    })
  },

  // 选择主账户
  selectMain() {
    let subInfo = this.data.subInfo;
    if (!subInfo.tsuSubUid) {
      // 已选中当前主账户不执行
      return
    }
    this.setData({
      showDialog: true, //显示是否切换弹窗
      mainAccount: true, //是否选了主账户
      showAccount: false, //隐藏切换账户弹窗
    })
  },

  // 切换子账户
  sureSwitch(e) {
    let index = e.currentTarget.dataset.index;
    let {
      subUserInfoList,
      subInfo
    } = this.data;
    let tsuSubUid = subUserInfoList[index].tsuSubUid;
    if (tsuSubUid == subInfo.tsuSubUid) {
      // 已选中当前子账户不执行
      return
    }
    this.setData({
      showDialog: true,
      selectAccountIndex: index, //子账户下标
      mainAccount: false,
      showAccount: false,
    })
  },

  targetConfirmDialog() {
    let {
      mainAccount,
      selectAccountIndex,
      subUserInfoList
    } = this.data;
    if (mainAccount) {
      removeStorage('subToken');
      removeStorage('subInfo');
      // 重新请求数据
      this.updatetime();
      this.setData({
        subInfo: {},
        showDialog: false,
        subToken: '',
      })
    } else {
      let subToken = subUserInfoList[selectAccountIndex].subToken;
      let subInfo = subUserInfoList[selectAccountIndex];
      setStorage('subToken', subToken).then(() => {
        // 重新请求数据
        this.updatetime();
      })
      setStorage('subInfo', subInfo)
      this.setData({
        subInfo,
        showDialog: false,
        subToken,
      })
    }
    wx.showToast({
      title: mainAccount ? '已切换为主账户' : '已切换为子账户',
      image: '/images/my/success.png',
      duration: 1500
    });
  },

  toHealth() {
    if (!this.data.total || !this.data.total.nutritionHealthScore) {
      return
    }
    const subInfo = this.data.subInfo;
    const allCart = this.data.total.allCart;
    const {
      mealIndex,
      list
    } = this.data;
    const category = list[mealIndex].categoryType;
    const orderDate = list[mealIndex].date;
    const dateObj = allCart.find(item => item.date == day(orderDate).format('YYYYMMDD'));
    const skuList = dateObj.skuList;
    let cidList = {};
    skuList.forEach((item) => {
      if (category == item.category) {
        cidList[item.cid] = item.num;
      }
    })

    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || this.data.uid,
          payFlag: false,
          category,
          orderDate: day(orderDate).format('YYYYMMDD'),
          cidList,
        }]
      })
      .then(res => {
        if (res.errCode === 0) {
          const {
            nutritionHealthScoreForms: scoreForms,
            info
          } = res.obj;
          console.log(scoreForms)
          this.setData({
            scoreForms: scoreForms[0],
            humanInfoWithScore: info
          })
          wx.navigateTo({
            url: `/pages/packageOrder/healthScore/healthScore?page=index`
          })
        }
      })
  },

  // 偏好设置
  habit() {
    wx.navigateTo({
      url: '/pages/packageOrder/preference/preference',
      success: (result) => {
        this.setData({
          disableUpdateRecom: true,
        })
      },
      fail: () => {},
      complete: () => {}
    });
  },

  // 多餐优惠
  buyMeal(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/packageOrder/moreMealDetail/moreMealDetail?id=${id}`,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
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
  onShareAppMessage: function (e) {
    const idx = (Math.random() * 3) | 0;
    const userInfo = wx.getStorageSync('userInfo');
    let headImgUrl = userInfo.headImgUrl || userInfo.avatarUrl;
    let uid = this.data.uid;
    if (e.from == "button" && e.target.dataset.type == 'openbox') {
      saveUseLog('02', this.data.discoverDialogs.id, '02');
      return {
        title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
        imageUrl: 'https://prodstatic.weis1606.cn/api/market/sharebox.png',
        path: `/pages/activity/openBox/index?iuInvitedUid=${uid}&boxtype=share&scene=0717&shareimg=${headImgUrl}&invite=${uid}`,
      }
    } else if (e.target.dataset.type == 'double11') {
      setTimeout(() => {
        this._animation.rotateY(0).step({
          duration: 0
        })
        this.setData({
          amData: this._animation.export(),
          invited: true, // 是否有邀请好友
          hbOpened: false
        })
      }, 1000)
      return {
        title: '快来一起开双十一红包吧～',
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/share_double_11.png',
        path: '/pages/index/index?isDouble11=true'
      }
    } else {
      return {
        title: '维士小盒饭',
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/share.png',
      }
    }
  }

})