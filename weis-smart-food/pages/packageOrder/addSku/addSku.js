// pages/packageOrder/addSku/addSku.js
import apiRequest from '../../../service/index';
import {
  debounce,
  throttle
} from '../../../utils/throttle';
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
import {
  isLoginClick,
  loginPromise,
  t,
  confObj,
} from '../../../utils/common'
import day from '../../../libs/day'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage('navStatusHeight'),
    px2rpx: app.globalData.px2rpx,
    leftIndex: 0, //默认选中种类
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = JSON.parse(options.params);
    this.setData({
      code: params.code, // 套餐推荐的目录code
      id: params.id,
      orderMethod: params.orderMethod,
      dateTime: params.dateTime,
      category: params.category,
      heatId: params.heatId,
      comboId: params.comboid,
      corpId: params.corpId,
      addressId: params.addressId,
      confObj,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then(() => {
      // this.mobileInfo = wx.getSystemInfoSync();
      this.calculat();
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
        isLogin,
      })
      // this.mobileInfo ? this.calculat() : '';
      if (isLogin) {
        // 重新请求时间
        this.mobileInfo ? this.updatetime() : '';
      }
      this.getMenu()
    })
  },
  // 获取设备高度
  calculat: function () {
    // 减去状态栏高度
    let mobileInfo = wx.getSystemInfoSync();
    let {
      px2rpx,
      navStatusHeight,
    } = this.data;
    let scrollHeight = (mobileInfo.windowHeight - navStatusHeight) * px2rpx;
    this.setData({
      scrollHeight,
    })
  },
   // 获取菜品列表（已过）
   getMenu: function (type) {
    //type 换一换
    let {
      isLogin,
      dateTime,
      category,
      indexRules,
      heatId,
      addressId,
      leftIndex
    } = this.data;
    apiRequest.querySaleGoodsForThree({
        dateTime,
        category,
        indexRules,
        orderMethod: '01',
        hpid: heatId || 100000,
        addressId: addressId || 0,
        version: "01",
        tagList: this.data.tagList || undefined,
        isLogin,
        dataStt: '99',
        cleanCategory: '04', //清除加餐数据
        refreshStt: false, // 是否是换一换
        shopType: '10',
      })
      .then(res => {
        let resultList = res.obj.resultList;
        let stockindex = 0
        // let checkBook = getStorage('checkBook')
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
            if (day(dateTime) <= day() || (dateTime == day().add(1, 'day').format('YYYYMMDD') && day() > day(`${day().format('YYYY/MM/DD')} ${this.data.confObj.orderTimeLimit}`))) {
              item2.checkStock = true
            }
            // if (checkBook) { //预订送券
            //   if (item1.skuCatalog == '动物蛋白' || item1.skuCatalog == '蔬菜') {
            //     // console.log(item2.stock)
            //     if (item2.stock > 0) {
            //       stockindex++
            //     }
            //   }
            // }
            // 筛选标记
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
          // showBookDialog: indexRules == "intakeCategory" && stockindex < 6 && checkBook && !outRange && (matchHpid.shopType == '10') ? true : false,
        }, () => {
          this.countKindNum();
          // removeStorage('checkBook');
          if (type == 'change') {
            return
          }
          // this.allPrice();
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
  // 切换类目
  category() {
    let indexRules = this.data.indexRules == 'catalog'?'intakeCategory':'catalog'
    this.setData({
      indexRules
    }, () => {
      setStorage('indexRules', indexRules)
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
  // 添加
  add(e) {
    let {
      item
    } = e.currentTarget.dataset;
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packageOrder/setMealModify/setMealModify'
    );
    const prepage = pages[index];
    // prepage.data.addSkuData.push(item)
    //调用上一个页面中的addComment方法
    prepage.setData({
      addSkuSelect: item
    })
    prepage.addSkuObj()
    wx.navigateBack({
      delta: pages.length - (index + 1)
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})