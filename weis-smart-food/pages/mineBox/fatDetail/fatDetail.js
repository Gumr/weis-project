// pages/mineBox/fatDetail/fatDetail.js
import requests from '../../../service/index'
import day from '../../../libs/day'
import {
  isLoginClick
} from '../../../utils/common'
import Draw from '../../../utils/Draw';
import ShareImage from '../../../utils/ShareImage'
import {
  t,
  queryUserInfo
} from '../../../utils/common';
// import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exitDialog: false,
    morePopup: false,
    tipDialog: false,
    buttonHeight: 0,
    showUnit: false,
    detail: {},
    step: 1,
    title: '',
    closeImg: '',
    confirmText: '',
    unitList: [],
    confirmDisabled: false,
    weight: 0,
    unitSelect: '',
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id;
    this.queryActivityDetail();
    this.setData({
      step: 1,
      title: '请选择分队',
      closeImg: '/images/icon_down.png',
      confirmText: '下一步',
    })
    this.getQrCode();

    // requests.queryUserInfo()
    //   .then((res) => {
    //     if (res.errCode === 0) {
    //       this.initWeight = res.obj.userProfile.weight * 2
    //     }
    //   })
    requests.queryUserCurrActivity()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            hasActivity: Boolean(res.obj && (Object.keys(res.obj).length > 0))
          })
        }
      })
  },

  queryUserInfo() {
    queryUserInfo().then((res) => {
      if (res.errCode === 0) {
        this.initWeight = res.obj.userProfile.weight * 2
      }
      this.setData({
        userInfo: res.obj
      })
    })
  },

  toRule() {
    let tclwRule = this.data.detail.tclwRule;
    if (!tclwRule) {
      return
    }
    wx.navigateTo({
      url: '/pages/mineBox/imgPage/imgPage',
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('img', {
          img: tclwRule
        })
      },
      fail: () => {},
      complete: () => {}
    });

  },

  loginTap: isLoginClick(),
  // 报名
  signUp: isLoginClick(function () {
    if (this.data.hasActivity) {
      this.setData({
        tipDialog: true
      })
      return
    }

    this.setData({
      weight: this.initWeight,
      unitSelect: '',
      step: 1,
      confirmDisabled: true,
      showUnit: true
    })
  }),
  // 选择分队
  unitSelect({
    currentTarget
  }) {
    this.groupId = currentTarget.dataset.id;
    this.setData({
      unitSelect: currentTarget.dataset.index
    });
    this.updateConfirmDisabled()
  },
  toggleMoreTap() {
    this.setData({
      morePopup: !this.data.morePopup
    })
  },

  // 退出减脂营
  exit() {
    this.toggleMoreTap();
    this.setData({
      exitDialog: true
    })
  },

  sureExit() {
    requests.quitActivityCamp({
      activityId: this.id,
      type: '02', //企业减脂营
    }).then((res) => {
      if (res.errCode == 0) {
        wx.navigateBack({
          delta: 1
        });
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {

          },
          fail: () => {},
          complete: () => {}
        });

      }
    })
  },

  queryActivityDetail() {
    requests.queryActivityDetail({
      activityId: this.id
    }).then((res) => {
      if (res.errCode === 0) {
        const detail = res.obj.activity
        // gameDate: 减脂营比赛开始时间
        detail.gameDate = day(String(detail.tclwStartDate)).format('M月D日')
        detail.startDate = day(String(detail.tclwStartDate)).format('YYYY/MM/DD')
        detail.endDate = day(String(detail.tclwEndDate)).format('YYYY/MM/DD')
        detail.$status = {
          '00': '已加入',
          '01': '报名中',
          '02': '准备开营',
          '03': '进行中',
          '04': '已结束'
        } [detail.stt]
        // detail.groupLabel = detail.groupList.map(item => `${item.tclwgName}(${item.peopleNum}人)`).join(',')

        this.setData({
          detail,
          group: res.obj.group
        })
        if (res.obj.record) {
          this.setData({
            weight: (res.obj.record.tclwrWeightStart) * 2
          })
        }
      } else {
        this.setData({
          detail: {}
        })
      }
    })
  },
  weightChange(evt) {
    let value = evt.detail.value
    value = value.match(/[0-9]+(\.[0-9]{0,1})?/)

    if (value) {
      this.setData({
        weight: value[0] > 300 ? '' : value[0]
      })
      if (value[0] > 300) {
        wx.showToast({
          title: '体重不能超过300斤',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {

          },
          fail: () => {},
          complete: () => {}
        });

      }
    }
    this.updateConfirmDisabled()
  },
  // 确定
  onConfirm() {
    if (this.data.step == 1) {
      this.setData({
        step: 2,
        title: '请输入你当前体重',
        closeImg: '/images/icon_return.png',
        confirmText: '完成',
      })
      this.updateConfirmDisabled()
      return;
    }
    if (this.data.step == 2) {
      const {
        weight
      } = this.data;
      requests.updateUserProfile({
        weight: weight / 2
      })
      requests.addBodyDataInfo({
        time: day().format('YYYYMMDD'),
        bdValue: weight / 2,
        bdKey: 9
      })
      this.recordCampanyActivity()
        .then((res) => {
          if (res.errCode === 0) {
            wx.showToast({
              icon: 'none',
              title: '报名成功'
            })
            this.queryActivityDetail();
            this.setData({
              showUnit: false,
            })
          }
        })

    }
  },
  recordCampanyActivity() {
    return requests.recordCampanyActivity({
      activityId: this.id,
      groupId: this.groupId,
      currWeight: this.data.weight / 2
    })
  },
  // 关闭
  onClose() {
    if (this.data.step == 1) {
      this.setData({
        showUnit: false
      })
      return;
    }
    if (this.data.step == 2) {
      this.setData({
        step: 1,
        title: '请选择分队',
        closeImg: '/images/icon_down.png',
        confirmText: '下一步',
      })
      this.updateConfirmDisabled()
    }
  },
  updateConfirmDisabled() {
    const {
      unitSelect,
      weight
    } = this.data;

    function isUndef(val) {
      return !val && val !== 0
    }
    this.setData({
      confirmDisabled: this.data.step === 1 ? isUndef(unitSelect) : isUndef(weight)
    })
  },
  // 活动规则
  activeRule: isLoginClick(function () {
    wx.navigateTo({
      url: `/pages/mineBox/activeRule/activeRule`
    })
  }),

  showMember(e) {
    let groupList = this.data.detail.groupList;
    let index = e.currentTarget.dataset.index;
    if (groupList[index].peopleNum == 0) {
      return
    }
    requests.queryActivityTeamMembers({
      activityId: this.id,
      groupId: groupList[index].tclwgId,
    }).then((res) => {
      this.setData({
        userList: res.obj.userList || [],
        showGroup: groupList[index]
      })
    })
  },

  close() {
    this.setData({
      userList: [],
    })
  },

  getQrCode() {
    requests.getQrCode({
      targetPath: `/pages/mineBox/fatDetail/fatDetail?id=${this.id}`,
      targetAppid: 'wxb41830cd88835f5c',
      scene: `${this.id}0`, //scene不同生成图片不同
    }).then((res) => {
      this.qrcode = res.obj.ImageUrl || '';
      if(!this.load && !res.obj.ImageUrl){
        this.load = true;
        this.getQrCode();
      }
    })
  },

  // 邀请
  invite: isLoginClick(function () {
    this.setData({
      showShare: true
    })
  }),

  cancel() {
    this.setData({
      showShare: false
    })
  },

  async saveShareTap() {
    if (this.sharing) return;
    this.cancel();
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
    const userInfo = this.data.userInfo;
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('share', this))
    const draw = new Draw(ctx)

    draw.drawView({
      left: t(0),
      top: t(0),
      width: Math.ceil(t(750)),
      height: Math.ceil(t(1624)),
    }, {
      backgroundColor: "#FE5E0F",
      border: 'none'
    })

    let bgimg = this.data.detail.tclwCoverImg;
    if(bgimg.indexOf('https') == -1){
      bgimg = bgimg.replace(/^http/,"https");
    }

    await draw.drawImage(bgimg, {
      left: t(0),
      top: t(0),
      width: t(750),
      height: t(549),
    })

    bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/share_qiye_bj.png'

    await draw.drawImage(bgimg, {
      left: t(30),
      top: t(549),
      width: t(690),
      height: t(972),
    })

    bgimg = userInfo.headImgUrl;

    await draw.drawImage(bgimg, {
      left: t(90),
      top: t(639),
      width: t(88),
      height: t(88),
      borderRadius: t(44)
    })

    let uname = userInfo.uname;

    draw.drawText(uname, {
      left: t(198),
      top: t(669),
      height: Math.ceil(t(28)),
      width: Math.ceil(draw.textWidth(uname, t(28))),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333333',
    })

    bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_%EF%BC%82.png";

    await draw.drawImage(bgimg, {
      left: t(87),
      top: t(787),
      width: t(58),
      height: t(46),
    })

    bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_%EF%BC%82_1.png";

    await draw.drawImage(bgimg, {
      left: t(605),
      top: t(997),
      width: t(58),
      height: t(46),
    })

    uname = this.data.detail.tclwName.length > 11 ? `我在参加${this.data.detail.tclwName.substring(0,11)}...` : `我在参加${this.data.detail.tclwName}`;

    draw.drawText(uname, {
      left: (t(750) - draw.textWidth(uname, t(40))) / 2,
      top: t(855),
      height: Math.ceil(t(40)),
      width: Math.ceil(draw.textWidth(uname, t(40))),
    }, {
      fontSize: t(40),
      lineHeight: Math.ceil(t(40)),
      color: '#333333',
      fontWeight: 'bold'
    })

    uname = '邀请你一同加入';

    draw.drawText(uname, {
      left: (t(750) - draw.textWidth(uname, t(40))) / 2,
      top: t(935),
      height: Math.ceil(t(40)),
      width: Math.ceil(draw.textWidth(uname, t(40))),
    }, {
      fontSize: t(40),
      lineHeight: Math.ceil(t(40)),
      color: '#333333',
    })

    bgimg = this.qrcode;

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

    uname = '扫描左方小程序码';

    draw.drawText(uname, {
      left: t(378),
      top: t(1297),
      height: Math.ceil(t(52)),
      width: Math.ceil(draw.textWidth(uname, t(28))),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(52)),
      color: '#333333',
    })

    uname = '「报名参加」';

    draw.drawText(uname, {
      left: t(378),
      top: t(1349),
      height: Math.ceil(t(52)),
      width: Math.ceil(draw.textWidth(uname, t(28))),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(52)),
      color: '#333333',
    })

    bgimg = "https://prodstatic.weis1606.cn/api/smartFood/share_qiye_guajian.png";

    await draw.drawImage(bgimg, {
      left: t(0),
      top: t(1562),
      width: t(750),
      height: t(62),
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.queryUserInfo();
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
    const {
      detail
    } = this.data
    return {
      path: `/pages/mineBox/fatDetail/fatDetail?id=${this.id}`,
      title: `邀请你加入${detail.tclwName}`,
      imageUrl: detail.tclwCoverImg
    }
  }
})