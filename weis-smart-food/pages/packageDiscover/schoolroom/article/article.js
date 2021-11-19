// pages/packageDiscover/schoolroom/article/article.js
import apiRequest from '../../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      catalogue: options.catalogue,
      title: options.title,
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
    this.queryDiscoverContents()
  },
  // 查询文章
  queryDiscoverContents() {
    let { catalogue } = this.data;
    apiRequest.queryDiscoverContents({
      target: '05', // 05:营养课堂
      catalogue, // 100001营养与膳食，100002营养与疾病，100003营养与生活
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          article: res.obj.discoverContents,
        })
      }
    })
  },
  // 文章点击
  articleTap(e) {
    let { link } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/webview/webview?url=${link}`,
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