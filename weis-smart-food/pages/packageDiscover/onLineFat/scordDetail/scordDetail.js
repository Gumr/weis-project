// pages/packageDiscover/onLineFat/scordDetail/scordDetail.js
import day from '../../../../libs/day';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupScoreList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      let groupScoreList = data.data.groupScoreList || [];
      groupScoreList.sort((a, b) => day(b.scoreTime) - day(a.scoreTime))
      groupScoreList.forEach((item)=>{
        item.scoreTime = day(item.scoreTime).format('MM月DD日')
      });
      that.setData({
        groupScoreList,
      })
    })
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

  }
})