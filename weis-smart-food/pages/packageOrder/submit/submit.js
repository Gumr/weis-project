// pages/predefine/submit/submit.js
// import day from '../../../utils/day';
import {
  filterTablewareSku,
  round,
  tablewareList,
  isTableware,
  toTimeRangeList,
  saveUseLog
} from '../../../utils/common'
import {
  distributionMode,
  spellType,
  categoryMap
} from '../../../utils/map'
var location = require('../../../libs/location');
import day from '../../../libs/day'
import apiRequest from '../../../service/index';
import shakeTool from '../../../libs/tool'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
    advanceRewards: 0,
    showBookDialog: false,
    px2rpx: app.globalData.px2rpx,
    tablewareList,
    statusHeight: wx.getStorageSync('navStatusHeight'), //状态栏高度,
    virtualHeight: '', //页面有效高度
    goodsList: [],
    rechargeCardList: [], // 充值卡列表
    toView: '',
    sendPrice: 0, //送餐费
    tablewareTotal: 0, // 餐具套数总计
    tablewarePrice: 0, // 餐具价格总计
    timeList: [],
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
    payPrice: 0,
    changeStt: '', //切换地址后
    deliveryType: [{
      groupName: '三方配送',
      name: '外卖配送',
      selfTaking: 0,
    }, {
      groupName: '到店自取',
      name: '到店自取',
      selfTaking: 1,
    }],
    balance: 0, // 用户余额
    distributionMode,
    usertips: false,
    hasActivity: false, // 是否参加企业减脂营
    spellType,
    showtype: 0,
    showSelfDialog: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // debugger
    this.setData({
      code: options.code ? options.code : '',
      from: options.from ? options.from : '',
      corpId: options.corpId ? options.corpId : null,
      tgcaId: options.tgcaId ? options.tgcaId : null,
      tgeRole: options.tgeRole ? options.tgeRole : '01',
      subuidsList: options.subuidsList ? JSON.parse(options.subuidsList) : undefined,
      spellOrder: options.spellOrder || '',
      mergeCode: options.mergeCode || '',
      subuidsListLength: options.subuidsList && JSON.parse(options.subuidsList).length > 0 ? JSON.parse(options.subuidsList).length : 1,
      typeAdd: options.typeAdd && options.typeAdd != 'undefined' ? options.typeAdd : '', // 团餐自定义地址
      tgcName: options.tgcName || '',
      selchild: options.selchild || false,
      selType: options.selType || undefined,
      spellGroup: options.spellGroup || '',
    })

    apiRequest.queryUserCurrActivity()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            hasActivity: Boolean(res.obj && (Object.keys(res.obj).length > 0))
          })
        }
      })
    this.countHeight() //计算系统高度
    this.getBuyCardForGoods();
    this.queryUserProgramme();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.modeShip = this.selectComponent("#mode");
    this.payPopup = this.selectComponent('#pay');
    this.spell = this.selectComponent('#spell');
  },

  queryTimeList() {
    return apiRequest.queryBusinessSendTime({
        corpId: this.data.corpId,
        tgcaId: this.data.tgcaId
      })
      .then(res => {
        let groupCorp = res.obj.groupCorp;
        groupCorp.name = groupCorp.tgcName.length < 9 ? groupCorp.tgcName : `${groupCorp.tgcName.substring(0,9)}...`;
        this.setData({
          groupCorpInfo: groupCorp, //企业 7折以下包括七折不可使用券和卡包
        })
        if (res.obj.groupCorp.corpAddress) {
          this.setData({
            groupCorp,
            hpid: res.obj.groupCorp.corpAddress.tgcaHeatingPoint,
            distance: res.obj.groupCorp.corpAddress.distance,
            tgcaDistributionType: res.obj.groupCorp.corpAddress.tgcaDistributionType, // 企业配送类型 01企业专送 02 三方配送
          })
        }
      })
  },
  showBooktips(e) {

    let {
      id
    } = e.currentTarget.dataset
    this.setData({
      showBookDialog: true,
      showtype: id
    })

  },
  bookDialogConfirm() {
    this.setData({
      showBookDialog: false
    })
  },
  iptNumber(e) {
    const {
      value
    } = e.detail
    this.$iptNum = Number(value)

  },
  blurIpfFn(e) {
    const {
      wrapindex,
      index,
      lastnum
    } = e.currentTarget.dataset
    // const preNum = this.data.nameList[wrapindex].detailList[index].num
    if (Number(this.$iptNum) > 0) {
      const nowNum = this.$iptNum - lastnum
      this.tablewareTap(e, nowNum)
    } else {
      this.userBillSettlementForShip()
    }
  },


  tablewareTap(evt, num = 1) {
    let {
      goodsIndex,
      detailIndex,
      heatPointIndex,
      cid,
      type,
      lastnum
    } = evt.currentTarget.dataset;
    const goods = this.data.goodsList[goodsIndex];
    const detail = goods.detailList[detailIndex];
    const heatPoint = detail.heatPoint[heatPointIndex];

    let number = evt.detail.value ? Number(evt.detail.value) : null;
    if (type == 'add') {
      num = 1
    } else if (type == 'reduce') {
      num = -1
    } else if (type == 'number') {
      if (number > lastnum) {
        num = number - lastnum
      } else {
        num = -(lastnum - number)
      }
    }

    if (num == 0 || !num) {
      return
    }

    this.addShoppingCart({
      code: this.data.code, // 套餐推荐的目录code
      cid,
      num: num, // 企业接口人未选择子账号可输入加购数量
      dateTime: goods.date,
      category: heatPoint.category,
      hpid: heatPoint.hpid,
      selfTaking: heatPoint.selfTaking,
      orderMethod: '01',
      corpId: this.data.corpId || undefined,
      // mealTakingTime: detail.mealTakingTime || '',
    }).then((res) => {
      if (res.errCode === 0) {
        this.userBillSettlementForShip();
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }
    })
  },
  addShoppingCart(params) {
    return apiRequest.addShoppingCart(params)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    if (this.wechatPay) {
      return
    }
    this.setData({
      hideLoad: false
    })
    if (this.data.from == 'groupMenu') { // 团餐 查询企业信息
      await this.queryTimeList()
    }

    this.judgeIsHospital = false;
    if (this.data.mergeCode && (!this.data.spellInfo || this.data.spellGroup)) { //拼单
      await this.queryMergeTeamDetail();
    }
    if (!Array.isArray(this.data.couponUserVos)) {
      await this.queryCoupon();
    }
    if (!Array.isArray(this.data.redPacketList)) {
      await this.queryRedPacketByUser();
    }
    this.userBillSettlementForShip();
    this.queryUserVipCouponMessage() // 维士会员状态
    saveUseLog('04', 0, '01', '', '05');
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
      spellInfo.waybillRecord.expectDesc = day(spellInfo.waybillRecord.expectDate).format('MM月DD日')
      spellInfo.num = spellInfo.mergeTeamInfo.dietOrderMergeDetails.length;
      this.setData({
        endTime: day(res.obj.mergeTeamInfo.dietOrderMerge.endTime).format('MM月DD日 HH:mm'),
        spellOrderStatus: day() < day(res.obj.mergeTeamInfo.dietOrderMerge.endTime), //true 未结束 false 已结束
        spellInfo,
      })
    })
  },

  check() {
    this.setData({
      spellTip: !this.data.spellTip
    })
  },

  checkDetail() {
    this.setData({
      showSpellTip: !this.data.showSpellTip
    })
  },

  showRule() {
    this.setData({
      showSpellTipRule: !this.data.showSpellTipRule,
      showSpellTip: false
    })
  },

  getBalance(e) {
    this.setData({
      balance: e.detail.balance
    })
  },

  countHeight: function () {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          virtualHeight: res.windowHeight - this.data.statusHeight
        })
      }
    })
  },

  queryUserProgramme() {
    apiRequest
      .queryUserProgramme({
        dateTime: day().format('YYYYMMDD'),
        isMainPlan: '0',
        planStt: '01',
        needGoods: false,
      })
      .then((res) => {
        let plandata = { //方案信息
          planname: (res.obj && res.obj.dietPlan.planName) || '',
          planCode: (res.obj && res.obj.dietPlan.planCode) || '00'
        }
        this.plandata = plandata;
      })
  },

  // 查询卡券
  queryCoupon: function () {
    var that = this;
    return apiRequest.queryCouponList({
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

  // 查询会员得分
  queryHealthScore(postData) {
    let {
      goodsList
    } = this.data
    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: postData
      })
      .then(res => {
        if (res.errCode === 0) {
          const {
            nutritionHealthScoreForms: scoreForms,
            info
          } = res.obj
          goodsList.forEach((item, index) => {
            item.detailList.forEach((item2, index2) => {
              for (var i = 0; i < scoreForms.length; i++) {
                if (item.date == scoreForms[i].dateTime && item2.category === scoreForms[i].category) {
                  item2.score = scoreForms[i].totalScore
                  item2.overRankPart = scoreForms[i].overRankPart // 超过百分比
                }
              }

            })
          })
          this.setData({
            goodsList,
            scoreForms,
            humanInfoWithScore: info
          })
        }
      })
  },
  // 查询红包
  queryRedPacketByUser: function () {
    var that = this;
    return apiRequest.queryRedPacketByUser()
      .then(res => {
        let redPacketList = res.obj.redPacketList ? res.obj.redPacketList : [];
        that.setData({
          redPacketList
        })
      })
      .catch(error => {

      })
  },

  // 结算
  userBillSettlementForShip: function (callback) {
    return new Promise((resolve, reject) => {
      var that = this;
      apiRequest.userBillSettlementForShip({
          orderMethod: '01',
          corpId: that.data.from == 'groupMenu' ? Number(that.data.corpId) : undefined,
          tgcaId: that.data.from == 'groupMenu' ? Number(that.data.tgcaId) : undefined,
          interface: (that.data.from == 'groupMenu' ? that.data.tgeRole : undefined),
          mergeFlag: that.data.spellOrder || that.data.spellGroup ? '10' : '00', //00 普通 10 拼单
          subuids: that.data.from == 'groupMenu' ? that.data.subuidsList : undefined,
          mergeCode: that.data.mergeCode || undefined,
          orderFor: this.data.selType || undefined,
          mergeMethod: this.data.spellOrder ? '00' : this.data.spellGroup ? '01' : '', // 00:统一地址,01:不同地址
        })
        .then(res => {
          if (res.errCode != 0) {
            wx.showModal({
              title: '提示',
              content: res.errMsg,
              showCancel: false,
              confirmText: '确定',
              confirmColor: '#000000',
              success: (result) => {
                if (result.confirm) {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              },
            });
          }
          let cartList = res.obj.cartList;
          let selloutArr = [];
          // 查询健康分参数
          let hsData = []
          const subInfo = wx.getStorageSync('subInfo')

          let tomorrowDate = day().add(1, 'day').format('YYYY/MM/DD');
          this.existReserve = false;
          cartList.forEach((item1, index1) => {
            if (day(item1.date).format('YYYY/MM/DD') == tomorrowDate) {
              item1.tomorrow = true;
            }
            // 判断是否存在预定 预定券的使用
            if (!this.existReserve && day(item1.date) >= day(tomorrowDate)) {
              this.existReserve = true;
            }
            item1.dateText = day(item1.date).format('MM月DD日')
            item1.detailList.forEach((item2, index2) => {
              let hsData_each = {
                fromUid: subInfo.tsuSubUid || app.globalData.uid,
                payFlag: false,
                cidList: {}
              }
              hsData_each.orderDate = item1.date
              hsData_each.category = item2.category

              if (!this.judgeIsHospital && item2.inScope) {
                this.judgeIsHospital = true;
                item2.showHospitalTag = true
              }
              item2.heatPoint.forEach((item3, index3) => {
                let sell = {
                  date: item1.date,
                  dateText: day(item1.date).format('MM月DD日'),
                  category: item3.category,
                  skuList: []
                };
                // existPrice 有效商品价格 existNum 有效商品数量 selloutNum 失效商品数量
                let existPrice = 0;
                let existNum = 0;
                let selloutNum = 0;
                item3.detailMapList = item3.detailMapList.filter(sku => sku.num > 0);
                const detailMapList = filterTablewareSku(item3.detailMapList)
                detailMapList.forEach((item4, index4) => {
                  hsData_each.cidList[item4.cid] = item4.num
                  item4.dietLabelList = (item4.dietLabelList || []).filter(label => label.type === '02');
                  if (!item4.dataStt) {
                    existNum += item4.num;
                    existPrice += item4.price * item4.num;
                    if (!item2.psEffective) {
                      // 该单（配送）存在正常sku，参与运费计算,有效单
                      item2.psEffective = true;
                    }
                  } else {
                    selloutNum += item4.num
                  }
                })
                hsData.push(hsData_each)
                item3.existPrice = round(existPrice, 2);
                item3.existNum = this.data.subuidsList && this.data.subuidsList.length > 0 ? this.data.subuidsList.length * existNum : existNum; //给子账号点单*子账号数量
                item3.selloutNum = selloutNum;
                // dataStt状态存在该sku失效
                sell.skuList = detailMapList.filter(item => item.dataStt); //该餐失效sku
                // sell.skuList = detailMapList
                item3.selloutList = detailMapList.filter(item => item.dataStt);
                item3.existList = detailMapList.filter(item => !item.dataStt);
                if (sell.skuList.length > 0) {
                  selloutArr.push(sell);
                }
              })
              if (that.data.mergeCode && !that.data.spellGroup) {
                item2.selfAddress = {
                  name: that.data.spellInfo.heatingPoint.name
                };
                item2.address = {
                  detail: that.data.spellInfo.waybillRecord.receivingAddress,
                  houseNum: '',
                  name: that.data.spellInfo.waybillRecord.consignee,
                  phone: that.data.spellInfo.waybillRecord.contactNumber,
                  id: that.data.spellInfo.waybillRecord.receivingId
                };
                item2.mealTakingTime = that.data.spellInfo.waybillRecord.expectTime;
                item2.shipType = that.data.spellInfo.waybillRecord.shipWithCold;
              }
            })
          })
          //res.obj.discount 1 不打折 
          that.setData({
            goodsList: cartList,
            selloutArr,
            discount: res.obj.discount,
            allPrice: res.obj.totalPrice, // 商品总价
            discountPrice: Number(res.obj.discountAmount), // 折扣价
            sendPrice: res.obj.foodDeliveryPrice, //配送费
            sjSubsidy: Number(res.obj.discountDeliveryPrice), //配送费补贴
            afterDiscountPrice: res.obj.actualPrice, // 折扣后的金额
            advanceRewards: Number(res.obj.advanceRewards), //预订送券金额
            employeeAllowance: res.obj.employeeAllowance, // 员工补助金额
            totalPackageNum: res.obj.totalPackageNum, // 包装袋数量
            totalPackageFee: res.obj.totalPackageFee, // 包装袋价格
            countPrice: res.obj.countPrice, // 总价格
            preToken: res.obj.preToken || '', // 拼单和拼组的标识
          }, () => {
            // 查询健康分
            this.queryHealthScore(hsData)
            that.calSendPrice();
            if (that.data.mergeCode && !that.data.spellGroup) {
              that.setData({
                hideLoad: true
              })
            } else {
              that.checkLat(function () {
                that.checkHeat(); //查询供餐点列表
              })
            }
            callback && callback()
          })
          // 中国银行-对私（数据）
          if (that.data.corpId == '100097') {
            that.setData({
              pointUsing: res.obj.pointUsing.map(item => { // 本次使用补助 && 本次剩余补助 && 本月补助情况 && 补助使用规则
                return {
                  ...item,
                  date: item.date ? item.date.substring(4, 6).replace(/\b(0+)/gi, "") + '月' + item.date.substring(6.8).replace(/\b(0+)/gi, "") + '日' : ''
                }
              }),
              pointHist: res.obj.pointHist.map(item => { // 本月已使用补助记录
                return {
                  ...item,
                  date: item.date ? item.date.substring(4, 6).replace(/\b(0+)/gi, "") + '月' + item.date.substring(6.8).replace(/\b(0+)/gi, "") + '日' : '',
                  price: parseFloat(Number(item.price).toFixed(2))
                }
              })
            })
          }
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 中行-员工补助说明-弹窗
  showusertips() {
    this.setData({
      usertips: true
    })
  },
  // 继续下单
  ahead() {
    this.setData({
      showSellOut: true
    }, async () => {
      // // 标记是否在库存不足时继续支付
      // this._isContinue = true
      await this.userBillSettlementForShip()
      // this.pay()
    })
  },
  // 菜品不足，更换单个菜品
  changeSingleGood: shakeTool.throttle(function(e) {
    if(!this._changedGood) {
      this._changedGood = true
      const {index, index2} = e[0].currentTarget.dataset
      const {selloutArr} = this.data
      const sku = selloutArr[index].skuList[index2]
      apiRequest.replaceSingleGoods({
        cid: sku.cid,
        dateTime: sku.date,
        category: sku.category,
        hpid: sku.hpid,
        addressId: sku.addressId || 0,
        selfTaking: sku.selfTaking,
        mealTakingTime: sku.mealTakingTime,
        corpId: sku.corpId,
        shipType: sku.shipType
      })
      .then(res => {
        if(res.errCode === 0) {
          const {compose} = res.obj
          this.setData({
            [`selloutArr[${index}].skuList[${index2}]`]: {
              ...sku,
              skuName: compose.skuname,
              cid: compose.cid,
              price: compose.price,
              inStock: true, // 区分是否有库存
              primaryImgUrl: compose.primaryImgUrl
            }
          })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
        this._changedGood = false
      })
    }
  }, 500),
  adjustment() {
    let that = this;
    if (that.data.from == 'groupMenu') { // 团餐
      apiRequest.cleanSkuListEmp({
          hpid: that.data.hpid,
          corpId: that.data.corpId,
          orderMethod: '01',
        })
        .then(res => {
          const pages = getCurrentPages();
          const lastPage = pages.find(
            page => page.route === 'pages/mineBox/groupSelectMeal/index'
          );
          if (!lastPage) {
            wx.showToast({
              title: '请返回点餐页面调整',
              icon: 'none',
            });
            return
          }
          let list = lastPage.data.list;
          let selloutArr = this.data.selloutArr || [];
          let index = 0;
          for (var i = 0; i < list.length; i++) {
            if (list[i].date == day(selloutArr[0].date).format('YYYY/MM/DD') && list[i].categoryType == selloutArr[0].category) {
              index = i;
              break
            }
          }
          lastPage.setData({
            mealIndex: index,
            leftIndex: 0,
            intoIndex: 'scroll_0',
          }, () => {
            wx.navigateBack({
              delta: 1
            });
          })
        })


    } else {
      apiRequest.cleanGoodsForShip({
          orderMethod: '01',
        })
        .then(res => {
          const pages = getCurrentPages();
          const lastPage = pages.find(
            page => page.route === 'pages/index/index'
          );
          if (!lastPage) {
            let pageIndex = pages.findIndex(
              page => page.route === 'pages/mineBox/order/index'
            )
            if (pageIndex >= 0) {
              wx.navigateBack({
                delta: pages.length - pageIndex - 1
              });
            } else {
              wx.showToast({
                title: '请返回点餐页面调整',
                icon: 'none',
              });
            }
            return
          }
          let list = lastPage.data.list;
          let selloutArr = this.data.selloutArr || [];
          let index = 0;
          for (var i = 0; i < list.length; i++) {
            if (list[i].date == day(selloutArr[0].date).format('YYYY/MM/DD') && list[i].categoryType == selloutArr[0].category) {
              index = i;
              break
            }
          }
          lastPage.setData({
            mealIndex: index,
            leftIndex: 0,
            intoIndex: 'scroll_0',
          }, () => {
            let pageIndex = pages.findIndex(
              page => page.route === 'pages/index/index'
            )
            wx.navigateBack({
              delta: pages.length - pageIndex - 1
            });
          })
        })
        .catch(error => {})
    }

  },


  // 查询经纬度
  checkLat: function (callBack) {
    var that = this;
    if (app.globalData.lat && app.globalData.lon) {
      callBack()
    } else {
      location.getCity(function (res) {
        callBack()
      })
    }
  },

  // 查询供餐点列表
  checkHeat: function () {
    var that = this;
    if (that.heatingPointList && that.heatingPointList.length > 0) {
      let heatingPointList = that.heatingPointList;
      let heatArr = heatingPointList.map((v) => {
        return v.id
      })
      let goodsList = that.data.goodsList;
      goodsList.forEach((item1, index1) => {
        item1.detailList.forEach((item2, index2) => {
          if (heatArr.indexOf(Number(item2.hpid)) > -1) {
            item2.selfAddress = heatingPointList[heatArr.indexOf(Number(item2.hpid))]
          }
        })
      })
      that.setData({
        goodsList,
      }, async () => {
        // 查询地址列表
        await that.address()
        // 同步点餐页面tab数据
        that.SynchronizeData()
      })

      return
    }
    let {
      goodsList,
      corpId
    } = that.data;
    apiRequest.heatingPointListForRange({
        userLat: app.globalData.lat,
        userLng: app.globalData.lon,
        userAddr: (app.globalData.userAddr && app.globalData.userAddr.address) || '',
        showScope: true,
        showAll: true,
        key: '6',
        shopType: goodsList[0].detailList[0].shopType,
        openLevel: corpId ? -1 : undefined,
      })
      .then(res => {
        let hpidList = res.obj.dtos;
        hpidList.forEach((item, index) => {
          item.distance = item.shipDistance;
          item.id = item.hpId;
          item.name = item.hpName;
          item.shopAddress = item.address;
          // 更改时间格式
          item.stime = item.stime.substring(0, 2) + ':' + item.stime.substring(2, 4)
          item.etime = item.etime.substring(0, 2) + ':' + item.etime.substring(2, 4)
        })
        that.heatingPointList = hpidList;
        let heatArr = hpidList.map((v) => {
          return v.id
        })
        goodsList.forEach((item1, index1) => {
          item1.detailList.forEach((item2, index2) => {
            if (heatArr.indexOf(Number(item2.hpid)) > -1) {
              item2.selfAddress = hpidList[heatArr.indexOf(Number(item2.hpid))]
            }
          })
        })
        that.setData({
          goodsList,
          heatList: hpidList
        }, async () => {
          // 查询地址列表
          await that.address()
          // 同步点餐页面tab数据
          that.SynchronizeData()
        })
      })
      .catch(error => {

      })
  },

  SynchronizeData() {
    let that = this;
    let {
      goodsList
    } = that.data;
    const pages = getCurrentPages();
    const lastPage = pages.find(
      page => (page.route === 'pages/index/index' || page.route === 'pages/packageOrder/snacks/snacks')
    );
    let list = lastPage ? lastPage.data.list : [];
    if (!lastPage) {
      return
    }
    goodsList.forEach((item1, index1) => {
      item1.detailList.forEach((item2, index2) => {
        item2.heatPoint.forEach((item3, index3) => {
          for (var i = 0; i < list.length; i++) {
            if (list[i].date == day(item1.date).format('YYYY/MM/DD') && list[i].categoryType == item3.category) {
              list[i].addressName = item2.selfTaking == 0 ? (list[i].hpid == item2.hpid && !item2.addressId ? list[i].addressName : item2.address.detail) : '';
              list[i].selfTaking = item2.selfTaking;
              list[i].addressId = item2.addressId;
              list[i].hpid = item2.hpid;
              list[i].hpName = item2.selfAddress.name;
              list[i].shipType = item2.shipType;
              break
            }
          }
        })
      })
    })
    if (lastPage) {
      lastPage.setData({
        list
      })
    }
  },

  switchShipType(shipType) {
    switch (shipType) {
      case '00': // 热配送
        return '02'
      case '01': // 冷配送
        return '03'
      case '02': // 热自取
        return '00'
      case '03': // 冷自取
        return '01'
    }
  },
  // 配送方式功能
  sureTake: function (e) {
    var that = this;
    let {
      day,
      category,
      take,
      cur
    } = e.currentTarget.dataset;
    let {
      goodsList
    } = that.data;
    if (take == cur) {
      return
    }
    wx.showLoading({
      title: ' ',
      mask: true,
    });
    let cateList = [];
    let shipType = take == '1' ? (goodsList[day].detailList[category].shipType == '00' ? '02' : '03') : (goodsList[day].detailList[category].shipType == '02' ? '00' : '01')
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })

    if ((take == '0' && goodsList[day].detailList[category].addressId) || take == '1') {
      let lat, lon
      if (take == '1') {
        that.checkLat(function () {
          lat = app.globalData.lat;
          lon = app.globalData.lon;
        })
      } else {
        lat = goodsList[day].detailList[category].address.lat;
        lon = goodsList[day].detailList[category].address.lon;
      }
      apiRequest.heatingPointListForRange({
          userLat: lat,
          userLng: lon,
          userAddr: take == '1' ? (app.globalData.userAddr && app.globalData.userAddr.address) || '' : goodsList[day].detailList[category].address.detail,
          hpId: take == '1' ? goodsList[day].detailList[category].hpid : undefined,
          showAll: take == '1' ? false : true,
          key: '7'
        })
        .then(res => {
          let hpidList = res.obj.dtos;
          let hpidPs = hpidList.filter((item) => {
            return item.hotFlag;
          }).length > 0 ? hpidList.filter((item) => {
            return item.hotFlag;
          }) : (hpidList.filter((item) => {
            return item.coldFlag;
          }).length > 0 ? hpidList.filter((item) => {
            return item.coldFlag;
          }) : hpidList.filter((item) => {
            return (item.selfTaking == '1' || item.selfTaking == '2');
          }));

          if (take == '0' && !hpidPs[0].hotFlag && !hpidPs[0].coldFlag) {
            wx.showToast({
              title: '不支持配送',
              icon: 'none',
            });
            return
          }

          if (take == '1' && hpidPs[0].selfTaking == '0') {
            wx.showToast({
              title: '当前加热点不支持自取',
              icon: 'none',
            });
            return
          }

          apiRequest.switchLogisticsWay({
              addressId: goodsList[day].detailList[category].addressId || 0,
              dateTime: goodsList[day].date,
              category: cateList,
              hpid: take == '1' ? goodsList[day].detailList[category].hpid : hpidPs[0].hpId,
              orderMethod: '01',
              selfTaking: take,
              shipTimes: goodsList[day].detailList[category].shipTimes,
              shipType: take == '1' ? shipType : (shipType == '00' && hpidPs[0].hotFlag ? '00' : '01'), // 把自取切配送 配送切自取
              allStt: true,
              apiFrom: '01',
            })
            .then(res => {
              setTimeout(() => {
                wx.hideLoading();
              }, 200)
              if (res.errCode == 0) {
                that.userBillSettlementForShip()
              } else if (res.errCode == 1009) {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                  image: '',
                  duration: 1500,
                  mask: false,
                });
              }
            })
            .catch(error => {
              wx.hideLoading();
            })
        })
        .catch(error => {
          wx.hideLoading();
        })
    } else {
      apiRequest.switchLogisticsWay({
          addressId: goodsList[day].detailList[category].addressId || 0,
          dateTime: goodsList[day].date,
          category: cateList,
          hpid: goodsList[day].detailList[category].hpid,
          orderMethod: '01',
          selfTaking: take,
          shipTimes: goodsList[day].detailList[category].shipTimes,
          shipType: shipType, // 把自取切配送 配送切自取
          allStt: true,
          apiFrom: '01',
        })
        .then(res => {
          wx.hideLoading();
          if (res.errCode == 0) {
            that.userBillSettlementForShip()
          } else if (res.errCode == 1009) {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });
          }
        })
        .catch(error => {

        })
    }
  },

  // 切换配送频率
  switchMode(e) {
    let that = this;
    let shopType = e.currentTarget.dataset.shopType;
    if (((that.data.from == 'groupMenu' && !that.data.typeAdd) || that.data.mergeCode) && !that.data.spellGroup || shopType == '20') { // 团餐不支持切换配送方式
      return
    }
    if (that.data.spellOrder) {
      that.chooseDelivery(e);
      return
    }
    let {
      day,
      category
    } = e.currentTarget.dataset;
    that.day = day;
    that.category = category;
    let {
      goodsList
    } = that.data;
    let {
      shipTimes,
      shipType,
      selfTaking,
      addressId,
      hpid,
      heatPoint
    } = goodsList[day].detailList[category];
    // unable 配送只有一餐不可选每日 配送多餐相同地址可选每日
    let unable = true;
    if (heatPoint.length > 1) {
      unable = false;
    } else {
      for (var i = 0; i < goodsList[day].detailList.length; i++) {
        if (i != category && goodsList[day].detailList[i].selfTaking == selfTaking && (selfTaking == 0 ? goodsList[day].detailList[i].addressId == addressId : goodsList[day].detailList[i].hpid == hpid)) {
          unable = false;
          break
        }
      }
    }
    that.modeShip.dispatch(shipTimes, shipType, unable, selfTaking);
    if (addressId) {
      that.getHpid(goodsList[day].detailList[category].address.lat, goodsList[day].detailList[category].address.lon, hpid, goodsList[day].detailList[category].address.detail, addressId);
    } else {
      that.checkLat(function () {
        that.getHpid(app.globalData.lat, app.globalData.lon, hpid, (app.globalData.userAddr && app.globalData.userAddr.address) || '');
      })
    }
  },

  getHpid(lat, lon, hpid, userAddr, addressId) {
    apiRequest.heatingPointListForRange({
        userAddr: userAddr || '',
        userLat: lat,
        userLng: lon,
        hpId: hpid,
        key: '8'
      })
      .then(res => {
        let hpidList = res.obj.dtos;
        this.selectHpidMode = hpidList[0];
        if (!addressId && (!this.selectHpidMode.hotFlag || !this.selectHpidMode.coldFlag) && (this.selectHpidMode.selfTaking == 0 || this.selectHpidMode.selfTaking == 1)) {
          // 定位地址匹配加热点 改为热配
          this.selectHpidMode.hotFlag = true;
          this.selectHpidMode.coldFlag = true;
        }
      })
      .catch(error => {

      })
  },

  // 确定配送频率
  confirm(e) {
    let that = this;
    let {
      day,
      category
    } = that;
    let {
      goodsList
    } = that.data;
    let shipType = e.detail.mode;
    let shipTimes = e.detail.time;
    let cateList = [];
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })
    if (that.selectHpidMode && ((shipType == '00' && !that.selectHpidMode.hotFlag) || (shipType == '01' && !that.selectHpidMode.coldFlag) || ((shipType == '02' || shipType == '03') && that.selectHpidMode.selfTaking == '0'))) {
      wx.showToast({
        title: shipType == '00' ? '不支持热食配送' : (shipType == '01' ? '不支持冷链配送' : '当前加热点不支持自取'),
        icon: 'none',
      });
      e.detail.callback()
      return
    }
    apiRequest.switchLogisticsWay({
        addressId: goodsList[day].detailList[category].addressId || 0,
        dateTime: goodsList[day].date,
        category: cateList,
        hpid: goodsList[day].detailList[category].hpid,
        orderMethod: '01',
        selfTaking: shipType == '00' || shipType == '01' ? 0 : 1,
        shipType: shipType,
        shipTimes: shipTimes,
        apiFrom: '02',
      })
      .then(res => {
        if (res.errCode == 0) {
          that.userBillSettlementForShip()
        } else if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch(error => {

      })
    e.detail.callback()
  },


  // 拼单切换配送方式
  chooseDelivery(e) {
    let {
      goodsList
    } = this.data;
    let {
      day,
      category
    } = e.currentTarget.dataset;
    this.day = day;
    this.category = category;
    let {
      shipType,
      addressId,
      hpid
    } = goodsList[day].detailList[category];
    if (addressId) {
      apiRequest.heatingPointListForRange({
          userAddr: goodsList[day].detailList[category].address.detail || '',
          userLat: goodsList[day].detailList[category].address.lat,
          userLng: goodsList[day].detailList[category].address.lon,
          hpId: hpid
        })
        .then(res => {
          let hpidCur = res.obj.dtos[0];
          this.spell.show(shipType, hpidCur.hotFlag ? (hpidCur.coldFlag ? '' : '01') : '00')
        })
        .catch(error => {

        })
    } else {
      this.spell.show(shipType)
    }
  },

  sureDelivery(e) {
    let {
      goodsList
    } = this.data;
    let {
      day,
      category
    } = this;
    let meal = goodsList[day].detailList[category].heatPoint[0].category;
    let shipType = e.detail.value;
    apiRequest.switchLogisticsWay({
        addressId: goodsList[day].detailList[category].addressId || 0,
        dateTime: goodsList[day].date,
        category: [meal],
        hpid: goodsList[day].detailList[category].hpid,
        orderMethod: '01',
        selfTaking: 0,
        shipType: shipType,
        shipTimes: '00',
        apiFrom: '02',
      })
      .then(res => {
        if (res.errCode == 0) {
          this.userBillSettlementForShip()
          this.setData({
            ['goodsList[' + day + '].detailList[' + category + '].shipType']: shipType
          })
        } else if (res.errCode == 1009) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch(error => {

      })
  },

  blurPhone: function (e) {
    var that = this;
    let {
      day,
      category,
    } = e.currentTarget.dataset;
    let goodsList = that.data.goodsList;
    let cateList = [];
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })
    if (e.detail.value.length < 11) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: true,
      });
    }
    apiRequest.switchLogistics({
        dateTime: goodsList[day].date,
        category: cateList,
        orderMethod: that.data.business ? that.data.business : '01',
        selfTaking: goodsList[day].detailList[category].selfTaking,
        addressId: goodsList[day].detailList[category].addressId,
        hpid: goodsList[day].detailList[category].hpid,
        // mealTakingTime: that.data.goodsList[day].detailList[index_category].mealTakingTime ? that.data.goodsList[day].detailList[index_category].mealTakingTime : (that.data.categoryTime[that.data.goodsList[day].detailList[index_category].category]),
        allStt: true,
        phone: e.detail.value
      })
      .then(res => {
        that.userBillSettlementForShip()
      })
      .catch(error => {

      })

  },


  // 计算运费
  calSendPrice: function () {
    // 计算运费
    let [...goodsList] = this.data.goodsList;
    let {
      corpId,
      groupCorpInfo
    } = this.data;
    let tablewarePrice = 0; //餐具
    let tablewareTotal = 0;

    goodsList.forEach((item1, index1) => {
      item1.detailList.forEach((item2, index2) => {
        item2.heatPoint.forEach((item3, index3) => {
          item3.detailMapList.forEach((item4, index4) => {
            const skuPrice = item4.num * item4.price;
            if (isTableware(item4) && !item4.dataStt) {
              // 是否餐具 存在库存
              tablewareTotal += item4.num;
              tablewarePrice += skuPrice;
            }
          })
        })
      })
    })
    // debugger
    this.setData({
      tablewarePrice: round(this.data.subuidsListLength * tablewarePrice, 1), //餐具总价
      tablewareTotal,
    }, () => {
      if (corpId && groupCorpInfo && groupCorpInfo.tgcEmpDiscount <= 0.7) {
        this.setData({
          payPrice: round(Number(this.data.countPrice), 2),
          unShare: true, //不能分享返现
        })
        return
      }
      this.checkCoupon();
      this.checkRedPacket()
    })
  },



  checkCoupon: function () {
    let {
      allPrice,
      afterDiscountPrice,
      couponUserVos,
      goodsList
    } = this.data;
    this.goodsIdArr = [];
    let canUseCoupon = [];
    let currentDate = new Date().getTime();
    goodsList.forEach((item1, index1) => {
      item1.detailList.forEach((item2, index2) => {
        item2.heatPoint.forEach((item3, index3) => {
          item3.detailMapList.forEach((item4, index4) => {
            if (this.goodsIdArr.indexOf(item4.cid) == -1) {
              this.goodsIdArr.push(item4.cid)
            }
          })
        })
      })
    })
    // 筛选出可使用的卡券
    couponUserVos.forEach((item, index) => {
      if (item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime && afterDiscountPrice >= Number(item.tcuRestrictAmount) && afterDiscountPrice > Number(item.tcuAmount)) {
        if (item.tcuUseType == '00') {
          // 普通券
          if (item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01' && this.existReserve)) {
            // 非预定券 || （预定券 && 存在预定日期）
            canUseCoupon.push(item)
          }
        } else if (item.tcuUseType == '02') {
          // 菜品券
          let skuArr = item.couponSys.map((v) => {
            return v.skuCid
          })
          for (var i = 0; i < skuArr.length; i++) {
            if (this.goodsIdArr.indexOf(skuArr[i]) >= 0) {
              if (item.tcuOrderThreshold == '00' || (item.tcuOrderThreshold == '01' && this.existReserve)) {
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

    // const payPrice = round(Number(this.data.afterDiscountPrice) + Number(this.data.sendPrice) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0), 2);
    const payPrice = round(Number(this.data.countPrice) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0), 2);
    const afterPriceSubCoupon = round(Number(this.data.afterDiscountPrice) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0), 2);
    this.setData({
      payPrice,
      afterPriceSubCoupon, //保存(金额-优惠券)后的金额，用于判断是否符合红包门槛
      useCouponNum
    })
  },

  checkRedPacket: function () {
    let {
      afterPriceSubCoupon,
      redPacketList,
      redPacket,
    } = this.data;
    let canUseRedPacket = [];
    let currentDate = new Date().getTime();
    // 筛选出可使用的红包
    redPacketList.forEach((item, index) => {
      if (item.stt == '00' && currentDate >= item.stime && currentDate <= item.etime && afterPriceSubCoupon >= Number(item.restrictAmount) && afterPriceSubCoupon >= Number(item.amount)) {
        canUseRedPacket.push(item);
      }
    })
    let useRedPacketNum = canUseRedPacket.length;
    // 以下几种情况无法使用红包，清空redPacket红包的数据
    let {
      coupon
    } = this.data;
    if (coupon.tcuStackable == 1 || useRedPacketNum == 0) {
      this.setData({
        useRedPacketNum,
        redPacket: null
      })
      return
    }
    // --------------------
    let canUseId = canUseRedPacket.map((v) => {
      return v.recordId
    });

    if (redPacket && canUseId.indexOf(redPacket.recordId) != -1) {
      this.setData({
        redPacket
      })
    } else {
      // 筛选出最大红包
      let maxRedPacket = Math.max.apply(Math, canUseRedPacket.map(function (o) {
        return o.amount
      }));
      let index = canUseRedPacket.map(item => item.amount).indexOf(maxRedPacket)
      this.setData({
        redPacket: canUseRedPacket.length > 0 ? canUseRedPacket[index] : ''
      })
    }

    const payPrice = round(Number(this.data.countPrice) - ((this.data.coupon && Number(this.data.coupon.tcuAmount)) || 0) - ((this.data.redPacket && Number(this.data.redPacket.amount)) || 0), 2)
    // const payPrice = round(Number(afterPriceSubCoupon) - ((this.data.redPacket && Number(this.data.redPacket.amount)) || 0), 2);
    this.setData({
      payPrice,
      useRedPacketNum
    })
  },

  toCoupon: function () {
    let afterDiscountPrice = this.data.afterDiscountPrice;
    wx.setStorageSync('goodsIdArr', this.goodsIdArr);
    wx.navigateTo({
      url: `/pages/mineBox/coupon-valid/coupon-valid?from=coupon&price=${afterDiscountPrice}&existReserve=${this.existReserve || ''}`,
    });
  },

  toRedPacket: function () {
    let afterPriceSubCoupon = this.data.afterPriceSubCoupon;
    let coupon = this.data.coupon;
    wx.navigateTo({
      url: `/pages/mineBox/coupon-valid/coupon-valid?from=redPacket&price=${afterPriceSubCoupon}&tcuStackable=${coupon.tcuStackable}`,
    });
  },


  pay: function () {
    var that = this;
    const {from, allPrice, spellOrder, goodsList} = this.data
    if (allPrice <= 0) {
      wx.showToast({
        title: '商品合计为0',
        icon: 'error'
      });
      return
    }

    if (spellOrder && goodsList[0].detailList[0].selfTaking == '1') {
      wx.showToast({
        title: '拼单不支持自取',
        icon: 'none',
      });
      return
    }
    this.coldNum = 0;
    if (from != 'groupMenu') {
      // 遍历是否全部有取餐时间
      let list = goodsList;
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].detailList.length; j++) {
          const meal = list[i].detailList[j]
          if (!meal.mealTakingTime) {
            this.setData({
              toView: `r_${i}_${j}`
            })
            return;
          }
          if (list[i].detailList[j].selfTaking == 0 && !list[i].detailList[j].address && list[i].detailList[j].itExist) {
            this.setData({
              toView: `r_${i}_${j}`
            })
            wx.showToast({
              title: '请选择送餐地址',
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });
            return
          }

        }
      }

    }
    // 自取二次确认弹窗
    if(goodsList[0].detailList[0].selfTaking == '1') {
      this.setData({
        showSelfDialog: true
      })
      return
    }
    this.paySubscriMessage()
  },
  selfDialogConfirm() {
    this.setData({
      showSelfDialog: false
    }, () => {
      this.paySubscriMessage()
    })
  },
  selfDialogCancel() {
    this.setData({
      showSelfDialog: false,
    }, () => {
      const {goodsList} = this.data
      // 更换门店
      if(goodsList.length == 1 && goodsList[0].detailList.length == 1) {
        this.setData({
          day: 0,
          category: 0,
          showHpid: true
        })
      }
    })
  },
  // 支付前先调起消息订阅
  paySubscriMessage() {
    const that = this
    wx.requestSubscribeMessage({
      tmplIds: ['HnZk0k3ZLM9IR28kMMFc1pdbgkPkRmmWdW-AriTbqac', 'cZ1Faqjdye6bA2D53hRempEowJ6zEJc6ftvSNODtNy4', 'OKWmqYn6u9nPpljarn8EPq1bFskAZg5kg4_7UVoSWGU'],
      success(res) {
        that.showPay()
      },
      fail(res) {
        that.showPay()
      }
    })
  },
  showPay() {
    let goodsList = this.data.goodsList;
    let coldNum = 0;
    goodsList.forEach((item1) => {
      item1.detailList.forEach((item2) => {
        item2.heatPoint.forEach((item3) => {
          if (item2.shipType == '01' || item2.shipType == '03') {
            coldNum++
          }
        })
      })
    })
    if (coldNum > 0) {
      wx.showModal({
        title: '温馨提示',
        content: `有${coldNum}餐为冷链，需要自己加热，你确定要冷链吗？`,
        showCancel: true,
        cancelText: '去修改',
        cancelColor: '#000000',
        confirmText: '继续支付',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            this.payPopup.pay(this.data.payPrice)
          }
        },
      });
    } else {
      this.payPopup.pay(this.data.payPrice)
    }
  },

  // 支付
  wxPay: function (e) {
    const {
      detail
    } = e;
    var that = this;
    let plandata = that.plandata // 方案信息
    // 深拷贝数组
    let [...goodsList] = this.data.goodsList;
    let putList = [];
    let mealNum = 0;
    for (var i = 0; i < goodsList.length; i++) {
      for (var j = 0; j < goodsList[i].detailList.length; j++) {
        // 配送单
        var psOrder = {};
        psOrder.dateTime = goodsList[i].date;
        psOrder.mealTakingTime = goodsList[i].detailList[j].mealTakingTime;
        psOrder.shipWithCold = (goodsList[i].detailList[j].shipType == '00' || goodsList[i].detailList[j].shipType == '02') ? '00' : '01';
        psOrder.distributionMode = that.data.from == 'groupMenu' && that.data.tgcaDistributionType == '01' ? '2' : goodsList[i].detailList[j].selfTaking; //配送方式 0.配送 1.自取 2企业专送
        psOrder.deliveryFrequency = goodsList[i].detailList[j].shipTimes;
        psOrder.tripDist = goodsList[i].detailList[j].selfAddress.shipDistance;
        psOrder.hpId = goodsList[i].detailList[j].selfAddress.hpId;
        psOrder.addressId = goodsList[i].detailList[j].address.id;
        psOrder.contactNumber = goodsList[i].detailList[j].selfTaking == 0 ? goodsList[i].detailList[j].address.phone : goodsList[i].detailList[j].phone;
        psOrder.transferForms = [];

        for (var h = 0; h < goodsList[i].detailList[j].heatPoint.length; h++) {
          mealNum++;
          var categoryMap = {};
          categoryMap.tdotDate = goodsList[i].date;
          categoryMap.mealTakingTime = goodsList[i].detailList[j].mealTakingTime;
          categoryMap.category = goodsList[i].detailList[j].heatPoint[h].category;
          categoryMap.detailForms = [];
          if (plandata.planCode != '00') { // 00方案不用传
            categoryMap.planName = plandata.planname;
            categoryMap.planCode = plandata.planCode;
          }

          let selloutList = goodsList[i].detailList[j].heatPoint[h].selloutList;
          // 筛选出更换菜品后，剩余的售罄菜品
          // selloutList = (selloutList && selloutList.map(item => {
          //   if(!item.isReplace) {
          //     return item
          //   }
          // })) || []
          selloutList = (selloutList && selloutList.map(({
            cid
          }) => cid)) || [];
          for (var n = 0; n < goodsList[i].detailList[j].heatPoint[h].detailMapList.length; n++) {
            var cidObj = {};
            const {
              cid,
              num,
              type
            } = goodsList[i].detailList[j].heatPoint[h].detailMapList[n];
            // 还要判断goodsId 是否不存在 已售罄的商品中
            if (goodsList[i].detailList[j].itExist && selloutList.indexOf(cid) === -1) {
              cidObj.tdodCid = cid;
              cidObj.tdodNum = num;
              cidObj.tdodType = type;
            }
            if (cidObj.tdodCid) categoryMap.detailForms.push(cidObj)
          }
          if (categoryMap.detailForms.length > 0) psOrder.transferForms.push(categoryMap);
        }
        if (psOrder.transferForms.length > 0) putList.push(psOrder)
      }
    }

    if (that.data.isGroups) {
      requestData.corpRole = that.data.tgeRole,
        requestData.groupCorpId = corpId
      requestData.tgcaId = wx.getStorageSync('tgcaId')

    }

    apiRequest.makeOrder({
        payChannel: 'mina',
        isDrawBill: '0',
        payWay: detail.type,
        wayBillForms: putList,
        payAmount: that.data.payPrice,
        discountRate: that.data.discount,
        couponAmount: that.data.coupon ? that.data.coupon.tcuAmount : 0,
        openid: app.globalData.openId,
        couponId: that.data.coupon ? that.data.coupon.tcuId : 0,
        groupCorpId: that.data.corpId ? that.data.corpId : undefined, // 团餐 
        tgcaId: that.data.tgcaId ? that.data.tgcaId : undefined, // 团餐 
        corpRole: that.data.tgeRole || '01',
        mergeFlag: that.data.spellOrder || that.data.spellGroup ? '10' : '00', //00 普通 10 拼单
        subuids: that.data.subuidsList ? that.data.subuidsList : undefined, //子账号
        redPackId: that.data.redPacket ? that.data.redPacket.recordId : '', // 红包券ID
        redPackAmount: that.data.redPacket ? that.data.redPacket.amount : '', // 红包券 面额
        mergeCode: that.data.mergeCode || undefined,
        preToken: this.data.preToken || '', // 拼单和拼组的标识
        mergeMethod: this.data.spellOrder ? '00' : this.data.spellGroup ? '01' : '', // 00:统一地址,01:不同地址
      })
      .then(res => {
        detail.done();
        if (res.errCode == '0') {
          let shopType = goodsList[0].detailList[0].shopType;
          let playNunmber = res.obj.wayBillDTOList ? res.obj.wayBillDTOList[0].transferDTOList[0].orderId : null;
          let price = res.obj.countPrice;
          let shareprice = (that.data.payPrice - that.data.sendPrice).toFixed(2);
          let corpId = this.data.corpId || '';
          let tgcaId = this.data.tgcaId || '';
          let orderId = res.obj.orderNumber;
          let payPrice = this.data.payPrice;
          let spellOrder = this.data.spellOrder || '';
          let spellGroup = this.data.spellGroup || '';
          // let shipOid = shopType == '20' ? res.obj.wayBillDTOList[0].shipOid : spellOrder || spellGroup ? res.obj.wayBillDTOList[0].mergeCode : ''; //仅拼单用 拼单mergeCode相同
          let shipOid = spellOrder || spellGroup ? res.obj.wayBillDTOList[0].mergeCode : res.obj.wayBillDTOList[0].shipOid //仅拼单用 拼单mergeCode相同
          let qrCodeStr = res.obj.qrCodeStr || '' // 当天单点自取单取餐二维码

          if (detail.type == 'wechat') {
            this.wechatPay = true;
            detail.wxPay(res.obj).then(data => {
              if (data.errMsg == 'requestPayment:ok') {
                app.globalData.gio('track', 'n_Payuser', {
                  payType: 'wechat',
                  mealNum,
                  useCoupon: that.data.coupon ? true : false,
                  spellOrder: spellOrder ? true : false,
                  ordertype: spellOrder ? (that.data.mergeCode ? '拼友' : '拼主') : '普通订单'
                })
                if ((spellOrder || spellGroup) && !that.data.mergeCode) {
                  wx.redirectTo({
                    url: `/pages/packageOrder/spellSucc/spellSucc?spellOrder=${spellOrder}&spellGroup=${spellGroup}&price=${price}&playNunmber=${playNunmber}&shareprice=${shareprice}&corpId=${corpId}&tgcaId=${tgcaId}&mergeCode=${shipOid}&mode=${that.data.subuidsList && that.data.subuidsList.length > 0 ? 'ischild' : ''}&unShare=${this.data.unShare || ''}`,
                  });
                } else {
                  wx.redirectTo({
                    url: `/pages/packageOrder/payStatus/payStatus?status=true&price=${price}&playNunmber=${playNunmber}&shareprice=${shareprice}&corpId=${corpId}&tgcaId=${tgcaId}&shipOid=${shipOid}&mode=${that.data.subuidsList && that.data.subuidsList.length > 0 ? 'ischild' : ''}&shopType=${shopType}&existReserve=${this.existReserve || ''}&qrCodeStr=${qrCodeStr}`,
                  });
                }
              }
            }).catch((data) => {
              if (data.errMsg == 'requestPayment:fail cancel') {
                wx.redirectTo({
                  url: `/pages/packageOrder/payStatus/payStatus?orderId=${orderId}&playNunmber=${playNunmber}&shareprice=${shareprice}&payPrice=${payPrice}&corpId=${corpId}&tgcaId=${tgcaId}&shipOid=${shipOid}&shopType=${shopType}&existReserve=${this.existReserve || ''}&qrCodeStr=${qrCodeStr}`,
                });
              }
              if (data.errMsg == 'requestPayment:fail (detail message)') {
                wx.showToast({
                  title: '支付失败',
                  icon: 'none',
                  image: '',
                  duration: 1500,
                  mask: false,
                });
              }
            })
          } else {
            app.globalData.gio('track', 'n_Payuser', {
              payType: 'balance',
              mealNum,
              useCoupon: that.data.coupon ? true : false,
              spellOrder: spellOrder ? true : false,
              ordertype: spellOrder ? (that.data.mergeCode ? '拼友' : '拼主') : '普通订单'
            })
            if ((spellOrder || spellGroup) && !that.data.mergeCode) {
              wx.redirectTo({
                url: `/pages/packageOrder/spellSucc/spellSucc?spellOrder=${spellOrder}&spellGroup=${spellGroup}&price=${price}&playNunmber=${playNunmber}&shareprice=${shareprice}&corpId=${corpId}&tgcaId=${tgcaId}&mergeCode=${shipOid}&mode=${that.data.subuidsList && that.data.subuidsList.length > 0 ? 'ischild' : ''}&unShare=${this.data.unShare || ''}`,
              });
            } else {
              wx.redirectTo({
                url: `/pages/packageOrder/payStatus/payStatus?status=true&price=${price}&playNunmber=${playNunmber}&shareprice=${shareprice}&corpId=${corpId}&tgcaId=${tgcaId}&shipOid=${shipOid}&mode=${that.data.subuidsList && that.data.subuidsList.length > 0 ? 'ischild' : ''}&shopType=${shopType}&existReserve=${this.existReserve || ''}&qrCodeStr=${qrCodeStr}`,
              });
            }
          }
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
      .catch(error => {

      })
  },


  getBuyCardForGoods() {
    apiRequest.getBuyCardForGoods({

    }).then((res) => {
      const cardList = res.errCode === 0 ? res.obj.cardList : [];
      this.setData({
        rechargeCardList: cardList.map((card) => {
          card.$present = card.totalAmount - card.cardModelBean.amount;
          return card;
        })
      })
    })
  },



  address: function () {
    var that = this;
    if (that.addressList && !that.requestAddress) {
      return new Promise((resolve) => {
        let addressArr = that.addressList.map((v) => {
          return v.id
        })
        let goodsList = that.data.goodsList
        goodsList.forEach((item1, index1) => {
          item1.detailList.forEach((item2, index2) => {
            // 配送
            if (addressArr.indexOf(item2.addressId) > -1) {
              item2.address = that.addressList[addressArr.indexOf(item2.addressId)]
            } else {
              item2.address = '';
              item2.addressId = '';
              item2.itExist = true;
            }
          })
        })
        that.setData({
          goodsList: goodsList,
          hideLoad: true
        })
        resolve()
      })

      return
    }
    return apiRequest.queryAddressListForThree({
        sortNum: '',
        dataStt: '',
      })
      .then(res => {
        that.requestAddress = false;
        that.addressList = res.obj.addressInfos;
        let addressArr = that.addressList.map((v) => {
          return v.id
        })
        let goodsList = that.data.goodsList
        goodsList.forEach((item1, index1) => {
          item1.detailList.forEach((item2, index2) => {
            // 配送
            if (addressArr.indexOf(item2.addressId) > -1) {
              item2.address = that.addressList[addressArr.indexOf(item2.addressId)]
            } else {
              item2.address = '';
              item2.addressId = '';
              item2.itExist = true;
            }
          })
        })
        that.setData({
          goodsList: goodsList,
          hideLoad: true
        })
      })
      .catch(error => {

      })
  },

  // 显示该配送单所有商品
  showAll(e) {
    let {
      date,
      cate
    } = e.currentTarget.dataset;
    if (this.data.from === 'groupMenu') return
    let goodsList = this.data.goodsList;
    let cateList = goodsList[date].detailList[cate].heatPoint;
    let showAllList = {
      date: day(goodsList[date].date).format('M月D日'),
      cateList: cateList,
      subuidsList: this.data.subuidsList && this.data.subuidsList.length > 0 ? this.data.subuidsList.length : 1 // 点餐的子账号
    };
    wx.setStorageSync('showAllList', showAllList);
    wx.navigateTo({
      url: `/pages/packageOrder/showCateList/showCateList?date=${date}&cate=${cate}`,
    });
  },

  own(e) {
    let {
      day,
      category,
      shopType
    } = e.currentTarget.dataset;
    if ((this.data.from == 'groupMenu' && this.data.typeAdd == '') || shopType == '20') { // 团餐 不是自定义地址
      return;
    }
    this.setData({
      day: day,
      category: category,
      showHpid: true
    })
  },

  close() {
    this.setData({
      showHpid: false
    })
  },

  selectStore(e) {
    let that = this;
    let heatList = that.data.heatList;
    let index = e.detail;
    let {
      day,
      category,
      goodsList
    } = that.data;
    let cateList = [];
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })
    if (heatList[index].selfTaking == 0) {
      return
    }
    apiRequest.switchLogisticsWay({
        dateTime: goodsList[day].date,
        category: cateList,
        orderMethod: '01',
        selfTaking: goodsList[day].detailList[category].selfTaking,
        addressId: goodsList[day].detailList[category].addressId || 0,
        hpid: heatList[index].id,
        mealTakingTime: goodsList[day].detailList[category].mealTakingTime,
        shipTimes: goodsList[day].detailList[category].shipTimes,
        shipType: goodsList[day].detailList[category].shipType,
        allStt: true,
        apiFrom: '03'
      })
      .then(res => {
        that.setData({
          showHpid: false
        }, () => {
          if (res.errCode != 0) {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
            });
            return
          }
          that.userBillSettlementForShip()
        })
      })
      .catch(error => {

      })
  },


  // 切换地址
  cutAddress: function (e) {
    if (this.data.mergeCode && !this.data.spellGroup) {
      return
    }

    let groupCorp = this.data.groupCorp ? JSON.stringify(this.data.groupCorp) : null

    if (this.data.from == 'groupMenu' && this.data.tgcaDistributionType == '01' && !this.data.typeAdd) { // 企业专送不能选地址 应产品要求2021/12/24 可以修改地址信息 同下
      wx.navigateTo({
        url: `/pages/packageOrder/addAddress/addAddress?type=groupEdit&groupCorp=${groupCorp}`,
      });
      // return
    } else if (this.data.from == 'groupMenu' && this.data.tgcaDistributionType != '01' && !this.data.typeAdd) { //企业三方配送 不是自定义地址 编辑地址信息 

      wx.navigateTo({
        url: `/pages/packageOrder/addAddress/addAddress?type=groupEdit&groupCorp=${groupCorp}`,
      });

    } else {
      this.requestAddress = true;
      this.setData({
        day: e.currentTarget.dataset.day,
        category: e.currentTarget.dataset.category
      })
      wx.navigateTo({
        url: `/pages/packageOrder/addressList/addressList?type=submit`
      });
    }

  },

  updateAddress(address, callBack) {
    var that = this;
    let {
      day,
      category,
      goodsList,
      spellOrder,
      spellGroup,
    } = that.data;
    let curShipType = goodsList[day].detailList[category].shipType;
    let curShipTimes = goodsList[day].detailList[category].shipTimes;
    apiRequest.heatingPointListForRange({
        userLat: address.lat,
        userLng: address.lon,
        key: '9',
        userAddr: `${address.province || ''}${address.city || ''}${address.area || ''}${address.street || ''}${address.detail || ''}`,
      })
      .then(res => {
        let hpidList = res.obj.dtos;
        let hpidIndex = hpidList.findIndex((item, index) => item.hpId == goodsList[day].detailList[category].hpid);
        // 冷链每日达 切换地址匹配最优加热点不支持冷链，加热点仍使用原加热点
        if (hpidIndex > 0 && curShipType == '01' && !hpidList[0].coldFlag) {
          that.hpidAddress = hpidList[hpidIndex];
          that.switchNearest(curShipType, callBack)
        }
        // 原来的加热点仍可配送 当前匹配出最新加热点
        else if (hpidIndex > 0 && !spellOrder && !spellGroup) {
          let content = !hpidList[hpidIndex].hotFlag && hpidList[hpidIndex].coldFlag && hpidList[0].hotFlag && (hpidList[0].selfTaking == 0 || hpidList[0].selfTaking == 1) ? `当前地址距离${hpidList[hpidIndex].hpName}太远，只能冷链配送。${hpidList[0].hpName}距离更近，可以热链配送。是否切换成${hpidList[0].hpName}配送？` : `匹配出距离当前地址最近的店面${hpidList[0].hpName}，是否同意切换`;
          wx.showModal({
            title: '提示',
            content: content,
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: (result) => {
              if (result.confirm) {
                that.hpidAddress = hpidList[0];
                that.switchNearest(curShipType, callBack)
              } else {
                that.hpidAddress = hpidList[hpidIndex];
                that.switchNearest(curShipType, callBack)
              }
            },
          });
        } else {
          that.hpidAddress = hpidList.filter((item) => {
            return curShipType == '00' ? item.hotFlag && (item.selfTaking == 0 || item.selfTaking == 1) : item.coldFlag && (item.selfTaking == 0 || item.selfTaking == 1);
          })[0];
          if (!that.hpidAddress) {
            that.hpidAddress = hpidList[0];
          }
          that.switchNearest(curShipType, callBack)
        }
      })
      .catch(error => {

      })
  },

  // 切换地址
  switchNearest(curShipType, callBack) {
    let that = this;
    if (curShipType == '00' && !that.hpidAddress.hotFlag && that.hpidAddress.coldFlag && (that.hpidAddress.selfTaking == 0 || that.hpidAddress.selfTaking == 1)) {
      // 热改冷 callback传值 1 热改冷 2 配送改自取 否则 正常原值
      that.shipType = '01';
      callBack('1')
    } else if (!that.hpidAddress.hotFlag && !that.hpidAddress.coldFlag || that.hpidAddress.selfTaking == 2) {
      // 配送改自取
      that.shipType = curShipType == '00' ? '02' : '03';
      callBack('2', that.hpidAddress)
    } else {
      that.shipType = curShipType == '00' ? (that.hpidAddress.hotFlag ? '00' : '01') : (that.hpidAddress.coldFlag ? '01' : '00');
      callBack()
    }
  },

  // 更改某餐地址
  switchAddress: function (address, selfTaking, callBack) {
    var that = this;
    let day = that.data.day;
    let category = that.data.category;
    let goodsList = that.data.goodsList;
    let cateList = [];
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })
    apiRequest.switchLogisticsWay({
        dateTime: goodsList[day].date,
        category: cateList,
        orderMethod: '01',
        selfTaking: selfTaking ? selfTaking : goodsList[day].detailList[category].selfTaking,
        addressId: selfTaking ? goodsList[day].detailList[category].addressId || 0 : address.id,
        hpid: that.hpidAddress.hpId,
        shipTimes: goodsList[day].detailList[category].shipTimes,
        shipType: that.shipType,
        allStt: true,
        apiFrom: '03',
      })
      .then(res => {
        if (res.errCode == '1009') {
          return
        }
        if (typeof callBack === "function") {
          that.setData({
            changeStt: res.obj && res.obj.changeStt,
            lockIndex1: `${day}`,
            lockIndex2: `${category}`,
          }, () => {
            callBack(res);
          })
        }
      })
      .catch(error => {

      })
  },


  // 更改时间
  cutTime: function (e) {
    if ((this.data.from == 'groupMenu' && this.data.tgcaDistributionType == '01') || (this.data.mergeCode && !this.data.spellGroup)) { // 企业专送不能选时间
      return
    }

    let {
      dayIdx,
      category,
      time
    } = e.currentTarget.dataset;
    let goodsList = this.data.goodsList;
    let psOrder = goodsList[dayIdx].detailList[category];
    if (!psOrder.address && psOrder.selfTaking == 0 && this.data.from != 'groupMenu') {
      wx.showToast({
        title: '请先选择配送地址',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return
    }

    apiRequest.queryHeatingPointConf({
        hId: psOrder.hpid,
        category: psOrder.heatPoint[psOrder.heatPoint.length - 1].category,
        dataStt: '00',
        orderMethod: '01',
        selfTaking: psOrder.selfTaking,
        dateTime: goodsList[dayIdx].date,
        mergeFlag: this.data.spellOrder || this.data.spellGroup ? '10' : '00', //00 普通 10 拼单
        changeFlag: true,
        shipWithCold: psOrder.shipType,
      })
      .then(res => {
        if (res.errCode == '1009') {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        let timeList = [];
        if (psOrder.selfTaking == '0') {
          // let mt = day().format('YYYY/MM/DD');
          // let {
          //   stime,
          //   etime
          // } = res.obj.supplyConf;
          // let start = `${mt} ${stime.substring(0, 2)}:${stime.substring(2, 4)}`
          // let end = `${mt} ${etime.substring(0, 2)}:${etime.substring(2, 4)}`
          // timeList = toTimeRangeList(start, end)
          timeList = res.obj.selfTakingTimes
        } else {
          timeList = res.obj.selfTakingTimes
        }
        if (timeList && timeList.length > 0) {
          this.setData({
            timeList,
            shortTime: time ? [timeList.indexOf(time) >= 0 ? timeList.indexOf(time) : 0] : [0],
            day: dayIdx,
            timeSelectTitle: psOrder.selfTaking == '0' ? '预计到达时间' : '预计取餐时间', // 根据时间类型 设置 时间选择弹窗的title
            category: category,
            showGetTime: true,
            canSure: true,
          })
        }
      })
      .catch(error => {

      })
  },


  cancelTime: function () {
    this.setData({
      showGetTime: false,
      shortTime: '',
    })
  },

  sureTime: function () {
    var that = this;
    if (!that.data.canSure) {
      return
    }
    let {
      day,
      category,
      goodsList
    } = that.data;
    let cateList = [];
    goodsList[day].detailList[category].heatPoint.forEach((item) => {
      cateList.push(item.category)
    })

    apiRequest.switchLogisticsWay({
        dateTime: goodsList[day].date,
        category: cateList,
        orderMethod: '01',
        selfTaking: goodsList[day].detailList[category].selfTaking,
        addressId: goodsList[day].detailList[category].addressId || 0,
        shipTimes: goodsList[day].detailList[category].shipTimes,
        shipType: goodsList[day].detailList[category].shipType,
        hpid: goodsList[day].detailList[category].hpid,
        mealTakingTime: that.data.timeList[that.data.shortTime[0]],
        allStt: true,
        apiFrom: '04',
      })
      .then(res => {
        const mealTakingTime = that.data.timeList[that.data.shortTime[0]];
        that.setData({
          showGetTime: false,
          shortTime: '',
        }, () => {
          if (res.errCode == 0) {
            that.setData({
              ['goodsList[' + day + '].detailList[' + category + '].mealTakingTime']: mealTakingTime,
            })
          }
          // that.userBillSettlementForShip()
        })
      })
      .catch(error => {

      })
  },

  selectTime: function (e) {
    this.setData({
      shortTime: e.detail.value
    })
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

  recharge() {
    wx.navigateTo({
      url: `/pages/mineBox/balance/balance?source=submit`,
    });
  },

  // 维士会员
  member() {
    saveUseLog('04', 0, '02', '', '05');
    wx.navigateTo({
      url: `/pages/packSubAccount/member/member/member`,
      // url: `/pages/packSubAccount/member/member/member?btnStatus=${this.data.vipCouponTip.btnStatus}`,
    });
  },
  queryUserInfo: function () {
    return new Promise((resolve, reject) => {
      apiRequest.queryUserInfo()
        .then(res => {
          resolve(res)
        })
        .catch(error => {

        })
    })
  },
  // 维士会员
  async queryUserVipCouponMessage() {
    let res = await this.queryUserInfo()
    apiRequest.queryUserVipCouponMessage({
        uid: res.obj.userInfo.uid
      })
      .then(res => {
        let obj = res.obj;
        let vipCouponTip = {
          title: '维士会员'
        }
        // vipStt: 01 立即开通 02 没券续费 03 有券续费  04 五折购买
        vipCouponTip.text = '开通维士会员，立即获得' + obj.couponNum + '张' + obj.couponAmount + '元无门槛券'
        vipCouponTip.btnText = '立即开通'
        switch (obj.vipStt) {
          case '01':
            vipCouponTip.discount = 3
            break;
          case '02':
            vipCouponTip.discount = 4
            break;
          default:
            vipCouponTip = null
        }
        this.setData({
          // vipCoupon: obj,
          vipCouponTip
        })
      })
      .catch(error => {

      })
  },
  // 拼组-查看详情
  spellGroupCheck() {
    this.setData({
      spellGroupTip: !this.data.spellGroupTip
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
  onShareAppMessage: function (options) {
    if (options.from == "button") {
      let {
        spellInfo,
        categoryMap,
        mergeCode,
        tgcaId,
        corpId
      } = this.data;
      return {
        title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，一起拼单免配送费，快上车吧！`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareImg.png',
        path: `/pages/mineBox/order/index?mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
      }
    } else {
      return {
        title: '维士健身饮食，健康美味！',
        path: '/pages/index/index',
        imageUrl: "https://prodstatic.weis1606.cn/api/mini/small_program_share.png",
        success: (res) => {

        },
        fail: (res) => {

        }
      }
    }
  }
})