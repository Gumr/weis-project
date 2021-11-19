// pages/aboutOrder/skuRefundDetail/skuRefundDetail.js

import requests from '../../../service/index'
import { refundHandleStatusMap, orderHandleStatusMap } from '../../../utils/map'
import day from '../../../libs/day'

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
    // console.log(options);
    this.opts = options;

    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('data', (sku) => {
      this.setData({
        sku
      })
      if (this.opts.handleId) {
        this.queryRefundDetail();
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const appData = getApp().globalData;

    this.setData({
      statusHeight: appData.navStatusHeight
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
  copyTap() {
    wx.setClipboardData({
      data: String(this.data.queryLog.id),
    });
  },
  contactTap() {
    wx.makePhoneCall({
      phoneNumber: '4006681606'
    });
  },
  recallTap() {

  },
  recallTap() {
    requests.cancellationRefund({
      sid: this.data.queryLog.sid,
      type: '02',
    })
      .then(res => {
        if (res.obj.cancellationStt) {
          wx.navigateBack({
            delta: 1
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
  },
  phone: function () {
    wx.makePhoneCall({
      phoneNumber: '4006681606',
      success: (result) => {

      },
    });
  },
  queryRefundDetail() {
    requests.queryRefundDetail({
      // id: this.opts.orderId,
      handleId: this.opts.handleId
    }).then((res) => {
      if (res.errCode === 0) {
        const queryLog = res.obj.queryLog;
        queryLog.$statusLabel = orderHandleStatusMap[queryLog.handleStt]

        let imgUrlList = [];
        try {
          imgUrlList = JSON.parse(`{"imgUrlList":${queryLog.imgUrlList}}`).imgUrlList;
        } catch (e) {
        }

        queryLog.$imgUrlList = imgUrlList;
        const reversalLogList = queryLog.reversalLogList
          .map((item) => {
            const handleTime = day(+item.handleTime)
            item.$date = handleTime.format('MM-DD')
            item.$time = handleTime.format('HH:mm')
            item.$statusLabel = refundHandleStatusMap[item.handleStt]
            return item;
          })
          .reverse()
        this.setData({
          queryLog: res.obj.queryLog,
          reversalLogList
        })
      }
    })
  },
})