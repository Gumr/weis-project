
import requests from '../../../service/index'
import { round } from '../../../utils/common'
import { URL } from '../../../utils/request'
// pages/aboutOrder/skuRefund/skuRefund.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sku: {},
    form: {
      num: 1,
      applicationReason: ''
    },
    wordCount: 0,
    confirmable: false,
    refundPrice: 0,
    imgUrlList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('data', (sku) => {
      this.setData({
        sku
      })

      this.updateRefundPrice();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      isFullscreen: getApp().globalData.isIpx
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
  chosseCameraTap() {
    const { imgUrlList } = this.data;
    if (imgUrlList.length >= 3) {
      wx.showToast({
        title: '最多上传3张图!',
        icon: 'none'
      })
      return;
    }

    wx.chooseImage({
      count: 3 - imgUrlList.length,
      success: (res) => {

        this.setData({
          imgUrlList: [...imgUrlList, ...res.tempFilePaths]
        }, () => this.updateConfirmable())
      }
    })
  },
  calcTap(evt) { // 加减icon点击
    const { type } = evt.currentTarget.dataset;

    let { num } = this.data.form;
    switch (type) {
      case 'add':
        num += 1;
        break;
      case 'subtract':
        num -= 1;
        break;
    }
    if (num > this.data.sku.num) {
      wx.showToast({
        title: '退款数量不能大于可申请数量',
        icon: 'none'
      })
      return;
    }
    if (num < 1) {
      wx.showToast({
        title: '退款数量不能小于1',
        icon: 'none'
      })
      return;
    }
    this.setData({
      'form.num': num
    })

    this.updateRefundPrice();
  },
  getCheckMsg() {
    const { form, imgUrlList } = this.data;
    let errMsg;
    if (!form.applicationReason) {
      errMsg = '申请原因未填写'
    } else if (imgUrlList.length <= 0) {
      errMsg = '商品图片信息未上传'
    }

    return errMsg;
  },
  updateRefundPrice() {
    const { sku, form } = this.data;

    this.setData({
      // refundPrice: round(form.num * sku.totalPrice * sku.$discount, 2)
      refundPrice: round(sku.totalPrice / sku.num * form.num)
    })
  },
  updateConfirmable() {
    const errMsg = this.getCheckMsg();
    this.setData({
      confirmable: !errMsg
    })
  },
  handleTextareaInput(evt) {
    const { value } = evt.detail;
    this.setData({
      'form.applicationReason': value,
      wordCount: value.length
    }, () => this.updateConfirmable())
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  uploadImage(imageUrl) {
    return requests
      .uploadFile(
        `${URL.api}/upload/image`,
        imageUrl,
        {
          flag: 'refund'
        })
      .then(res => {
        res = JSON.parse(res.data);

        return res.errCode === 0 ? res.obj.imageUrl : Promise.reject();
      });
  },
  refundConfirmTap() {
    if (!this.data.confirmable) {
      const errMsg = this.getCheckMsg();
      wx.showToast({
        title: errMsg,
        icon: 'none'
      })

      return;
    }

    this.orderRefund();
  },
  deleteImage(evt) {
    const { index } = evt.currentTarget.dataset;
    const { imgUrlList } = this.data;
    imgUrlList.splice(index, 1)
    this.setData({
      imgUrlList
    })
    this.updateConfirmable()
  },
  async orderRefund() {
    let { sku, form, imgUrlList } = this.data;

    imgUrlList = await Promise.all(
      imgUrlList.map(imgUrl => this.uploadImage(imgUrl))
    )
    requests.orderRefund({
      id: sku.dietDetailId,
      type: '02',
      orderId: sku.$orderId,
      imgUrlList,
      ...form
    })
      .then(res => {
        if (res.obj && res.obj.refundStt) {
          const duration = 1500;
          wx.showToast({
            title: '已提交售后申请',
            icon: 'none',
            duration
          });
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, duration)
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
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
})