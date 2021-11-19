// pages/addAddress/addAddress.js
var location = require('../../../libs/location');
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagList: [{
      name: '家',
      index: 1
    }, {
      name: '公司',
      index: 2
    }, {
      name: '医院',
      index: 3
    }, {
      name: '学校',
      index: 4
    }],
    tagIndex: '',
    address: '', //收货地址
    tuaHouseNum: '',
    tuaName: '',
    tuaPhone: '',
    addressComponent: {

    },
    default: 0,
    title: '新增收货地址',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      businessType: options.businessType ? options.businessType : '00',
      from: options.from || '',
      type: options.type || ''
    })
    if (options.type && options.type == 'edit') {
      let lastPages = getCurrentPages()[getCurrentPages().length - 2];
      let addressData = lastPages.data.addressList[options.index];
      this.setData({
        type: options.type,
        address: addressData.detail,
        tuaHouseNum: addressData.houseNum,
        tuaName: addressData.name,
        tuaPhone: addressData.phone,
        tagIndex: addressData.sortNum,
        province: addressData.province,
        city: addressData.city,
        area: addressData.area,
        street: addressData.street,
        title: '编辑收货地址',
        aid: addressData.id,
        latitude: addressData.lat,
        longitude: addressData.lon,
        default: addressData.tuaDef
      })
    } else if (options.type && options.type == 'groupEdit') { // 团餐修改地址信息
      let addressList = JSON.parse(options.groupCorp).corpAddress
      this.setData({
        type: options.type,
        address: addressList.tgcaAddress,
        tuaHouseNum: addressList.userCorpAddress ? addressList.userCorpAddress.tucaHouseNumber : '',
        tuaName: addressList.userCorpAddress ? addressList.userCorpAddress.tucaContacts : addressList.tgeName,
        tuaPhone: addressList.userCorpAddress ? addressList.userCorpAddress.tucaPhone : addressList.tgePhone,
        title: '编辑收货地址',
        addressList: JSON.parse(options.groupCorp)
      })
    } else {
      this.queryUserInfo()
    }
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

  change(e) {
    this.setData({
      default: e.detail.value ? 1 : 0,
    })
  },

  queryUserInfo: function () {
    apiRequest.queryUserInfo({

      })
      .then(res => {
        this.setData({
          tuaPhone: res.obj.phone
        })
      })
      .catch(error => {

      })
  },

  tag: function (e) {
    if (this.data.tagIndex === e.currentTarget.dataset.index) {
      this.setData({
        tagIndex: '',
      })
      return
    }
    this.setData({
      tagIndex: e.currentTarget.dataset.index,
    })
  },

  tuaHouseNum: function (e) {
    this.setData({
      tuaHouseNum: e.detail.value
    })
  },

  tuaName: function (e) {
    this.setData({
      tuaName: e.detail.value
    })
  },

  tuaPhone: function (e) {
    // var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    // if (e.detail.value.length == 11) {
    //   if (!myreg.test(e.detail.value)) {
    //     wx.showToast({
    //       title: '手机格式不正确',
    //       icon: 'none',
    //       image: '',
    //       duration: 1500,
    //       mask: false,
    //     });
    //     return
    //   }
    // }
    let value = this.validateNumber(e.detail.value)
    this.setData({
      tuaPhone: value
    })
  },

  validateNumber(val) {
    return val.replace(/\D/g, '')
  },

  select() {
    if (this.data.type && this.data.type == 'groupEdit') { // 团餐 不支持选地址
      return
    }
    this.checkUserSetting();
  },

  checkUserSetting() {
    const that = this;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '提示',
            content: '需要获取您的地理位置，请确认授权，否则部分功能将无法使用',
            showCancel: false,
            confirmColor: '#3CC51F',
            success: function (tip) {
              if (tip.confirm) {
                wx.openSetting({
                  complete: res => {
                    if (res.authSetting['scope.userLocation']) {
                      that.chooseLocation()
                    }
                  }
                })
              }
            }
          })
        } else {
          that.chooseLocation()
        }
      }
    })
  },

  chooseLocation() {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        if (that.data.businessType == '00') {
          that.matchHeatingPoint(res);
        } else {
          that.detectUserAddress(res);
        }
      }
    })
  },

  detectUserAddress(param) {
    var that = this;
    apiRequest.detectUserAddress({
        lat: param.latitude,
        lon: param.longitude,
      })
      .then(res => {
        if (res.obj && res.obj.hpDistance && res.obj.hpDistance / 1000 <= 12) {
          that.setData({
            address: param.name,
            latitude: param.latitude,
            longitude: param.longitude,
          })
          that.getLocation(param.latitude, param.longitude)
        } else {
          wx.showToast({
            title: '超出配送范围',
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

  matchHeatingPoint: function (data) {
    var that = this;
    apiRequest.matchHeatingPointForThree({
        lat: data.latitude,
        lon: data.longitude,
      })
      .then(res => {
        if (res.obj && res.obj.heatingPointId) {
          that.setData({
            address: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
          })
          that.getLocation(data.latitude, data.longitude)
        } else {
          if (that.data.from == 'submit') {
            const pages = getCurrentPages();
            const lastPage = pages.find(
              page => page.route === 'pages/packageOrder/submit/submit'
            );
            if (lastPage.data.spellOrder) {
              wx.showToast({
                title: '超出配送范围',
                icon: 'none',
                image: '',
                duration: 1500,
                mask: false,
              });
            } else {
              that.switch(data.latitude, data.longitude)
            }
            return
          }
          wx.showToast({
            title: '超出配送范围',
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

  getLocation: function (latitude, longitude) {
    var that = this;
    location.toCity(latitude, longitude, function (data) {
      that.setData({
        addressComponent: data.result.address_component
      })
    })
  },

  save: function () {
    var that = this;
    var patt = /^[ ]*$/;
    if (patt.test(that.data.address) || patt.test(that.data.tuaHouseNum) || patt.test(that.data.tuaName) || that.data.tuaPhone.length != 11) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return
    }

    // 编辑地址
    if (that.data.type == 'edit') {
      apiRequest.updateAddressInfoForThree({
          aid: that.data.aid,
          name: that.data.tuaName,
          phone: that.data.tuaPhone,
          province: that.data.addressComponent.province || that.data.province,
          city: that.data.addressComponent.city || that.data.city,
          area: that.data.addressComponent.district || that.data.area,
          street: that.data.addressComponent.street || that.data.street,
          village: '',
          road: '',
          houseNum: that.data.tuaHouseNum,
          sortNum: that.data.tagIndex !== '' ? that.data.tagIndex : '5',
          detail: that.data.address,
          dataStt: '00',
          lat: that.data.latitude,
          lon: that.data.longitude,
          businessType: that.data.businessType,
          tuaDef: that.data.default,
        })
        .then(res => {
          if (res.errCode == '0') {
            wx.navigateBack({

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
      return
    } else if (that.data.type == 'groupEdit') { // 团餐修改地址信息
      let userCorpAddress = {
        tucaId: this.data.addressList.corpAddress.userCorpAddress ? this.data.addressList.corpAddress.userCorpAddress.tucaId : null,
        tucaTgcId: this.data.addressList.tgcId,
        tucaTgcaId: this.data.addressList.corpAddress.tgcaId,
        tucaHouseNumber: that.data.tuaHouseNum,
        tucaContacts: that.data.tuaName,
        tucaPhone: that.data.tuaPhone,
        tucaUid: this.data.addressList.corpAddress.userCorpAddress ? this.data.addressList.corpAddress.userCorpAddress.tucaUid : null,
        tucaDataStt: this.data.addressList.corpAddress.userCorpAddress ? this.data.addressList.corpAddress.userCorpAddress.tucaDataStt : null,
        tucaCtime: this.data.addressList.corpAddress.userCorpAddress ? this.data.addressList.corpAddress.userCorpAddress.tucaCtime : null,
        tucaUtime: this.data.addressList.corpAddress.userCorpAddress ? this.data.addressList.corpAddress.userCorpAddress.tucaUtime : null,

      }
      apiRequest.userSaveUserCorpAddress({
        userCorpAddress: userCorpAddress
      }).then(res => {
        if (res.errCode == '0') {
          wx.navigateBack({});
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
      return
    }
    apiRequest.addAddressForThree({
        name: that.data.tuaName,
        phone: that.data.tuaPhone,
        province: that.data.addressComponent.province || that.data.province,
        city: that.data.addressComponent.city || that.data.city,
        area: that.data.addressComponent.district || that.data.area,
        street: that.data.addressComponent.street || that.data.street,
        village: '',
        road: '',
        houseNum: that.data.tuaHouseNum,
        sortNum: that.data.tagIndex !== '' ? that.data.tagIndex : '5',
        detail: that.data.address,
        lat: that.data.latitude,
        lon: that.data.longitude,
        businessType: '00',
        dataStt: '00',
        tuaDef: that.data.default,
      })
      .then(res => {
        if (res.errCode == '0') {
          wx.navigateBack({

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

  switch (latitude, longitude) {
    let that = this;
    let lat = latitude;
    let lon = longitude;
    //获取页面栈
    var pages = getCurrentPages();
    //上一个页面实例对象
    var prePage = pages[pages.length - 3];
    prePage.updateAddress({
        lat: lat,
        lon: lon
      },
      function (res, hpidAddress) {
        // 自取
        wx.showModal({
          title: '该地址超出配送范围',
          content: `距离您${hpidAddress.shipDistance / 1000}km最近的加热点${hpidAddress.hpName}可自取，是否自取?`,
          confirmText: '自取',
          confirmColor: '#FE5E0F',
          cancelText: '否',
          // showCancel: false,
          success: function (res) {
            if (res.confirm) {
              prePage.switchAddress({
                  lat: lat,
                  lon: lon
                },
                '1',
                function (res) {
                  wx.navigateBack({
                    delta: 2,
                  });
                }
              )
            }
          }
        })
      })
  },

  back() {
    this.setData({
      showBack: true
    })
  },

  sureBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  delete() {
    this.setData({
      showDelete: !this.data.showDelete
    })
  },

  sureDelete: function () {
    var that = this;
    apiRequest.updateAddressInfoForThree({
        aid: that.data.aid,
        dataStt: '99',
        lat: that.data.latitude,
        lon: that.data.longitude,
      })
      .then(res => {
        this.delete()
        if (res.errCode == '0') {
          wx.navigateBack({

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
    return {
      title: '维士健身饮食，健康美味！',
      path: '/pages/index/index',
      imageUrl: "https://prodstatic.weis1606.cn/api/mini/small_program_share.png",
      success: (res) => {

      },
      fail: (res) => {

      }
    }
  }
})