// pages/market/sharePlayOpen/index.js
// import OrderService from "../../../service/OrderService";
// const orderService = new OrderService();
// import UserService from '../../../service/UserService'
// const userService = new UserService()
import apiRequest from '../../../service/index'
import { getStorage } from '../../../utils/storage'
import day from '../../../libs/day'
const app = getApp();
import {
  isLoginClick,
  loginPromise,
  round
} from '../../../utils/common'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/',
    animationMain: null,//正面
    animationBack: null,//背面
    playBase: {},
    uname: '',
    showLogin: false,
    showMeal: true,
    error: false,
    time: '',
    timeData: {},
    tcuEtime: null,
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
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

  toMeal() {
    // wx.navigateTo({
    //   url: '/pages/orderFood/orderMeal/orderMeal'
    // });
    wx.setStorageSync('scoreOid', this.data.oid)
    wx.switchTab({
      url: '/pages/index/index'
    });

  },
  toRules() {
    wx.navigateTo({
      url: '/pages/activity/sharePlayRules/sharePlayRules'
    });
  },
  toHealthScore() {
    wx.navigateTo({
      url: `/pages/packageOrder/healthScore/healthScore?page=sharePlanOpen&oid=${this.data.orderId}`
    })
  },
  /**
 * 翻转卡片
 */
  rotateFn: isLoginClick(function (e) {
    var id = e.currentTarget.dataset.id
    this.animation_main = wx.createAnimation({
      duration: 1200,
      timingFunction: 'linear'
    })
    this.animation_back = wx.createAnimation({
      duration: 1200,
      timingFunction: 'linear'
    })
    this.animation_main.rotateY(180).step()
    this.animation_back.rotateY(0).step()
    this.setData({
      showMeal: false,
      animationMain: this.animation_main.export(),
      animationBack: this.animation_back.export(),
    })
    this.clickSharePlayDraw()
    app.globalData.gio('track','c_Cardclick',{
      desc: '点击翻牌人数',
    })
  }),
  // 优惠券倒计时
  cuntdown() {
    let nowTime = new Date().getTime();
    let limitTime = this.data.tcuEtime ? this.data.tcuEtime : 0;

    this.setData({
      time: limitTime
        ? limitTime - nowTime > 0
          ? limitTime - nowTime
          : 0
        : 0,

    })
    if (this.data.time > 0) {

      this.setData({
        cutdowntime: true
      })
    }

  },
  clickSharePlayDraw() {
    const that = this;
    apiRequest.sharePlay({
      playCardId: this.data.playCardId,
    })
      .then(res => {
        if (res.errCode == 0) {
          if (!res.obj.isDraw) { // 第一次翻牌跳转点餐页
            this.toImgPromise.then(()=>{
              let cardList = {
                images: that.data.waveringImgUrl,
                type: 'sharePlay',
                price: res.obj.shareAmount.toFixed(2),
                ctitle: that.data.playBase.ctitle,
                cbannerTitle: that.data.playBase.cbannerTitle,
                cdescription: that.data.playBase.cdescription,
                couponPrice: res.obj.userCouponAmount,
                couponInfo: res.obj.userCoupons && res.obj.userCoupons[0],
                scoreImg: that.data.scoreImg || ''
              }
              wx.setStorageSync('cardList', cardList);
              wx.switchTab({
                url: '/pages/index/index'
              });
            })
            app.globalData.gio('track','n_Cardsuccess',{
              desc: '翻牌成功'
            })
            return
          } else {
            this.queryShareList()
          }
          this.setData({
            couplist: res.obj,
            // tcuEtime: res.obj.userCoupons.length > 0 ? res.obj.userCoupons[0].tcuEtime : 0
          }, () => {
            // this.cuntdown()
          })
        } else if (res.errCode == 1003) {
          this.queryCoupon()
          this.setData({
            error: true
          })

        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
        if (res.errCode == 0 || res.errCode == 1003) {
          this.animation_main.rotateY(180).step()
          this.animation_back.rotateY(0).step()
        }
        this.setData({
          showMeal: false,
          animationMain: this.animation_main.export(),
          animationBack: this.animation_back.export(),
        })
      })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.toImgResolve = '';
    this.toImgPromise = new Promise((resolve) => this.toImgResolve = resolve);
    this.setData({
      inviteUid: options.invite,
      orderId: options.orderId,
      topcId: options.topcId
    })
    loginPromise.then((res) => {
      let loginInfo = getStorage('loginInfo');
      this.setData({
        isLogin: loginInfo.isLogin && loginInfo.isAuthorized ? true : false,
      })
      if (loginInfo.isLogin && loginInfo.isAuthorized) {
        this.setData({
          shareuserid: res.uid,
        })
      }
      this.queryPlay()
      this.queryHealthScore()
    })
  },
  // 查询卡券
  queryCoupon: function (params) {
    // debugger
    var that = this;
    apiRequest.queryCouponList({
      params: [{

      }]
    })
      .then(res => {
        let couponUserVos = res.obj.couponUserVos ? res.obj.couponUserVos : [];
        let currentDate = new Date().getTime();
        couponUserVos.forEach((item, index) => {
          item.tcuAmount = Number(item.tcuAmount);
          item.tcuRestrictAmount = Number(item.tcuRestrictAmount)
        })
        let list = couponUserVos.filter((item) => {
          return item.tcuStt == '01' && currentDate >= item.tcuStime && currentDate <= item.tcuEtime;
        });
        // 筛选出最大卡券值
        let maxCoupon = Math.max.apply(Math, list.map(function (o) { return o.tcuAmount }));
        let index = list.map(item => item.tcuAmount).indexOf(maxCoupon)

        that.setData({
          coupon: list.length > 0 ? list[index] : '',
          tcuEtime: list.length > 0 ? list[index].tcuEtime : 0
        }, () => {
          // that.cuntdown()
        })


      })
      .catch(error => {

      })
  },
  /**
     * 获取玩法卡片
     */
  queryPlay() {
    apiRequest.queryPlayCard({
      orderId: this.data.orderId
    })
      .then(res => {
        const {playCard: {topcId, topcOid, uname, uid, topcShareAmount}, playBase} = res.obj
        this.setData({
          uid,
          uname,
          topcId,
          playBase: playBase,
          orderId: topcOid,
          playCardId: topcId,
          totalPrice: topcShareAmount,
          waveringImgUrl: playBase.waveringImgUrl
        })
        if (this.data.shareuserid == uid) { //自己点自己
          wx.redirectTo({
            url: `/pages/activity/sharePlay/index?orderId=${topcOid}&invite=${this.data.inviteUid}`
          });
        }

        this.queryShareList()
      })
  },
  /**
  * 获取玩法分享记录
  */
  queryShareList() {
    apiRequest.queryPlayshareList({
      playCardId: this.data.topcId
    })
      .then(res => {
        let getPrice = 0
        for (let index = 0; index < res.obj.sharePlayPlanList.length; index++) {
          getPrice += res.obj.sharePlayPlanList[index].tsppShareAmount
        }
        let progress = (getPrice / this.data.totalPrice) * 100
        this.setData({
          progress: progress,
          getPrice: getPrice.toFixed(2),
          sharePlayPlanList: res.obj.sharePlayPlanList
        })

      })

  },
  // 查询会员得分
  queryHealthScore() {
    const {inviteUid, orderId} = this.data
    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          // fromUid: inviteUid || 100005,
          // oid: orderId || 'TDOTN626FD2C7ECF81DFBDEA4',
          fromUid: inviteUid,
          oid: orderId,
          payFlag: true,
        }]
      })
      .then(res => {
        if(res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms, info} = res.obj
          scoreForms.forEach(item => {
            item.dateText = day(item.dateTime).format('MM月DD日')
            item.categoryText = this.data.categoryStatus[item.category]
            item.balance = round(item.carbonwaterScore + item.proteinScore + item.fatScore)
          })
          this.setData({
            scoreForms: scoreForms[0],
            humanInfoWithScore: info
          }, () => {
            wx.setStorageSync('scoreForms', scoreForms[0])
            wx.setStorageSync('humanInfoWithScore', info)
          })
          this.calScore();
        }
      })
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

  finished(e){
    this.setData({
      scoreImg: e.detail
    })
    this.toImgResolve()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  todata() {
    this.setData({
      showLogin: false,
    }, () => {
      this.clickSharePlayDraw()
    })

  },
  closeimg() {
    this.setData({
      showLogin: false,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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