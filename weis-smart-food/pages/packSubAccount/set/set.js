// pages/packSubAccount/set/set.js
import apiRequest from '../../../service/index';
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
    this.userNutritionHealthSeting()
  },

  userNutritionHealthSeting(){
    apiRequest.userNutritionHealthSeting({
      
    }).then((res)=>{
      this.setData({
        hideTip: !res.obj.showTip,
      })
    })
  },

  proposal(){
    wx.navigateTo({
      url: '/pages/mineBox/allergen/allergen',
    }); 
  },

  advise(){
    wx.navigateTo({
      url: '/pages/packageOrder/advise/advise',
    });
  },

  about(){
    wx.navigateTo({
      url: '/pages/packSubAccount/about/about',
    }); 
  },

  switchChange(e){
    apiRequest.replaceCateringShoppingCartGoods({
      showTip: !e.detail.value,
    }).then(()=>{
      this.setData({
        hideTip: e.detail.value
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