import { filterTablewareSku } from '../../../utils/common'
import apiRequest from '../../../service/index'
import {
  getStorage,
} from '../../../utils/storage'

// pages/predefine/showCateList/showCateList.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    category: '',
    healthScore: '',
    categoryStatus: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._date = options.date
    this._cate = options.cate
    this.queryUserInfo()
    if(!options.mode){
      this.getHealthScore()
    }
    let showAllList = wx.getStorageSync('showAllList');
    this.setData({
      showAllList: {
        date: showAllList.date,
        cateList: showAllList.cateList.map((cate) => {
          cate = { ...cate }
          const detailMapList = filterTablewareSku(cate.detailMapList)
          detailMapList.map((item) => {
            item.dietLabelList = (item.dietLabelList || []).filter(label => label.type === '02');
            item.num = showAllList.subuidsList * item.num
            return item
          })
          cate.detailMapList = detailMapList;
          return cate;
        })
      },
      hidePrice: options.hidePrice ? true : false,
      mode: options.mode,
    });
  },
  toHealthScore() {
    wx.navigateTo({
      url: '/pages/packageOrder/healthScore/healthScore?page=showCateList'
    })
  },
  getHealthScore() {
    const pages = getCurrentPages()
    const prePage = pages[pages.length - 2]
    const date = prePage.data.goodsList[this._date]
    const cate = date.detailList[this._cate].category
    this.setData({
      healthScore: date.detailList[this._cate].score,
      overRankPart: date.detailList[this._cate].overRankPart,
      date: date.dateText,
      category: this.data.categoryStatus[cate],
      humanInfoWithScore: prePage.data.humanInfoWithScore,
      scoreForms: findSForms(prePage.data.scoreForms)
    })
    function findSForms(scoreForms) {
      let sForms
      scoreForms.forEach(item => {
        if(item.dateTime === date.date && item.category === cate) {
          sForms = item
        }
      })
      return sForms
    }
    // console.log(prePage.data.goodsList[this._date]);
  },
  queryUserInfo() {
    apiRequest.queryUserInfo()
    .then(res => {
      if(res.errCode === 0) {
        this.setData({
          userInfo: res.obj,
          subInfo: getStorage('subInfo')
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});
