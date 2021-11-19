
import requests from '../../../../service/index';
import Draw from '../../../../utils/Draw';
import ShareImage from '../../../../utils/ShareImage'
import { t } from '../../../../utils/common';
// pages/packageDiscover/slimmingCamp/InviteDialog/InviteDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    name: String,
    aid: String,
    uid: String
  },
  observers: {
    'aid,uid'(aid, uid) {
      if (aid && uid) {
        this.getQrCode() // 请求二维码
          .then(() => {
            this.drawShare(); // 绘制分享图
          })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {},
  ready() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getQrCode() {
      const { uid, aid } = this.data
      return requests.getQrCode({
        targetPath: `/pages/packageDiscover/slimmingCamp/slimmingCamp/slimmingCamp?invite=${uid}&uid=${uid}&aid=${aid}`,
        targetAppid: 'wxb41830cd88835f5c'
      }).then((res) => {
        this.setData({
          qrcode: res.obj.ImageUrl
        })
      })
    },
    downloadTap() {
      if (this.sharePromise) {
        this.sharePromise.then(async (sharer) => {
          try {
            await sharer.save();
          } catch (e) { }
          sharer.preview();
        })
      }
    },
    closeTap() {
      this.setData({
        show: false
      })
    },
    async drawShare() {
      const drawer = new Draw(wx.createCanvasContext('share', this))
      await drawer.drawImage('https://prodstatic.weis1606.cn/api/smartFood/camp_activity/reduce_share_poster.png', {
        top: 0,
        left: 0,
        width: t(636),
        height: t(969)
      })

      const tag = `来自：“${this.data.name}”的邀请`;

      drawer.drawView({
        top: t(252),
        left: t(74),
        width: t(52) + drawer.textWidth(tag, t(26)),
        height: t(54)
      }, {
        backgroundColor: '#FFBB41',
        borderRadius: t(28),
        borderWidth: t(2)
      })

      drawer.drawText(tag, {
        top: t(266),
        left: t(100),
        height: t(26)
      }, {
        fontSize: t(26),
        color: '#333'
      })

      drawer.drawView({
        top: t(720),
        left: t(415),
        width: t(182),
        height: t(182)
      }, {
        backgroundColor: '#FF5443',
        borderRadius: t(91)
      });

      drawer.drawView({
        top: t(720),
        left: t(415),
        width: t(182),
        height: t(182)
      }, {
        backgroundColor: '#FF5443',
        borderRadius: t(91)
      });

      await drawer.drawImage(this.data.qrcode, {
        top: t(731),
        left: t(426),
        width: t(160),
        height: t(160),
        borderRadius: t(80)
      });

      drawer.draw(true, () => {
        this.sharePromise = drawer.canvasToTempFilePath({
          id: 'share',
          width: 636,
          height: 969
        }, this).then((res) => {
          return new ShareImage(res.tempFilePath)
        })
      });
    },
  }
})
