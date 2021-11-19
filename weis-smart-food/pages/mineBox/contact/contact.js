// pages/contact/contact.js
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
    this.queryUserInfo()
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

  queryUserInfo: function () {
    var that = this;
    apiRequest.queryUserInfo({
      mainUid: true
      })
      .then(res => {
        let userInfo = res.obj.userInfo;
        let ysf = {
          config: JSON.stringify({
            "uid": userInfo.uid,
            "data": JSON.stringify([{
                "key": "avatar",
                "value": userInfo.headImgUrl
              },
              {
                "key": "mobile_phone",
                "label": "手机",
                "value": userInfo.phone
              },
              {
                "key": "sex",
                "label": "性别",
                "value": userInfo.sex == 1 ? '先生' : '女士'
              },
            ])
          })
        }
        this.setData({
          info: res.obj,
          ysf
        })
      })
      .catch(error => {

      })
  },

  phone: function () {
    this.setData({
      showPhone: false
    })
    wx.makePhoneCall({
      phoneNumber: '4006681606',
      success: (result) => {

      },
    });
  },

  showPhone(){
    this.setData({
      showPhone: true
    })
  },

  proposal() {
    wx.navigateTo({
      url: '/pages/packageOrder/advise/advise',
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
  onShareAppMessage: function (options) {
    return {
      title: '维士健身饮食，健康美味！',
      path: '/pages/index/index',
      imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/share.png",
      success: (res) => {

      },
      fail: (res) => {

      }
    }
  }
})