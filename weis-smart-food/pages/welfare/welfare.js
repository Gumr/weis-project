// pages/discover/discover.js
import apiRequest from '../../service/index';
import {
  loginPromise,
  isLoginClick,
  judgeSubAccount,
  showDialog,
  saveUseLog,
  round
} from '../../utils/common'
import {
  getStorage
} from '../../utils/storage';
const app = getApp()
import {
  debounce,
} from '../../utils/throttle';
import {
  categoryMap
} from '../../utils/map'
import day from '../../libs/day';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab栏
    diamondArr: [{
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/icon_find_kg.png',
      name: '线上减脂营',
      path: '/pages/packageDiscover/onLineFat/onLineReduceFat/onLineReduceFat',
    }, {
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/icon_find_riceBall.png',
      name: '折扣饭团',
      desc: '组团享折扣',
      path: '',
    }, {
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/icon_find_coupons.png',
      name: '多餐优惠',
      path: '',
    }, {
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/icon_find_groupMeal.png',
      name: '企业优惠点餐',
      path: '/pages/packageDiscover/groupMeal/groupMeal',
    }, ],
    // 内容引导栏
    contentArr: [{
      name: '每日签到',
      desc: ['连续签到', '领大额红包'],
      nameColor: '#D65D1B',
      descColor: '#E69E76',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/con1.png',
      path: '/pages/packageDiscover/signIn/signIn',
    }, {
      name: '召唤锦鲤',
      desc: ['点餐前先领券'],
      nameColor: '#AB841C',
      descColor: '#DDBC66',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/con2.png',
      path: '/pages/activity/openBox/index',
    }, {
      name: '邀请有礼',
      desc: ['邀请新人赢奖励金'],
      nameColor: '#B9618A',
      descColor: '#E278A9',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/discover/con3.png',
      path: '/pages/packSubAccount/inviteNew/inviteNew',
    }],
    // 领券中心
    map: {
      '01': '已抢完',
      '02': '热抢中',
      '03': '即将开始',
    },
    selectIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then(async (res) => {
      // 后台配置弹窗显示
      showDialog('05', this);
      this.setData({
        uid: res.uid
      })
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
    loginPromise.then(async () => {
      const loginInfo = getStorage('loginInfo');
      this.setData({
        loginInfo,
        subToken: getStorage('subToken'),
      })
      this.queryDiscoverCarousel()
      this.queryUserVipCouponMessage()
      this.queryActivityCouponForCentre()
    })
  },
  login: isLoginClick(function () {

  }),
  // banner----------------------------
  queryDiscoverCarousel() {
    apiRequest.queryDiscoverCarousel({
      type: '05'
    }).then((res) => {
      if (res.errCode === 0) {
        let discoverCarousels = res.obj && res.obj.discoverCarousels || [];
        this.setData({
          imgUrls: discoverCarousels
          // imgUrls: discoverCarousels.filter(item => item.target == '01')
        })
      } else {
        this.setData({
          imgUrls: []
        })
      }
    })
  },
  slideshowChange(evt) {
    this.setData({
      currentSlideshow: evt.detail.current
    })
  },
  slideshowTap: isLoginClick(function (e) {
    const {
      url,
      type,
      id
    } = e.currentTarget.dataset;
    if (type == '01' || type == '02') {
      saveUseLog('03', id, '02');
    }
    if (type == '01') {
      this.navigateTo({
        url,
        fail() {
          wx.switchTab({
            url
          })
        }
      })
    } else if (type == '02') {
      this.navigateTo({
        url: `/pages/webview/webview?url=${url}`
      })
    }
  }),
  navigateTo(opts) {
    wx.navigateTo(opts);
  },
  // 维士会员----------------------------
  member() {
    saveUseLog('04', 0, '02', '', '06');
    wx.navigateTo({
      url: `/pages/packSubAccount/member/member/member`,
      // url: `/pages/packSubAccount/member/member/member?btnStatus=${this.data.vipCouponTip.btnStatus}`,
    });
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
  async queryUserVipCouponMessage() {
    let res = await this.queryUserInfo()
    apiRequest.queryUserVipCouponMessage({
        uid: res.obj.userInfo.uid
      })
      .then(res => {
        let obj = res.obj;
        let vipCouponTip = {}
        // vipStt: 01 立即开通 02 没券续费 03 有券续费  04 五折购买
        switch (obj.vipStt) {
          case '01':
          case '02':
            vipCouponTip.title = '非维士会员',
              // vipCouponTip.text = '4折开通会员，得' + obj.couponNum + '张' + obj.couponAmount + '元无门槛券'
              vipCouponTip.btnText = '立即开通'
            break;
          case '03':
            vipCouponTip.title = '维士会员',
              // vipCouponTip.text = '你本月还有' + obj.couponNum + '张会员券可用'
              vipCouponTip.btnText = '立即续费'
            break;
          case '04':
            vipCouponTip.title = '维士会员',
              // vipCouponTip.text = '本月会员券已用完，可以' + (obj.couponDiscount?obj.couponDiscount:5) + '折购买加量包'
              vipCouponTip.btnText = (obj.couponDiscount ? obj.couponDiscount : 5) + '折购买加量包'
            break;
        }
        this.setData({
          vipCoupon: obj,
          vipCouponTip,
          isVip: ['03', '04'].includes(obj.vipStt),
        })
      })
      .catch(error => {

      })
  },
  // tab栏----------------------------
  tabBox: isLoginClick(function (e) {
    let diamondArr = this.data.diamondArr;
    let index = e.currentTarget.dataset.index;
    if (diamondArr[index].name == '线上减脂营' && this.data.subToken) {
      wx.showToast({
        title: '请切换成主账号后加入减脂营',
        icon: 'none',
      });
      return
    }
    if (diamondArr[index].name == '折扣饭团') {
      if (this.data.subToken) {
        wx.showToast({
          title: '请切换成主账号后进入',
          icon: 'none',
        });
        return
      }
      wx.navigateTo({
        url: '/pages/packageDiscover/riceBall/preRiceBall/preRiceBall'
      })
      // apiRequest.checkUserInRiceBall({
      // }).then((res) => {
      //   if (!res.obj.inRiceBall) { // 未建团
      //     wx.navigateTo({
      //       url: '/pages/packageDiscover/riceBall/rules/rules'
      //     })
      //   } else if(res.obj.stt == '99' && res.obj.riceRallRecordInfos.length>0) { // 过了报名期，饭团人数小于5人时
      //     let riceRallRecordBeans = JSON.stringify(res.obj.riceRallRecordInfos)
      //     wx.navigateTo({
      //       url: `/pages/packageDiscover/riceBall/fail/fail?riceRallRecordBeans=${riceRallRecordBeans}&trrrTrrId=${res.obj.trrrTrrId}`
      //     });
      //   }else {
      //     wx.navigateTo({
      //       url: '/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?trrrTrrId=' + res.obj.trrrTrrId
      //     })
      //   }
      // })
      return
    }
    if (diamondArr[index].name == '多餐优惠') {
      wx.setStorageSync('from', 'welfare')
      wx.switchTab({
        url: '/pages/index/index',
      });
      return
    }
    wx.navigateTo({
      url: diamondArr[index].path,
    });
  }),
  // 内容引导栏----------------------------
  contentTap(e) {
    let {
      path
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: path,
    });
  },
  // 领券中心----------------------------
  select(e) {
    let selectIndex = this.data.selectIndex;
    let index = e.currentTarget.dataset.index;
    if (index == selectIndex) {
      return
    }
    this.setData({
      selectIndex: index
    })
  },

  queryActivityCouponForCentre() {
    apiRequest.queryActivityCouponForCentre({

    }).then((res) => {
      if (res.errCode === 0) {
        let infoVoResponseList = res.obj.infoVoResponseList || [];
        let curHour = day().format('H');
        infoVoResponseList.forEach((item1, index1) => {
          item1.couponUsers.forEach((item2, index2) => {
            item2.tcuEtime = day(Number(item2.tcuEtime)).format('YYYY.MM.DD HH:mm');
            item2.tcuAmount = round(item2.tcuAmount, 0);
            if (item1.couponActivityStt != '03') {
              item2.percent = `${round((item2.tcaNumTotal - item2.curCouponNum)/item2.tcaNumTotal * 100, 0)}%`
            }
          })
          if (!this.data.infoVoResponseList && curHour >= item1.startTime && curHour < item1.endTime) {
            this.setData({
              selectIndex: index1
            })
          }
        })
        this.setData({
          infoVoResponseList
        })
      }
    })
    // 判断是否是今天
    function isToday(date) {
      return day(date).format('YYYY/MM/DD') === day().format('YYYY/MM/DD')
    }
  },

  // 领取
  receive: isLoginClick(function (e) {
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s', 'Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'],
      success(res) {
        that.getActivityCoupon(e)
      },
      fail(res) {
        that.getActivityCoupon(e)
      }
    })
  }),

  getActivityCoupon(e) {
    let couponUsers = this.data.infoVoResponseList[this.data.selectIndex].couponUsers;
    let {
      index
    } = e.currentTarget.dataset;
    apiRequest.getActivityCoupon({
      activityType: '06', // 06领券中心，默认05
      // activityCode: code,
      couponRecordId: couponUsers[index].tcuId,
    }).then((res) => {
      if (res.obj && res.obj.couponUsers.length > 0) {
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        this.queryActivityCouponForCentre();
      }
    })
  },
  // 去使用
  goUse() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  // 提醒我
  remind: isLoginClick(function (e) {
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s', 'Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'],
      success(res) {
        if (res['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s'] == 'accept' || res['Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'] == 'accept') {
          that.setCouponReminderNotice(e)
        }
      },
      fail(res) {
        // that.setCouponReminderNotice(e)
      }
    })
  }),

  setCouponReminderNotice(e) {
    let couponUsers = this.data.infoVoResponseList[this.data.selectIndex].couponUsers;
    let {
      index
    } = e.currentTarget.dataset;
    apiRequest.setCouponReminderNotice({
      tcuId: couponUsers[index].tcuId
    }).then((res) => {
      if (res.errCode === 0) {
        wx.showToast({
          title: '成功~~~',
          icon: 'success',
        });
      }
    })
  },

  rule(e) {
    let index = e.currentTarget.dataset.index;
    let selectIndex = this.data.selectIndex;
    let couponUserVos = this.data.infoVoResponseList[selectIndex].couponUsers;
    couponUserVos.forEach((item) => {
      item.sTime = day(Number(item.tcuStime)).format('YYYY.MM.DD HH:mm');
      item.eTime = item.tcuEtime
    })
    this.setData({
      couponUserVos,
    })
    wx.navigateTo({
      url: `/pages/mineBox/couponRule/couponRule?index=${index}`,
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
  onShareAppMessage: function (e) {
    const idx = (Math.random() * 3) | 0;
    const userInfo = wx.getStorageSync('userInfo');
    let headImgUrl = userInfo.headImgUrl || userInfo.avatarUrl;
    let uid = this.data.uid;
    if (e.from == "button" && e.target.dataset.type == 'openbox') {
      saveUseLog('02', this.data.discoverDialogs.id, '02');
      return {
        title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
        imageUrl: 'https://prodstatic.weis1606.cn/api/market/sharebox.png',
        path: `/pages/activity/openBox/index?iuInvitedUid=${uid}&boxtype=share&scene=0717&shareimg=${headImgUrl}&invite=${uid}`,
      }
    } else {
      return {
        imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/share.png",
      }
    }
  },
})