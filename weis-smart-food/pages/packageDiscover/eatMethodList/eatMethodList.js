import day from '../../../libs/day';
import requests from '../../../service/index'
import {
  decideCategory
} from '../../../utils/common'
// pages/packageDiscover/eatMethodList/eatMethodList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playList: [], // 全部的吃法列表
    activeTab: 1,
    statusHeight: getApp().globalData.navStatusHeight,
    tabs: [
      {
        label: '上班族',
        value: 1
      },
      {
        label: '学生',
        value: 4
      },
      {
        label: '抗糖化',
        value: 3
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activeTab: Number(options.type),
      jumptype: options.jumptype || ''
    })
    this.getPlayList();
    this.getEatWayList();
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
  getEatWayList() {
    // let type = '01'
    //   if (isStudent && isGroup && isComEnter) {
    //     type = '03'
    //   } else if (isGroup && isComEnter) {
    //     type = '02'
    //   }
    requests.getEatWayList({
      date: day().format('YYYYMMDD'),
      category: decideCategory(),
      type: '01'
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          currentPlay: res.obj.eatWayList.find(i => i.isCheck === '1')
        })
      }
    })
  },
  tabTap(evt) {
    const {
      value
    } = evt.currentTarget.dataset;
    this.setData({
      activeTab: +value
    })

    this.getPlayList();
  },

  // [{ "bannerUrl": "https://prodstatic.weis1606.cn/api1/health/jkc.jpg", "jumpLink": "https://health.weis1606.cn/static/banner.html" }, { "bannerUrl": "https://prodstatic.weis1606.cn/api1/health/20201120_banner.jpg", "jumpLink": "https://health.weis1606.cn/static/index.html" }, { "bannerUrl": "https://prodstatic.weis1606.cn/api1/health/2020_12_17_banner.jpg", "jumpLink": "https://health.weis1606.cn/static/banner3.html" }]
  eatCardTap(evt) {
    const {
      index
    } = evt.currentTarget.dataset;
    const item = this.data.playList[index];
    // if (item.name === this.data.currentPlay.name) return;
    wx.navigateTo({
      url: '/pages/packageDiscover/eatMethodDetail/eatMethodDetail?title=' + item.name + '&jumptype=' + this.data.jumptype,
      success({
        eventChannel
      }) {
        eventChannel.emit('data', item);
      }
    })
  },
  getPlayList() {
    requests.getPlayList({
      planType: this.data.activeTab
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          playList: res.obj.playList.filter(item => item.code !== '06' && item.code !== '204')
        })
      }
    })
  }
})