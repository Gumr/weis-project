// pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail.js
import apiRequest from '../../../../service/index'
import day from '../../../../libs/day';
import {
  onLineCampStatus
} from '../../../../utils/map';
import {
  isLoginClick,
  t,
  loginPromise,
} from '../../../../utils/common'
import Draw from '../../../../utils/Draw';
import ShareImage from '../../../../utils/ShareImage'
let app = getApp();
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
    onLineCampStatus,
    tipDialog: false,
    balance: 0,
    result: false,
    joinCode: false,// 减肥营群二维码
    tacGroupQrcode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      campId: options.campId || '',
      activityId: options.activityId || '',
      inviteUid: options.invite || '',
      type: options.type || ''
    })
    loginPromise.then((res) => {

      this.setData({
        uid: res.uid,
        subToken: getStorage("subToken") || '',
      })

      if (options.invite && app.globalData.uid != options.invite && !options.type) {
        apiRequest.addActivityInvited({
          avActivityType: '01',
          avInvitedUid: options.invite,
          avActivityId: this.data.activityId
        })
      }
    })
    // this.queryActivityList();
    this.ifLiked()
    this.queryActivityRuleBean()


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
    // this.load ? this.queryActivityList() : this.load = true;
    this.queryActivityList()
    this.getBalance()
    this.queryUserOnLineIncome()
  },
  showQrcode() {
    this.setData({
      joinCode: !this.data.joinCode
    })

  },
  queryUserOnLineIncome() {
    apiRequest.queryUserOnLineIncome({
      campId: this.data.campId
    }).then(res => {
      if (res.errCode == 0) {
        this.setData({
          totalIncome: res.obj
        })

      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }

    })

  },

  getQrCode() {

    let uid = app.globalData.uid;
    let obj = this.data.obj;
    return apiRequest.getQrCode({
      targetPath: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?campId=${this.data.campId}&activityId=${this.data.activityId}&invite=${obj.ifJoin && obj.activity.type == '01' ? uid : ''}`,
      targetAppid: 'wxb41830cd88835f5c',
      scene: `${this.data.campId}${obj.ifJoin && obj.activity.type == '01' ? '1' : ''}`, //scene不同生成图片不同
    }).then((res) => {
      this.code = res.obj.ImageUrl;
    })
  },

  queryActivityList() {
    apiRequest.queryActivityList({
      activityId: this.data.activityId
    }).then(res => {
      let remainDay;
      let activityList = res.obj.activityList || [];
      activityList.forEach((item) => {
        item.activity.startTime = day(String(item.activity.startTime).substring(0, 8)).format('YYYY/MM/DD');
        item.activity.endTime = day(String(item.activity.endTime).substring(0, 8)).format('YYYY/MM/DD')
      })

      let obj = activityList.filter((item) => {
        return item.camp.campId == this.data.campId;
      })[0];
      // let join = Boolean(activityList.filter((item) => {
      //   return item.ifJoin && item.activity.type != '03';
      // }).length)
      obj.activity.sDate = day(obj.activity.startTime).format('MM月DD日');
      // 进行中
      if (obj.activity.type == '02') {
        remainDay = (day(obj.activity.endTime) - day(day().format('YYYY/MM/DD'))) / (1000 * 3600 * 24)
      }
      setStorage('tacGroupQrcode', obj.camp.tacGroupQrcode ? obj.camp.tacGroupQrcode : null) //减肥营群二维码
      this.setData({
        obj,
        // join,
        remainDay: remainDay || 0,
        times: res.obj.times.times
      })

      // 进行中 或结束
      if (obj.activity.type != '01') {
        this.getGroupRankList()

      }
    })
  },
  priveimg() {
    wx.previewImage({
      urls: [this.data.obj.camp.tacGroupQrcode],
    });

  },
  //余额
  getBalance() {
    apiRequest.detailsBalance({
      pageSize: 1,
      pageNo: 1
    }).then((res) => {
      this.setData({
        balance: res.obj.totalBalance
      })
    })
  },

  closeshowRecharge() {
    this.setData({
      showRecharge: false
    })

  },
  // 查看报名人数
  checkNum() {
    let campId = this.data.campId;
    let activityId = this.data.activityId;
    wx.navigateTo({
      url: `/pages/packageDiscover/onLineFat/checkCampNum/checkCampNum?campId=${campId}&activityId=${activityId}`,
    });
  },
  toBlance() {
    this.closeshowRecharge()
    wx.navigateTo({
      url: `/pages/mineBox/balance/balance?source=onlineFat&joinRuleBalance=${this.data.ruleBean.joinRuleBalance}`,
    });
  },

  sign: isLoginClick(function () {
    if (this.data.subToken) {
      wx.showToast({
        title: '子账号不能加入减脂营',
        icon: 'none',
      });
      return
    }

    if (!this.data.obj.joinalbe) {
      this.setData({
        tipDialog: true
      })
      return
    }
    else if (this.data.ruleBean.joinRuleBalance && Number(this.data.ruleBean.joinRuleBalance) > this.data.balance) { // 充值
      this.setData({
        showRecharge: true
      })
      return
    }

    let obj = this.data.obj;
    let planState = {
      startDate: day(obj.activity.startTime).format('YYYYMMDD') == day().add(1, 'day').format('YYYYMMDD') && day().get('hour') >= 18 ? day().add(2, 'day').format('YYYYMMDD') : day(obj.activity.startTime).format('YYYYMMDD'),
      endDate: day(obj.activity.endTime).format('YYYYMMDD'),
      type: 'celebrityPlan',
      activityId: obj.activity.activityId,
      times: this.data.times
    };
    apiRequest.reserveActivityCamp({
      campId: this.data.campId,
      activityId: obj.activity.activityId,
    }).then((res) => {
      if (res.errCode == 0) {
        // 跳转地址
        let joinRuleOrderDays = this.data.ruleBean.joinRuleOrderDays // 点餐天数
        let joinRuleOrderOrder = this.data.ruleBean.joinRuleOrderOrder // 点餐参数
        let orderDiscount = this.data.ruleBean.orderDiscount //折扣
        wx.navigateTo({
          url: `/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=onLineFat&joinRuleOrderDays=${joinRuleOrderDays}&joinRuleOrderOrder=${joinRuleOrderOrder}&orderDiscount=${orderDiscount}`,
          success: ({
            eventChannel
          }) => {
            eventChannel.emit('ai-state', planState);
          },
        });
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }
    })
  }),


  getGroupRankList() {
    apiRequest.queryUsersOnLineRankList({
      tacId: this.data.campId,
    }).then((res) => {
      if (res.errCode === 0) {
        const activityCampDto = res.obj.activityCampDto;
        activityCampDto.tmaStartTime = day(String(activityCampDto.tmaStartTime)).format('YYYY/MM/DD')
        activityCampDto.tmaEndTime = day(String(activityCampDto.tmaEndTime)).format('YYYY/MM/DD')

        function setValue(item) {
          item.rankScore = Number(item.scoreRecord)
          const unit = '分'
          item.$value = item.rankScore + unit
          item.headUrl = item.headImgUrl
          return item;
        }

        const list = res.obj.rankRecords.map(setValue)
        // 邀请点赞
        if (this.data.inviteUid && this.data.inviteUid != this.data.uid) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].uid == this.data.inviteUid) {
              let inviteObj = list[i];
              this.setData({
                inviteObj
              })
              break
            }
          }
        }

        this.setData({
          activityCampDto,
          myRank: res.obj.rankRecordUid ? {
            ...setValue(res.obj.rankRecordUid),
            next: true
          } : null,
          rankList: list,
          activityCampInfo: res.obj.activityCampInfo,
          scoreObj: res.obj,
        })
      }
    })
  },

  // 退出减脂营
  exit() {
    this.setData({
      showExit: !this.data.showExit
    })
  },

  exitTap() {
    this.setData({
      exitDialog: true,
      showExit: false,
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
    const that = this;
    wx.navigateTo({
      url: `/pages/packageDiscover/onLineFat/rules/rules`,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: that.data.obj.activity.rule || '' })
      }
    })
  },
  //  营长信息
  toGroupLeader() {

    let campPrincipalInfo = this.data.obj.campPrincipalInfo ? JSON.stringify(this.data.obj.campPrincipalInfo) : null

    wx.navigateTo({
      url: `/pages/mineBox/agentDetail/agentDetail?id=${this.data.obj.camp.campPrincipal}&from=check&campPrincipalInfo=${campPrincipalInfo}`
    })

  },
  //减肥营规则
  queryActivityRuleBean() {
    apiRequest.queryActivityRuleBean({
      tarcCid: this.data.campId
    }).then((res) => {
      this.setData({
        ruleBean: res.obj.ruleBean
      })

    })


  },
  // 查询有没有点赞
  ifLiked() {
    if (this.data.inviteUid && this.data.inviteUid != this.data.uid) {
      apiRequest.ifLiked({
        beUid: this.data.inviteUid,
        type: '01',
        activityId: this.data.activityId,
      }).then((res) => {
        this.setData({
          result: res.obj.result
        })
      })
    }
  },

  // 点赞
  like: isLoginClick(function () {
    if (this.data.subToken) {
      wx.showToast({
        title: '请切换成主账号后点赞',
        icon: 'none',
      });
      return
    }
    apiRequest.activityLike({
      beUid: this.data.inviteUid,
      type: '01',
      activityId: this.data.campId,
      score: this.data.ruleBean.integralRuleLike ? this.data.ruleBean.integralRuleLike : 1,
    }).then((res) => {
      if (res.errCode == 0) {
        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {

          },
          fail: () => { },
          complete: () => { }
        });

        this.getGroupRankList()
        this.setData({
          result: true
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {

          },
          fail: () => { },
          complete: () => { }
        });

      }
    })

  }),

  // 积分详情
  myRankClick() {

    wx.navigateTo({
      url: '/pages/packageDiscover/onLineFat/scordDetail/scordDetail',
      success: (result) => {
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          data: this.data.myRank
        })
      },
      fail: () => { },
      complete: () => { }
    });

  },

  // 点餐
  order() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  card() {
    wx.navigateTo({
      url: '/pages/packageDiscover/dietCard/dietCard',
    });
  },
  toFriends() {

    let activityId = this.data.obj.activity.activityId
    let inviteUid = this.data.scoreObj.rankRecordUid.uid
    let status = this.data.obj.activity.type
    let tclwCoverImg = this.data.obj.activity.activityImgUrl
    let tclwName = this.data.obj.activity.name
    let companyLikeRels = JSON.stringify(this.data.scoreObj.companyLikeRels)
    let integralRuleLike = this.data.ruleBean.integralRuleLike
    let integralRuleLikeLimit = this.data.ruleBean.integralRuleLikeLimit
    wx.navigateTo({
      url: '/pages/packageDiscover/onLineFat/shareList/shareList?activityId=' + activityId + '&inviteUid=' + inviteUid + '&status=' + status + '&tclwCoverImg=' + tclwCoverImg + '&campId=' + this.data.campId + '&activityId=' + activityId + '&tclwName=' + tclwName + '&companyLikeRels=' + companyLikeRels + '&integralRuleLike=' + integralRuleLike + '&integralRuleLikeLimit=' + integralRuleLikeLimit,
    });

  },
  toMoney() {
    let campDiscount  = this.data.obj.campDiscount&&this.data.obj.campDiscount!=1?this.data.obj.campDiscount*10:0
    wx.navigateTo({
      url: '/pages/packageDiscover/onLineFat/myPerformance/myPerformance?campId=' + this.data.campId+'&campDiscount='+campDiscount,
    });

  },

  async saveShareTap() {
    if (this.sharing) return;
    this.exit();
    wx.showLoading({
      title: '绘制中',
    })

    this.sharing = true;
    const imageUrl = (await this.drawShareImage()).tempFilePath;
    this.sharing = false;
    wx.hideLoading()
    const sharer = new ShareImage(imageUrl)
    sharer.save().then(sharer.preview.bind(sharer), sharer.preview.bind(sharer))
  },

  async drawShareImage() {
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('share', this))
    const draw = new Draw(ctx)

    draw.drawView({
      left: t(0),
      top: t(0),
      width: Math.ceil(t(750)),
      height: Math.ceil(t(1624)),
    }, {
      backgroundColor: "#267DFF",
      border: 'none'
    })

    let bgimg = this.data.obj.activity.activityImgUrl || 'https://prodstatic.weis1606.cn/api/smartFood/reduce_fat_kv.png';
    if (bgimg.indexOf('https') == -1) {
      bgimg = bgimg.replace(/^http/, "https");
    }

    await draw.drawImage(bgimg, {
      left: t(0),
      top: t(0),
      width: t(750),
      height: t(654),
    })

    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/share_qiye_bj2.png'

    await draw.drawImage(bgimg, {
      left: t(30),
      top: t(589),
      width: t(690),
      height: t(972),
    })


    await this.getQrCode()

    bgimg = this.code;

    await draw.drawImage(bgimg, {
      left: t(90),
      top: t(1241),
      width: t(240),
      height: t(240),
    })

    bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_qr_frame.png";

    await draw.drawImage(bgimg, {
      left: t(90),
      top: t(1241),
      width: t(240),
      height: t(240),
    })


    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 750,
            height: 1624,
            id: 'share'
          }, this).then(resolve)
        }, 600)
      })
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
  onShareAppMessage: function () {
    let uid = app.globalData.uid;
    let obj = this.data.obj;
    return {
      path: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?campId=${this.data.campId}&activityId=${this.data.activityId}&invite=${obj.ifJoin && obj.activity.type == '01' ? uid : ''}`,
      title: `邀请你加入${obj.camp.campName}`,
      imageUrl: obj.activity.activityImgUrl || 'https://prodstatic.weis1606.cn/api/smartFood/reduce_fat_wechat_share%402x.png'
    }
  }
})