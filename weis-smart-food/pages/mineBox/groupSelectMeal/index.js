// pages/index/index.js
import {
  isLoginClick,
  loginPromise,
  t,
  confObj,
  round,
  judgeSubAccount,
} from '../../../utils/common'
import {
  getStorage,
  setStorage
} from '../../../utils/storage'
const location = require('../../../libs/location.js');
import apiRequest from '../../../service/index';
import {
  debounce,
  throttle
} from '../../../utils/throttle';
import day from '../../../libs/day'
var utils = require('../../../utils/week-utils.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minsel: false,
    subuidsList: [],//子账号数组

    selectNums: 0,
    showChild: false,//子账号弹窗
    showShre: false,//分享返利
    openbox: false, //锦鲤
    time: '',
    timeData: {},
    tcuEtime: null,
    IMG_URL: app.globalData.IMG_URL,
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
    subUserInfoList: [],
    all: false,
    allergy: [{
      name: '无过敏',
      value: '00'
    }, {
      name: '过敏',
      value: '01'
    }],
    allergyIndex: 0,
    ageList: [{
      name: '2-4岁',
      value: '00'
    }, {
      name: '5-6岁',
      value: '01'
    }],
    ageIndex: 0,
    subUserInfoListLength: 0,
    tgcType: '',
    tgeRole: '',
    dialData: {
      totalCarbonwater: 1,//计划碳水
      carbonwaterSupply: 0,//实际碳水
      totalProtein: 1,//计划蛋白质
      proteinSupply: 0,//实际蛋白质
      totalFat: 1,//计划脂肪
      fatSupply: 0,//实际脂肪
      totalEnergy: 1,//计划能量
      energySupply: 0,//实际能量
      totalSalt: 0,//计划盐量
      saltSupply: 0,//实际盐量
      foodTypeNum: 0,//食物多样性
      totalDiversity: 0,//计划食物多样性
      totalFiber: 0,//膳食纤维
      fiberSupply: 0,//实际膳食纤维
      nutritionHealthScore: 0,//健康分
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let theme = 'pillars' || wx.getStorageSync('theme') || 'simple';
    this.setData({
      theme, 
    });
    loginPromise.then((res) => {
      const navStatusHeight = getStorage('navStatusHeight');
      this.setData({
        navStatusHeight,
        confObj,
        tgcaId: options.tgcaId && options.tgcaId != "undefined" ? options.tgcaId : null,  // 地址id
        corpId: options.corpId, // 企业id 
        type:options.type,// 自定义地址
        subuidsList:options.subuidsList?options.subuidsList.split(","):[], // 选中的子账号
        tagList:options.tagList?JSON.parse(options.tagList) : {},// 选中的过敏原
        selchild:options.selchild|| false,
        isshowchild:options.isshowchild|| false,
        selectNums:options.subuidsList?options.subuidsList.split(",").length:0, // 选中的子账号数量
        selType:options.selType||undefined,// 01学生餐02老师餐
        subInfo: getStorage('subInfo') || {},
      })
      if (options.type =='userAdd') {
        this.queryAddress()

      } else {
        this.queryTimeList()
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
    loginPromise.then((res) => {
      const loginInfo = getStorage('loginInfo');
      const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
      this.setData({
        uid: res.uid,
        loginInfo,
        isLogin,
        showComponent: !(loginInfo.isAuthorized && loginInfo.isLogin),
        subToken: getStorage("subToken") || '',
      })
      this.calculat();
      if (isLogin) {
      this.queryUserTarget();
      
      }    
      if (this.yetLoad) {
        this.getMenu()
        this.queryTimeList()

      } else {
        this.yetLoad = true
      }

    })
  },


  // 切换加热点后 更新sku
  cleanCartByDateAndCategory: function () {
    let that = this;
    apiRequest.cleanCartByDateAndCategory({
      dateList: [utils.formatDate(new Date())],
      categoryList: [that.data.list[that.data.mealIndex].categoryType],
      hpid: that.data.hpid,
      orderMethod: '02',
      corpId: that.data.corpId
    })
      .then(res => {
        // debugger
        // let index = that.data.hpidIndex;
        // if (that.data.hpidList[index].selfTaking != 2) {
        //   that.matchingAddress(that.data.hpidList[index].id);
        // } else {
        //   that.getMenu();
        // }
        // let expiredCartList = res.obj && res.obj.expiredCartList ? res.obj.expiredCartList : [];
        // expiredCartList.forEach((item, index) => {
        //   item.dietLabelList = (item.dietLabelList || []).filter(label => label.type === '02')
        // })
        // that.setData({
        //   expiredCartList: expiredCartList
        // })
      })
      .catch(error => {

      })
  },
  queryTimeList() {
    apiRequest.queryBusinessSendTime({
      corpId: this.data.corpId,
      tgcaId: this.data.tgcaId
    })
      .then(res => {
        this.setData({
          tgcName:res.obj.groupCorp.tgcName
        })
        this.setData({
          groupCorp: res.obj.groupCorp,
          hpid: res.obj.groupCorp.corpAddress.tgcaHeatingPoint,
          hpname: res.obj.groupCorp.corpAddress.heatingPoint.name,
          tgcType: res.obj.groupCorp.tgcType,
        })
        this.queryGoodsDateList()
      })
  },

  getUserListForSubUser() {

    apiRequest.getUserListForSubUserForCorp({
      corpId: this.data.corpId,
      addressId: this.data.tgcaId,
      dateTime: day(this.data.list[this.data.mealIndex].date).format('YYYYMMDD'),
      category: this.data.list[this.data.mealIndex].categoryType,
    }).then((res) => {
      let subUserInfoList = res.obj.subUserInfoList;
      // let ss = [].slice.call(subUserInfoList)
      // debugger
      this.setData({
        minsel: res.obj.result,
        showChild: res.obj.result,
        subUserInfoList: subUserInfoList,
        showChild: res.obj.result,
        subUserInfoList: subUserInfoList,
        showChildtips: res.obj.result,
        selectNums: 0

      })
    })

  },
  closeclearCart() {
    this.setData({
      showChild: false
    })
  },
  // closeHpid() {
  //   this.setData({
  //     showHpid: false
  //   })
  // },

  closeshowShre() {
    this.setData({
      showShre: false
    })

  },

  // 选择加热点
  // selectHpid(e) {
  //   let index = e.currentTarget.dataset.index;
  //   this.setData({
  //     selectActiveIndex: index
  //   })
  // },

  // 登录状态组件
  loginClick: isLoginClick(function () {

  }),

  queryAddress() {
    let that = this;
    apiRequest.queryAddressListForThree({
      sortNum: '',
      dataStt: '',
    }).then((res) => {
      that.setData({
        addressList: res.obj.addressInfos || []
      })
      that.address = that.data.addressList.filter((item) => {
        return item.tuaDef == '1';
      });
      
      if (that.address.length > 0) {
        // 默认地址和上次不同 更新加热点
        if (that.addressId != that.address[0].id) {
          that.addressId = that.address[0].id;
          this.setData({
            hpname: that.address[0].detail,
          
          })
          that.queryHpidList(that.address[0].lat, that.address[0].lon, that.addressId)
        } else {
          // 查询日期 更新是否订餐
          that.queryGoodsDateList('', 'updateDateOrderStatus')
        }
      } else {
        if (that.getHpid) {
          this.queryGoodsDateList('', 'updateDateOrderStatus')
        } else {
          // 根据位置匹配加热点只运行一次
          that.addressId = 0;
          that.checkLat(function () {
            that.queryHpidList(app.globalData.lat, app.globalData.lon);
            that.getHpid = true
          })
        }
      }
    })
      .catch((error) => { });
  },

  //查询经纬度
  checkLat: function (callBack) {
    let that = this
    if (app.globalData.lat && app.globalData.lon) {
      location.locationMt(app.globalData.lat, app.globalData.lon, function (res) {   
        let address = res.result.pois[0] || {
          hpname:res.result.address,
        };     
        that.setData({
          hpname:address.title,
       
        })
      })

      callBack()
    } else {
      location.getCity(function (res) {
        callBack()
      })
    }
  },

  queryHpidList(lat, lon, addressId) {
    var that = this;
  
    apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      showAll: true,
      showScope: true
    })
      .then(res => {
      
        let hpidList = res.obj.dtos;
        this.setData({
          hpidList,
        })

        that.selectStore();

      })
      .catch(error => {

      })
  },



  //初始选择加热点 e? 手动切换: 初始切换
  selectStore: function (e) {
   
    let hpidList = this.data.hpidList;
    let index = 0;
    this.setData({
      hpid: e ? e.hpId : hpidList[0].hpId
    })
    // if (e) {
    //   // 切换加热点购物车切换到该加热点
    //   this.switchShopCatHpid(index)
    // }

    this.queryGoodsDateList(e)
  },

  switchShopCatHpid(seldata) {
    let {
      list,
      mealIndex,
      hpidList,
      corpId
    } = this.data;
    apiRequest.switchShopCatHpid({
      corpId:corpId,
      hpid:seldata.hpId,
      dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
      category: list[mealIndex].categoryType,
      selfTaking: seldata.hotFlag || seldata.coldFlag || seldata.selfTaking == 0 || seldata.selfTaking == 1 ? 0 : 1,
      addressId: seldata.addressId || 0,
      shipType: seldata.hotFlag ? '00' : (seldata.coldFlag ? '01' : (seldata.selfTaking == 0 || seldata.selfTaking == 1 ? '00' : '02')),
    }).then((res) => {

    })
  },

  /*选择有无过敏 */
  clickAllergy(e) {
    let { allergyIndex } = e.currentTarget.dataset
    this.setData({
      allergyIndex: allergyIndex
    })
  },
  /*选择年龄*/
  clickAge(e) {
    let { ageIndex } = e.currentTarget.dataset
    this.setData({
      ageIndex: ageIndex
    })

  },

  // 查询日期
  queryGoodsDateList(e, type) {
    // type参数 只是查询日期列表 更新日期是否订餐
    let {
      mealIndex,
      groupCorp,

    } = this.data;
    let addressList = this.data.addressList || [];
    let hpidList = this.data.hpidList || [];
    let addressArr = addressList.map((v) => {
      return v.id
    })
    let index = 0;
    let lastList = this.data.list || [];
    apiRequest.queryGoodsDateList({
      beginTime: groupCorp && groupCorp.corpAddress.tgcaDistributionType == '01' ? day(utils.DateAddDay(day(), 1)).format('YYYYMMDD') : day().format('YYYYMMDD'), // 01 企业专送 不能现点 日期推后一天
      hpid: this.data.hpid,
      addTimes: 15,
      tgcaDistributionType: groupCorp && groupCorp.corpAddress.tgcaDistributionType,
      corpId: this.data.corpId // 中行点餐-对私的corpId为100097（只显示明天的午餐和晚餐日历）
    }).then((res) => {
      let list = res.obj.resultDateList;
      // 和上次保持一致 避免切换回页面 加热点自动变更
      for (var i = 0; i < list.length; i++) {
        list[i].date = day(list[i].date).format('YYYY/MM/DD');
        list[i].month = day(list[i].date).format('MM');
        list[i].day = day(list[i].date).format('DD');
        last: for (var j = 0; j < lastList.length; j++) {
          if (list[i].date == lastList[j].date && list[i].categoryType == lastList[j].categoryType) {
            lastList[j].isCreateOrder = list[i].isCreateOrder;
            list[i] = lastList[j];
            list[i].addressId = list[i].addressId && addressArr.indexOf(list[i].addressId) >= 0 ? list[i].addressId : 0;
            break last
          }
        }
      }
      if (!type) {
        if (!e) {
          list.forEach((item, idx) => {
            if (!item.hpid && hpidList.length > 0) {
              item.hpid = hpidList[index].hpId;
              item.hpName = hpidList[index].hpName,
                item.selfTaking = hpidList[index].hotFlag || hpidList[index].coldFlag || hpidList[index].selfTaking == 0 || hpidList[index].selfTaking == 1 ? 0 : 1;
              item.shipType = hpidList[index].hotFlag ? '00' : (hpidList[index].coldFlag ? '01' : (hpidList[index].selfTaking == 0 || hpidList[index].selfTaking == 1 ? '00' : '02'));
              item.addressId = hpidList[index].addressId || 0
            }
          })
        } else {
          list[mealIndex].hpid = hpidList[index].hpId;
          list[mealIndex].hpName = hpidList[index].hpName,
            list[mealIndex].selfTaking = hpidList[index].hotFlag || hpidList[index].coldFlag || hpidList[index].selfTaking == 0 || hpidList[index].selfTaking == 1 ? 0 : 1;
          list[mealIndex].shipType = hpidList[index].hotFlag ? '00' : (hpidList[index].coldFlag ? '01' : (hpidList[index].selfTaking == 0 || hpidList[index].selfTaking == 1 ? '00' : '02'));
          list[mealIndex].addressId = hpidList[index].addressId || 0
        }
      }
      this.setData({
        list
      }, () => {
        // 代点餐
        // if (wx.getStorageSync('replaceOrder')) {
        //   this.getReplaceOrder();
        // } else {
        this.getMenu()


        if (!this.data.type) { // 接口人给子账号点餐
          // this.getUserListForSubUser()
        }

        // debugger
        if (!this.selectHeat) {
          this.selectHeat = true;
          this.cleanCartByDateAndCategory();
        }
        // }
      })
    })
  },

  // getReplaceOrder() {
  //   let list = this.data.list;
  //   let replaceOrder = wx.getStorageSync('replaceOrder');
  //   this.showReplaceCart = true; //显示购物车弹窗
  //   let index = '';

  //   for (var i = 0; i < replaceOrder.length; i++) {
  //     last: for (var j = 0; j < list.length; j++) {
  //       if (replaceOrder[i].date == list[j].date && replaceOrder[i].categoryType == list[j].categoryType) {
  //         replaceOrder[i].isCreateOrder = list[j].isCreateOrder;
  //         list[j] = replaceOrder[i];
  //         if (index === '') {
  //           index = j
  //         }
  //         break last
  //       }
  //     }
  //   }
  //   this.setData({
  //     list,
  //     mealIndex: index,
  //     leftIndex: 0,
  //     intoIndex: 'scroll_0',
  //   }, () => {
  //     this.getMenu()
  //     wx.removeStorage({
  //       key: 'replaceOrder'
  //     });
  //   })
  // },

  // 更新页面登录状态
  updateLogin() {
    let loginInfo = getStorage('loginInfo');
    this.setData({
      loginInfo,
      isLogin: loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile,
    })
    if (this.data.isLogin) {
      this.calculat();
      // this.queryAddress()
      // this.queryOpenbox() //锦鲤弹窗
    }
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
    
      if (!this.data.type) {
        // this.getUserListForSubUser()
      }
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

  // 筛选标签
  getFoodLabel(flavor, dietaryIntakes,notLike) {
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
    })
  },

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

  calculat: function () {
    // 减去状态栏高度 减去上部高度
    let mobileInfo = wx.getSystemInfoSync();
    let {
      px2rpx,
      isLogin,
      navStatusHeight,
      theme
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - t(isLogin ? (theme && theme == 'pillars' ? 432 : 402) : 404) - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight
    })
  },


  getMenu: function () {
    let {
      list,
      mealIndex,
      hpid,
      isLogin,
      subuidsList,
      selchild
    } = this.data;

    apiRequest.querySaleGoodsForThree({
      dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
      category: list[mealIndex].categoryType,
      indexRules: 'intakeCategory',
      orderMethod: '01',
      hpid: hpid,
      addressId: list[mealIndex].addressId || 0,
      version: "01",
      tagList: this.data.tagList || undefined,
      isLogin: isLogin,
      corpId: this.data.corpId,
      userAge: subuidsList.length > 0 || selchild == 'true'? 5 : undefined // 选择子账号切换为儿童
    })
      .then(res => {
        let resultList = res.obj.resultList;
        resultList.forEach((item1, index1) => {
          item1.detailList && item1.detailList.forEach((item2, index2) => {
            // 判断是否校验库存
            if (day(list[mealIndex].date) <= day() || (list[mealIndex].date == day().add(1, 'day').format('YYYY/MM/DD') && day() > day(`${day().format('YYYY/MM/DD')} ${this.data.confObj.orderTimeLimit}`))) {
              item2.checkStock = true
            }
            if (Array.isArray(item2.dietaryIntakes)) {
              item2.dietaryIntakes = item2.dietaryIntakes.filter(label => label.type === '02')
            } else if (Array.isArray(item2.dietLabelList)) {
              item2.dietLabelList = item2.dietLabelList.filter(label => label.type === '02')
            }
            if (item2.type == '01') {
              item2.cid = item2.id
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
          tgeRole: res.obj.interface|| '01',
        }, () => {
          this.allPrice();
        })
      })
      .catch(error => {

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
      dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
      category: list[mealIndex].categoryType,
      corpId: this.data.corpId,
      tgcaId: this.data.tgcaId,
      interface: this.data.tgeRole,
    })
      .then(res => {
        if (res.errCode == '0') {
          // g 转化 kcal 蛋白质 碳水 *4  脂肪*9
          let total = res.obj;
          total.totalPrice = round(total.totalPrice, 2);
          // total.energyPercent = round((total.energySupply / total.totalEnergy) * 100, 0);
          // total.saltPercent = round((total.saltSupply / total.totalSalt) * 100, 0);//盐量
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
        if (!that.data.hideLoad) {
          that.setData({
            hideLoad: true
          })
        }
      })
      .catch(error => {

      })
  },
  selectAll(e) {
    this.setData({
      all: !this.data.all
    }, () => {
      this.selectAllList(Boolean(this.data.all)) //全选 
    })

  },
  selectAllList: function (selectAll) {
    let { subUserInfoList } = this.data;
    if (this.data.ageIndex == 0) {
      subUserInfoList.subUserInfoBeans = subUserInfoList.subUserInfoBeans.map((item) => {
        item.checked = selectAll;
        return item;
      })
    } else {
      subUserInfoList.subUserInfoBeanList = subUserInfoList.subUserInfoBeanList.map((item) => {
        item.checked = selectAll;
        return item;
      })
    }
    this.setData({
      subUserInfoList,
      selectNums: selectAll && this.data.ageIndex == 0 ? subUserInfoList.subUserInfoBeans.length : selectAll && this.data.ageIndex == 1 ? subUserInfoList.subUserInfoBeanList.length : 0
    }, () => {
      // this.computePrice()
    })
  },


  selected: function (e) {
    var that = this;
    let subUserInfoList = that.data.subUserInfoList;
    let {
      tsusubuid, index
    } = e.currentTarget.dataset;
    let nowlist = {}
    if (that.data.allergyIndex == 0 && that.data.ageIndex == 0) {
      nowlist = subUserInfoList.subUserInfoBeans
    } else if (that.data.allergyIndex == 0 && that.data.ageIndex == 1) {
      nowlist = subUserInfoList.subUserInfoBeanList
    } else {
      nowlist = subUserInfoList.infoBeans
    }

    nowlist[index].checked = !nowlist[index].checked,

      that.setData({
        selectNums: nowlist[index].checked ? that.data.selectNums + 1 : that.data.selectNums - 1,
        subUserInfoList
      }, () => {

      })
  },

  scroll: throttle(100, function (e) {
    let that = this;
    let {
      isLogin,
      navStatusHeight
    } = that.data;
    let wrapTop = t(isLogin ? 432 : 404) + navStatusHeight;
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

  showEdit() {

  },
  tapcustom() {
    if (this.data.type =='userAdd') {
      let that = this
      wx.navigateTo({
        url: '/pages/packageOrder/switchHpid/switchHpid',
        events: {
          // 切换收货地址
          switchAdd: async function (data) {
          
            that.defAddress = data.data;
            that.addressId=that.defAddress.id   
            that.setData({
              hpname: that.defAddress.detail,
                      
            })
         
            // 查询地址匹配加热点
            that.queryHpidList(that.defAddress.lat, that.defAddress.lon, that.defAddress.id);
          },
          // 切换定位地址
          switchLocation: async function (data) {

            let defAddress = data.data;
            that.addressId = 0
            that.setData({
              hpname: defAddress.title,
             
            })
            that.queryHpidList(defAddress.location.lat, defAddress.location.lng, defAddress.id);
          },
          // 切换加热点
          switchhpid: async function (data) {
           
            let defAddress = data.data
            that.setData({
              hpname: defAddress.hpName,
              isselhp:true,
              hpid:defAddress.hpId,
            })
            that.switchShopCatHpid(defAddress);
          },
        },
        success: (result) => {
          // 通过eventChannel向被打开页面传送数据
          result.eventChannel.emit('acceptDataFromOpenerPage', {
            index: that.data.isselhp ? 1 : 0
          });
        },
        fail: () => { },
        complete: () => { }
      });
    }


  },
  confirm() {
    console.log('ggg')
  },
  iptNumber(e) {
    const { value } = e.detail
    this.$iptNum = Number(value)
  },
  blurIpfFn(e) {
    const {
      wrapindex,
      index
    } = e.currentTarget.dataset
    const preNum = this.data.nameList[wrapindex].detailList[index].num
    if (Number(this.$iptNum) > 0) {
      const nowNum = this.$iptNum - preNum
      this.add(e, nowNum)
    } else {
      this.autoNum()
    }
  },
  // 增加
  add: isLoginClick(function (e, num = 1) {
    let that = this;
  
    let {
      wrapindex,
      index,
      combo,
      comboid,
      cid,
      type,
      groupComboId,
      lastnum
    } = e.currentTarget.dataset;
    let {
      list,
      mealIndex,
      selfTaking,
      hpid,
      shipType,
      corpId,
      nameList,
      total
    } = that.data;

   
    app.globalData.gio('track', 'c_Addgoods', {
      goodsId: cid,
      goodsName: nameList[wrapindex].detailList[index].skuname || nameList[wrapindex].detailList[index].name,
      type,
    })
    // let num = 1
    // console.log(e.detail.value);
    let number = e.detail.value ? Number(e.detail.value) : null;

    if (type == 'add') {
      num = 1
    } else if (type == 'reduce') {
      num = -1
    } else if (type == 'number') {
      // if (number <= 0 || number == lastnum) {
      //   this.setData({
      //     [`nameList[${wrapindex}].detailList[${index}].num`]: number
      //   })
      //   return
      // }
      // else 
      // console.log('number', number)
      // console.log('lastnum', lastnum)
      if (number > lastnum) {
        num = number - lastnum
      }
      else {
        num = -(lastnum - number)
      }
    }

    if (num == 0 || !num) {
      return
    }
    // console.log('num', num)

    apiRequest.addShoppingCart({
      cid: cid,
      dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
      category: list[mealIndex].categoryType,
      orderMethod: '01',
      num: num, // 企业接口人未选择子账号可输入加购数量
      selfTaking: list[mealIndex].selfTaking >= 0 ? list[mealIndex].selfTaking : selfTaking,
      addressId: list[mealIndex].addressId || that.addressId || 0,
      hpid: hpid,
      type: combo,
      version: '01',
      comboId: comboid ? comboid : 0,
      shipType: list[mealIndex].shipType || shipType,
      corpId: corpId,
      groupComboId: groupComboId

    })
      .then(res => {
        if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
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
          type == 'number' ? nameList[wrapindex].detailList[index].num = number : type == 'add' ? nameList[wrapindex].detailList[index].num++ : nameList[wrapindex].detailList[index].num--; // 企业接口人未选择子账号可输入加购数量
          that.setData({
            nameList: nameList,
            scale: true
          }, () => {
          
            if (combo == '01' && !groupComboId) {
        
              that.comboSku = nameList[wrapindex].detailList[index].setMealDateils;
              that.autoCombo(type);
            } else {
              let autoNum = nameList[wrapindex].detailList[index].num;
              // 同步同一sku数量
              that.autoNum(autoNum, cid);
            }
          })


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

  // 同步同一sku数量
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
  },

  // 同步套餐
  autoCombo: function (type) {
   
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
  },

  // 编辑购物车

  editCart: function () {
    var that = this;
    let {
      list,
      mealIndex,
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
      dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
      corpId: corpId,
      tgcaId: this.data.tgcaId,
      interface: this.data.tgeRole,
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

  // 增加减少
  edit: function (e) {
  
    let that = this;
    let {
      category,
      index1,
      index2,
      index3,
      type,
      combo,
      cid,
      groupComboId

    } = e.currentTarget.dataset;
    let {
      allCart,
      list,
      mealIndex,
      corpId
    } = this.data;
    let date = allCart[index1].date;
    let skuInfo = allCart[index1].categoryCart[index2].list[index3];
    app.globalData.gio('track', 'c_Addgoods', {
      goodsId: cid,
      goodsName: skuInfo.skuname,
      type,
    })
    apiRequest.addShoppingCart({
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
      corpId: corpId,
      groupComboId: groupComboId
    })
      .then(res => {
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
          setTimeout(function () {
            that.setData({
              scale: false
            })
          }, 200)
        }
      })
      .catch(error => {

      })
  },


  hideCart: function () {
    this.setData({
      showCart: false,
    })
  },

  cancelTap() {
    this.setData({
      clearCartTip: false
    })
  },


  // 清空购物车
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
      category: 'all',
      orderMethod: '01',
      dataStt: '99',
      version: '01',
      corpId: this.data.corpId
    })
      .then(res => {
        if (res.obj.stt) {
          that.getMenu();
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

  // 详情
  goodsDetail: function (e) {
 
    var that = this;
    let {
      id,
      combo,
      comboid,
      forbid,
      cid,
      groupComboId
    } = e.currentTarget.dataset;
    let {
      list,
      mealIndex
    } = that.data;
    if (combo == '00' && forbid) {
      return
    }
    let obj = {
      id: id,
      orderMethod: '01',
      category: list[mealIndex].categoryType,
      dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
      deliveryIndex: list[mealIndex].selfTaking || 0,
      addressId: list[mealIndex].addressId || 0,
      heatId: this.data.hpid || 0,
      combo: combo,
      comboid: comboid || 0,
      shipType: list[mealIndex].shipType || '',
      cid: cid,
      corpId: this.data.corpId,
      groupcomboid: groupComboId,
      tgcaId: this.data.tgcaId,
      tgeRole: this.data.tgeRole,
      subuidsList: this.data.subuidsList
    }

    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`,
    });
  },

  //去结算
  buy() {

    this.setData({
      showCart: false
    })
    let {
      corpId,
      tgcaId,
      tgeRole,
      subuidsList,
      type,
      tgcName,
      selchild,
      selType
    } = this.data
   
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=groupMenu&corpId=` + corpId + '&tgcaId=' + tgcaId + '&tgeRole=' + tgeRole + '&subuidsList=' + JSON.stringify(subuidsList) + '&typeAdd=' + type+'&tgcName='+tgcName +'&selchild='+selchild + '&selType='+selType,
    });
  },

  // 拼单
  spell() {
    // // 是否可以拼单（菜品原价 >= 20元时才可以拼单）
    // if(this.data.total.totalOriginalPrice < 20) {
    //   wx.showToast({
    //     title: '购物车中菜品原价大于等于20元才可发起拼单',
    //     icon: 'none',
    //   });
    //   return;
    // }
    this.setData({
      showCart: false
    })
    let {corpId,tgcaId,tgeRole, total} = this.data;
    if (total.allCart[0].skuList[0].selfTaking == 1) {
      wx.showToast({
        title: '拼单不支持自取',
        icon: 'none',
      });
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=groupMenu&spellOrder=true&corpId=` + corpId + '&tgcaId=' + tgcaId + '&tgeRole=' + tgeRole,
    });
  },

  adjust() {
    let {
      mealIndex,
      list,
     
    } = this.data;
   let isshowchange = false

   if(this.data.tgeRole=='00' ){
    isshowchange = true
   }
    wx.navigateTo({
      url: `/pages/packageOrder/editData/editData?date=${list[mealIndex].date}&isshowchange=${isshowchange}`,
    });
  },

  phone(e) {
    let phone = e.currentTarget.dataset.phone;
    this.setData({
      phone,
      showPhone: true
    })
  },

  surePhone() {
    wx.makePhoneCall({
      phoneNumber: String(this.data.phone),
    });
    this.setData({
      showPhone: false
    })
  },

  goMap(e) {
    wx.openLocation({
      latitude: Number(e.currentTarget.dataset.lat),
      longitude: Number(e.currentTarget.dataset.lon),
      scale: 18,
      name: e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
    });
  },
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
    const { planningType } = this.data;
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
          url: '/pages/packageDiscover/schemeLibrary/schemeLibrary?jumptype=groupMeal',
        });
        break;
      case '02': // 增肌增重 02
        wx.navigateTo({
          url: '/pages/packageDiscover/schemeLibrary/schemeLibrary?index=1&&jumptype=groupMeal',
        });
        break;
      case '03': // 保持体型 03
      case '10': // 营养均衡 10
        wx.navigateTo({
          url: '/pages/packageDiscover/eatMethodList/eatMethodList?jumptype=groupMeal',
        });
        break;
    }
  },
  // 查询账户卡券
  queryCoupon: function (params) {

    var that = this;
    apiRequest.queryCouponList({
    })
      .then(res => {
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : [];
        this.setData({
          couponUserVos: couponUserVos,
          showShre: true,
        }, () => {
          that.checkCoup()
        })

      })
      .catch(error => {

      })
  },
  checkCoup() {
    let currentDate = new Date().getTime();
    let couponUserVos = this.data.couponUserVos;
    couponUserVos.forEach((item, index) => {
      item.tcuAmount = Number(item.tcuAmount);
      item.tcuRestrictAmount = Number(item.tcuRestrictAmount)
    })
    if (this.data.coupon) {
      if (this.data.total.totalPrice < this.data.coupon.tcuRestrictAmount || this.data.total.totalPrice <= this.data.coupon.tcuAmount) {
        this.setData({
          coupon: ''
        })
      }
    } else {
      let list = []
      list = couponUserVos.filter((item) => {
        return item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime;
      });

      // 筛选出最大卡券值
      let maxCoupon = Math.max.apply(Math, list.map(function (o) { return o.tcuAmount }));
      let index = list.map(item => item.tcuAmount).indexOf(maxCoupon)
      this.setData({
        coupon: list.length > 0 ? list[index] : '',
        tcuEtime: list.length > 0 ? list[index].tcuEtime : 0
      }, () => {
        if (this.data.showShre) {
          this.cuntdown()
        }
      })
    }
  },
  // 优惠券倒计时
  cuntdown() {
    let nowTime = new Date().getTime();
    let limitTime = this.data.tcuEtime ? Number(this.data.tcuEtime) : 0;

    this.setData({
      time: (limitTime && limitTime - nowTime > 0) ? limitTime - nowTime : 0
    })
    if (this.data.time > 0) {
      this.setData({
        cutdowntime: true
      })
    }

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
  // confirmTap() { 旧版给子帐号点餐

  //   let { subUserInfoList, subuidsList } = this.data;

  //   subuidsList = []
  //   let tagArray = []
  //   let tagList = {}
  //   subUserInfoList.subUserInfoBeanList.map((item) => {
  //     if (item.checked) {
  //       subuidsList.push(item.tsuSubUid)
  //     }
  //   })
  //   subUserInfoList.subUserInfoBeans.map((item) => {
  //     if (item.checked) {
  //       subuidsList.push(item.tsuSubUid)
  //     }
  //   })
  //   subUserInfoList.infoBeans.map((item) => {
  //     if (item.checked) {
  //       subuidsList.push(item.tsuSubUid)
  //       for (let index = 0; index < item.eatingHabitStr.length; index++) {
  //         tagArray.push(Number(item.eatingHabitStr[index].lid))
  //       }
  //     }
  //   })

  //   tagArray.length > 0 ? tagList['过敏原'] = tagArray : undefined
  //   this.setData({
  //     showChild: false,
  //     subuidsList: subuidsList,
  //     tagList: tagList
  //   })
  //   this.getMenu()
  // },
  editChildtipd() {
   wx.navigateBack();
  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },
  finish: function (e) {
    var that = this;
    var countDown = that.selectComponent('.control-count-down');
    countDown.pause();
  },

  toHealth() {
    if(!this.data.total || !this.data.total.nutritionHealthScore){
      return
    }
    const subInfo = this.data.subInfo;
    const allCart = this.data.total.allCart;
    const {mealIndex, list} = this.data;
    const category = list[mealIndex].categoryType;
    const orderDate = list[mealIndex].date;
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
          fromUid: subInfo.tsuSubUid || this.data.uid,
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
    const idx = (Math.random() * 3) | 0
    let headImgUrl = wx.getStorageSync('userInfo').headImgUrl
    if (e.from == "button") {
      return {
        title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
        imageUrl: 'https://prodstatic.weis1606.cn/api/market/sharebox.png',
        path: '/pages/activity/openBox/index?iuInvitedUid=' + this.data.uid + '&boxtype=share&scene=0717&shareimg=' + headImgUrl
      }
    }
  }

})