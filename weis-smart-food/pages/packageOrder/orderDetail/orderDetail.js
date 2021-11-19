// pages/packageOrder/orderDetail/orderDetail.js
import day from '../../../libs/day'
import {
  round,
  filterTablewareSku,
  genDispatchTag,
  toTimeRangeList,
  loginPromise
} from '../../../utils/common'
import drawQrcode from '../../../libs/qrcode';
import requests from '../../../service/index'

import {
  orderStatusMap,
  categoryMap,
  cancelReason,
} from '../../../utils/map';
import {
  getStorage
} from '../../../utils/storage';

let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
    px2rpx: app.globalData.px2rpx,
    shortTime: [0],
    showGetTime: false,
    status: '待支付',
    detail: {},
    dialog: {
      cancelOrder: false,
      log: false,
      call: false,
      qrcode: false,
      method: false
    },
    pieData: [{
        value: 0,
        key: 'totalFat',
        color: '#18C5C1'
      },
      {
        value: 0,
        key: 'totalCarbohydrate',
        color: '#EEEEEE'
      },
      {
        value: 0,
        key: 'totalProtein',
        color: '#FA6400'
      }
    ],
    skuList: [],
    payType: [{
      img: '/images/payment_wallet.png',
      name: '余额支付',
      payType: 0,
      balance: 0,
    }, {
      img: '/images/payment_wechat.png',
      name: '微信支付',
      payType: 1,
    }],
    payIndex: 0,
    cancelReason, //取消订单原因
    cancelDesc: '',
    isAndriod: getStorage('isAndriod'),
    // isVip: getStorage('isVip') || false,
    showCalender: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid
      })
    })
    // 已支付： DOP1544C3BDDA8AF0038ED141
    this.shipOid = options.id;
    this.code = options.code;
    wx.getScreenBrightness({
      success: (res) => {
        this.brightness = res.value
      },
    });
  },
  showCalendar() {
    this.setData({
      showCalender: true
    });
  },
  closeCalendar() {
    this.setData({
      showCalender: false
    });
  },
  check() {
    this.setData({
      showSpell: !this.data.showSpell
    })
  },
  checkSpellTip() {
    this.setData({
      spellTip: !this.data.spellTip
    })
  },
  checkSpellGroupTip() {
    this.setData({
      spellGroupTip: !this.data.spellGroupTip
    })
  },
  // 拼组-更多
  spellGroupMore() {
    let { spellInfo } = this.data;
    wx.navigateTo({
      url: `/pages/mineBox/spellGroupList/spellGroupList?list=${JSON.stringify(spellInfo.mergeTeamInfo.dietOrderMergeDetails)}`,
    });
  },
  handleCountdownFinish() {
    this.setData({
      countdownTime: null
    })
  },
  timeStrToDay(str) {
    return day(str.slice(0, 8))
      .set('hour', +str.slice(8, 10))
      .set('minute', +str.slice(10, 12))
      .set('second', +str.slice(12, 14))
  },
  closeQrcode() {
    this.setData({
      'dialog.qrcode': false
    })
    this.queryShipOrderDetailForThree();
    wx.setScreenBrightness({
      value: this.brightness
    })
  },
  takeMealCodeTap(evt) {
    const {
      disabled
    } = evt.currentTarget.dataset;
    const waybillRecord = this.data.waybillRecord;
    if(day() < day(waybillRecord.expectDate)){
      wx.showToast({
        title: '当天0：00出取餐二维码',
        icon: 'none',
      }); 
    }
    if (disabled) return;
    const code = this.asciiOrderId;

    if (code) {
      this.setData({
        'dialog.qrcode': true
      })

      wx.setScreenBrightness({
        value: 1,
        success: () => {
          drawQrcode({
            width: 173,
            height: 173,
            canvasId: 'qrcode',
            text: code,
          })
        }
      })
    }
  },
  signForTap() {
    requests.confirmedOrder({
      orderId: this.shipOid
    }).then(res => {
      if (res.obj.result) {
        this.queryShipOrderDetailForThree();
        // const eventChannel = this.getOpenerEventChannel();
        // eventChannel.emit('updateSure')
      }

      wx.showToast({
        title: res.obj.result ? '收货成功' : res.errMsg,
        icon: 'none',
      })
    })
  },
  phoneCallTap(e) {
    this.setData({
      'dialog.call': true,
      Tel: e.currentTarget.dataset.tel,
    })
  },
  copyTap() {
    wx.setClipboardData({
      data: this.data.waybillRecord.shipOid
    })
  },
  handlePhoneCallConfirm() {
    wx.makePhoneCall({
      phoneNumber: this.data.Tel
    })
    this.setData({
      'dialog.call': false,
    })
  },
  // 选择取消原因
  selectReason(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      cancelIndex: index === this.data.cancelIndex ? '' : index,
      applicationReason: index === this.data.cancelIndex ? '' : this.data.cancelReason[index].name,
      cancelDesc: '',
    })
  },
  // 选择原因后 弹出弹窗
  sureReson() {
    if (!this.data.applicationReason) {
      return
    }
    if(this.data.detail.$shipResult.detail.groupCorpId == '100097' && this.data.totalNums.length > 1){
      this.setData({
        showSureDialog: true,
        'dialog.cancelOrder': false
      })
    }else{
      this.setData({
        'dialog.cancelOrder': false
      })
      this.handleOrderCancelConfirm()
    }
  },
  handleOrderCancelDialog() {
    this.setData({
      showSureDialog: false
    })
  },
  handleOrderCancel() {
    this.setData({
      'dialog.cancelOrder': false
    })
  },
  handleOrderCancelConfirm() {
    let api = '';
    let {
      detail
    } = this.data;
    requests.orderRefundShipOrder({
      shipOid: this.shipOid,
      applicationReason: this.data.applicationReason,
      payNo: detail.soid,
    }).then(res => {
      this.setData({
        showSureDialog: false
      })
      if (res.errCode === 0) {
        app.globalData.gio('track', 'n_Cancelmeal', {
          mealNum: detail.shipResult.length
        })
        if(this.data.orderStt == '00'){
          wx.navigateBack({
            delta: 1
          }); 
          return
        }
        this.queryShipOrderDetailForThree();
      }
    })
  },
  // handleOrderCancelConfirm() {
  //   requests.orderRefundShipOrder({
  //     shipOid: this.shipOid
  //   }).then(res => {
  //     if (res.errCode === 0) {
  //       this.setData({
  //         'dialog.cancelOrder': false
  //       })
  //       this.queryShipOrderDetailForThree();
  //     }
  //   })
  // },
  cancelOrderTap() {
    this.setData({
      'dialog.cancelOrder': true,
      cancelIndex: '',
      cancelDesc: ' ',
      applicationReason: '',
    })
    let timeId = setTimeout(() => {
      this.setData({
        cancelDesc: '',
      })
      clearTimeout(timeId);
    }, 50);
  },
  closeLogDialogTap() {
    this.setData({
      'dialog.log': false
    })
  },
  showLogDialogTap({
    currentTarget
  }) {
    if (currentTarget.dataset.disabled) return;
    const {
      detail
    } = this.data;

    if (!detail.$shipResult.detail.tradeNo) {
      wx.showToast({
        title: '状态暂未更新',
        icon: 'none'
      });
      return;
    }
    this.getOrderLog()
      .then(() => {
        this.setData({
          'dialog.log': true
        })
      });
  },

  getOrderLog() {
    return requests
      .getOrderLog({
        trade_no: this.data.detail.$shipResult.detail.tradeNo
      })
      .then((res) => {
        if (res.errCode === 0) {
          const logs = res.obj.data_result
            .map((log) => {
              const dateTime = day(log.createTime)
              log.$date = dateTime.format('M/D')
              log.$time = dateTime.format('HH:mm')
              return log;
            })
            .reverse();
          this.setData({
            logs
          })
        } else {
          wx.showToast({
            title: '状态暂未更新',
            icon: 'none'
          });
        }
      })
  },
  toHealthScore(e) {
    const {detail: {shipResult}} = this.data
    const {index} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/packageOrder/healthScore/healthScore?page=orderDetail&index=${index}&oid=${shipResult[index].detail.orderId}`
    })
  },
  // 查询会员得分
  queryHealthScore() {
    let infoComposeList = []
    const {detail: {shipResult}} = this.data
    const tsuSubUid = wx.getStorageSync('subInfo').tsuSubUid || shipResult[0].subUid
    const { uid } = app.globalData

    shipResult.forEach(item => {
      infoComposeList.push({
        fromUid: tsuSubUid || uid,
        oid: item.detail.orderId,
        payFlag: true,
      })
    })
    requests
      .queryUserNutritionHealthScore({
        infoComposeList
      })
      .then(res => {
        if(res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms, info} = res.obj
          this.setData({
            scoreForms: scoreForms,
            humanInfoWithScore: info
          })
        }
      })
  },
  queryTotalShipOrder() {
    requests.queryTotalShipOrder({
      soid: this.data.waybillRecord.sourceOid
    }).then((res) => {
      if (res.errCode === 0) {
        const data = res.obj;
        this.setData({
          totalPrice: data.totalPrice,
          totalNums: data.num
        })
      }
    })
  },
  // 请求配送单详情 distributionMode 0配送 1自取
  queryShipOrderDetailForThree() {
    return requests.queryShipOrderDetailForThree({
      shipOid: this.shipOid
    }).then(res => {
      if (res.errCode === 0) {
        const detail = res.obj;
        const waybillRecord = detail.waybillRecord;
        detail.$shipResult = detail.shipResult[0];

        const {
          orderStt,
          distributionMode,
          groupCorpId
        } = detail.$shipResult.detail;
        detail.$status = orderStatusMap(orderStt, distributionMode, waybillRecord.subStt || undefined);
        detail.$groupCorpId = groupCorpId; // 团餐订单
        detail.$shipTime = detail.$shipResult.detail.takingTimeDan; // 送达时间
        detail.$orderTime = day(+waybillRecord.ctime).format('YYYY/M/D HH:mm'); // 下单时间
        detail.$payWay = waybillRecord.payWay
        detail.$mode = genDispatchTag(waybillRecord.shipWithCold, waybillRecord.deliveryFrequency, waybillRecord.distributionMode)
        detail.shipResult = detail.shipResult.map((ret) => {
          ret.$category = categoryMap[ret.detail.category];
          ret.$date = day(ret.detail.date).format('M月D日');
          ret.detail.skuList = filterTablewareSku(ret.detail.skuList)
            .map(sku => {
              sku.dietLabelList = sku.dietLabelList.filter(label => label.type === '02' && label.desc)

              return sku;
            });
          ret.pieData = this.data.pieData
            .map((it) => {
              it.value = ret[it.key];
              return it;
            })
            .filter((it) => Boolean(it.value));

          return ret;
        })
        detail.isToday = day().format('YYYYMMDD') == waybillRecord.expectDate;

        const nutriData = detail.shipResult.reduce((result, item) => {
          result.totalProtein = round(result.totalProtein + item.totalProtein, 2)
          result.totalCarbohydrate = round(result.totalCarbohydrate + item.totalCarbohydrate, 2)
          result.totalFat = round(result.totalFat + item.totalFat, 2)
          result.totalKcal = round(result.totalKcal + item.totalKcal, 2)
          // result.energyDiff = round(result.energyDiff + item.energyDiff, 2)
          return result;
        }, {
          totalProtein: 0, // 蛋白质
          totalCarbohydrate: 0, // 碳水
          totalFat: 0, // 脂肪
          totalKcal: 0, // 能量
          // energyDiff: 0 // 能量差
        })
        // 算出营养的百分比
        const radioTotal = nutriData.totalProtein + nutriData.totalCarbohydrate + nutriData.totalFat
        nutriData.proteinPercent = round(nutriData.totalProtein / radioTotal * 100, 0)
        nutriData.fatPercent = round(nutriData.totalFat / radioTotal * 100, 0)
        nutriData.carbohydratPercent = round(nutriData.totalCarbohydrate / radioTotal * 100, 0)


        // 遍历配送单数据下 每餐得单，相加每餐的费用 得出这个配送单的总费用
        const shipOrderCost = detail.shipResult.reduce(
          (result, item) => {
            const detailData = item.detail;
            // 算出折扣金额
            result.orderPrice = round(result.orderPrice + detailData.orderPrice)
            result.couponAmount = round(result.couponAmount + detailData.couponAmount);
            result.redpacketAmount = round(detailData.redpacketAmount) || 0;
            // const discountPrice = round((detailData.orderPrice) * (1 - detailData.discount) + detailData.groupAllowance)
            // 折扣金额 = 商品合计 + 餐具费用 - 预定奖励金 - （实际支付 - 配送费） - 企业补助 - 优惠券
            // 折扣金额 = （商品合计 + 餐具费用:orderPrice） - （预定奖励金:advanceRewards） - （实际支付 - 配送费:accountsPay） - （企业补助:groupAllowance） - （优惠券:couponAmount） - （维士红包:redpacketAmount）
            const discountPrice = round(detailData.orderPrice - detailData.advanceRewards - detailData.accountsPay - detailData.groupAllowance - detailData.couponAmount - detailData.redpacketAmount)
            result.discoutPrice = round(result.discoutPrice + discountPrice)
            result.accountsPay = round(result.accountsPay + detailData.accountsPay)
            result.tablewarePrice = round(result.tablewarePrice + item.tablewarePrice)
            result.packageFee = round(result.packageFee + detailData.packageFee)
            result.advanceRewards = round(result.advanceRewards + detailData.advanceRewards)
            return result;
          }, {
            couponAmount: 0, //优惠券抵扣
            tablewarePrice: 0, // 餐具费用
            orderPrice: 0, //商品总计
            discoutPrice: 0, //折扣
            accountsPay: 0, //实付
            packageFee: 0,//冷链保鲜袋费用
            advanceRewards: 0,//预订奖励金
          }
        );
        shipOrderCost.orderPrice = round(shipOrderCost.orderPrice - shipOrderCost.tablewarePrice - shipOrderCost.packageFee)
        // 优惠券
        // shipOrderCost.couponAmount = detail.$shipResult.detail.couponAmount
        // 预订奖励金
        // shipOrderCost.advanceRewards = shipOrderCost.advanceRewards
        // 配送费
        shipOrderCost.foodDeliveryPrice = waybillRecord.freightPrice
        shipOrderCost.accountsPay = round(shipOrderCost.accountsPay + shipOrderCost.foodDeliveryPrice) //实付
        shipOrderCost.discounts = round(shipOrderCost.discoutPrice + shipOrderCost.couponAmount, 2) || 0;

        if (orderStt === '00' // 待付款状态
          &&
          detail.$shipResult.limitTime) { // 且有limittime
          const countdownTime = this.timeStrToDay(detail.$shipResult.limitTime);
          this.setData({
            countdownTime: countdownTime.valueOf() - Date.now()
          })
        }

        if (detail.asciiOrderId) { // 生成取餐二维码的code
          this.asciiOrderId = detail.asciiOrderId;
        }

        const now = day();
        const changeable = orderStt === '01' && // 小于18点可以更改 明天的，大于18点 只能更改后天的，
          (now.get('hour') > 18 ?
            day(waybillRecord.shipTime).startOf('day') >= now.add(2, 'day').startOf('day') :
            day(waybillRecord.shipTime).startOf('day') >= now.add(1, 'day').startOf('day')) && waybillRecord.mergeFlag != '10'; //mergeFlag 10 拼单

        const statusDisabled = (detail.$shipResult.distributionMode == 1 ||
          orderStt == '00' ||
          orderStt == '09' ||
          orderStt == '99')
        const canUpdateTime = day(detail.$shipResult.detail.date + ' ' + detail.$shipResult.detail.mealTakingTime.slice(0, 5)) - day() >= 70 * 60 * 1000 && orderStt == '01' && waybillRecord.mergeFlag != '10'; //配送时间70min前可更改时间

        this.setData({
          canUpdateTime,
          statusDisabled,
          activityId: detail.activityId,
          orderStt,
          changeable,
          takeMealCode: waybillRecord.orderStt === '01' // 已支付订单
            &&
            waybillRecord.distributionMode === '1' // 自取单
            &&
            waybillRecord.takeMealCode,
          businessHours: detail.$shipResult.heatingPoint.stime.slice(0,2) + ':' + detail.$shipResult.heatingPoint.stime.slice(2,4) + '-' + detail.$shipResult.heatingPoint.etime.slice(0,2) + ':' + detail.$shipResult.heatingPoint.etime.slice(2,4),
          shopTel: detail.$shipResult.heatingPoint.shopTel,
          // pieData,
          nutriData,
          waybillRecord,
          shipOrderCost,
          detail
        })
      }
    })
  },
  switchShipOrderAddress(addressId, all) {
    const {
      waybillRecord,
      activityId
    } = this.data;
    return requests.switchShipOrderAddress({
      shipOid: this.shipOid,
      activityId: activityId,
      addressId,
      shipWithCold: waybillRecord.shipWithCold,
      dateTime: waybillRecord.shipTime.slice(0, 8),
      // category: this.data.detailData.detail.category,
      followUpStt: all ? '01' : '00',
      mealTakingTime: '',
      selfTaking: waybillRecord.distributionMode,
    })
  },

  // 更改时间
  updateTime: function (e) {
    return //修改时间屏蔽
    if (e.currentTarget.dataset.disabled) return;
    if (this.data.detail.$groupCorpId > 0) return // 团餐 
    const {
      detail
    } = this.data;
    const detailData = detail.$shipResult.detail;
    requests
      .queryHeatingPointConf({
        hId: detailData.heatingPoint,
        category: detailData.category,
        dataStt: '00',
        orderMethod: '01',
        selfTaking: '0',
        dateTime: detailData.date,
      })
      .then((res) => {
        if (res.errCode == '1009') {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return;
        }
        // let mt = day().format('YYYY/MM/DD');
        // let {
        //   stime,
        //   etime
        // } = res.obj.supplyConf;
        // let start = `${mt} ${stime.substring(0, 2)}:${stime.substring(2, 4)}`
        // let end = `${mt} ${etime.substring(0, 2)}:${etime.substring(2, 4)}`
        // const timeList = toTimeRangeList(start, end)
        const timeList = res.obj.selfTakingTimes;
        this.setData({
          timeList,
          showGetTime: true,
          canSure: true,
        });
        setTimeout(() => {
          this.setData({
            [`shortTime[0]`]: timeList.indexOf(detailData.takingTimeDan),
          })
        }, 300)
      })
  },
  setOrderId(shipOid) {
    const pages = getCurrentPages();
    const orderListPages = pages.find(
      page => page.route === 'pages/packageOrder/orderList/orderList'
    );
    if (orderListPages && this.shipOid == orderListPages.shipOid) {
      let orderTransferMap = orderListPages.data.orderTransferMap;
      orderTransferMap[orderListPages.psIndex].shipOid = shipOid
      orderListPages.shipOid = shipOid;
      orderListPages.setData({
        orderTransferMap
      })
    }
    this.shipOid = shipOid;
  },
  clickOverlay() {
    this.setData({
      showGetTime: false
    })
  },
  // sureTime: function () {
  //   const { detail, activityId, waybillRecord } = this.data;
  //   const detailData = detail.$shipResult.detail;
  //   const timeIndex = shortTime[0] < 0 ? 0 : shortTime[0];
  //   orderService
  //     .switchShipOrderAddress({
  //       shipOid: this.shipOid,
  //       activityId: activityId,
  //       addressId: '',
  //       shipWithCold: waybillRecord.shipWithCold,
  //       dateTime: detailData.date,
  //       category: detailData.detail.category,
  //       followUpStt: '00',
  //       mealTakingTime: that.data.timeList[timeIndex],
  //       selfTaking: selfTaking,
  //     })
  //     .then((res) => {
  //       that.setData({
  //         showGetTime: false,
  //         shortTime: '',
  //       },
  //         () => {
  //           that.init();
  //         }
  //       );
  //     })
  //     .catch((error) => { });
  // },
  checkChangeAddress(addressId) {
    const {
      waybillRecord
    } = this.data;

    return requests.checkChangeAddress({
      addressId,
      shipOid: waybillRecord.shipOid,
      followUpStt: '00',
      mealTakingTime: `${waybillRecord.shipTime.slice(8, 10)}:${waybillRecord.shipTime.slice(10, 12)}`,
      selfTaking: waybillRecord.distributionMode,
    });
  },
  addressTap(evt) {
    return//修改地址欧阳（产品）又说不支持修改
    if (evt.currentTarget.dataset.disabled) return;
    if (this.data.detail.$groupCorpId > 0) return // 团餐

    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=updateOrder&&activityId=${this.data.activityId}`
    })
  },
  goPay: function () {
    const component = this.payComponent || (this.payComponent = this.selectComponent('#pay'));
    component.pay(this.data.totalPrice)
  },
  async pay(evt) {
    const {
      wxPay,
      done,
      type
    } = evt.detail
    const app = getApp();
    try {
      const payRes = await requests.rePayOrder({
        payWay: type,
        openid: app.globalData.openId,
        payChannel: 'mina',
        tradeNo: this.data.detail.soid
      });
      if (payRes.errCode === 0) {
        if (type == 'wechat') {
          await wxPay(payRes.obj);
        }
      }
      // 如果是拼单
      if (this.data.waybillRecord.mergeFlag == '10') { //00 普通订单 10 拼单
        this.queryMergeTeamDetail();
      }
      this.queryShipOrderDetailForThree();
      // const eventChannel = this.getOpenerEventChannel();
      // eventChannel.emit('update', this.data.totalNums.map(i => i.shipOid))
    } catch (e) {
      console.log(e)
    }
    done();
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
    if(event.scrollTop > 20 && !this.data.hideMap){
      this.setData({
        hideMap: true
      })
    }else if(event.scrollTop <= 20 && this.data.hideMap){
      this.setData({
        hideMap: false
      })
    }
  },
  onPullDownRefresh: function () {
    this.queryShipOrderDetailForThree();
    // 如果是拼单
    if (this.data.waybillRecord.mergeFlag == '10') { //00 普通订单 10 拼单
      this.queryMergeTeamDetail();
    }
    setTimeout(() => {
      this.refreshView.stopPullRefresh();
    }, 1000);
  },
  refundTap(evt) {
    if (this.data.waybillRecord.uid != this.data.uid && this.data.waybillRecord.mergeFlag == '00') {
      return
    }
    const {
      index,
      skuIndex
    } = evt.currentTarget.dataset;
    const shipResult = this.data.detail.shipResult[index]
    const shipResultDetail = shipResult.detail
    const sku = shipResultDetail.skuList[skuIndex]

    // sku.$orderId = shipResultDetail.orderId;
    wx.navigateTo({
      url: `/pages/packageOrder/skuRefundDetail/skuRefundDetail?handleId=${sku.handleId}&orderId=${shipResultDetail.orderId}`,
      success: ({
        eventChannel
      }) => {
        sku.$date = shipResult.$date;
        sku.$category = shipResult.$category;
        eventChannel.emit('data', sku)
      }
    })
  },
  afterSaleTap(evt) {
    const {
      index,
      skuIndex
    } = evt.currentTarget.dataset;

    const shipResultDetail = this.data.detail.shipResult[index].detail
    const sku = shipResultDetail.skuList[skuIndex]
    wx.navigateTo({
      url: '/pages/packageOrder/skuRefund/skuRefund',
      success: ({
        eventChannel
      }) => {
        sku.$discount = shipResultDetail.discount;
        sku.$orderId = shipResultDetail.orderId;
        eventChannel.emit('data', sku)
      }
    })
  },
  sureTime: function () {
    const {
      detail,
      activityId,
      timeList,
      waybillRecord,
      shortTime
    } = this.data;
    const detailData = detail.$shipResult.detail
    const timeIndex = shortTime[0] < 0 ? 0 : shortTime[0];
    if (!this.data.canSure) {
      return
    }
    requests
      .switchShipOrderAddress({
        shipOid: this.shipOid,
        activityId,
        addressId: '',
        shipWithCold: waybillRecord.shipWithCold,
        dateTime: detailData.date,
        category: detailData.category,
        followUpStt: '00',
        mealTakingTime: timeList[timeIndex],
        selfTaking: waybillRecord.distributionMode,
      })
      .then((res) => {
        if (res.errCode !== 0) return;
        this.setData({
          showGetTime: false,
          shortTime: '',
        });
        this.queryShipOrderDetailForThree();
      })
  },
  selectTime: function (e) {
    this.setData({
      shortTime: e.detail.value,
    });
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

  queryRiderPosition() {
    const {
      detail
    } = this.data;
    requests
      .queryRiderPosition({
        tsold: detail.$shipResult.detail.tradeNo,
        shipOid: this.shipOid
      })
      .then((res) => {
        let markers = [{
          iconPath: "https://prodstatic.weis1606.cn/api/mini/rider_head_icon.png",
          latitude: res.obj.position.shiperLat,
          longitude: res.obj.position.shiperLng,
          width: 44,
          height: 50,
        }, {
          iconPath: "https://prodstatic.weis1606.cn/api/mini/weis_head_icon.png",
          latitude: res.obj.position.hpLat,
          longitude: res.obj.position.hpLng,
          width: 44,
          height: 50,
          callout: {
            content: detail.$shipResult.heatingPoint.name,
            textAlign: 'center',
            padding: 10,
            bgColor: '#fff',
            borderRadius: 2,
            fontSize: 12,
            color: '#333',
            display: 'ALWAYS',
          }
        }, {
          iconPath: "https://prodstatic.weis1606.cn/api/mini/map_marker.png",
          latitude: res.obj.position.userLat,
          longitude: res.obj.position.userLng,
          width: 20,
          height: 32,
        }];
        let includePoints = [{
          latitude: res.obj.position.hpLat,
          longitude: res.obj.position.hpLng,
        }, {
          latitude: res.obj.position.userLat,
          longitude: res.obj.position.userLng,
        }]
        this.setData({
          markers,
          includePoints
        })
      })
  },
  selectPay: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      payType,
      payIndex,
      shipOrderCost
    } = this.data
    if (index == payIndex) return
    if (index == 0 && shipOrderCost.accountsPay > Number(payType[0].balance)) {
      wx.showToast({
        title: '余额不足',
        icon: 'none',
      });
      return
    }
    this.setData({
      payIndex: index
    })
  },
  hideModal() {
    this.setData({
      ['dialog.log']: false,
      ['dialog.method']: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then(()=>{
      const appData = getApp().globalData;
      this.refreshView = this.selectComponent('#refresh-view')
      this.setData({
        isFullScreen: appData.isFullScreen,
        statusHeight: appData.navStatusHeight
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    loginPromise.then(()=>{
      this.queryShipOrderDetailForThree()
      .then((res) => {
        // this.data.orderStt === '00'
        if (this.data.detail.$shipResult.result || (this.data.waybillRecord.mergeFlag == '10' && this.data.orderStt === '00')) {
          this.queryTotalShipOrder();
        }
        if (this.data.orderStt === '06' && this.data.waybillRecord.distributionMode != '1') {
          this.queryRiderPosition();
        }
        // 如果是拼单
        if (this.data.waybillRecord.mergeFlag == '10') { //00 普通订单 10 拼单
          this.queryMergeTeamDetail();
        }
        this.queryHealthScore()
      })
    })
  },

  // 查询拼单信息
  // 查询拼单信息
  queryMergeTeamDetail() {
    requests.queryMergeTeamDetail({
      shipOid: this.code || this.shipOid,
    }).then((res) => {
      let spellInfo = res.obj;
      spellInfo.mergeTeamInfo.dietOrderMergeDetails = spellInfo.mergeTeamInfo.dietOrderMergeDetails.filter((item) => {
        return item.stt != '00'
      })
      spellInfo.num = spellInfo.mergeTeamInfo.dietOrderMergeDetails.length;
      spellInfo.saveFreight = round(spellInfo.num * spellInfo.mergeTeamInfo.dietOrderMerge.shipFee, 2);//省配送费
      this.setData({
        endTime: day(res.obj.mergeTeamInfo.dietOrderMerge.endTime).format('MM月DD日 HH:mm'),
        spellOrderStatus: day() < day(res.obj.mergeTeamInfo.dietOrderMerge.endTime), //true 未结束 false 已结束
        spellInfo,
      })
    })
  },

  back() {
    if (this.data.dialog.qrcode) {
      this.closeQrcode()
    } else if (this.data.dialog.cancelOrder) {
      this.handleOrderCancel()
    } else {
      wx.navigateBack({
        delta: 1
      });
    }
  },

  // 取消原因
  iptReson(e) {
    this.setData({
      cancelDesc: e.detail.value,
      applicationReason: e.detail.value,
      cancelIndex: '',
    })
  },

  // 评价
  discuss(e){
    let id = e.currentTarget.dataset.id;
    let evaluationStt = this.data.detail.evaluationStt;
    wx.navigateTo({
      url: `/pages/packageOrder/discuss/discuss?id=${id}&evaluationStt=${evaluationStt || ''}`,
    });  
  },

  goAddress(){
    let heatingPoint = this.data.detail.$shipResult.heatingPoint;
    wx.openLocation({
      latitude: Number(heatingPoint.latitude),
      longitude: Number(heatingPoint.longitude),
      scale: 18,
      name: heatingPoint.name,
      address: heatingPoint.shopAddress,
    });
  },

  goImg(){
    let {latitude, longitude, shopAddress, id} = this.data.detail.$shipResult.heatingPoint;
    requests.heatingPointListForRange({
      userLat: latitude,
      userLng: longitude,
      userAddr: shopAddress,
      hpId: id,
      showAll: false,
      key: 'machineInfo'
    }).then((res) => {
      let dtos = res.obj.dtos;
      wx.navigateTo({
        url: '/pages/packageOrder/storeImg/storeImg',
        success: (result) => {
          // 通过eventChannel向被打开页面传送数据
          result.eventChannel.emit('acceptDataFromOpenerPage', {
            machineInfo: dtos[0],
          });
        },
        fail: () => {},
        complete: () => {}
      });
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.setScreenBrightness({
      value: this.brightness
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setScreenBrightness({
      value: this.brightness
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  onShareAppMessage: function (e) {
    if (e.from == 'button') {
      let {
        spellInfo,
        categoryMap,
        waybillRecord
      } = this.data;
      // let mergeCode = this.shipOid;
      let mergeCode = this.code || this.shipOid;
      let {
        tgcaId,
        corpId
      } = waybillRecord;
      // orderMode: 00拼单 01拼组
      if(spellInfo.mergeTeamInfo.dietOrderMerge.orderMode == '00') {
        return {
          title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，一起拼单免配送费，快上车吧！`,
          imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareImg.png',
          path: `/pages/mineBox/order/index?spellOrder=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
        }
      }
      if(spellInfo.mergeTeamInfo.dietOrderMerge.orderMode == '01') {
        return {
          title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，越多人拼单返现越多，签收后立即返现到余额，快上车吧！`,
          imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/spellGroup_shareImg.png',
          path: `/pages/mineBox/order/index?spellGroup=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
        }
      }
    }
  }
})