import apiRequest from '../../../service/index';
// pages/packageDiscover/discoverList/discoverList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeDiabetesTab: 0,
    diabetesTabs: [
      {
        label: '视频',
        value: 0
      },
      {
        label: '图文',
        value: 1
      }
    ],
    videos: [], // 视频
    articles: [], // 图文
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryPublicityCopy();
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
  diabetesTabTap(evt) {
    const {
      index
    } = evt.currentTarget.dataset;
    this.setData({
      activeDiabetesTab: this.data.diabetesTabs[index].value
    })

    this.data.videos.forEach((_, index) => {
      const videoId = `video_${index}`;

      const ctx = wx.createVideoContext(videoId, this);
      ctx.pause();
    })
  },
  articleTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const item = this.data.articles[index];

    wx.navigateTo({
      url: `/pages/webview/webview?url=${item.draftUrl}`
    })
  },
  handleVideoPlay(evt) {
    const { id } = evt.currentTarget;
    const { videos } = this.data;
    videos.forEach((_, index) => {
      const videoId = `video_${index}`;
      if (videoId !== id) {
        const ctx = wx.createVideoContext(videoId, this);
        ctx.pause();
      }
    })
  },
  videoPlayTap(evt) {
    const {
      id,
      index
    } = evt.currentTarget.dataset;

    this.setData({
      [`videos[${index}].$controls`]: true
    })

    const ctx = wx.createVideoContext(id, this);
    ctx.play();
  },
  queryPublicityCopy() {
    apiRequest.queryPublicityCopy({
      draftsType: 'all',
      limitType: '02'
    }).then((res) => {
      if (res.errCode === 0) {
        const { publicityDrafts } = res.obj;
        const videos = [];
        const articles = [];
        for (const item of publicityDrafts) {
          if (item.type === '01') {
            item.$controls = false;
            videos.push(item)
          }
          if (item.type === '02') articles.push(item)
        }

        this.setData({
          videos,
          articles
        })
      }
    })
  },
})