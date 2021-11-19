import requests from '../../../../service/index';
// import Draw from '../../../../utils/Draw';
// import ShareImage from '../../../../utils/ShareImage'
import dayjs from '../../../../libs/day';
import { t, round } from '../../../../utils/common';
import { setStorage } from '../../../../utils/storage';
// pages/packageDiscover/slimmingCamp/slimmingCampDetail/slimmingCampDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId: '',
    captain: {}, // 营长
    counselorId: '', // 营长id
    userName: '', // 用户名
    paddingBottom: 0,
    expired: false, // 是否已失效
    showShare: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      campId: options.campId,
      counselorId: options.cid,
      activityId: options.aid
    })

    setStorage('counselorId', options.cid)
    this.queryUserInfo();
    this.queryActivityStt();
    this.queryUserActivityTimeList()
      .then(() => {
        if (!this.data.expired) {
          this.queryCompWechatQrcode();
        }
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    requests.queryCampCaseId()
      .then((res) => {
        if (res.errCode === 0) {
          this.queryRecommendCaseById(res.obj.caseId);
        }
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
    const { uid, activityId } = this.data;
    return {
      title: '维士减脂营一起来！14天瘦3斤，减脂路上和最重要的都是坚持',
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/camp_activity/reduce_wechat_share.png',
      path: `/pages/packageDiscover/slimmingCamp/slimmingCamp/slimmingCamp?invite=${uid}&uid=${uid}&aid=${activityId}`
    }
  },
  queryActivityStt(activityId = this.data.activityId) {
    return requests.queryActivityStt({
      activityId
    })
      .then((res) => {
        if (res.errCode === 0) {
          const { stt } = res.obj;
          this.setData({
            activityStatus: stt,
          })
        }
      })
  },
  queryUserActivityTimeList() {
    return requests.queryUserActivityTimeList({
      tacId: this.data.campId
    })
      .then((res) => {
        if (res.errCode === 0) {
          let { ctime, endTime, startTime, stt } = res.obj;
          const today = dayjs().startOf('day');
          ctime = dayjs(ctime.slice(0, 8));
          startTime = dayjs(startTime.slice(0, 8));
          endTime = dayjs(endTime.slice(0, 8));
          const logs = [];
          logs.push({
            label: '预约入营成功',
            date: ctime.format('MM月DD日')
          })
          logs.push({
            date: `${ctime.format('MM月DD日')}-${startTime.subtract(1, 'day').format('MM月DD日')}`,
            label: '预定5日减脂营期间饮食'
          })
          logs.push({
            date: `${startTime.format('MM月DD日')}`,
            label: '减脂营正式开始'
          })
          let activeIndex = 0;
          if (today > startTime && stt !== '02') {
            logs.push({
              label: '您已错过开营时间'
            })
            activeIndex = logs.length - 1;
          } else {
            if (+today === +ctime) {
              activeIndex = 0;
            } else if (today < startTime) {
              activeIndex = 1;
            } else if (+today >= +startTime) {
              activeIndex = 2;
            }
          }

          this.setData({
            expired: today > startTime,
            logs,
            activeIndex
          })
        }
      })
  },
  queryRecommendCaseById(tcFid) {
    requests.queryRecommendCaseById({
      tcFid
    }).then(res => {
      if (res.errCode === 0) {
        const data = res.obj;
        data.energyDifference = round(Math.abs(data.energyDifference), 1)
        this.setData({
          detail: data
        })
      }
    })
  },
  queryCompWechatQrcode() {
    requests.queryCompWechatQrcode({
      counselorId: this.data.counselorId
    })
      .then(res => {
        this.setData({
          captain: res.obj.queryCompWechat
        })
      })

  },
  orderTap() {
    switch (this.data.activityStatus) {
      case '00':
        wx.navigateTo({
          url: '/pages/packageDiscover/slimmingCamp/slimmingCampRecharge/slimmingCampRecharge'
        })
        break;
      case '01':
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/bodyForm/bodyForm?aid=${this.data.activityId}`
        })
        break;
      default:
        wx.switchTab({
          url: '/pages/index/index'
        });
        break;
    }
  },
  queryUserInfo() {
    return requests.queryUserInfo()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            uid: res.obj.userInfo.uid,
            uname: res.obj.uname
          })
        }
      })
  },
  // getQrCode() {
  //   return requests.getQrCode({
  //     targetPath: `/pages/packageDiscover/slimmingCamp/slimmingCamp/slimmingCamp?invite=${this.uid}`,
  //     targetAppid: 'wxb41830cd88835f5c'
  //   }).then((res) => {
  //     this.setData({
  //       qrcode: res.obj.ImageUrl
  //     })
  //   })
  // },
  // downloadPosterTap() {
  //   this.sharer.save();
  // },
  // async drawShare() {
  //   const drawer = new Draw(wx.createCanvasContext('share', this))
  //   await drawer.drawImage('https://prodstatic.weis1606.cn/api/smartFood/camp_activity/reduce_share_poster.png', {
  //     top: 0,
  //     left: 0,
  //     width: t(636),
  //     height: t(969)
  //   })

  //   const tag = `来自：“${this.data.userName}”的邀请`;

  //   drawer.drawView({
  //     top: t(252),
  //     left: t(74),
  //     width: t(52) + drawer.textWidth(tag, t(26)),
  //     height: t(54)
  //   }, {
  //     backgroundColor: '#FFBB41',
  //     borderRadius: t(28),
  //     borderWidth: t(2)
  //   })

  //   drawer.drawText(tag, {
  //     top: t(266),
  //     left: t(100),
  //     height: t(26)
  //   }, {
  //     fontSize: t(26),
  //     color: '#333'
  //   })

  //   drawer.drawView({
  //     top: t(720),
  //     left: t(415),
  //     width: t(182),
  //     height: t(182)
  //   }, {
  //     backgroundColor: '#FF5443',
  //     borderRadius: t(91)
  //   });

  //   drawer.drawView({
  //     top: t(720),
  //     left: t(415),
  //     width: t(182),
  //     height: t(182)
  //   }, {
  //     backgroundColor: '#FF5443',
  //     borderRadius: t(91)
  //   });

  //   await drawer.drawImage(this.data.qrcode, {
  //     top: t(731),
  //     left: t(426),
  //     width: t(160),
  //     height: t(160),
  //     borderRadius: t(80)
  //   });

  //   drawer.draw(true, () => {
  //     drawer.canvasToTempFilePath({
  //       id: 'share',
  //       width: 636,
  //       height: 969
  //     }, this).then((res) => {
  //       this.sharer = new ShareImage(res.tempFilePath)
  //     })
  //   });
  // },
  inviteTap() {
    this.setData({
      showShare: true
    })
  },
  closeTap() {
    this.setData({
      showShare: false
    })
  },
  noop() { }
})