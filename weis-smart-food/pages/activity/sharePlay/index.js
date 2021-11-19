import day from '../../../libs/day'
import {
  round
} from '../../../utils/common'
import apiRequest from '../../../service/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/',
    playBase: {},
    totalPrice: 0,
    getPrice: 0,
    time: '',
    timeData: {},
    showsharebox: false,
    drawerVisible: false,
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      inviteUid: options.invite,
      orderId: options.orderId,
      topcId: options.topcId
    })
    this.queryPlay()
    this.queryHealthScore()
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      uname: userInfo.uname || userInfo.nickName,
      uid: userInfo.uid
    })
  },
  // showShare() {
  //   this.setData({
  //     drawerVisible: true
  //   })
  // },
  // cancelShareTap() {
  //   this.setData({
  //     drawerVisible: false
  //   })
  // },
  cuntdown() {

    let nowTime = new Date().getTime();
    let limitTime = this.data.tcuEtime ? this.data.tcuEtime : 0;
    let cutDowntime = this.data.tcuEtime + (24 * 60 * 60 * 1000);

    this.setData({
      time: cutDowntime ?
        cutDowntime - nowTime > 0 ?
        cutDowntime - nowTime :
        0 :
        0,

    })
    if (this.data.time > 0) {

      this.setData({
        cutdowntime: true
      })
    }

  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
      isTimeout: this.isTimeout(this.data.tcuEtime)
    });
  },
  /**
   * 获取玩法卡片
   */
  queryPlay() {
    apiRequest.queryPlayCard({
        orderId: this.data.orderId
      })
      .then(res => {
        this.queryShareList(res.obj.playCard.topcId)
        this.setData({
          topcId: res.obj.playCard.topcId,
          playBase: res.obj.playBase,
          totalPrice: res.obj.playCard.topcShareAmount,
          tcuEtime: res.obj.playCard.topcCtime,
          isTimeout: this.isTimeout(res.obj.playCard.topcCtime)
        })
        this.cuntdown()
      })
  },
  /**
   * 获取玩法分享记录
   */
  queryShareList(topcId) {
    apiRequest.queryPlayshareList({
        playCardId: topcId
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
    const {
      inviteUid,
      orderId
    } = this.data
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
        if (res.errCode === 0) {
          const {
            nutritionHealthScoreForms: scoreForms,
            info
          } = res.obj
          scoreForms.forEach(item => {
            item.dateText = day(item.dateTime).format('MM月DD日')
            item.categoryText = this.data.categoryStatus[item.category]
            item.balance = round(item.carbonwaterScore + item.proteinScore + item.fatScore)
          })
          this.setData({
            scoreForms: scoreForms[0],
            humanInfoWithScore: info
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


  sharePosterTap() {
    wx.navigateTo({
      url: '/pages/activity/sharePlayPoster/index?orderId=' + this.data.orderId + '&uname=' + this.data.uname + '&uid=' + this.data.uid
    });
  },
  toRules() {
    wx.navigateTo({
      url: '/pages/activity/sharePlayRules/sharePlayRules'
    });
  },
  // 判断是否失效
  isTimeout(time) {
    const now = Date.now()
    return now <= time
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const {
      inviteUid,
      orderId,
      topcId
    } = this.data
    const idx = (Math.random() * 2) | 0
    return {
      title: ['帮我戳一戳，送你现金券~', '快！翻出全额返现就差你了！'][idx],
      imageUrl: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/shareEatPlay.png',
      path: `/pages/activity/sharePlayOpen/index?scene=0798&orderId=${orderId}&topcId=${topcId}&invite=${inviteUid}`
    }
  },
  onPageScroll: function ({
    scrollTop
  }) {
    if (scrollTop >= 400) {
      this.setData({
        showsharebox: true
      })
    } else {
      this.setData({
        showsharebox: false
      })

    }
  }
})