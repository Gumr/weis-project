// pages/packageOrder/snacks/snacks.js
import {
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
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx,
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
    currentSlideshow: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let theme = 'simple' || wx.getStorageSync('theme') || 'simple';
    this.setData({
      theme, 
    });
    const navStatusHeight = getStorage('navStatusHeight');
    let list = [{
      categoryType: '04',
      date: options.date
    }];
    this.setData({
      isIpx: app.globalData.isIpx,
      navStatusHeight,
      confObj,
      subToken: getStorage("subToken") || '',
      list,
      title: `${day(options.date).format('MM月DD日')}加餐${options.category == '04' ? '' : Number(options.category)-3}`
    })
    // 查询首页轮播图
    // this.queryDietBanner();
    // 清除购物车
    await this.clean();
    // 查询默认地址
    await this.queryAddress();
    if (this.defAddress) {
      // 查询地址匹配加热点
      await this.matchHpid(this.defAddress.lat, this.defAddress.lon, this.defAddress, );
      //  查询时间
      this.queryDate(this.defAddress);
    } else {
      // 没默认地址 查询当前用户位置
      await this.queryLocation()
      // console.log(this.currentAddress)
      // 查询地址匹配加热点
      await this.matchHpid(this.currentAddress.location.lat, this.currentAddress.location.lng, this.currentAddress);
      this.queryDate(this.currentAddress);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.forbidloadShow) {
      this.forbidloadShow = false;
      return
    }
    this.mobileInfo ? this.calculat() : '';
    // 重新请求时间
    this.mobileInfo ? this.getMenu() : '';
  },


  clean() {
    return apiRequest.addShoppingCart({
      category: 'all',
      orderMethod: '01',
      dataStt: '99',
      version: '01'
    })
  },

  queryDietBanner() {
    apiRequest.queryDietBanner({

    }).then((res) => {
      this.setData({
        dietBanners: res.obj.dietBanners || []
      })
    })
  },

  slideshowTap(e) {
    const {
      url,
      type
    } = e.currentTarget.dataset;
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
    this.mobileInfo = wx.getSystemInfoSync();
    this.calculat();
  },

  slideshowChange(evt) {
    this.setData({
      currentSlideshow: evt.detail.current
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
      userAddr: address.title ? `${address.address}` : `${address.province}${address.city}${address.area}${address.detail}`
    }).then((res) => {
      // console.log(res)
      this.setData({
        matchHpid: res.obj.dtos[0],
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
    let list = this.data.list;
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
    this.getMenu()
  },

  // 切换 加热点
  tapHpid() {
    let {
      mealIndex,
      list
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
          await that.cutShopCatHpid(that.defAddress);
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
          await that.cutShopCatHpid();
          that.queryDate(that.currentAddress);
        },
        // 切换加热点
        switchhpid: async function (data) {
          that.forbidloadShow = true; //不运行onShow逻辑
          that.setData({
            matchHpid: data.data,
          })
          await that.cutShopCatHpid();
          that.queryDate();
        },
      },
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          index: list[mealIndex].addressName ? 0 : 1
        });
      },
      fail: () => {},
      complete: () => {}
    });
  },



  queryAddress() {
    let that = this;
    return apiRequest.queryAddressListForThree({
        sortNum: '',
        dataStt: '',
      }).then((res) => {
        that.setData({
          addressList: res.obj.addressInfos || []
        })
        that.defAddress = that.data.addressList.filter((item) => {
          return item.tuaDef == '1';
        })[0];
      })
      .catch((error) => {});
  },

  // 查询用户地址
  queryLocation() {
    let that = this;
    return new Promise((resolve) => {
      console.log(app.globalData.userAddr)
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


  // 左边菜单-选中
  selectKind: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      leftIndex: index,
      intoIndex: `scroll_${index}`
    })
  },
  // 标签筛选-点击显示隐藏
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
  // 筛选标签-重置
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

  // 筛选标签-处理数据
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

  // 筛选标签-选择
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
  // 筛选标签-确定
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

  // 获取设备高度
  calculat: function () {
    // 减去状态栏高度 减去上部高度
    let mobileInfo = this.mobileInfo ? this.mobileInfo : wx.getSystemInfoSync();
    let {
      px2rpx,
      navStatusHeight
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - t(402) - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight
    })
  },

  // 获取菜品列表
  getMenu: function () {
    let {
      list,
      mealIndex,
      hpid,
    } = this.data;
    apiRequest.querySaleGoodsForThree({
        dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
        category: list[mealIndex].categoryType,
        indexRules: 'intakeCategory',
        orderMethod: '01',
        hpid: list[mealIndex].hpid || 100000,
        addressId: list[mealIndex].addressId || 0,
        version: "01",
        tagList: this.data.tagList || undefined,
        isLogin: true
      })
      .then(res => {
        let resultList = res.obj.resultList;
        let stockindex = 0
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
          ageType: res.obj.ageType,
        }, () => {
          this.allPrice();
        })
        if (!this.data.hideLoad) {
          this.setData({
            hideLoad: true
          })
        }
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
    } = that.data;
    apiRequest.queryShoppingCartCount({
        orderMethod: '01',
        dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
        category: list[mealIndex].categoryType,
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
      })
      .catch(error => {

      })
  },

  // 滚动菜品联动菜单
  scroll: throttle(200, function (e) {
    let that = this;
    let {
      navStatusHeight
    } = that.data;
    let wrapTop = t(402) + navStatusHeight;
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

  // 菜品-增/减
  add: function (e) {

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
      nameList
    } = that.data;
    app.globalData.gio('track', 'c_Addgoods', {
      goodsId: cid,
      goodsName: nameList[wrapindex].detailList[index].skuname || nameList[wrapindex].detailList[index].name,
      type,
    })
    apiRequest.addShoppingCart({
        cid: cid,
        dateTime: day(new Date(list[mealIndex].date)).format('YYYYMMDD'),
        category: list[mealIndex].categoryType,
        orderMethod: '01',
        num: type == 'add' ? 1 : -1,
        selfTaking: list[mealIndex].selfTaking >= 0 ? list[mealIndex].selfTaking : selfTaking,
        addressId: list[mealIndex].addressId || that.addressId || 0,
        hpid: list[mealIndex].hpid || hpid,
        type: combo,
        version: '01',
        comboId: comboid ? comboid : 0,
        shipType: list[mealIndex].shipType || shipType,
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
          type == 'add' ? nameList[wrapindex].detailList[index].num++ : nameList[wrapindex].detailList[index].num--;
          that.setData({
            nameList: nameList,
            scale: true
          }, () => {
            if (combo == '01') {
              that.comboSku = nameList[wrapindex].detailList[index].setMealDateils;
              that.autoCombo();
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


  },

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

  // 同步套餐到单品
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
  },

  // 编辑购物车
  // 点击显示购物车&获取数据
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
        let categoryList = ['01', '02', '03', '04'];
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
          },{
            category: '04',
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

  // 购物车-增/减
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
      mealIndex
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

  // 关闭购物车
  hideCart: function () {
    this.setData({
      showCart: false,
    })
  },
  // 清空购物车-取消
  cancelTap() {
    this.setData({
      clearCartTip: false
    })
  },

  // 清空购物车-确定
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
        version: '01'
      })
      .then(res => {
        if (res.obj.stt) {
          that.getMenu();
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

  // 菜品详情
  goodsDetail: function (e) {
    return
  },

  //去结算
  buy() {
    this.setData({
      showCart: false
    })
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=menu`,
    });
  },

  // 拼单
  spell() {
    // 是否可以拼单（菜品原价 >= 20元时才可以拼单）
    if(this.data.total.totalOriginalPrice < 20) {
      wx.showToast({
        title: '购物车中菜品原价大于等于20元才可发起拼单',
        icon: 'none',
      });
      return;
    }
    this.setData({
      showCart: false
    })
    if (this.data.total.allCart[0].skuList[0].selfTaking == 1) {
      wx.showToast({
        title: '拼单不支持自取，请选择收货地址',
        icon: 'none',
      });
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/submit/submit?from=menu&spellOrder=true`,
    });
  },

  adjust() {
    wx.navigateBack({
      delta: 1
    }); 
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
})