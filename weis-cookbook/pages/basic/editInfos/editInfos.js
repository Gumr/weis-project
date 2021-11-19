// pages/basic/editInfos/editInfos.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: null,
    navtitle: null,
    newValue: null,
    maxLength: 50,
    nowLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {navtitle, maxLength} = this.data
    const type = options.type
    const {userInfo: {uname, userInfo: {autograph}}} = app.globalData
    this.setData({
      type
    }, () => {
      navtitle = type === 'nickname' ? '修改昵称' : '个人简介'
      maxLength = type === 'nickname' ? 10 : 50
      console.log(maxLength)
      this.setData({
        navtitle,
        maxLength,
        newValue: type === 'nickname' ? uname : autograph
      },() => {
        this.setData({
          nowLength: this.data.newValue.length
        })
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
  inputFn(e) {
    const {value} = e.detail
    this.setData({
      newValue: value,
      nowLength: value.length
    })
  },
  submitUpdate() {
    const {type, newValue} = this.data
    const obj = {}
    type === 'nickname' ? obj.uname = newValue : obj.autograph = newValue
    if(newValue.length === 0) return
    basicService.updateInfos(obj).then(res => {
      if(res.errCode === 0 && res.obj.result > 0) {
        type === 'nickname' ? app.globalData.userInfo.uname = newValue : app.globalData.userInfo.userInfo.autograph = newValue
        wx.navigateBack()
      } else {
        wx.showToast({
          title: '修改失败，请重试~',
          icon: 'none'
        })
      }
    })
  },
  clearWord() {
    this.setData({
      newValue: ''
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