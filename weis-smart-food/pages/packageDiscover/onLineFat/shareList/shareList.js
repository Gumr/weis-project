

import day from '../../../../libs/day';
let app = getApp();
import Draw from '../../../../utils/Draw';
import ShareImage from '../../../../utils/ShareImage'
import apiRequest from '../../../../service/index'

import {
  isLoginClick,
  refreshStepData,
  getStepConfig,
  loginPromise,
  t,
  queryUserInfo
} from '../../../../utils/common';
Page({


  data: {
    today: day(new Date()).format('MM月DD日'),
    showShare: false,
  },
  cancel() {
    this.setData({
      showShare: false
    })
  },
  buttonTap() {
    this.setData({
      showShare: true
    })

  },
  getQrCode() {
    let uid = app.globalData.uid;
    let obj = this.data.obj;
    return apiRequest.getQrCode({
      targetPath: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?id=${this.data.activityId}&campId=${this.data.campId}&status=${this.data.status}&invite=${this.data.inviteUid}&activityId=${this.data.activityId}&type=shareFriends`,
      targetAppid: 'wxb41830cd88835f5c',
      scene: `1`, //scene不同生成图片不同
    }).then((res) => {
      this.code = res.obj.ImageUrl;
    })
  },

  async saveShareTap() {
    if (this.sharing) return;
    // this.cancel();
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
    const userInfo = wx.getStorageSync('userInfo');
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

    let bgimg = 'https://prodstatic.weis1606.cn/api/smartFood/reduce_fat_kv.png'

    await draw.drawImage(bgimg, {
      left: t(0),
      top: t(0),
      width: t(750),
      height: t(654),
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

    uname = this.data.tclwName.length > 11 ? `我在参加${this.data.tclwName.substring(0, 11)}...` : `我在参加${this.data.tclwName}`;
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

    uname = '需要你助我一臂之力';

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

    uname = '进来帮我点个赞吧';

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


  onLoad: function (options) {

    this.setData({
      activityId: options.activityId,
      inviteUid: options.inviteUid,
      status: options.status,
      tclwCoverImg: options.tclwCoverImg,
      campId: options.campId,
      tclwName: options.tclwName,
      companyLikeRels: options.companyLikeRels != 'undefined' ? JSON.parse(options.companyLikeRels) : undefined,
      integralRuleLike: options.integralRuleLike != 'undefined' ? options.integralRuleLike : 1,
      integralRuleLikeLimit: options.integralRuleLikeLimit != 'undefined' ? options.integralRuleLikeLimit : 5
    })

  },
  onShow: function () {

  },
  onShareAppMessage: function () {

    return {
      path: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?id=${this.data.activityId}&campId=${this.data.campId}&status=${this.data.status}&invite=${this.data.inviteUid}&activityId=${this.data.activityId}&type=shareFriends`,
      title: '我正在参加减脂大赛，帮我点个赞吧',
      imageUrl: this.data.tclwCoverImg
    }
  }
})