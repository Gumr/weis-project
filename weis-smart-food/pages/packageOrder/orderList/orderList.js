// pages/packageOrder/orderList/orderList.js
import apiRequest from '../../../service/index'
import day from '../../../libs/day'
import {
  getStorage,
  removeStorage
} from '../../../utils/storage'
import {
  round,
  genDispatchTag,
  filterTablewareSku,
  loginPromise
} from '../../../utils/common'
import {
  orderStatusMap,
  categoryMap
} from '../../../utils/map'
import drawQrcode from '../../../libs/qrcode';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    tabList: [{
        'name': '待用餐',
        stt: 'isWaitMeal',
        isWaitMeal: '00'
      }, {
        'name': '全部订单',
        stt: 'all'
      },
      /*{
        'name': '待付款',
        stt: '00'
      },
      {
        'name': '待确认',
        stt: '10'
      },*/
      {
        'name': '退款',
        stt: ''
      },
      {
        'name': '套餐',
        stt: ''
      }
    ],
    tabIndex: 0,
    stt: 'all',
    pageSize: 10,
    pageNo: 0,
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
    },
    more: true,
    showLoading: true,
    orderTransferMap: [],
    fatPackOrderList: [],
    filterVal: [0],
    filterList: [],
    canSure: true,
    filterIndex: 0,
    queryAll: true, //查询所有
    tsuSubUid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let tabList = this.data.tabList;
    let index = options.index || 0;
    this.setData({
      stt: tabList[index].stt,
      tabIndex: index,
      subToken: getStorage('subToken'),
      subInfo: getStorage('subInfo') || {},
    })
    // 当前主账户 查询子账户列表
    if (!this.data.subToken) {
      this.getUserListForSubUser()
    } else {
      // 当前子账户 直接查询该子账户
      this.setData({
        queryAll: false,
        tsuSubUid: this.data.subInfo.tsuSubUid
      })
    }
    // 查询订单列表
    if (this.data.tabIndex == '2') {
      this.queryUserRefundListForThree()
    } else if (this.data.tabIndex == '3') {
      this.queryUserBuyFatPackOrderForThree()
    } else {
      this.queryOrderListForThree()
    }
    wx.getScreenBrightness({
      success: (res) => {
        this.brightness = res.value
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.canLoad = true;
    this.payPopup = this.selectComponent('#pay');
    this.refreshView = this.selectComponent('#refresh-view')
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.canLoad){
      wx.showLoading({
        title: '加载中...',
        mask: true,
      });
      this.loadIng = true;
      this.switchTab(this.data.tabIndex)
    }
  },

  // 查询子账户
  getUserListForSubUser() {
    let filterList = [{
      name: '全部',
      tsuSubUid: '',
      type: 'all'
    }, {
      name: '我',
      tsuSubUid: '',
      type: 'my'
    }];
    apiRequest.getUserListForSubUser({

    }).then((res) => {
      let subUserInfoList = res.obj.subUserInfoList;
      subUserInfoList.forEach((item, index) => {
        let obj = {
          name: item.tsuSubUname,
          tsuSubUid: item.tsuSubUid
        }
        filterList.push(obj)
      })
      this.setData({
        filterList: filterList.length > 2 ? filterList : []
      })
    })
  },


  tabClick(e) {
    let {
      stt,
      index
    } = e.currentTarget.dataset;
    let tabIndex = this.data.tabIndex;
    if (index == tabIndex) {
      return
    }
    this.setData({
      tabIndex: index,
      stt: e.currentTarget.dataset.stt,
      orderTransferMap: [],
      pageNo: 0,
      more: true,
    })
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    this.loadIng = true;
    if (index == 2) {
      this.queryUserRefundListForThree();
    }else if(index == 3){
      this.queryUserBuyFatPackOrderForThree()
    }else{
      this.queryOrderListForThree()
    }
  },

  // 查询
  queryOrderListForThree() {
    let {
      stt,
      pageSize,
      tabIndex,
      more,
      tsuSubUid,
      queryAll
    } = this.data;
    if (more == false) {
      return
    }
    this.data.pageNo++
    apiRequest.queryOrderListForThree({
      orderStt: stt == 'isWaitMeal' ? undefined : stt,
      pageSize: pageSize,
      pageNo: this.data.pageNo,
      isNeedFatPack: '00',//01 需要查询Ai套餐等
      subUid: tsuSubUid,
      queryAll,
      isWaitMeal: stt == 'isWaitMeal' ? '00' : undefined,//待用餐传值
    }).then((res) => {
      if (res.obj.pageCount == this.data.pageNo) {
        this.setData({
          more: false
        })
      }
      this.getList(res);
      if(this.loadIng){
        this.loadIng = false;
        wx.hideLoading();
      }
    })
  },

  getList(res) {
    let {
      orderTransferMap
    } = this.data;
    let orderList = (res.obj && res.obj.orderTransferMap) || [];
    orderList.forEach((item1) => {
      item1.isToday = day().format('YYYYMMDD') == item1.date;
      item1.dateText = day(item1.date).format('MM月DD日');
      item1.psText = genDispatchTag(item1.shipWithCold, item1.deliveryFrequency, item1.distributionMode)
      item1.dietOrderResult.forEach((item2) => {
        item2.orderSttText = orderStatusMap(item2.orderStt, item1.distributionMode, item1.subStt || undefined)
        item2.dietOrderDetailList = filterTablewareSku(item2.dietOrderDetailList);
        item2.totalPrice = round(item2.totalPrice, 2)
        // 当餐数据
        this.handleCategory(item2)
      })
    })
    if (orderTransferMap.length > 0 && orderList[0].shipOid && orderTransferMap[orderTransferMap.length - 1].shipOid == orderList[0].shipOid) {
      orderTransferMap[orderTransferMap.length - 1].dietOrderResult = orderTransferMap[orderTransferMap.length - 1].dietOrderResult.concat(orderList[0].dietOrderResult);
      orderList.splice(0, 1)
    }
    orderTransferMap = orderTransferMap.concat(orderList);
    if(this.data.stt == 'all' || this.data.stt == 'isWaitMeal'){
      orderTransferMap.forEach((item,index)=>{
        if(item.mergeTeam){
          item.mergeTeam.dietOrderMergeDetails = item.mergeTeam.dietOrderMergeDetails.filter((item) => {
            return item.stt == '10'
          })
          item.mergeTeam.num = item.mergeTeam.dietOrderMergeDetails.length;
          item.mergeTeam.saveFrenght = round(item.mergeTeam.num * item.mergeTeam.dietOrderMerge.shipFee, 2);//省配送费
          item.mergeTeam.dietOrderMerge.spellOrderStatus = day() < day(item.mergeTeam.dietOrderMerge.endTime) //true 未结束 false 已结束
        }
      })
    }
    this.setData({
      orderTransferMap,
    })
  },

  handleCategory(category) {
    category.num = category.dietOrderDetailList.reduce((num, or) => {
      num += Number(or.num)
      return num
    }, 0)
    category.pieData = [{ // 处理生成饼图用的数据
      key: 'fatRatio',
      color: '#18C5C1'
    }, {
      key: 'carbonRatio',
      color: '#EEEEEE',
    }, {
      key: 'proteinRatio',
      color: '#FE5E0F'
    }].map((it) => {
      it.value = category.stringMap[it.key]
      return it
    }).filter((it) => Boolean(it.value))

    return category
  },

  // 售后列表
  queryUserRefundListForThree() {
    let {
      pageSize,
      more,
      tsuSubUid,
      queryAll
    } = this.data;
    if (more == false) {
      return
    }
    this.data.pageNo++
    apiRequest.queryUserRefundListForThree({
      pageSize: pageSize,
      pageNo: this.data.pageNo,
      subUid: tsuSubUid,
      queryAll,
    }).then((res) => {
      if (res.obj.pageCount == this.data.pageNo) {
        this.setData({
          more: false
        })
      }
      this.getList(res);
      if(this.loadIng){
        this.loadIng = false;
        wx.hideLoading();
      }
    })
  },

  queryUserBuyFatPackOrderForThree() {
    apiRequest.queryUserBuyFatPackOrderForThree({
      flag: '01'
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          fatPackOrderList: res.obj.fatPackResult.map((item) => {
            const {
              maxormin
            } = item;
            item._sDate = day(maxormin.minDate).format('M月D日')
            item._eDate = day(maxormin.maxDate).format('M月D日')
            return item
          })
        })
      }
      if(this.loadIng){
        this.loadIng = false;
        wx.hideLoading();
      }
    })
  },
  toShare(e) {
    let orderId = e.currentTarget.dataset.soid
    const {tsuSubUid} = wx.getStorageSync('subInfo')
    const {uid} = this.data;
    wx.navigateTo({
      url: `/pages/activity/sharePlay/index?orderId=${orderId}&invite=${tsuSubUid || uid}`
    })
  },
  fatPackOrderTap(evt) {
    const data = evt.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/packageOrder/fatPackOrder/fatPackOrder?fatPackId=${data.fatPackId}&title=${data.title}`
    })
  },

  orderDetail(e) {
    let {
      id,
      code,
      index
    } = e.currentTarget.dataset;
    let that = this;
    wx.navigateTo({
      url: `/pages/packageOrder/orderDetail/orderDetail?id=${id}&code=${code}`,
      events: {
       
      },
      success: function () {
        that.shipOid = id;
        that.psIndex = index;
      }
    });
  },

  pay(e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    this.soid = e.currentTarget.dataset.soid;
    this.shipOid = id;
    apiRequest.queryTotalShipOrder({
      soid: this.soid
    }).then((res) => {
      let num = res.obj.num;
      let arr = [];
      num.forEach((item) => {
        // 配送单 id list
        arr.push(item.shipOid)
      })
      this.setData({
        payOrderList: arr,
      })
      this.payPopup.pay(res.obj.totalPrice)
    })
  },

  wxPay(e) {
    const {
      detail
    } = e;
    apiRequest.rePayOrder({
      tradeNo: this.soid,
      payWay: detail.type,
      openid: app.globalData.openId,
      payChannel: 'mina',
    }).then((res) => {
      if (res.errCode == '0') {
        if (detail.type == 'wechat') {
          detail.wxPay(res.obj).then(data => {
            if (data.errMsg == 'requestPayment:ok') {
              //微信支付成功
              this.switchTab(this.data.tabIndex)
            }
          }).catch((data) => {
            if (data.errMsg == 'requestPayment:fail cancel') {

            }
            if (data.errMsg == 'requestPayment:fail (detail message)') {

            }
          })
        } else {
          // 余额支付成功
          this.switchTab(this.data.tabIndex)
        }
        detail.done();
      }
    })
  },


  switchTab(index) {
    let {
      tabList
    } = this.data;
    this.setData({
      tabIndex: index,
      stt: tabList[index].stt,
      orderTransferMap: [],
      pageNo: 0,
      more: true,
    })
    if (index == 2) {
      this.queryUserRefundListForThree();
    } else if (index == 3) {
      this.queryUserBuyFatPackOrderForThree()
    } else {
      this.queryOrderListForThree()
    }
  },

  // 确认收货
  sure(e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    let {
     tabIndex
    } = this.data;

    apiRequest.confirmedOrder({
        orderId: id
      })
      .then(res => {
        wx.showLoading({
          title: '',
          mask: true,
        });

        if (res.obj && res.obj.result) {
          this.switchTab(tabIndex)
        }
        setTimeout(() => {
          wx.hideLoading();
        }, 1500)
      })
      .catch(error => {
        setTimeout(() => {
          wx.hideLoading();
        }, 1500)
      })
  },

  // 显示筛选
  filterAccount() {
    this.setData({
      showFilter: !this.data.showFilter,
      filterVal: ''
    })
    if (this.data.showFilter) {
      this.setData({
        filterVal: [this.data.filterIndex]
      })
    } else {
      this.setData({
        // filterVal: ''
      })
    }
  },

  // 滚动筛选
  filterChange(e) {
    this.setData({
      filterVal: e.detail.value
    })
  },

  // 确定筛选
  filterConfirm(e) {
    let filterList = this.data.filterList;
    let filterIndex = this.data.filterVal[0];
    let tabIndex = this.data.tabIndex;
    this.setData({
      showFilter: false,
      filterIndex,
      queryAll: filterList[filterIndex].type == 'all' ? true : false,
      tsuSubUid: filterList[filterIndex].tsuSubUid,
      // filterVal: ''
    })
    this.switchTab(tabIndex)
  },

  bindpickstart() {
    this.setData({
      canSure: false
    })
  },

  bindpickend() {
    this.setData({
      canSure: true
    })
  },

  toHealthScore(e) {
    const {oid, index} = e.currentTarget.dataset;
    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          fromUid: this.data.tsuSubUid || this.data.uid,
          payFlag: true,
          oid,
        }]
      })
      .then(res => {
        if(res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms, info} = res.obj;
          console.log(scoreForms)
          this.setData({
            scoreForms: scoreForms[index],
            humanInfoWithScore: info
          })
          wx.navigateTo({
            url: `/pages/packageOrder/healthScore/healthScore?page=orderList&oid=${oid}`
          })
        }
      })
  },

  takeMealCodeTap(e) {
    console.log(e)
    const {
      disabled, date, shopType, takeMealCode, asciiOrderId
    } = e.currentTarget.dataset;
    if(day() < day(date)){
      wx.showToast({
        title: '取餐码于用餐当天生成',
        icon: 'none',
      }); 
    }
    if (disabled) return;
    this.setData({
      ShowQrcode: true,
      takeMealCode,
      shopType,
    })
    wx.setScreenBrightness({
      value: 1,
      success: () => {
        drawQrcode({
          width: 173,
          height: 173,
          canvasId: 'qrcode',
          text: asciiOrderId,
        })
      }
    })
  },

  back() {
    if (this.data.ShowQrcode) {
      this.closeQrcode()
    } else {
      wx.navigateBack({
        delta: 1
      });
    }
  },

  closeQrcode() {
    this.setData({
      ShowQrcode: false
    })
    wx.setScreenBrightness({
      value: this.brightness || 0.5
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if(this.data.takeMealCode && this.brightness){
      wx.setScreenBrightness({
        value: this.brightness
      })
    }
    if(this.data.ShowQrcode){
      this.setData({
        ShowQrcode: false,
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(this.data.takeMealCode && this.brightness){
      wx.setScreenBrightness({
        value: this.brightness
      })
    }
  },

  //触摸开始
  handletouchstart: function (event) {
    this.refreshView.handletouchstart(event);
  },
  //触摸移动
  handletouchmove: function (event) {
    this.refreshView.handletouchmove(event);
  },
  //触摸结束
  handletouchend: function (event) {
    this.refreshView.handletouchend(event);
  },
  //触摸取消
  handletouchcancel: function (event) {
    this.refreshView.handletouchcancel(event);
  },
  //页面滚动
  onPageScroll: function (event) {
    this.refreshView.onPageScroll(event);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.switchTab(this.data.tabIndex)
    setTimeout(() => {
      this.refreshView.stopPullRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.tabIndex == '2') {
      this.queryUserRefundListForThree()
    } else if (this.data.tabIndex == '3') {

    } else {
      this.queryOrderListForThree()
    }
  },

  shareView(){
    return
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    if (e.from == 'button') {
      console.log(e)
      let orderTransferMap = this.data.orderTransferMap;
      let {index, ordermode} = e.target.dataset;
      let currentOrder = orderTransferMap[index];
      let spellInfo = currentOrder.mergeTeam;
      let corpId = currentOrder.corpId > 0 ? currentOrder.corpId : '';
      let tgcaId = currentOrder.tgcaId > 0 ? currentOrder.tgcaId : '';
      // orderMode: 00拼单 01拼组
      if(ordermode == '00') {
        return {
          title: `我正在拼${day(currentOrder.date).format('MM月DD日')}${categoryMap[currentOrder.dietOrderResult[0].category]}，一起拼单免配送费，快上车吧！`,
          imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareImg.png',
          path: `/pages/mineBox/order/index?spellOrder=true&mergeCode=${spellInfo.dietOrderMerge.code}&date=${day(currentOrder.date).format('YYYY/MM/DD')}&category=${currentOrder.dietOrderResult[0].category}&tgcaId=${tgcaId}&corpId=${corpId}`,
        }
      }
      if(ordermode == '01') {
        return {
          title: `我正在拼${day(currentOrder.date).format('MM月DD日')}${categoryMap[currentOrder.dietOrderResult[0].category]}，越多人拼单返现越多，签收后立即返现到余额，快上车吧！`,
          imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/spellGroup_shareImg.png',
          path: `/pages/mineBox/order/index?spellGroup=true&mergeCode=${spellInfo.dietOrderMerge.code}&date=${day(currentOrder.date).format('YYYY/MM/DD')}&category=${currentOrder.dietOrderResult[0].category}&tgcaId=${tgcaId}&corpId=${corpId}`,
        }
      }
    }
  }
})