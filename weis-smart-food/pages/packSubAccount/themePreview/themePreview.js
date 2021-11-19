// pages/packSubAccount/themePreview/themePreview.js
import { themeList, } from '../../../utils/map'
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
    let index = options.index;
    this.setData({
      info: themeList[index],
    })
  },

  application(){
    let {info} = this.data;
    wx.vibrateShort({
      success: (result) => {},
    });
    wx.setStorage({
      key: 'theme',
      data: info.name,
      success: (result) => {
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 1500,
          mask: false,
          success: (result) => {
            setTimeout(()=>{
              wx.switchTab({
                url: `/pages/index/index`,
              });
            },1500)
          },
        }); 
      },
    });
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