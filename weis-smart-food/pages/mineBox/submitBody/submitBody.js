import requests from '../../../service/index'

// pages/mineBox/submitBody/submitBody.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyboardHeight: 0,
    confirmable: true,
    body: {
      weight: '',
      height: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.url = decodeURIComponent(options.url);
    this.queryUserInfo();
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
  handleInput(evt) {
    const { currentTarget, detail } = evt;
    this.setData({
      [`body.${currentTarget.dataset.key}`]: detail.value
    })
    this.updateConfirmable();
  },
  updateConfirmable() {
    const { body } = this.data;
    this.setData({
      confirmable: body.weight && body.height
    })
  },
  queryUserInfo() {
    requests.queryUserInfo({
      
    }).then((res) => {
      if (res.errCode === 0) {
        const userProfile = res.obj.userProfile;
        this.setData({
          'body.weight': userProfile.weight,
          'body.height': userProfile.height
        })
      }
    })
  },
  updateUserProfile() {
    return requests.updateUserProfile(this.data.body)
  },
  handleKeyboardHeightChange({ detail }) {
    this.setData({
      keyboardHeight: detail.height
    })
  },
  confirmTap() {
    if (!this.data.confirmable) return;
    this.updateUserProfile()
      .then((res) => {
        if (res.errCode === 0) {
          console.log(this.url, 'url')
          wx.navigateTo({
            url: this.url
          })
        }
      })
  }
})