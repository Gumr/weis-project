// pages/packageDiscover/dynamic/menuList/menuList.js
import apiRequest from '../../../../service/index';
import {
  categoryMap
} from '../../../../utils/map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.healthScoreList()
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
  // 关联餐单时候需要得到的 & 健康分列表
  healthScoreList() {
    apiRequest.healthScoreList().then((res) => {
      if (res.errCode === 0) {
        this.setData({
          menu: res.obj.healthScoreList.map(item => {
            item.checked = false
            return item
          })
        })
      }
    })
  },
  // 选择
  select(e) {
    let { menu } = this.data;
    let { index } = e.currentTarget.dataset;
    if(!menu[index].checked) {
      menu.map(item => item.checked = false)
    }
    menu[index].checked = !menu[index].checked;
    this.setData({
      menu,
      btnActive: menu.some(item => item.checked),
      menuSelect: menu[index]
    })
  },
  // 关联该餐单
  relationMenu() {
    if(!this.data.btnActive) {
      return
    }
    //设置上一个页面中的数据
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packageDiscover/dynamic/dynamicRelease/dynamicRelease'
    );
    const prepage = pages[index];
    prepage.setData({
      menu: this.data.menuSelect
    });
    wx.navigateBack({
      delta: 1
    })
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