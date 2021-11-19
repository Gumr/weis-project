const day = require("../../../../libs/day");
import requests from '../../../../service/index'
import { setStorage } from '../../../../utils/storage';
import { isLoginClick } from '../../../../utils/common';
// pages/packageDiscover/slimmingCamp/slimmingCamp.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countDown: { // 倒计时数据
      time: 0,
      data: {}
    },
    ifJoin: '00',
    showShare: false,
    campList: [], // 营长列表
    isEnd: 0, // 判断有没有结营报告
    phone: '', // 预约电话号码
    activityStatus: '',
    btnTitle: '', // 按钮文字
    dialog: { // dialog显示
      show: false,
      confirmDisabled: true
    },
    warnDialog: false,
    historyActivity: null, // 历史减脂营
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const loginInfo = wx.getStorageSync('loginInfo');
    const isLogin = Boolean(loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile);

    if (options.aid && options.uid) { // 是被邀请进来的用户
      this.addActivityInvited(options);
    }

    this.setData({
      isLogin,
      isIpx: getApp().globalData.isIpx
    })

    this.queryUserInfo();
    this.userTargetPromise = requests.queryUserTarget().then((res) => {
      if (res.errCode !== 0) return;
      const { planningType } = res.obj.healthGoal;
      return planningType === '01' || planningType === '02' || planningType === '03'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    const isLossWeightUser = await this.userTargetPromise;
    if (isLossWeightUser) {
      this.queryUserHistoryActivityList();
      this.queryActivityList()
    } else {
      this.setData({
        warnDialog: true
      })
    }
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
    const { uid, activityId } = this.data;
    return {
      title: '维士减脂营一起来！14天瘦3斤，减脂路上和最重要的都是坚持',
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/camp_activity/reduce_wechat_share.png',
      path: `/pages/packageDiscover/slimmingCamp/slimmingCamp/slimmingCamp?invite=${uid}&uid=${uid}&aid=${activityId}`
    }
  },
  integralRuleTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/slimmingCamp/rule/rule'
    })
  },
  leftBtnTap: isLoginClick(function () {
    wx.navigateTo({
      url: `/pages/packageDiscover/slimmingCamp/campReport/campReport?id=${this.data.historyActivity.camp.campId}`
    })
  }),
  warnDialogConfirm() {
    wx.switchTab({
      url: '/pages/discover/discover'
    })
  },
  rightBtnTap() {
    this.btnHandler('09');
  },
  queryUserInfo() {
    return requests.queryUserInfo()
      .then((res) => {
        if (res.errCode === 0) {
          const info = res.obj.userInfo
          this.setData({
            uid: info.uid,
            uname: res.obj.uname
          })
        }
      })
  },
  getBuyCardForGoods() {
    requests.getBuyCardForGoods()
      .then((res) => {
        const cardList = res.errCode === 0 ? res.obj.cardList : [];

        this.setData({
          cardList: cardList.sort((a, b) => a.totalAmount - b.totalAmount)
        })
      })
  },
  taskTap() {
    this.setData({
      showTaskPopup: true
    })
  },
  closeTaskTap() {
    this.setData({
      showTaskPopup: false
    })
  },
  phoneInput(evt) {
    const phone = evt.detail.value;

    this.setData({
      phone,
      'dialog.confirmDisabled': phone.length < 11
    })
  },
  checkError() {
    const { activityStatus, isEnd, isStarted } = this.data;

    if (activityStatus !== '02' && isEnd !== 1) {
      return '请正式入营后查看'
    }

    if (activityStatus === '02'
      && !isStarted
      && isEnd !== 1) { // isend判断是否参加过瘦身营
      return '瘦身营还未开始，无法查看'
    }
  },
  integralTap: isLoginClick(function () {
    const err = this.checkError();
    if (err) {
      wx.showToast({
        title: err,
        icon: 'none'
      })
      return;
    }

    wx.navigateTo({
      url: `/pages/packageDiscover/slimmingCamp/integral/integral?campId=${this.data.campId}`
    })
  }),
  rankTap: isLoginClick(function () {
    const err = this.checkError();
    if (err) {
      wx.showToast({
        title: err,
        icon: 'none'
      })
      return;
    }

    wx.navigateTo({
      url: `/pages/packageDiscover/slimmingCamp/rankList/rankList?campId=${this.data.campId}`
    })
  }),
  // dialogConfirm() {
  //   const { phone } = this.data;

  //   wx.requestSubscribeMessage({
  //     tmplIds: ['tmJ28h28v4A3W3o-pO4BCZor5d0jQCrLNoIPVjdLZn0']
  //   })

  // },
  dialogCancel() {
    this.setData({
      phone: ''
    })
  },
  countDownChange(evt) {
    const data = evt.detail;

    const keys = Object.keys(data)

    keys.forEach(key => { // 把0转成00字符串显示
      if (data[key] < 10) {
        data[key] = `0${data[key]}`
      }
    })
    if (keys.every(key => data[key] === 0)) { // 倒计时结束
      // this.queryCurrActivity();
      this.setData({
        'countDown.time': 0
      })
    }
    this.setData({
      'countDown.data': data
    })
  },
  viewRulerTap() {
    wx.navigateTo({
      url: '/pages/orderFood/rule/rule'
    })
  },
  btnTap: isLoginClick(function () {
    this.btnHandler();
  }),
  inviteTap() {
    this.setData({
      showShare: true
    })
  },
  queryUserHistoryActivityList() {
    requests.queryUserHistoryActivityList()
      .then((res) => {
        if (res.obj && res.obj.activityList.length > 0) {
          this.setData({
            historyActivity: res.obj.activityList[0]
          })
        }
      })
  },
  btnHandler(status = this.data.activityStatus) {
    const { activityId, counselorId, campId, campList } = this.data;
    switch (status) {
      // case '00': // 充值入营
      //   wx.navigateTo({
      //     url: `/pages/packageDiscover/slimmingCamp/slimmingCampRecharge/slimmingCampRecharge?aid=${activityId}`
      //   })
      //   break;
      case '01': // 去订餐
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/bodyForm/bodyForm?aid=${activityId}`
        })
        break;
      case '02': // 查看我的减脂营
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/slimmingCampDetail/slimmingCampDetail?aid=${activityId}&cid=${counselorId}&campId=${campId}`
        })
        break;
      case '00': // 充值入营
      case '09': // 立即预约
        if (campList.length === 1) {
          const camp = campList[0];
          this.join(camp.activity.activityId, camp.camp.campId)
        } else {
          wx.showToast({
            title: '请选择一个您喜欢的营加入',
            icon: 'none'
          })
        }
        wx.pageScrollTo({
          selector: '#camps'
        })
        break;
    }
  },
  join(activityId, campId) {
    this.activityId = activityId;
    this.campId = campId;

    this.reserveActivityCamp()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            'dialog.show': false
          })
          this.queryActivityList();
        } else if (res.errMsg) {
          wx.showToast({
            icon: 'none',
            title: res.errMsg
          })
        }
      })
  },
  joinTap: isLoginClick(function ({ currentTarget }) {
    this.join(currentTarget.dataset.id, currentTarget.dataset.cid)
  }),
  queryPhone() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.phone) {
      this.setData({
        phone: userInfo.phone
      })
    } else {
      requests.queryUserInfo()
        .then(res => {
          let info = res.obj;
          wx.setStorageSync('userInfo', info.userInfo);
          this.setData({
            phone: info.userInfo.phone
          })
        })
    }
  },
  queryActivityList() {
    requests.queryActivityList()
      .then((res) => {
        if (res.errCode === 0) {
          const { ifJoin, activityList } = res.obj;
          this.setData({
            ifJoin
          })
          const campList = activityList
            .map((item) => {
              const { activity } = item;
              item.startTime = day(String(activity.startTime).slice(0, 8)).format('M月D日');
              item.endTime = day(String(activity.endTime).slice(0, 8)).format('M月D日');

              return item;
            })


          if (campList.length > 0) this.setActivity(campList[0]);

          // 01 代表有入营
          if (ifJoin === '01') {
            this.activityId = campList[0].activity.activityId;
            this.queryActivityStt();
          } else {
            this.setData({
              activityStatus: '09',
              btnTitle: '预约入营',
            })
          }

          this.setData({
            campList
          })
        }
      })
  },
  queryActivityStt(activityId = this.activityId) {
    requests.queryActivityStt({
      activityId
    })
      .then((res) => {
        if (res.errCode === 0) {
          const { stt, isEnd } = res.obj;
          this.setData({
            activityStatus: stt,
            isEnd, // 0 没有报告 1代表有结营报告
            btnTitle: {
              '00': '预约入营',
              '01': '去订餐',
              '02': '查看我的减脂营',
              '09': '预约入营',
            }[stt]
          })
        }
      })
  },
  // updateTaskDisabled() {
  //   const { isStarted, activityStatus } = this.data;
  //   this.setData({
  //     taskDisabled: !isStarted || activityStatus !== '02'
  //   })
  // },
  setActivity({ activity, camp }) {
    const startTime = String(activity && activity.startTime);
    const startDay = startTime
      ? day()
        .set('year', startTime.slice(0, 4))
        .set('month', startTime.slice(4, 6) - 1,)
        .set('date', startTime.slice(6, 8))
        .set('hour', startTime.slice(8, 10))
        .set('minute', startTime.slice(10, 12))
        .set('second', startTime.slice(12))
      : day()

    const today = day();
    const countdownTime = startDay - today;
    this.setData({
      counselorId: camp.campPrincipalUid,
      activityId: activity.activityId,
      isStarted: today >= startDay,
      campId: camp.campId,
      'countDown.time': countdownTime,
      showCountdown: countdownTime > 0 && this.data.ifJoin === '01'
    })
    setStorage('counselorId', camp.campPrincipalUid)
  },
  // queryCurrActivity() {
  //   return requests.queryCurrActivity()
  //     .then((res) => {
  //       if (res.errCode === 0) {
  //         let startTime = (res.obj.activity && res.obj.activity.startTime);
  //         startTime = startTime && String(startTime);
  //         const startDay = startTime
  //           ? day()
  //             .set('year', startTime.slice(0, 4))
  //             .set('month', startTime.slice(4, 6) - 1,)
  //             .set('date', startTime.slice(6, 8))
  //             .set('hour', startTime.slice(8, 10))
  //             .set('minute', startTime.slice(10, 12))
  //             .set('second', startTime.slice(12))
  //           : day()

  //         const today = day();
  //         this.setData({
  //           activityId: res.obj.activity.activityId,
  //           isStarted: today >= startDay,
  //           campId: res.obj.campId,
  //           'countDown.time': startDay - today
  //         }, () => {
  //           this.updateTaskDisabled();
  //         })
  //         查询营长二维码
  //         if (res.obj.counselorId) {
  //           this.queryCompWechatQrcode(res.obj.counselorId)
  //         }
  //       }
  //     })
  // },
  // 查询营长二维码
  // queryCompWechatQrcode(code) {
  //   requests.queryCompWechatQrcode({
  //     counselorId: code
  //   })
  //     .then(res => {
  //       this.setData({
  //         codeImg: res.obj.queryCompWechat.qrcodeImg
  //       })
  //     })
  //     .catch(error => {

  //     })
  // },
  addActivityInvited({
    uid,
    aid
  }) {
    requests.addActivityInvited({
      avActivityType: '01',
      avInvitedUid: uid,
      avActivityId: aid
    })
  },
  reserveActivityCamp() {
    return requests.reserveActivityCamp({
      activityId: this.activityId,
      campId: this.campId,
    })
  },
  orderTap(evt) {
    if (evt.currentTarget.dataset.disabled) return;
    wx.navigateTo({
      url: '/pages/predefine/orderMeal/orderMeal'
    })
  },
  sportTap(evt) {
    if (evt.currentTarget.dataset.disabled) return;
    wx.navigateTo({
      url: '/pages/sport/sportIndex/sportIndex'
    })
  },
  foodTap(evt) {
    if (evt.currentTarget.dataset.disabled) return;
    wx.navigateTo({
      url: '/pages/datas/diet/diet'
    })
  },
  saveCode() {
    let that = this;
    let url = this.data.codeImg;
    wx.getImageInfo({
      src: url,
      success: (res) => {
        let path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: (res) => {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              image: '',
              duration: 1500,
              mask: false,
              success: (result) => {
                that.setData({
                  hideDialog: true
                })
              },
              fail: () => { },
              complete: () => { }
            });

          },
          fail: (res) => {
            that.setting()
          }
        })
      },
    })
  },

  // 拒绝授权打开设置
  setting: function () {
    var that = this;
    wx.getSetting({
      success: function (res) {
        var statu = res.authSetting;
        if (!statu['scope.writePhotosAlbum']) {
          wx.showModal({
            title: '保存图片需开启权限',
            content: '请确认授权，否则将无法保存图片',
            showCancel: false,
            confirmColor: '#f5af53',
            success: function (tip) {
              if (tip.confirm) {
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.writePhotosAlbum"] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //授权成功之后，再调用保存相册
                      that.saveImg()
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
            }
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '调用授权窗口失败',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },
})