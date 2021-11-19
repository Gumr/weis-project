// pages/mineBox/recovery/menuList/menuList.js
import {
  getStorage,
} from '../../../../utils/storage'
import {
  isLoginClick,
} from '../../../../utils/common'
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
    // 是否登录
    const loginInfo = getStorage('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
    this.setData({
      isLogin,
    })
    this.recyclingBox()
  },
  login: isLoginClick(function() {

  }),
  // 回收-查询近三天已签收/取餐状态的餐单的餐盒
  recyclingBox() {
    apiRequest.recyclingBox({
      pageNo: 1,
      pageSize: 9999
    })
      .then((res) => {
        this.setData({
          menu: res.obj.waitingRecyclingOrders
        })
      })
  },
  // 点击回收
  listTap(e) {
    let { itemobj } = e.currentTarget.dataset
    this.setData({
      recoveryShow: true,
      itemobj,
    })
  },
  // 确定回收
  recoveryConfirm() {
    this.setData({
      recoveryShow: false,
    })
    this.confirmRecycling()
  },
  // 回收-确认回收某一餐单的餐盒
  confirmRecycling() {
    let { itemobj } = this.data;
    apiRequest.confirmRecycling({
      oid: itemobj.orderId
    })
      .then((res) => {
        // 是否成功回收
        let { recyclingStatus } = res.obj;
        wx.navigateTo({
          url: `/pages/mineBox/recovery/redPacket/redPacket?status=${recyclingStatus}`,
        });
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