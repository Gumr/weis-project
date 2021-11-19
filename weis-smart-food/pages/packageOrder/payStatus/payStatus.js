// pages/packageOrder/payStatus/payStatus.js
import apiRequest from '../../../service/index';
import {
  setStorage,
  getStorage,
  removeStorage
} from '../../../utils/storage'
import {
  categoryMap
} from '../../../utils/map'
let reqNum_code = 0 // 请求取餐码次数
const app = getApp()
const util = require('../../../utils/util');
import day from '../../../libs/day'
import drawQrcode from '../../../libs/qrcode';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    categoryMap,
    tcuEtime: null,
    time: '',
    timeData: {},
    time2: '',
    timeData2: {},
    showCounp: false,
    showAgin: false,
    shareprice: 0,
    uid: app.globalData.uid,
    showArticle: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      status: options.status || false, //true 成功 false 失败
      mode: options.mode,
      orderId: options.orderId || '',
      payPrice: options.payPrice || 0,
      playNunmber: options.playNunmber || '',
      shareprice: Number(options.shareprice).toFixed(2) || 0,
      shipOid: options.shipOid || '', //shipOid
      corpId: options.corpId || '',
      tgcaId: options.tgcaId || '',
      ischild: options.ischild ? options.ischild.length : 0,
      shopType: options.shopType || '10',
      existReserve: options.existReserve || false,
      qrCodeStr: options.qrCodeStr
    })
    // 当天单点自取，二维码
    this.todayQrCode()
    if (options.status && this.data.mode != 'aiFat') {
      //再来一单送券
      // this.getCounp()
      this.queryPlay() // 分享返利
      this.queryActivityList() //查询是不是减脂营用户
    }
    switch (this.data.mode) {
      case 'slimmingCamp':
        this.setData({
          discount: options.discount
        })
        this.queryCode();
        if (getStorage('teamUpDate')) {
          this.checkUserOrderedByCategory()
        }
        break;
    }
    // 获取目标
    this.queryUserTarget();
    // 取餐码
    if (this.data.shopType == '20') {
      this.asciiOrderId();
    }
  },

  // 取餐码
  asciiOrderId() {
    apiRequest.asciiOrderId({
      shipOid: this.data.shipOid
    }).then((res) => {
      let asciiOrderId = res.obj.asciiOrderId || '';
      this.setData({
        asciiOrderId,
      })
      if (asciiOrderId) {
        drawQrcode({
          width: 175,
          height: 175,
          canvasId: 'qrcode',
          text: asciiOrderId,
        })
      }
    })
  },
  todayQrCode() {
    reqNum_code++
    clearTimeout(this._timer)
    const {qrCodeStr} = this.data
    this._timer = setTimeout(() => {
      if(!qrCodeStr || reqNum_code > 10) {
        this.setData({
          loading: false
        })
        if(reqNum_code > 2) {
          this.checkOrder()
          reqNum_code = 0
        }
        return
      }
      apiRequest.queryShipOrderDetailForThree({
        shipOid: this.data.shipOid
      }).then(res => {
        if(res.errCode === 0) {
          const shipResult = res.obj.shipResult[0]
          const {takeMealCode} = shipResult.detail
          if(!takeMealCode) this.todayQrCode()
          drawQrcode({
            width: 175,
            height: 175,
            canvasId: 'todayQrcode',
            text: qrCodeStr,
          })
          this.setData({
            takeMealCode,
            loading: !takeMealCode
          })
          return
        }
        this.setData({
          loading: false
        })
      })
    }, 500)
  },
  // toShareEat() {
  //   wx.navigateTo({
  //     url: '/pages/market/sharePlay/index'
  //   });
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.payPopup = this.selectComponent('#pay');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 获取目标
  queryUserTarget() {
    apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          let {
            planningType
          } = res.obj.healthGoal;
          this.queryPublicityCopy(planningType)
        }
      })
  },
  // 获取文章
  queryPublicityCopy(planningType) {
    apiRequest.queryPublicityCopy({
      draftsType: '02',
      limitType: '01',
      healthGoal: planningType
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          articles: res.obj.publicityDrafts
        })
      }
    })
  },
  // 文章-查看全文
  seeArticle(e) {
    const {
      drafturl
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/webview/webview?url=${drafturl}`
    })
  },
  // 关闭文章弹窗
  closeArticle() {
    this.setData({
      showArticle: false
    })
  },
  backHome() {
    // 支付失败 && 中行点餐-对私(返回是回到团餐页)
    let {
      status,
      corpId
    } = this.data;
    if (!status && corpId == '100097') {
      wx.navigateBack({
        delta: 1
      });
      return;
    } else if (corpId) {
      // const pages = getCurrentPages()
      // const prePage = pages[pages.length - 2]
      // prePage.queryTimeList()
      wx.navigateBack({
        delta: 3
      });
      return;

    }
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  queryActivityList() {
    apiRequest.queryActivityList()
      .then((res) => {
        if (res.errCode === 0 && res.obj.ifJoin === '02') {
          wx.showToast({
            title: '订餐积分将会在确认收货后到账！',
            icon: 'none'
          })
        }
      })
  },
  async queryCode() {
    const counselorId = getStorage('counselorId');
    if (!counselorId) return;
    const qrcodeRes = await apiRequest.queryCompWechatQrcode({
      counselorId
    })
    if (qrcodeRes.errCode === 0) {
      this.setData({
        codeImg: qrcodeRes.obj.queryCompWechat.qrcodeImg
      })
    }
  },
  saveImg() {
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
              fail: () => {},
              complete: () => {}
            });

          },
          fail: (res) => {
            that.setting()
          }
        })
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },
  // 查看订单 重新支付
  checkOrder() {
    let {
      status,
      payPrice
    } = this.data;
    if (status) {
      let url = this.data.mode == 'aiFat' ? `/pages/packageOrder/fatPackOrder/fatPackOrder?fatPackId=${this.data.orderId}&title=${''}` : '/pages/packageOrder/orderList/orderList'
      wx.navigateTo({
        url
      })
      // // 查看订单
      // wx.navigateTo({
      //   url: '/pages/packageOrder/orderList/orderList',
      // });

    } else {
      // 重新支付
      this.payPopup.pay(payPrice)
    }
  },

  async handlePayConfirm(e) {
    // 支付弹窗处理函数
    // 支付弹窗确认时间
    const {
      detail
    } = e;
    const changeRes = await this.rePayOrder({
      tradeNo: this.data.orderId,
      payWay: detail.type,
      openid: app.globalData.openId,
      payChannel: 'mina',
    });
    if (changeRes.errCode === 0) {
      if (detail.type === 'wechat') {
        try {
          await detail.wxPay(changeRes.obj).then(() => {
            this.setData({
              status: true
            })
            // this.getCounp()
            this.queryPlay() // 分享返利
            this.queryActivityList() //查询是不是减脂营用户
          });
        } catch {
          detail.done();
          return;
        }
      } else {
        this.setData({
          status: true
        })
        // this.getCounp()
        this.queryPlay() // 分享返利
        this.queryActivityList() //查询是不是减脂营用户
      }
      detail.done();
      this.setData({
        status: true
      })
    }
  },
  toMeal() {
    wx.switchTab({
      url: '/pages/index/index'
    })

  },
  close() {
    this.setData({
      showCounp: false
    })
  },
  getCounp() {
    apiRequest.querySendCoupons()
      .then(res => {
        if (res.obj && res.obj.coupon) {
          this.setData({
            tcuEtime: res.obj.coupon.length > 0 ? res.obj.coupon[0].tcuEtime : 0,
            showCounp: res.obj.coupon.length > 0 ? true : false,
            coupon: res.obj.coupon.map((item) => {
              item.tcuAmount = parseInt(item.tcuAmount)
              item.tcuEtime = util.dateUtil.format(new Date(Number(item.tcuEtime)), 'Y.M.D');
              return item
            })
          })
          if (this.data.showCounp && this.data.corpId != '100097' && this.data.time === '') {
            this.cuntdown()
          }
        }
      })


  },
  cuntdown() {
    let nowTime = new Date().getTime();
    let limitTime = this.data.tcuEtime ? this.data.tcuEtime : 0;

    this.setData({
      time: limitTime && limitTime - nowTime > 0 ? limitTime - nowTime : 0
    })
    if (this.data.time > 0) {
      this.setData({
        cutdowntime: true
      })
    }

  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },
  finish: function (e) {
    var that = this;
    var countDown = that.selectComponent('.control-count-down');
    countDown.pause();
  },
  closeshowAgin() {
    this.setData({
      showAgin: false,
      // 关闭分享给好友后，该弹窗变成引导预定的弹窗
      reserveShow: !this.data.existReserve,
    })
    this.cuntdown()
  },
  onChange2(e) {
    this.setData({
      timeData2: e.detail,
    });
  },
  cuntdown2() {
    let nowTime = new Date().getTime();
    let limitTime = this.data.topcCtime ? this.data.topcCtime : 0;
    let cutDowntime = this.data.topcCtime + (24 * 60 * 60 * 1000);

    this.setData({
      time2: cutDowntime ?
        cutDowntime - nowTime > 0 ?
        cutDowntime - nowTime :
        0 : 0,
    })
  },
  /**
   * 获取玩法卡片
   */
  queryPlay() {
    apiRequest.queryPlayCard({
        orderId: this.data.playNunmber
      })
      .then(res => {
        if (res.errCode === 0) {
          const playCard = res.obj && res.obj.playCard || {};
          if (Object.keys(playCard).length > 0) {
            this.setData({
              topcId: playCard.topcId,
              topcOid: playCard.topcOid,
              topcCtime: playCard.topcCtime,
              showAgin: true
            })
            this.cuntdown2()
          } else {
            this.setData({
              reserveShow: !this.data.existReserve,
            })
          }
        }
        // if (!(res.obj && res.obj.playCard)) return;

        // this.setData({
        //   topcId: res.obj.playCard.topcId,
        //   topcOid: res.obj.playCard.topcOid,
        //   topcCtime: res.obj.playCard.topcCtime
        // })
        // this.cuntdown2()
      })
  },

  rePayOrder(params) {
    return apiRequest.rePayOrder(params);
  },
  checkUserOrderedByCategory() {
    let teamUpDate = getStorage('teamUpDate');
    removeStorage('teamUpDate');
    let meal = this.data.meal;
    apiRequest.checkUserOrderedByCategory({
      dateList: teamUpDate.dateList,
      categoryList: teamUpDate.checkMeal,
      orderId: this.data.queryId
    }).then((res) => {
      if (!res.obj.dateList) {
        return
      }
      let dateList = res.obj.dateList;
      let list = ``;
      Object.keys(dateList).forEach((key, index) => {
        dateList[key].forEach((item, idx) => {
          let listVal = `${day(key).format('MM月DD日')} ${meal[item]}`
          list = list + listVal + (index == Object.keys(dateList).length - 1 && idx == dateList[key].length - 1 ? '' : ' / ')
        })
      })
      this.setData({
        coincideList: list,
        idList: res.obj.idList
      })
    })
  },
  // 预定明天餐-弹窗关闭
  reserveClose() {
    this.setData({
      reserveShow: false,
    })
  },
  // 预定明天餐-到点餐页默认选中明日午餐
  toIndex() {
    // 跳转点餐页
    setStorage('planMealDate', {
      date: day().add(1, 'day').format('YYYYMMDD'),
      category: '02',
    })
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
  onShareAppMessage: function (e) {
    if (e.from == "button") {
      app.globalData.gio('track', 'n_Sendcard', {
        desc: '发送翻牌'
      })
      const idx = (Math.random() * 2) | 0;
      const {
        tsuSubUid
      } = wx.getStorageSync('subInfo')
      const {
        topcOid,
        topcId,
        uid
      } = this.data;
      return {
        title: ['帮我戳一戳，送你现金券~', '快！翻出全额返现就差你了！'][idx],
        imageUrl: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/shareEatPlay.png',
        path: `/pages/activity/sharePlayOpen/index?scene=0798&orderId=${topcOid}&topcId=${topcId}&invite=${tsuSubUid || uid}`,
      }
    }
  }
})