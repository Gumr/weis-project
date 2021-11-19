// pages/packageDiscover/coach/coachAll/coachAll.js
import apiRequest from '../../../../service/index';
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
    this.queryCoachInfo()
  },
  // 教练专区-数据
  queryCoachInfo() {
    apiRequest.queryCoachInfo({
      pageSize: 9999,
      pageNo: 1,
    }).then((res) => {
      if (res.errCode === 0) {
        const { coachDTO } = res.obj;
        this.setData({
          coach: coachDTO.map(item => {
            item.star = item.star?item.star.toFixed(1):item.star
            item.domain = item.domainList.join("·")
            return item
          })
        })
      }
    })
  },
  // 教练专区-点击跳转详情
  coachTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const item = this.data.coach[index];

    wx.navigateTo({
      url: `/pages/packageDiscover/coach/coachDetail/coachDetail?tcaId=${item.tcaId}`
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