// pages/packageDiscover/schemeLibrary/schemeLibrary.js
import apiRequest from '../../../service/index'
import day from '../../../libs/day';
import {
  getStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    tabList: [{
      name: '减脂',
      stt: '01',
    }, {
      name: '增肌',
      stt: '02',
    },{
      name: '我的',
      stt: 'all',
    }],
    tabIndex: 0,
    typeStatus: {
      '01': '减脂',
      '02': '增肌',
      '03': '保持体形',
      '04': '控糖'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    let {
      tabIndex
    } = this.data;
    if (tabIndex == 0 || tabIndex == 1) {
      this.queryRecommendListByType()
    } else {
      this.queryDietPlanList();
    }
  },

  tab(e) {
    let {
      stt,
      index
    } = e.currentTarget.dataset;
    let {
      tabList
    } = this.data;
    if (stt == 'all') {
      this.setData({
        tabIndex: index,
        updateIsOk: false
      })
      this.queryDietPlanList();
    } else if (stt) {
      this.setData({
        tabIndex: index,
        updateIsOk: false
      })
      this.queryRecommendListByType()
    }
  },
  createFn: function() {
    wx.navigateTo({
      url: '/pages/packageDiscover/planSet/planSet',
    })
  },
  queryRecommendListByType() {
    let {
      tabIndex,
      tabList
    } = this.data;
    apiRequest.queryRecommendListByType({
      target: tabList[tabIndex].stt
    })
      .then(res => {
        let caseList = res.obj.caseList;
        this.update();
        this.setData({
          solutionList: caseList,
        })
      })
      .catch(error => {

      })
  },

  // 我的方案
  queryDietPlanList() {
    apiRequest.queryDietPlanList({
      planStt: 'all'
    })
      .then(res => {
        let queryList = (res.obj && res.obj.queryList) || [];
        // queryList = queryList.filter((item) => {
        //   return item.currStt == '01'
        // });
        queryList.map((item) => {
          item.ctime = `${item.ctime.substring(0, 4)}-${item.ctime.substring(4, 6)}-${item.ctime.substring(6, 8)}`
        })
        this.update();
        this.setData({
          queryList,
        })
      })
      .catch(error => {

      })
  },

  update() {
    setTimeout(() => {
      this.setData({
        updateIsOk: true
      })
    }, 200)
  },

  detail: function (e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    let {
      solutionList
    } = this.data;
    wx.navigateTo({
      url: `/pages/packageDiscover/netRedPlan/netRedPlan?id=${id}`
    });
  },

  // 我的方案
  goPlan: function (e) {
    let {
      id,
    } = e.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/packageDiscover/planDetail/planDetail?id=${id}`,
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
  onShareAppMessage: function () {

  }
})