// pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail.js
import apiRequest from '../../../../service/index'
import day from '../../../../libs/day';
import {
  riceBallStatus
} from '../../../../utils/map';
import {
  isLoginClick,
} from '../../../../utils/common'
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../../utils/storage'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
    riceBallStatus,
    tipDialog: false,
    showExit: false,
    joinsuc: false,
    riceRallInfo: {},
    groupName: '',
    showError: false,
    trrDataPower: ['体重', '血糖', '血压'],
    riceRallRecordBeans: [],
    shareType: false,
    groupInfo: {},
    ratio: 0,
    status: 0,
    isjoin: false,
    todayOrderSocre: 0,
    todayCardSocre: 0,
    todaySumScore: 0,
    isLeader: false,
    showtips: false,
    trrrStt: '',
    totalScore: 0,
    levelRules: [{
      level: '青铜饭团',
      score: '≤400',
      discount: '9折',
      tzDiscount: '8.5折'
    }, {
      level: '白银饭团',
      score: '400-799',
      discount: '8.5折',
      tzDiscount: '8折'
    }, {
      level: '黄金饭团',
      score: '800-1199',
      discount: '8折',
      tzDiscount: '7.5折'
    }, {
      level: '钻石饭团',
      score: '1200-1599',
      discount: '7.5折',
      tzDiscount: '7折'
    }, {
      level: '王者饭团',
      score: '≥1600',
      discount: '7折',
      tzDiscount: '6.5折'
    }],
    // riceBallRules: ['1、首次发起邀请成功，无论对方是否接受邀请，发起人均可获得1个福袋。', '2、每次被邀请人接受邀请，发起人和被邀请人双方各自可获得1个福袋。', '3、同一被邀请人接受多个发起人的邀请，可获赠福袋，但单个手机号码累计获得以11个福袋为上限，再发起或接受邀请均不再享受。', '4、活动奖品：福袋中奖概率为100%'],
    showOperate: false,
    showConfirm: false,
    subToken: getStorage("subToken") || '',
    navStatusHeight: getStorage('navStatusHeight'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const {
      trrrTrrId = null, campId = null, shareType = false, trrtype = false
    } = options
    const uid = await this.queryUserInfo()
    this.setData({
      uid,
      campId,
      trrtype,
      trrrTrrId,
      shareType: Boolean(shareType),
      showSubDialog: this.data.subToken ? true : false
    }, () => {
      this.queryActivityList()
    })
    // if (options.trrtype == undefined) { //历史饭团
    //   this.queryisjoin()

    // } else {
    //   this.queryActivityList()

    // }

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
  },
  queryUserInfo() {
    return new Promise(resolve => {
      apiRequest.queryUserInfo({
          params: [{}]
        })
        .then(res => {
          resolve(res.obj.userInfo.uid)
        })
    })
  },
  newFill() {
    this.queryActivityList()

  },
  queryActivityList() {
    apiRequest.queryMyRiceBallDetail({
      trrrTrrId: this.data.trrrTrrId
    }).then(res => {
      if (res.errCode == 0) {
        const {
          stt
        } = res.obj
        if (stt == '04') {
          wx.redirectTo({
            url: '/pages/packageDiscover/riceBall/preRiceBall/preRiceBall'
          })
          return
        } else if (stt != '01') {
          this.getGroupRankList()
        }
        let remainDay;
        let riceRallInfo = res.obj.riceRallInfo || {};
        riceRallInfo.trrActivityBTime = day(String(riceRallInfo.trrActivityBTime).substring(0, 8)).format('YYYY/MM/DD');
        riceRallInfo.trrActivityETime = day(String(riceRallInfo.trrActivityETime).substring(0, 8)).format('YYYY/MM/DD')
        riceRallInfo.trrDataPower = JSON.parse(riceRallInfo.trrDataPower)
        if (res.obj.stt == '02') { //进行中
          remainDay = (day(riceRallInfo.trrActivityETime) - day(day().format('YYYY/MM/DD'))) / (1000 * 3600 * 24)
        }
        this.setData({
          inAllRiceRall: res.obj.inAllRiceRall,
          inRiceRall: res.obj.inRiceRall,
          riceRallInfo: riceRallInfo,
          groupName: riceRallInfo.trrName,
          riceRallRecordBeans: res.obj.riceRallRecordBeans,
          groupInfo: res.obj.userInfo,
          ratio: res.obj.ratio,
          status: res.obj.stt,
          remainDay,
          // showError: res.obj.stt == '09' || res.obj.stt == '04' ? true : false,
          isLeader: Boolean(this.data.uid == (res.obj.userInfo && res.obj.userInfo.uid))
        })
      } else {
        this.setData({
          showError: true
        })
      }
    })
  },

  getGroupRankList() {
    apiRequest.queryMyRiceBallRanks({
      trrrTrrId: this.data.trrrTrrId,
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          totalPrice: res.obj.totalPrice,
          todayOrderSocre: res.obj.todayOrderSocre,
          todayCardSocre: res.obj.todayCardSocre,
          todaySumScore: Number(res.obj.todayOrderSocre) + Number(res.obj.todayCardSocre),
          totalScore: res.obj.totalScore
        })

        function setValue(item) {
          item.rankScore = Number(item.scoreRecord)
          const unit = '分'
          item.$value = item.rankScore + unit
          item.headUrl = item.headImgUrl
          return item;
        }
        const list = res.obj.rankRecords.map(setValue)
        this.setData({
          rankList: list,
          myRank: res.obj.rankRecordUid ? {
            ...setValue(res.obj.rankRecordUid),
            next: true
          } : null,
        })
      }
    })
  },
  CountTip() {
    this.setData({
      tipDialog: true
    })
  },

  closed() {
    let riceRallRecordBeans = JSON.stringify(this.data.riceRallRecordBeans)
    let joinNumber = this.data.riceRallRecordBeans.length
    let status = this.data.status
    // debugger
    apiRequest.finishRiceBall({
      trrrTrrId: this.data.trrrTrrId,
    }).then((res) => {
      if (res.errCode == 0) {
        wx.showToast({
          title: '历史饭团在 “我的“→”我的饭团“中查看” ',
          icon: 'none',
          duration: 3000,
        })
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/packageDiscover/riceBall/rules/rules'
          })
        }, 1000)
      }
    })
  },
  tocreate: isLoginClick(function () {
    wx.redirectTo({
      url: '/pages/packageDiscover/riceBall/preRiceBall/preRiceBall'
    })
  }),
  // 加入饭团
  sign: isLoginClick(function () {
    let uid = this.data.uid;
    apiRequest.changeMyRiceBall({
      trrrUid: uid,
      trrrTrrId: this.data.trrrTrrId,
      dataStrr: '00',
      operationType: '01'
    }).then((res) => {
      if (res.errCode == 0) {
        this.setData({
          shareType: false,
          // joinsuc: true,
          isjoin: true
        })
        wx.showToast({
          title: '报名成功',
          icon: 'none',
          duration: 1500,
        })
        this.queryActivityList()
      }
    })
  }),

  preOperateFn(e) {
    const {
      type
    } = e.currentTarget.dataset
    switch (type) {
      case 'edit':
        this.setData({
          showOperate: false
        }, () => {
          wx.navigateTo({
            url: `/pages/packageDiscover/riceBall/establish/establish?statusType=edit&riceRallInfo=${JSON.stringify(this.data.riceRallInfo)}&trrrTrrId=${this.data.trrrTrrId}`
          })
        })
        break
      case 'dismiss':
        this.setData({
          showConfirm: true,
          showOperate: false
        })
        break
      case 'cancel':
        this.setData({
          showOperate: !this.data.showOperate
        })
        break
    }
  },
  sureDialog() {
    this.setData({
      showSubDialog: false
    })
  },
  // 团长解散饭团
  dismissRiceBall() {
    this.setData({
      showConfirm: false
    })
    let that = this
    apiRequest.createRiceBall({
      trrrUid: that.data.uid,
      trrrId: that.data.trrrId,
      trrrTrrId: that.data.trrrTrrId,
      dataStt: '02',
      operationType: '04'
    }).then((res) => {
      if (res.errCode == 0) {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  // 非团长退出饭团
  userExitRiceBall() {
    const that = this
    this.setData({
      showOperate: false
    })
    wx.showModal({
      title: '',
      content: '确定退出该饭团吗?',
      confirmText: '确定',
      // showCancel: false,
      confirmColor: '#FE5E0F',
      success: function (res) {
        if (res.confirm) {
          apiRequest.changeMyRiceBall({
            trrrUid: that.data.uid,
            trrrId: that.data.trrrId,
            trrrTrrId: that.data.trrrTrrId,
            operationType: '03'
          }).then((res) => {
            // console.log(res);

            if (res.errCode == 0) {
              that.queryActivityList()
            }
          })
        }
      }
    })
  },
  toGroupUser() {
    if (this.data.trrtype) return
    wx.navigateTo({
      url: `/pages/packageDiscover/riceBall/myGroupUser/myGroupUser?trrrTrrId=` + this.data.trrrTrrId + '&riceRallRecordBeans=' + JSON.stringify(this.data.riceRallRecordBeans) + '&isLeader=' + this.data.isLeader,
    });
  },

  myRankClick(e) {
    const {
      rankList,
      myRank,
      riceRallRecordBeans,
      groupInfo,
      riceRallInfo
    } = this.data
    const {
      index
    } = e.currentTarget.dataset
    if (this.data.trrtype) {
      return
    }
    const uid = index == -1 ? myRank.uid : rankList[index].uid,
      trrrId = riceRallRecordBeans[riceRallRecordBeans.findIndex(item => item.trrrUid == uid)].trrrId
    wx.navigateTo({
      url: `/pages/packageDiscover/riceBall/scoreDetail/scoreDetail?index=${index}&trrrId=${trrrId}&trrrTrrId=${this.data.trrrTrrId}&uid=${uid}&chiefUid=${riceRallInfo.trrChiefUid}`
    })
  },

  confirmExit() {
    this.setData({
      exitDialog: false,
    })
    wx.navigateTo({
      url: `/pages/packageOrder/orderList/orderList?index=4`,
    });
  },
  // 活动规则
  toRules() {
    this.setData({
      exitDialog: false,
    })
    wx.navigateTo({
      url: `/pages/packageDiscover/riceBall/rules/rules?type=true`
    })

  },
  //  营长信息
  toGroupLeader() {
    wx.navigateTo({
      url: `/pages/mineBox/agentDetail/agentDetail?id=${this.data.obj.camp.campPrincipal}&from=check`
    })

  },


  // 点餐
  order() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  //打卡
  card() {
    wx.navigateTo({
      url: '/pages/packageDiscover/dietCard/dietCard',
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
    return {
      path: `/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?shareType=true&trrrTrrId=${this.data.trrrTrrId}`,
      title: '快加入' + this.data.groupName + ',一起享受折扣吧',
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/fantuan_wechat_share.png'
    }
  }
})