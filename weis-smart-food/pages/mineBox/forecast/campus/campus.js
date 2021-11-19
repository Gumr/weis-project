// pages/mineBox/forecast/campus/campus.js
import apiRequest from '../../../../service/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
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
    this.queryUserCorpAddressList()
  },
  // 获取接口人的校区列表
  queryUserCorpAddressList() {
    apiRequest.queryUserCorpAddressList()
      .then(res => {
        this.setData({
          list: res.obj.messageBeans
        })
      })
      .catch(() => { });
  },
  // 跳转销售预测
  select(e) {
    let item = e.currentTarget.dataset.item;
    // 预测企业id：corpId 、校区id：tgcaId
    wx.navigateTo({
      url: `/pages/mineBox/forecast/forecast/forecast?corpId=${item.corpId}&tgcaId=${item.tgcaId}`,
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