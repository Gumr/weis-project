// pages/my/my.js
const app = getApp();
import apiRequest from '../../service/index';
const util = require('../../utils/util')
import {
  getStorage,
  setStorage
} from '../../utils/storage'
import {
  isLoginClick,
  loginPromise,
  t,
  round,
  judgeSubAccount,
  saveUseLog
} from '../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusHeight: wx.getStorageSync('navStatusHeight'),
    contactShow: false, // 联系客服-确认框
    tel: '4006681606', // 电话号码
    pszOrder: false,
    unUsedOrder: false,
    isIpx: Boolean(getApp().globalData.isIpx),
    isLogin: true,
    employeeInfo: [], // 客户渠道信息
    info: '',
    list: [{
      name: '待用餐',
      icon: '/images/my/have_meals.png',
      index: '0',
    }, {
      name: '全部订单',
      icon: '/images/my/my_wallet.png',
      index: '1',
    }, {
      name: '套餐',
      icon: '/images/my/set_meal.png',
      index: '3',
    }, {
      name: '退货/售后',
      icon: '/images/my/return_goods.png',
      index: '2',
    }],
    IMG_URL: app.globalData.IMG_URL,
    replaceList: [], // 有订单
    isNews: {}, // 有消息
    showTip: '', // “我的客户经理”页面的消息弹框-是否显示，不显示则当前页面的“有消息”也不显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let hideInviteBubbles = wx.getStorageSync('hideInviteBubbles') || false;
    this.setData({
      hideInviteBubbles
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
    this.setData({
      isVip: wx.getStorageSync('isVip') || false,
    })
    saveUseLog('04', 0, '01', '', '06');
    loginPromise.then((res) => {
      let loginInfo = getStorage('loginInfo');
      this.setData({
        isLogin: loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile,
        showComponent: !(loginInfo.isAuthorized && loginInfo.isLogin),
        subToken: getStorage("subToken") || '',
        subInfo: getStorage('subInfo') || {},
      })
      // 查询用户
      this.queryEmployeeInfo()
      const queryUserInfo = this.queryUserInfo();
      // 查询客户经理
      const queryManager = this.queryManager();
      this.queryUserTarget();
      this.queryOrder();
      this.amount();
      this.querycoupon();
      this.queryRedPacketByUser();
      this.replaceList(queryUserInfo, queryManager)
      this.news();
      this.queryUserVipCouponMessage() // 维士会员状态
      this.toolkitRoot() // 工具包白名单
      // 判断子账户是否有效
      judgeSubAccount()
      app.checkUnread('', () => {
        // 查询最新未读
        var uncheck = app.globalData.uncheck
        this.setData({
          uncheck: Boolean(Boolean(Object.keys(uncheck).length > 0))
        })
      })
    })
  },
  // 是否显示“有消息”
  news() {
    // showTip: “我的客户经理”页面的消息弹框-是否显示，不显示则当前页面的“有消息”也不显示
    const showTip = wx.getStorageSync('showTip');
    apiRequest.checkHaveCounselor({})
      .then(res => {
        this.setData({
          isNews: res.obj,
          showTip: showTip === false ? showTip : true
        })
      })
      .catch(error => {})
  },
  inviteTap() {
    wx.navigateTo({
      // url: '/pages/mineBox/inviteNew/inviteNew'
    })
  },
  // 切换账号
  switch () {
    wx.navigateTo({
      url: '/pages/packSubAccount/switchAccount/switchAccount',
    });
  },
  queryUserTarget() {
    apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            identifer: res.obj && res.obj.healthGoal && res.obj.healthGoal.planningType
          })
          setStorage('planType', res.obj && res.obj.healthGoal && res.obj.healthGoal.planningType)
        }
      })
  },
  login: isLoginClick(function () {

  }),
  updateLogin(e) {
    if (e.detail.type == '1') {
      this.queryUserInfo()
    }
    let loginInfo = getStorage('loginInfo');
    this.setData({
      isLogin: loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile,
    })
  },
  // 我的瘦身必备
  // myActive: function () {
  //   wx.navigateTo({
  //     url: '../mineBox/mineActive/mineActive',
  //   });
  // },
  // 地址管理
  myAddress: function () {
    wx.navigateTo({
      url: `/pages/packageOrder/addressList/addressList?type=my`,
    })
  },
  // 联系客服
  contact: function () {
    wx.navigateTo({
      url: '/pages/mineBox/contact/contact',
    });
    // this.setData({
    //   contactShow: true
    // })
  },
  // 联系客服-确定
  contactConfirm: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.tel
    })
    this.setData({
      contactShow: false
    })
  },
  // 意见反馈
  // proposal() {
  //   wx.navigateTo({
  //     url: '/pages/packageOrder/advise/advise',
  //   });
  // },
  // 关于维士
  about() {
    wx.navigateTo({
      url: '/pages/mineBox/aboutWeis/aboutWeis',
    });

  },
  // 饮食偏好
  // taboo: function () {
  //   wx.navigateTo({
  //     url: '../orderFood/taboo/taboo?type=my',
  //   });
  // },

  mySolution: function () {
    wx.navigateTo({
      // url: '../solution/history/history?from=history',
    });
  },
  // 我的客户经理
  myAgenthook: function () {
    let obj = {
      result: this.data.isNews.result,
      orderSize: this.data.isNews.orderSize,
      counselorId: this.data.isNews.counselor.counselorId,
      counselorIcon: this.data.isNews.counselor.counselorIcon,
      counselorName: this.data.isNews.counselor.counselorName,
      identifer: this.data.identifer
    }
    wx.navigateTo({
      url: '../mineBox/myAgenthook/myAgenthook?result=' + obj.result + '&orderSize=' + obj.orderSize + '&counselorId=' + obj.counselorId + '&counselorIcon=' + obj.counselorIcon + '&counselorName=' + obj.counselorName + '&identifer=' + obj.identifer
    });
  },

  replaceList: function (queryUserInfo, queryManager) {
    var that = this;
    Promise.all([queryUserInfo, queryManager]).then((res) => {
      if (res[1].obj && res[1].obj.counselorInfo) {
        that.queryList()
      }
    })
  },

  queryList: function () {

    var that = this;
    apiRequest.queryReplaceRelation({
        targetUid: that.data.info.userInfo.uid,
        counselorId: that.counselorInfo.counselorId
      })
      .then(res => {
        let replaceRelations = res.obj.replaceRelations;
        replaceRelations.forEach((item, index) => {
          item.sdate = util.dateUtil.dateSwitch(item.sdate);
          item.edate = util.dateUtil.dateSwitch(item.edate);
          item.losedate = util.dateUtil.format(new Date(new Date(item.sdate).getTime() - 24 * 60 * 60 * 1000), 'Y/M/D')
        })
        let replaceList = replaceRelations.filter((item) => {
          return item.dataStt == '01';
        });
        this.setData({
          replaceList
        })
      })
      .catch(error => {

      })
  },



  queryOrder: function () {
    let {
      subToken,
      subInfo
    } = this.data;
    // 查询待用餐订单
    apiRequest.queryOrderListForThree({
      isNeedFatPack: '00',
      isWaitMeal: '00', //查询待用餐
      pageNo: 1,
      pageSize: 1,
      subUid: subToken ? subInfo.tsuSubUid : '',
      queryAll: subToken ? false : true,
    }).then((res) => {
      if (res.obj) {
        this.setData({
          unUsedOrder: res.obj.orderTransferMap.length > 0
        })
      }
    })
  },

  amount: function () {
    var that = this;
    apiRequest.detailsBalance({
        pageSize: 1,
        pageNo: 1
      })
      .then(res => {
        // that.setData({
        //   amount: res.obj ? res.obj : ''
        // })
        const totalBalance = res.obj.totalBalance ? res.obj.totalBalance : 0;
        that.setData({
          amount: res.obj ? {
            ...res.obj,
            totalBalance: parseFloat(totalBalance.toFixed(2))
          } : {}
        })
      })
      .catch(error => {

      })
    //查询饭票
    apiRequest.queryUserCardTicket({})
      .then(res => {
        that.setData({
          cardSize: res.obj.cardList.length
        })
      })
      .catch(error => {

      })
  },
  // 优惠券
  querycoupon: function () {
    var that = this;
    apiRequest.queryCouponList({
        stt: '01', //已激活
      })
      .then(res => {
        let currentDate = new Date().getTime();
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : [];
        let couponNum = 0;
        couponUserVos.forEach((item, index) => {
          if (item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime) {
            couponNum++
          }
        })

        that.setData({
          couponNum
        })
      })
      .catch(error => {

      })
  },
  // 红包
  queryRedPacketByUser: function () {
    var that = this;
    apiRequest.queryRedPacketByUser({})
      .then(res => {
        let currentDate = new Date().getTime();
        let redPacketList = res.obj.redPacketList ? res.obj.redPacketList : [];
        let redPacketNum = 0;
        redPacketList.forEach((item, index) => {
          if (item.stt == '00' && currentDate >= item.stime && currentDate <= item.etime) {
            redPacketNum++
          }
        })

        that.setData({
          redPacketNum
        })
      })
      .catch(error => {

      })
  },
  // 申请发票
  sq: function () {
    wx.showToast({
      title: '敬请期待',
      icon: 'none',
      image: '',
      duration: 1500,
      mask: false,
    });
    return
    wx.navigateTo({
      url: '/pages/mineBox/invoice/invoice',
    });
  },


  goOrder: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/packageOrder/orderList/orderList?index=${index}`,
    });
  },

  queryManager: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      apiRequest.queryCurrUserCounselor({})
        .then(res => {
          if (res.obj && res.obj.counselorInfo) {
            that.counselorInfo = res.obj.counselorInfo;
          }
          resolve(res)
        })
        .catch(error => {

        })
    })
  },

  queryUserInfo: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      apiRequest.queryUserInfo({
          mainUid: this.data.subToken ? false : true
        })
        .then(res => {
          let info = res.obj;
          this.setData({
            info: info
          })
          resolve(res)
          if (!wx.getStorageSync('userInfo') && info.isAuthorized && info.isLogin && info.isPerProfile) {
            wx.setStorageSync('userInfo', info.userInfo);
          }
        })
        .catch(error => {

        })
    })
  },
  queryEmployeeInfo: function () {
    apiRequest.queryEmployeeInfo({})
      .then(res => {
        if (res.errCode === 0) {
          let hasQudao = false
          const {
            saleEmployeeDTOS
          } = res.obj
          saleEmployeeDTOS.forEach(item => {
            if (item.tseRoleId === 100005 || item.tseRoleId === 100006 || item.tseRoleId === 100002) {
              this._tseRoleId = item.tseRoleId
              hasQudao = true
            }
          })
          this.setData({
            employeeInfo: saleEmployeeDTOS,
            hasQudao
          })
        }
      })
  },

  integral: function () {
    wx.showToast({
      title: '敬请期待~~',
      icon: 'none',
    });
  },
  // 余额
  recharge: function () {
    wx.navigateTo({
      url: '/pages/mineBox/balance/balance',
    });
  },
  // 优惠券
  coupon: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['oQT24SMzlyNmIsSt_zeW1gwF7exywSUBHeEpXBLQ4Xo'],
      success(res) {
        wx.navigateTo({
          url: '/pages/mineBox/coupon-valid/coupon-valid',
        });
      },
      fail(res) {
        wx.navigateTo({
          url: '/pages/mineBox/coupon-valid/coupon-valid',
        });
      }
    })
  },
  // 营养报告
  nutrientReport() {
    wx.navigateTo({
      url: '/pages/mineBox/nutrientReport/nutrientReport',
    });
  },
  // 帮充值
  myHelpRecharge() {
    wx.navigateTo({
      url: '/pages/mineBox/helpRecharge/helpRecharge',
    });
  },
  // 我的公司
  myCompany() {
    wx.showToast({
      title: '敬请期待',
      icon: 'none'
    });
  },
  // 业绩
  myAchievement() {
    wx.navigateTo({
      url: '/pages/mineBox/achievement/achievement',
    });
  },
  // 渠道码
  myChannel() {
    wx.navigateTo({
      url: `/pages/mineBox/channel/channel?roleId=${this._tseRoleId}`,
    });
  },
  // 我的活动
  myActive() {
    wx.navigateTo({
      url: '/pages/mineBox/myActive/myActive',
    });
  },
  // 饭票
  mealTicket() {
    wx.navigateTo({
      url: '/pages/orderFood/mealTicket/mealTicket',
    });
  },

  // 过敏原
  allergen() {
    wx.navigateTo({
      url: '/pages/mineBox/allergen/allergen',
    });
  },

  //我的饭团
  allMeal() {
    wx.navigateTo({
      url: '/pages/packageDiscover/riceBall/myBall/myBall',
    });

  },
  // 销量预测
  forecast() {
    wx.navigateTo({
      url: '/pages/mineBox/forecast/campus/campus',
    });
  },
  allList() {
    wx.navigateTo({
      url: '/pages/packageDiscover/confirmList/myList/myList',
    });

  },

  // 请客吃饭
  treat() {
    wx.navigateTo({
      url: '/pages/packSubAccount/treat/treat',
    });
  },

  // 设置
  set() {
    wx.navigateTo({
      url: '/pages/packSubAccount/set/set',
    });
  },

  // 开发票
  invoice() {
    wx.navigateTo({
      url: '/pages/packageDatum/invoice/drawBill/drawBill',
    });
  },

  // 工具包白名单
  toolkitRoot() {
    apiRequest.toolkitRoot()
      .then(res => {
        if (res.errCode === 0) {
          this.setData({
            toolkitRoot: res.obj.toolkitRoot
          })
        }
      })
  },
  // 拉新工具包
  tool() {
    wx.navigateTo({
      url: '/pages/mineBox/tool/tool/tool',
    });
  },
  // 教练点餐
  coach(){
    wx.navigateTo({
      url: '/pages/packSubAccount/coachMeal/coachMeal',
    }); 
  },
  // 运营页面
  operate() {
    wx.navigateTo({
      url: '/pages/mineBox/operate/goodsList/goodsList',
    });
  },
  // 维士会员
  member() {
    saveUseLog('04', 0, '02', '', '06');
    wx.navigateTo({
      url: `/pages/packSubAccount/member/member/member`,
      // url: `/pages/packSubAccount/member/member/member?btnStatus=${this.data.vipCouponTip.btnStatus}`,
    });
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
        switch (obj.vipStt) {
          case '01':
          case '02':
            vipCouponTip.text = '开通获得' + obj.couponNum + '张' + obj.couponAmount + '元无门槛券'
            vipCouponTip.btnText = '立即开通'
            break;
          case '03':
            vipCouponTip.text = '本月你还有' + obj.couponNum + '张' + obj.couponAmount + '元会员券可用'
            vipCouponTip.btnText = '立即续费'
            break;
          case '04':
            vipCouponTip.text = '会员券已用完，' + (obj.couponDiscount ? obj.couponDiscount : 5) + '折购买加量包'
            vipCouponTip.btnText = (obj.couponDiscount ? obj.couponDiscount : 5) + '折购买'
            break;
        }
        this.setData({
          vipCoupon: obj,
          vipCouponTip
        })
      })
      .catch(error => {

      })
  },
  // 我的业绩
  // myPerformance() {
  //   wx.navigateTo({
  //     url: '/pages/orderFood/performance/performance',
  //   });
  // },

  // partner(){
  //   wx.navigateTo({
  //     url: '/pages/orderFood/partner/partner',
  //     success: (result) => {

  //     },
  //     fail: () => {},
  //     complete: () => {}
  //   });

  // },

  invite() {
    if (!this.data.hideInviteBubbles) {
      wx.setStorageSync('hideInviteBubbles', true);
      this.setData({
        hideInviteBubbles: true
      })
    }
    wx.navigateTo({
      url: '/pages/packSubAccount/inviteNew/inviteNew',
    });
  },

  //换皮肤
  theme() {
    wx.navigateTo({
      url: '/pages/packSubAccount/theme/theme',
    });
  },

  // 收入提现
  withdrawal() {
    // let {employeeInfo} = this.data;
    // let url = '';
    // // 仅【个人消耗类渠道】展示此弹窗
    // if(employeeInfo[0].tpiConsociationType == '20') {
    //   url = `/pages/packSubAccount/withdrawal/withdrawal/withdrawal?employeeInfo=${JSON.stringify(employeeInfo)}`
    // }else {
    //   url = `/pages/mineBox/achievement/achievement`
    // }
    // wx.navigateTo({
    //   url
    // });
    let {
      employeeInfo
    } = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/withdrawal/withdrawal/withdrawal?employeeInfo=${JSON.stringify(employeeInfo)}`
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  onPageScroll: function (e) {

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
    return {
      imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/share.png",
    }
  },
})