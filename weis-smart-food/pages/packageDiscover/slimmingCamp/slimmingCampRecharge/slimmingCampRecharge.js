import requests from '../../../../service/index'

import { buyAndActiveCard } from '../../../../utils/common'
// pages/marketing/slimmingCamp/slimmingCampRecharge/slimmingCampRecharge.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    cardIndex: 0,
    cardList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.aid = options.aid;
    const { globalData } = getApp()
    this.setData({
      isIpx: globalData.isIpx,
      navStatusHeight: globalData.navStatusHeight
    })

    this.getBuyCardForGoods();
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

  },
  checkProtocolTap() {
    this.setData({
      checked: !this.data.checked
    })
  },
  cardTap(evt) {
    this.setData({
      cardIndex: evt.currentTarget.dataset.index
    })
  },
  btnTap() {
    const { checked, cardIndex, cardList } = this.data;
    if (!checked) return;
    const rechargeCard = cardList[cardIndex]
    buyAndActiveCard(rechargeCard.cardModelBean.id, {
      isCamp: '01'
    }).then((res) => {
      if (res.errCode === 0) {
        wx.redirectTo({
          url: `/pages/packageDiscover/slimmingCamp/rechargeSuccess/rechargeSuccess?price=${rechargeCard.totalAmount}&aid=${this.aid}`
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
  protocolTap() {
    wx.navigateTo({
      url: '/pages/mineBox/rechargeDeal/rechargeDeal'
    })
  },
})