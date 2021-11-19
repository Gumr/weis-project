// pages/packageDiscover/signIn/signIn.js
import request from '../../../service/index'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/signin/',
    isOpen: false, // 红包是否已打开
    signInDay: [],
    signingDayInd: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this._animation = animation
    this.signinDetail()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.unClickBtnAm()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  // 查询签到情况
  signinDetail() {
    let {signInDay, imgPrefix} = this.data
    request
      .userSignDetail()
      .then(res => {
        if(res.errCode === 0) {
          let amount
          let keepSignDay
          let signingDayInd  // 当前签到天数指针
          const {todayIsSign, lastSignInfo, redPacket} = res.obj
          if(lastSignInfo.length > 0) {
            keepSignDay = lastSignInfo[lastSignInfo.length - 1].keepSignDay
            signingDayInd = todayIsSign ? keepSignDay - 1 : keepSignDay
          } else {
            keepSignDay = 1
            signingDayInd = 0
          }
          if(redPacket.length > 0) {
            amount = redPacket[redPacket.length - 1].amount
          }
          
          this.setData({
            keepSignDay,
            signingDayInd,
            todayIsSign,
            isOpen: todayIsSign,
            signInDay,
            amount
          }, () => {
            this.createSignInDay(redPacket)
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.errMsg
          })
        }
      })
  },
  // 签到
  signinFn() {
    const {todayIsSign} = this.data
    if(todayIsSign) {
      wx.showToast({
        icon: 'none',
        title: '今天已签到啦~'
      })
    } else {
      this.openBtnAm()
      request.userDoSign()
        .then(res => {
          if(res.errCode === 0) {
            // 签到提醒
            this.subscribeMessage()
            const {todayIsSign, signInfo: {keepSignDay}, redPacket} = res.obj
            this.setData({
              amount: redPacket[0].amount,
              todayIsSign,
              keepSignDay,
            }, () => {
              const {path, tipPath} = this.confirmIcon(keepSignDay)
              this.setData({
                [`signInDay[${keepSignDay - 1}]`]: {
                  tipIcon: tipPath,
                  icon: path,
                  day: keepSignDay,
                  cash: `￥${redPacket[0].amount}`
                }
              })
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            })
          }
        })
      }
  },
  // 生成签到日期
  createSignInDay(redPacket) {
    
    let signInDay = []
    const {imgPrefix, todayIsSign, keepSignDay} = this.data
    for(var i = 1; i < 8; i++) {
      const {path, tipPath} = this.confirmIcon(i)
      signInDay.push({
        tipIcon: tipPath,
        icon: path,
        day: `${i}天`,
        cash: i <= redPacket.length ? `￥${redPacket[i - 1].amount}` : null
      })
    }
    this.setData({
      signInDay
    })
  },
  // 确定每天的签到icon
  confirmIcon(keepSignDay) {
    const {imgPrefix, signingDayInd, todayIsSign} = this.data
    const curSignDay = signingDayInd + 1
    let tipPath = keepSignDay == 4 ? 'red_tip_1.png' : 'red_tip_2.png'
    let path = keepSignDay === 4 ? 'red_envelopes.png' : keepSignDay === 7 ?  'red_envelopes_1.png' : 'currency.png'
    // 已签到的，除了当天，灰色图标
    if(keepSignDay <= curSignDay ) {
      if(keepSignDay < curSignDay) {
        path = 'currency_complete_grey.png'
        if(keepSignDay === 4) {
          tipPath = 'red_tip_1_grey.png'
          path = 'red_envelopes_open_grey.png'
        }
      } else if(todayIsSign) {
        tipPath = keepSignDay === 4 ? 'red_tip_1.png' : 'red_tip_2.png'
        path = keepSignDay === 4 || keepSignDay === 7 ? 'red_envelopes_open.png' : 'currency_complete.png'
      }
    }
    return {
      path: `${imgPrefix}${path}`,
      tipPath: `${imgPrefix}${tipPath}`
    }
  },
  // 开启红包按钮点击动画
  openBtnAm() {
    clearInterval(this._timer)
    this._animation.rotateY(180).step()
    this._animation.rotateY(0).step()
    this.setData({
      amData: this._animation.export(),
    }, () => {
      setTimeout(() => {
        this.setData({
          isOpen: true
        })
      }, 1500)
    })
  },
  // 开启红包按钮未点击动画
  unClickBtnAm() {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
    })
    this._timer = setInterval(function() {
      animation.scale(1.2, 1.2).step()
      animation.scale(1, 1).step()
      this.setData({
        amData: animation.export()
      })
    }.bind(this), 800)
  },
  subscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: ['tdGbyTy8VvLC0Wdp-7wDC_PgFNtpQBBeKbxeyruAmVs'],
      success(res) {
      },
      fail(res) {
      }
    })
  },
  toRedPage() {
    wx.navigateTo({
      url: '/pages/mineBox/coupon-valid/coupon-valid?from=redPacket'
    })
  },
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index',
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

  }
})