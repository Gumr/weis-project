// pages/market/sharePlayPoster/index.js
// import OrderService from "../../../service/OrderService";
// const orderService = new OrderService();
// import UserService from '../../../service/UserService'
// const userService = new UserService()
import apiRequest from '../../../service/index';
import Draw from '../../../utils/Draw'
import ShareImage from '../../../utils/ShareImage'
import { t } from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.queryPlay(options.orderId)

    this.setData({

      orderId: options.orderId
    })
  },


  getQrCode() {
    apiRequest.getuserSharePlayQrCode({

      orderId: this.data.orderId,
      topcId: this.data.topcId,
      uname: this.data.uname,
      uid: this.data.uid,
      scene: '0798'

    }).then((res) => {
      this.SaveQrCode = this.base64ToFilePath(res.obj.img)
      this.setData({
        QrCodePromiser: 'data:image/png;base64,' + res.obj.img,
        planData: res.obj.planData,
        calculationMethod: res.obj.calculationMethod
      })
    })
  },
  base64ToFilePath(bodyData) {
    const fsm = wx.getFileSystemManager();
    // const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    // if (!format) {
    //   return (new Error('ERROR_BASE64SRC_PARSE'));
    // }
    return new Promise((resolve, reject) => {
      const time = new Date().getTime(); //自定义文件名
      const filePath = `${wx.env.USER_DATA_PATH}/${time}.png`;
      const buffer = wx.base64ToArrayBuffer(bodyData);
      fsm.writeFile({
        filePath,
        data: buffer,
        encoding: 'binary',
        success() {
          console.log(filePath, 'filePath')
          resolve(filePath);
        },
        fail() {
          return (new Error('ERROR_BASE64SRC_WRITE'));
        },
      });
    })

  },
  /**
 * 获取玩法卡片
 */
  queryPlay(orderId) {
    apiRequest.queryPlayCard({

      orderId: orderId

    })
      .then(res => {

        this.setData({
          cardList: res.obj,
          topcId: res.obj.playCard.topcId,
          uname: res.obj.playCard.uname,
          uid: res.obj.playCard.uid,
        })
        this.getQrCode()
      })
  },

  async saveShareTap() {

    if (this.sharing) return;
    wx.showLoading({
      title: '绘制中'
    })

    this.sharing = true;
    const imageUrl = (await this.drawShareImage()).tempFilePath;
    this.sharing = false;
    wx.hideLoading()
    const sharer = new ShareImage(imageUrl)
    // wx.previewImage({
    //   current: imageUrl, // 当前显示图片的http链接
    //   urls: [imageUrl] // 需要预览的图片http链接列表
    // })
    sharer.save().then(sharer.preview.bind(sharer), sharer.preview.bind(sharer))
  },
  async drawShareImage() {
    let date = new Date();
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('canvas', this))
    const draw = new Draw(ctx)

    let bgimg = 'https://prodstatic.weis1606.cn/api/sodo/newposterbgs.png'
    await draw.drawImage(bgimg, {
      left: t(0),
      top: t(0),
      width: t(750),
      height: t(1190),
    })
    let cardimage = this.data.cardList.playBase.cImgUrl
    await draw.drawImage(cardimage, {
      left: t(36),
      top: t(223),
      width: t(360),
      height: t(492),
    })

    draw.drawText('能量', {
      left: t(509),
      top: t(284),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText('蛋白质', {
      left: t(509),
      top: t(344),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText('碳水', {
      left: t(509),
      top: t(400),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText('脂肪', {
      left: t(509),
      top: t(460),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })

    let tppdCalorie = this.data.planData.tpdTotalKcal + '千卡'
    let tppdProteinWeight = (this.data.calculationMethod == '01' ? this.data.planData.tpdProteinTotal : this.data.planData.tpdFixedProteinTotal) + '克'
    let tppdCarbohydrateWeight = this.data.planData.tpdCarbohydrateTotal + '克'
    let tppdFatWeight = this.data.planData.tpdFatTotal + '克'
    draw.drawText(tppdCalorie, {
      left: t(610),
      top: t(284),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText(tppdProteinWeight, {
      left: t(610),
      top: t(344),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText(tppdCarbohydrateWeight, {
      left: t(610),
      top: t(400),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    draw.drawText(tppdFatWeight, {
      left: t(610),
      top: t(460),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })

    let title = this.data.cardList.playBase.cbannerTitle
    let cdescription = this.data.cardList.playBase.cdescription
    let utextWidth = Math.ceil(draw.textWidth(title, t(36), 'bold'))

    draw.drawText(title, {
      left: t(100),
      top: t(800),
      width: utextWidth,
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(30),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
      fontWeight: '800'
    })
    draw.drawText(cdescription, {
      left: t(110),
      top: t(838),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
    })
    let cbackImgUrl = this.data.cardList.playBase.cbackImgUrl
    await draw.drawImage(cbackImgUrl, {
      left: t(66),
      top: t(950),
      width: t(423),
      height: t(180),
    })

    let cbannerTitle = this.data.cardList.playBase.cbannerTitle
    let cbannerDescription = this.data.cardList.playBase.cbannerDescription
    let cbannerTitleWidth = Math.ceil(draw.textWidth(cbannerTitle, t(36), 'bold'))
    draw.drawText(cbannerTitle, {
      left: t(152),
      top: t(1002),
      width: cbannerTitleWidth,
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(36),
      lineHeight: Math.ceil(t(22)),
      color: '#333333',
      fontWeight: 'bold'

    })
    draw.drawText(cbannerDescription, {
      left: t(107),
      top: t(1050),
      width: t(340),
      height: Math.ceil(t(70)),

    }, {
      fontSize: t(24),
      color: '#333333',
      textAlign: 'center',
      lineHeight: t(26)

    })


    await draw.drawImage(await this.SaveQrCode, {
      left: t(545),
      top: t(950),
      width: t(150),
      height: t(150),
    })
    let tipsWidth = Math.ceil(draw.textWidth('扫码助力翻一翻', t(32)))
    draw.drawText('扫码助力翻一翻', {
      left: t(531),
      top: t(1110),
      width: tipsWidth,
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      color: '#333333',
    })
    let uname = this.data.uname + '最近的吃法'
    draw.drawView({
      left: t(240),
      top: t(900),
      width: Math.ceil(draw.textWidth(uname, t(20))) + t(40),
      height: Math.ceil(t(30)),
    }, {
      backgroundColor: "#FC6A2A",
      borderRadius: t(16),
      border: 'none'
    })
    draw.drawText(uname, {
      left: t(258),
      top: t(904),
      height: Math.ceil(t(22)),
      width: Math.ceil(draw.textWidth(uname, t(20))),
    }, {
      color: '#FFFFFF',
      fontSize: t(20),
    })
    let downimg = 'https://prodstatic.weis1606.cn/api/sodo/tipsdo.png'
    await draw.drawImage(downimg, {
      left: t(290),
      top: t(930),
      width: t(22),
      height: t(8),
    })


    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 750,
            height: 1190,
            id: 'canvas'
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