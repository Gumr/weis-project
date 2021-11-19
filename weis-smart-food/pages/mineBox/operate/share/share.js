// pages/mineBox/operate/share/share.js
import apiRequest from '../../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航栏
    navHeight: wx.getSystemInfoSync().system.indexOf('iOS') > -1 ? 44 : 48, //状态栏高度,
    typeList: [
      {label: '我的分享', value: 0},
      {label: '排名', value: 1},
    ],
    typeValue: 0,
    // 列表数据
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
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
    this.getList()
  },
  // 导航栏改变
  cutType(e) {
    let {value} = e.currentTarget.dataset;
    if (value == this.data.typeValue) {
      return
    }
    this.setData({
      typeValue: value,
    }, () => {
      this.getList()
    })
  },
  // 获取列表数据
  getList() {
    const {typeValue, options} = this.data;
    apiRequest[typeValue == 0?'queryActivityMutual':'queryActivityRank']({
      activityId: options.id
    }).then(res => {
      this.setData({
        list: res.obj
      })
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