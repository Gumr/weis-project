// pages/index/index.js
import {
  isLoginClick,
  loginPromise,
  t,
  confObj,
  round,
} from '../../../utils/common'
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
const location = require('../../../libs/location.js');
import apiRequest from '../../../service/index';
import {
  debounce,
  throttle
} from '../../../utils/throttle';
import day from '../../../libs/day'
var utils = require('../../../utils/week-utils.js');
import {
  categoryMap,distributionMode, mealType
} from '../../../utils/map'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    distributionMode,
    isIpx: app.globalData.isIpx,
    categoryMap,
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    px2rpx: app.globalData.px2rpx,
    // isVip: wx.getStorageSync('isVip') || false,
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
    cart: {
      '00': '全部',
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
    mealText: {
      '01': '早',
      '02': '午',
      '03': '晚',
    },
    mealIndex: 0,
    list: [],
    // spellTip: true,
    spellGroupTip: true,
    // 套餐推荐 单品自选
    tab: [
      {
        name: '套餐推荐'
      },
      {
        name: '单品自选'
      },
    ],
    tabIndex: 0,
    pageNo: -1,
    more: true,
    recomMealList: [],
    requestComplete: true,
    mealType,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let theme = 'pillars' || wx.getStorageSync('theme') || 'simple';
    this.setData({
      theme, 
    });
    loginPromise.then( async (res) => {
      // 从支付成功后点击“邀请好友拼单”传以下参数
      this.setData({
        spellOrder: options.spellOrder || '',
        spellGroup: options.spellGroup || '',
        confObj,
        corpId: options.corpId > 0 ? options.corpId : '',
        tgcaId: options.tgcaId > 0 ? options.tgcaId : '',
        mergeCode: options.mergeCode || '',
        date: options.date || '',
        category: options.category || '',
        dateTime: day(options.date).format('MM月DD日'),
        curUid: res.uid,
        subInfo: getStorage('subInfo') || {},
      })
      // -------拼组---------
      if(this.data.spellGroup){
        // 查询默认地址
        await this.queryAddress();
        if (this.defAddress) {
          // 查询地址匹配加热点
          await this.matchHpid(this.defAddress.lat, this.defAddress.lon, this.defAddress, );
          // 切换购物车商品到该加热点
          await this.cutShopCatHpid(this.defAddress);
          //  查询时间
          this.queryDate(this.defAddress);
        } else {
          // 没默认地址 查询当前用户位置
          await this.queryLocation()
          // console.log(this.currentAddress)
          // 查询地址匹配加热点
          await this.matchHpid(this.currentAddress.location.lat, this.currentAddress.location.lng, this.currentAddress);
          await this.cutShopCatHpid();
          this.queryDate(this.currentAddress);
        }
      }
      // ------------------
      // 普通拼单
      if (this.data.corpId <= 0 || !this.data.corpId) {
        await this.queryMergeTeamDetail();
        await this.clean();
        this.queryDietBanner()
        this.getMenu();
        this.getSetMealType()
        // this.requestRecom()
      }else{
        // 企业团餐
        await this.checkUserCorrespondGroup();
        if(this.data.type == '00'){
          // 不在企业名单中
          this.setData({
            corpId: '',
            tgcaId: '',
            tgeRole: ''
          })
        }
        await this.queryMergeTeamDetail();
        this.data.corpId ? await this.cleanCartByDateAndCategory() : await this.clean();
        this.queryDietBanner()
        this.getMenu();
        this.getSetMealType()
        // this.requestRecom()
      }
      if(day(options.date) >= day(day().add(2, 'day').format('YYYY/MM/DD'))){
        wx.showModal({
          title: '温馨提示',
          content: `该拼单是预定${day(options.date).format('MM月DD日')}${this.data.cart[options.category]}`,
          confirmText: '知道了',
          confirmColor: '#FE5E0F',
          showCancel: false,
          success: function (res) {
       
          }
        }) 
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    loginPromise.then((res) => {
      const loginInfo = getStorage('loginInfo');
      const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
      this.setData({
        loginInfo,
        isLogin,
        subToken: getStorage("subToken") || '',
      })
      this.queryUserTarget();
    })
    this.load ? this.getMenu() : ''
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then(()=>{
      this.calculat();
      this.load = true;
    })
  },

  queryDietBanner() {
    let {spellGroup, matchHpid, spellInfo} = this.data;
    return apiRequest.queryDiscoverCarousel({
      type: '02',
      hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
    }).then((res) => {
      this.setData({
        dietBanners: res.obj && res.obj.discoverCarousels || []
      })
    })
  },
  // ----------------推荐套餐改版-------------------
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
  initPageIndex(){
    this.setData({
      scrollRecomTop: 0,
      pageNo: -1,
      more: true,
      recomMealList: [],
    })
  },
  //套餐推荐-目录列表
  getSetMealType() {
    apiRequest.getSetMealType().then((res) => {
      if(res.errCode == 0){
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
    let { index, code, pagesize, } = e.currentTarget.dataset;
    this.setData({
      leftIndex2: index,
      code,
      pagesize,
    })
    this.initPageIndex();
    this.requestRecom()
  },
  //套餐推荐-获取套餐
  requestRecom(skuFilters, refreshStt){
    const { spellGroup, matchHpid, spellInfo, more, requestComplete} = this.data;
    if(!more){
      return
    }
    // if(!more || !requestComplete){
    //   return
    // }
    this.setData({
      requestComplete: false, 
    })
    this.data.pageNo++
    const defAddress = this.defAddress; 
    apiRequest.getSetMealByType({
      userLat: defAddress && defAddress.lat,
      userLng: defAddress && defAddress.lon,
      code: this.data.code, // 套餐推荐的目录code
      dateTime: spellInfo.waybillRecord.expectDate,
      category: spellInfo.category,
      hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
      addressId: spellInfo.waybillRecord.receivingId,
      shopType: '10',
      pageNum: this.data.pageNo,
      pageSize: 10,
      locationType: '01',
      refreshStt: skuFilters && Array.isArray(skuFilters) || refreshStt ? true : false,
      skuFilters: skuFilters && Array.isArray(skuFilters) ? skuFilters : undefined,
    }).then((res)=>{
      if(res.errCode == 0){
        const dietSetMeals = res.obj && res.obj.dietSetMeals || [];
        let recomMealList = this.data.recomMealList || [];
        dietSetMeals.forEach((item,index)=>{
          item.allNum = item.setMealDateils.reduce((num, im) => (num + im.num), 0)
          if(recomMealList.length > 0){
            recomMealList = recomMealList.concat(item)
          }else{
            recomMealList.push(item)
          }
        })
        this.setData({
          recomMealList,
        })
        if(dietSetMeals.length == 0){
          this.setData({
            more: false,
          })
        }
      }
      setTimeout(()=>{
        this.setData({
          requestComplete: true, 
        })
      },300)
    }).catch((res)=>{
      this.setData({
        requestComplete: true,
        recomMealList: '',
      })
      // errMsg request:fail timeout
      console.log(res)
    })
  },
  // requestRecom(){
  //   const { spellGroup, matchHpid, spellInfo, more, requestComplete} = this.data;
  //   if(!more || !requestComplete){
  //     return
  //   }
  //   this.setData({
  //     requestComplete: false, 
  //   })
  //   this.data.pageNo++
  //   apiRequest.getGenerateSingleMeal({
  //     dateTime: spellInfo.waybillRecord.expectDate,
  //     category: spellInfo.category,
  //     hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
  //     addressId: spellInfo.waybillRecord.receivingId,
  //     shopType: '10',
  //     pageNum: this.data.pageNo,
  //     pageSize: 10,
  //     locationType: '01',
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
  // 选套餐推荐 单品自选
  tabType(e){
    const index = e.currentTarget.dataset.index;
    const {tabIndex,} = this.data;
    if(index == tabIndex){
      return
    }
    wx.vibrateShort({});
    this.setData({
      tabIndex: index,
    })
  },

  checkUserCorrespondGroup(){
    return apiRequest.checkUserCorrespondGroup({
      corpId: this.data.corpId
    }).then((res)=>{
      this.setData({
        tgeRole: res.obj.resGroupEmployee.tgeRole,
        type: res.obj.type
      })
    })
  },

  // 查询拼单信息
  queryMergeTeamDetail() {
    return apiRequest.queryMergeTeamDetail({
      shipOid: this.data.mergeCode
    }).then((res) => {
      let spellInfo = res.obj;
      spellInfo.mergeTeamInfo.dietOrderMergeDetails = spellInfo.mergeTeamInfo.dietOrderMergeDetails.filter((item) => {
        return item.stt == '10'
      })
      spellInfo.num = spellInfo.mergeTeamInfo.dietOrderMergeDetails.length;
      this.setData({
        endTime: day(res.obj.mergeTeamInfo.dietOrderMerge.endTime).format('MM月DD日 HH:mm'),
        spellOrderStatus: day() < day(res.obj.mergeTeamInfo.dietOrderMerge.endTime), //true 未结束 false 已结束
        spellInfo,
      })
    })
  },

  cleanCartByDateAndCategory: function () {
   return apiRequest.cleanCartByDateAndCategory({
      dateList: [day(this.data.date).format('YYYYMMDD')],
      categoryList: [this.data.category],
      hpid: this.data.spellGroup? this.data.matchHpid.hpId : this.data.spellInfo.waybillRecord.heatingPoint,
      orderMethod: '02',
      corpId: this.data.corpId
    })
      .then(res => {
       
      })
      .catch(error => {

      })
  },

  clean(){
    return apiRequest.addShoppingCart({
      code: this.data.code, // 套餐推荐的目录code
      category: 'all',
      orderMethod: '01',
      dataStt: '99',
      version: '01'
    }).then(()=>{

    })
  },

  // 去点餐
  order() {
    wx.switchTab({
      url: '/pages/index/index',
    });
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
  // 获取设备高度（已过）
  calculat: function () {
    // 减去状态栏高度 减去上部高度
    let mobileInfo = wx.getSystemInfoSync();
    let {
      px2rpx,
      isLogin,
      navStatusHeight,
      theme
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - t(510) - navStatusHeight) * px2rpx;
    let mealHeight = (mobileInfo.windowHeight - t(isLogin ? 280 : 226) - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight,
      mealHeight
    })
  },

  // 换一换
  change() {
    this.getMenu('change');
  },

  // 获取菜品列表（已过）
  getMenu: function (type) {
    let {
      spellGroup,
      matchHpid,
      spellInfo,
      isLogin,
      date
    } = this.data;
    apiRequest.querySaleGoodsForThree({
        dateTime: spellInfo.waybillRecord.expectDate,
        category: spellInfo.category,
        indexRules: 'intakeCategory',
        orderMethod: '01',
        hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
        addressId: spellInfo.waybillRecord.receivingId,
        version: "01",
        tagList: this.data.tagList || undefined,
        corpId: this.data.corpId || undefined,
        isLogin: true,
        refreshStt: type == 'change' ? true : false,
      })
      .then(res => {
        let resultList = res.obj.resultList;
        let isCheck = day(date) <= day(day().format('YYYY/MM/DD')) || (String(date) == day().add(1, 'day').format('YYYY/MM/DD') && day() > day(`${day().format('YYYY/MM/DD')} ${this.data.confObj.orderTimeLimit}`));

        resultList.forEach((item1, index1) => {
          item1.detailList && item1.detailList.forEach((item2, index2) => {
            // 添加换行符
            if(item1.lineBreakPosition > 0){
              const skuCatalog = item1.skuCatalog;
              const skuCatalogArr = skuCatalog.split('');
              skuCatalogArr.splice(item1.lineBreakPosition,0,'\n');
              item1.skuKind = skuCatalogArr.join('');
            }else{
              item1.skuKind = item1.skuCatalog;
            }
            // 判断是否校验库存
            item2.checkStock = isCheck
            if (Array.isArray(item2.dietaryIntakes)) {
              item2.dietaryIntakes = item2.dietaryIntakes.filter(label => label.type === '02')
            } else if (Array.isArray(item2.dietLabelList)) {
              item2.dietLabelList = item2.dietLabelList.filter(label => label.type === '02')
            }
            if (item2.type == '01') {
              item2.cid = item2.id;
              item2.packageForm = item2.setMealDateils.map(main => main.name).join('+');
            }
          })
        })
        // 筛选标签
        if (!this.data.labelsTag) {
          this.querySaleGoodsDietaryIntake().then((res)=>{
            this.getFoodLabel(res.obj.flavor || [], res.obj.dietaryIntakes || [], res.obj.notLike || [])
          });
        }
        this.setData({
          nameList: resultList,
          ageType: res.obj.ageType,
        }, () => {
          this.countKindNum();
          if (type == 'change') {
            return
          }
          this.allPrice();
        })
      })
      .catch(error => {

      })
  },

  // 统计菜单分类下菜品数量
  countKindNum(){
    let nameList = this.data.nameList;
    nameList.forEach((item)=>{
      if(item.skuCatalog !== '我的最爱' && item.skuCatalog !== '新品'){
        item.num = item.detailList.reduce((c, im) => (im.type ? c + 0 : c + im.num), 0) //type存在套餐
      }
    })
    this.setData({
      nameList
    })
  },

  querySaleGoodsDietaryIntake(){
    return apiRequest.querySaleGoodsDietaryIntake({

    }).then((res)=>{
       return res
    })
  },


  allPrice: function () {
    var that = this;
    let {
      spellInfo,
    } = that.data;
    apiRequest.queryShoppingCartCount({
        orderMethod: '01',
        dateTime: spellInfo.waybillRecord.expectDate,
        category: spellInfo.category,
        corpId: this.data.corpId,
      })
      .then(res => {
        if (res.errCode == '0') {
          // g 转化 kcal 蛋白质 碳水 *4  脂肪*9
          let total = res.obj;
          total.totalPrice = round(total.totalPrice, 2);
          // total.energyPercent = round((total.energySupply / total.totalEnergy) * 100, 0);
          // total.saltPercent = round((total.saltSupply / total.totalSalt) * 100, 0); //盐量
          // total.totalProteinPercent = round((total.proteinSupply / total.totalProtein) * 100, 0)
          // total.totalCarbonwaterPercent = round((total.carbonwaterSupply / total.totalCarbonwater) * 100, 0)
          // total.totalFatKcalPercent = round((total.fatSupply / total.totalFat) * 100, 0);
          total.discount = round((total.totalOriginalPrice - total.totalPrice), 2);

          let dialData = {
            totalCarbonwater: total.totalCarbonwater,//计划碳水
            carbonwaterSupply: total.carbonwaterSupply,//实际碳水
            totalProtein: total.totalProtein,//计划蛋白质
            proteinSupply: total.proteinSupply,//实际蛋白质
            totalFat: total.totalFat,//计划脂肪
            fatSupply: total.fatSupply,//实际脂肪
            totalEnergy: total.totalEnergy,//计划能量
            energySupply: total.energySupply,//实际能量
            totalSalt: total.totalSalt,//计划盐量
            saltSupply: total.saltSupply,//实际盐量
            foodTypeNum: total.foodTypeNum || 0,//食物多样性
            totalDiversity: total.totalDiversity || 0,//计划食物多样性
            totalFiber: total.totalFiber || 0,//膳食纤维
            fiberSupply: total.fiberSupply || 0,//实际膳食纤维
            nutritionHealthScore: total.nutritionHealthScore || 0,//健康分
          };
          Object.keys(dialData).forEach((key) => {
            dialData[key] = Number(dialData[key])
           })

          that.setData({
            total,
            dialData
          })
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
        if (!that.data.hideLoad) {
          that.setData({
            hideLoad: true,
          })
          setTimeout(()=>{
            that.setData({
              spellTip: true
            })
          },800)
        }
      })
      .catch(error => {

      })
  },

  // 滚动菜品联动菜单（已过）
  scroll: throttle(100, function (e) {
    let that = this;
    let {
      navStatusHeight,
      theme
    } = that.data;
    let wrapTop = t(510) + navStatusHeight;
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
      type,
      groupcomboid
    } = e.currentTarget.dataset;
    let {
      spellGroup,
      matchHpid,
      spellInfo,
      shipType,
      corpId,
      tabIndex,
      recomMealList,
    } = that.data;
    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        cid: cid,
        dateTime: spellInfo.waybillRecord.expectDate,
        category: spellInfo.category,
        orderMethod: '01',
        num: type == 'add' ? 1 : -1,
        selfTaking: 0,
        // addressId: spellInfo.waybillRecord.receivingId,
        hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
        type: combo,
        version: '01',
        comboId: comboid ? comboid : 0,
        shipType: spellInfo.waybillRecord.shipWithCold,
        corpId: corpId,
        groupComboId: groupcomboid
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
          let nameList = that.data.nameList;
          type == 'add' ? (tabIndex == 0 ? recomMealList[index].num++ : nameList[wrapindex].detailList[index].num++) : (tabIndex == 0 ? recomMealList[index].num-- : nameList[wrapindex].detailList[index].num--);
          // type == 'add' ? (tabIndex == 0 ? recomMealList[wrapindex].dietSetMeals[index].num++ : nameList[wrapindex].detailList[index].num++) : (tabIndex == 0 ? recomMealList[wrapindex].dietSetMeals[index].num-- : nameList[wrapindex].detailList[index].num--);
          if(tabIndex == 0){
            that.setData({
              recomMealList,
              scale: true
            })
          }else{
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
     date,
      showCart,
      corpId
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
        dateTime: day(date).format('YYYYMMDD'),
        corpId: corpId
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
      cid,
      groupcomboid
    } = e.currentTarget.dataset;
    let {
      spellGroup,
      matchHpid,
      allCart,
      date,
      corpId,
      spellInfo
    } = this.data;
    let categoryType = this.data.category;//当前餐别
    let dateTime = allCart[index1].date;
    let skuInfo = allCart[index1].categoryCart[index2].list[index3];

    apiRequest.addShoppingCart({
        code: this.data.code, // 套餐推荐的目录code
        cid: cid,
        dateTime: spellInfo.waybillRecord.expectDate,
        category: spellInfo.category,
        orderMethod: '01',
        num: type == 'reduce' ? -1 : 1,
        selfTaking: 0,
        hpid: spellGroup? matchHpid.hpId : spellInfo.heatingPoint.id,
        version: '01',
        comboId: 0,
        type: combo,
        corpId: corpId,
        groupComboId: groupcomboid
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
          if (day(date).format('YYYYMMDD') == dateTime && categoryType == category) {
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
        version: '01',
        corpId: this.data.corpId
      })
      .then(res => {
        if (res.obj.stt) {
          that.getMenu();
          that.clearRecomNum()
          that.setData({
            showCart: false,
          }, () => {
            wx.showToast({
              title: '购物车已清空',
              icon: 'none',
            });
          })
        }
      })
      .catch(error => {

      })
  },

  // 套餐中已选状态更改
  clearRecomNum(){
    let recomMealList = this.data.recomMealList;
    recomMealList.forEach((item)=>{
      item.num = 0
    })
    this.setData({
      recomMealList
    })
  },
  // // 套餐中已选状态更改
  // clearRecomNum(){
  //   let recomMealList = this.data.recomMealList;
  //   recomMealList.forEach((item)=>{
  //     item.dietSetMeals.forEach((item2)=>{
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
      id,
      combo,
      comboid,
      forbid,
      cid,
      groupcomboid
    } = e.currentTarget.dataset;
    let {
      ageType,
      date,
      category,spellInfo,
      spellOrder,
      spellGroup,
    } = that.data;
    if (combo == '00' && forbid) {
      return
    }
    let obj = {
      code: this.data.code, // 套餐推荐的目录code
      id: id,
      orderMethod: '01',
      category: category,
      dateTime: day(date).format('YYYYMMDD'),
      deliveryIndex:0,
      heatId: spellInfo.waybillRecord.heatingPoint,
      combo: combo,
      comboid: comboid || 0,
      shipType: spellInfo.waybillRecord.shipWithCold,
      cid: cid,
      corpId: this.data.corpId,
      groupcomboid: groupcomboid,
      tgcaId: this.data.tgcaId,
      tgeRole: this.data.tgeRole,
      ageType: ageType || '',
      mergeCode: this.data.mergeCode,
    }
    if(spellOrder){
      obj.spellOrder = true;
    }else if(spellGroup){
      obj.spellGroup = true;
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`,
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          dialData: this.data.dialData
        });
      },
    });
  },

  // 拼单
  async spell() {
    // 是否可以拼单（菜品原价 >= 20元时才可以拼单）
    if(this.data.total.totalOriginalPrice < 20) {
      wx.showToast({
        title: '购物车中菜品原价大于等于20元才可参与拼单',
        icon: 'none',
      });
      return;
    }
    if(this.data.showCart){
      this.setData({
        showCart: false
      })
    }
    // 判断是否显示更换菜品弹窗
    await this.judgeChangeSku();
    if(this.data.isChangeSkuInfo.showTip && !this.data.hideReplace){
      return
    }
    let {
      spellOrder,
      spellGroup,
      corpId,
      tgcaId,
      tgeRole,
      mergeCode
    } = this.data
    if(spellOrder) {
      wx.navigateTo({
        url: `/pages/packageOrder/submit/submit?spellOrder=true&from=${corpId ? 'groupMenu' : ''}&corpId=${corpId || ''}&tgcaId=${tgcaId || ''}&tgeRole=${tgeRole || ''}&mergeCode=${mergeCode}&code=${this.data.code}`,
      });
      return
    }
    if(spellGroup) {
      wx.navigateTo({
        url: `/pages/packageOrder/submit/submit?spellGroup=true&from=${corpId ? 'groupMenu' : ''}&corpId=${corpId || ''}&tgcaId=${tgcaId || ''}&tgeRole=${tgeRole || ''}&mergeCode=${mergeCode}&code=${this.data.code}`,
      });
    }
  },

  adjust() {
    let {
      date
    } = this.data;
    wx.navigateTo({
      url: `/pages/packageOrder/editData/editData?date=${date}`,
    });
  },

  // 获取用户目标（已过）
  queryUserTarget() {
    return apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            planningType: res.obj.healthGoal.planningType
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

    let {
      corpId,
      tgcaId,
    } = this.data
    wx.setStorageSync('corpId', corpId)
    wx.setStorageSync('tgcaId', tgcaId)
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
          url: '/pages/packageDiscover/eatMethodList/eatMethodList',
        });
        break;
    }
  },

  // 登录状态组件
  loginClick: isLoginClick(function () {

  }),

  
  check: isLoginClick(function(){
    this.setData({
      spellTip: !this.data.spellTip
    })
  }),

  checkInfo(){
    this.setData({
      spellTip: false,
      showSpell: !this.data.showSpell
    })
  },
  // --------------------------------
  // 拼组-查看详情
  spellGroupCheck: isLoginClick(function(){
    this.setData({
      spellGroupTip: !this.data.spellGroupTip
    })
  }),
  // 拼组-更多
  spellGroupMore() {
    let { spellInfo } = this.data;
    wx.navigateTo({
      url: `/pages/mineBox/spellGroupList/spellGroupList?list=${JSON.stringify(spellInfo.mergeTeamInfo.dietOrderMergeDetails)}`,
    });
  },
  // --------------------
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
          that.load = false; //不运行onShow逻辑的getMenu方法（下方已调用，不重复调用）
          that.defAddress = data.data;
          // 查询地址匹配加热点
          await that.matchHpid(that.defAddress.lat, that.defAddress.lon, that.defAddress);
          await that.getMenu()
          // 切换购物车商品到该加热点
          await that.cutShopCatHpid(that.defAddress);
          //  查询时间
          that.queryDate(that.defAddress);
        },
        // 切换定位地址
        switchLocation: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          that.load = false; //不运行onShow逻辑的getMenu方法（下方已调用，不重复调用）
          let address = data.data;
          // address.detail = address.title;
          address.id = '';
          that.currentAddress = address;
          await that.matchHpid(that.currentAddress.location.lat, that.currentAddress.location.lng, that.currentAddress);
          await that.getMenu()
          await that.cutShopCatHpid();
          that.queryDate(that.currentAddress);
        },
        // 切换加热点
        switchhpid: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          that.setData({
            matchHpid: data.data,
            outRange: false,
          })
          await that.cutShopCatHpid();
          that.queryDate();
        },
      },
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据 shopType 10 门店 20 机器
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          index: list[mealIndex].addressName ? 0 : (!matchHpid.shopType || matchHpid.shopType == '10') ? 1 : 2,
        });
      },
      fail: () => {},
      complete: () => {}
    });

  }),
  
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
      userAddr: address.title ? `${address.address}` : `${address.province}${address.city}${address.area}${address.detail}`
    }).then((res) => {
      let dtos = res.obj.dtos;
      // 超出配送范围
      let outRange = true;
      for(let i = 0; i < dtos.length; i++){
        if(dtos[i].hotFlag || dtos[i].coldFlag){
          outRange = false;
          break;
        }
      }
      this.setData({
        matchHpid: res.obj.dtos[0],
        outRange,
      })
    })
  },

  // 购物车里的商品切换为当前加热点
  cutShopCatHpid(address) {
    // console.log(address)
    let matchHpid = this.data.matchHpid;
    return apiRequest.switchShopCatHpid({
      hpid: matchHpid.hpId,
      selfTaking: matchHpid.hotFlag || matchHpid.coldFlag || matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? 0 : 1,
      addressId: (address && address.id) || 0,
      shipType: matchHpid.hotFlag ? '00' : (matchHpid.coldFlag ? '01' : (matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? '00' : '02')),
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
    }).then((res) => {
      // console.log(address)
      let list = res.obj.resultDateList;
      setStorage('orderDateList', JSON.parse(JSON.stringify(res.obj.resultDateList)));
      list.forEach((item, idx) => {
        item.date = day(item.date).format('YYYY/MM/DD');
        item.month = day(item.date).format('MM');
        item.day = day(item.date).format('DD');
        if (matchHpid) {
          item.hpid = matchHpid.hpId;
          item.hpName = matchHpid.hpName;
          item.selfTaking = matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? 0 : 1;
          item.shipType = matchHpid.hotFlag ? '00' : (matchHpid.coldFlag ? '01' : (matchHpid.selfTaking == 0 || matchHpid.selfTaking == 1 ? '00' : '02'));
          item.addressId = address && address.id || 0;
          item.addressName = (address && (address.detail || address.title)) || ''
        }
      })
      this.setData({
        list
      })
      // this.requestMenu()
    })
  },
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
          resolve();
        }, 'address')
      }
    })
  },


  toHealth() {
    if(!this.data.total || !this.data.total.nutritionHealthScore){
      return
    }
    const spellInfo = this.data.spellInfo;
    const subInfo = this.data.subInfo;
    const allCart = this.data.total.allCart;
    const category = spellInfo.category;
    const orderDate = spellInfo.waybillRecord.expectDate;
    const dateObj = allCart.find(item => item.date == day(orderDate).format('YYYYMMDD'));
    const skuList = dateObj.skuList;
    let cidList = {};
    skuList.forEach((item)=>{
      if(category == item.category){
        cidList[item.cid] = item.num;
      }
    })

    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || this.data.curUid,
          payFlag: false,
          category,
          orderDate: day(orderDate).format('YYYYMMDD'),
          cidList,
        }]
      })
      .then(res => {
        if(res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms, info} = res.obj;
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

  judgeChangeSku(){
    let nutritionHealthScore = this.data.total.nutritionHealthScore;//营养健康分
    let packageArr = this.data.nameList.filter((item) => {
      return item.skuCatalog == '推荐配餐';
    });//套餐
    let setMeal = packageArr.length > 0 && packageArr[0].detailList || [];//推荐套餐
    if(nutritionHealthScore > 0 && nutritionHealthScore < 80 && setMeal.length > 0 && !this.data.hideReplace){//加热点类型 小于80分 有套餐更换
      const {spellInfo:{category,waybillRecord:{expectDate}}, subInfo, total:{allCart, }, curUid} = this.data;
      const skuList = allCart.find(item => item.date == day(expectDate).format('YYYYMMDD')).skuList;
      let cidList = {};
      skuList.forEach((item)=>{
        if(category == item.category){
          cidList[item.cid] = item.num;
        }
      })
      return apiRequest.intelligenceChangeGoods({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || curUid,
          payFlag: false,
          category,
          orderDate: day(expectDate).format('YYYYMMDD'),
          cidList,
        }]
      }).then((res)=>{
        if(res.errCode == 0){
          let isChangeSkuInfo = res.obj;
          if(isChangeSkuInfo.showTip){
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
        }else{
          this.setData({
            isChangeSkuInfo:{}
          })
        }
      })
    }else{
      return new Promise((reslove)=>{
        this.setData({
          isChangeSkuInfo:{}
        })
        reslove();
      })
    } 
  
  },

  changeSku(){
    let {setMeal, setMealIndex} = this.data;
    this.setData({
      setMealIndex: setMealIndex < setMeal.length - 1 ? setMealIndex+1 : 0,
    })
  },

  // 不再提醒更换菜品
  refuse(){
    this.setData({
      refuseTip: !this.data.refuseTip
    })
  },

  // 关闭提醒弹窗
  closeChangeTip(){
    if(!this.data.refuseTip){
      this.setData({
        ['isChangeSkuInfo.showTip']: false,
        hideReplace: true,
      })
      this.spell();
    }else{
      apiRequest.replaceCateringShoppingCartGoods({
        code: this.data.code, // 套餐推荐的目录code
        showTip: false,
      }).then(()=>{
        this.setData({
          ['isChangeSkuInfo.showTip']: false,
          hideReplace: true,
        })
        this.spell();
      })
    }
  },

  // 更换菜品
  replaceSku(){
    let {setMeal,setMealIndex,refuseTip,spellInfo, spellGroup, matchHpid} = this.data;
    apiRequest.replaceCateringShoppingCartGoods({
      code: this.data.code, // 套餐推荐的目录code
      cid: setMeal[setMealIndex].id,
      dateTime: spellInfo.waybillRecord.expectDate,
      category: spellInfo.category,
      orderMethod: '01',
      selfTaking: 0,
      addressId: spellGroup ? this.defAddress && this.defAddress.id || 0 : spellInfo.waybillRecord.receivingId,
      hpid: spellGroup? matchHpid.hpId : spellInfo.waybillRecord.heatingPoint,
      shipType: spellInfo.waybillRecord.shipWithCold,
      showTip: !refuseTip,
    }).then((res)=>{
      this.setData({
        ['isChangeSkuInfo.showTip']: false
      })
      this.getMenu();
      if(res.errCode == 0){
        wx.showToast({
          title: '菜品更换成功',
          icon: 'success',
        }); 
      }
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
  onShareAppMessage: function (e) {
    let {
      spellOrder,
      spellGroup,
      spellInfo,
      categoryMap,
      mergeCode,
      tgcaId,
      corpId
    } = this.data;
    if(spellOrder) {
      return {
        title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，一起拼单免配送费，快上车吧！`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareImg.png',
        path: `/pages/mineBox/order/index?spellOrder=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
      }
    }
    if(spellGroup) {
      return {
        title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，越多人拼单返现越多，签收后立即返现到余额，快上车吧！`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/spellGroup_shareImg.png',
        path: `/pages/mineBox/order/index?spellGroup=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
      }
    }
  }

})