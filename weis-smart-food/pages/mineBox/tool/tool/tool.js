// pages/mineBox/tool/tool/tool.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toolList: [
      {
        img: 'https://prodstatic.weis1606.cn/api/smartFood/tool_kit_banner@2x.png', 
        name: '什么是基础代谢？'
      }
    ]
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

  },

  // 拉新工具包-详情
  detail() {
    wx.navigateTo({
      url: '/pages/mineBox/tool/toolDetail/toolDetail'
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