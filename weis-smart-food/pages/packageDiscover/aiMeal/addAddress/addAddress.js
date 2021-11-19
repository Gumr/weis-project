// pages/addAddress/addAddress.js
var location = require('../../../../libs/location');
import requests from "../../../../service/index";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '', //收货地址
    houseNum: '',
    tuaName: '',
    tuaPhone: '',
    title: '新增收货地址',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let lastPages = getCurrentPages()[getCurrentPages().length - 2];
    let queryUserOrder = lastPages.data.queryUserOrder;
    this.setData({
      address: queryUserOrder.detail,
      houseNum: queryUserOrder.houseNum,
      name: queryUserOrder.name,
      phone: queryUserOrder.phone,
      province: queryUserOrder.province,
      city: queryUserOrder.city,
      area: queryUserOrder.area,
      street: queryUserOrder.street,
      title: '编辑收货地址',
      latitude: queryUserOrder.lat,
      longitude: queryUserOrder.lon,
    })
    this.addressComponent = this.addressComponent ? this.addressComponent : {};
    this.fatPackId = options.saveId;
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



  houseNum: function (e) {
    this.setData({
      houseNum: e.detail.value
    })
  },

  tuaName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  tuaPhone: function (e) {
    let value = this.validateNumber(e.detail.value)
    this.setData({
      phone: value
    })
  },

  validateNumber(val) {
    return val.replace(/\D/g, '')
  },

  select() {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          address: res.name,
          latitude: res.latitude,
          longitude: res.longitude,
        })
        that.getLocation(res.latitude, res.longitude)
        that.detectUserAddress(res.latitude, res.longitude);
      },
      fail() {
        that.addressComponent = that.addressComponent ? that.addressComponent : {}
      }
    })
  },

  getLocation: function (latitude, longitude) {
    var that = this;
    location.toCity(latitude, longitude, function (data) {
      that.addressComponent = data.result.address_component;
    })
  },

  detectUserAddress(lat, lon) {
    requests.detectUserAddress({
      params: [{
        lat: lat,
        lon: lon,
      }]
    })
      .then(res => {
        let hpDistance = res.obj.hpDistance / 1000 > 0 ? res.obj.hpDistance / 1000 : 15;
        this.hpDistance = hpDistance;
        if (hpDistance > 10) {
          wx.showToast({
            title: '当前地址超出配送范围',
            icon: 'none',
          });
        }
      })
      .catch(error => {

      })
  },



  save: function () {
    var that = this;
    var patt = /^[ ]*$/;
    if (patt.test(that.data.address) || patt.test(that.data.houseNum) || patt.test(that.data.name) || that.data.phone.length != 11) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return
    }


    requests.changeFatOrderAddress({
      params: [{
        fatPackId: that.fatPackId,
        province: that.addressComponent.province ? that.addressComponent.province : that.data.province,
        city: that.addressComponent.city ? that.addressComponent.city : that.data.city,
        area: that.addressComponent.district ? that.addressComponent.district : that.data.area,
        street: that.addressComponent.street ? that.addressComponent.street : that.data.street,
        village: '0',
        road: '0',
        house_num: that.data.houseNum,
        detail: that.data.address,
        lat: that.data.latitude,
        lon: that.data.longitude,
        consignee: that.data.name,
        phone: that.data.phone,
      }]
    })
      .then(res => {
        if (res.errCode == '0') {
          let lastPages = getCurrentPages()[getCurrentPages().length - 2];
          lastPages.queryFatPackOrderInfo();
          wx.navigateBack({
            delta: 1
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });
        }
      })
      .catch(error => {

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
  onShareAppMessage: function (options) {

  }
})