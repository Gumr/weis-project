// pages/addAddress/addAddress.js
var location = require('../../../libs/location');
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '收货地址',
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/my/',
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
    addressComponent: {},
    address: '', // 收货地址
    tuaHouseNum: '', // 门牌号
    tuaName: '', // 联系人
    tuaPhone: '', // 手机号
    tagIndex: '', // 标签
    defaultAddr: 0, // 设置默认地址 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
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
        defaultAddr: addressData.tuaDef
      })
      this.isBtnSelect()
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
  // 点击选择收货地址-地图
  select() {
    this.checkUserSetting();
  },
  checkUserSetting() {
    const that = this;
    tt.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          tt.getLocation({
            success(res) {
              that.chooseLocation()
            },
            fail(res) {
              console.log(`getLocation 调用失败`);
              tt.showModal({
                title: '提示',
                content: '需要获取您的地理位置，请确认授权，否则部分功能将无法使用',
                showCancel: false,
                confirmColor: '#3CC51F',
                success: function (tip) {
                  if (tip.confirm) {
                    tt.openSetting({
                      complete: res => {
                        if (res.authSetting['scope.userLocation']) {
                          that.chooseLocation()
                        }
                      }
                    })
                  }
                }
              })
            }
          });
        } else {
          that.chooseLocation()
        }
      }
    })
  },
  chooseLocation() {
    var that = this;
    tt.chooseLocation({
      success: function (res) {
          that.setData({
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
          })
          that.getLocation(res.latitude, res.longitude)
          that.isBtnSelect()
      }
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
  // 门牌号
  tuaHouseNum: function (e) {
    this.setData({
      tuaHouseNum: e.detail.value
    })
    this.isBtnSelect()
  },
  // 联系人
  tuaName: function (e) {
    this.setData({
      tuaName: e.detail.value
    })
    this.isBtnSelect()
  },
  // 手机号
  tuaPhone: function (e) {
    let value = this.validateNumber(e.detail.value)
    this.setData({
      tuaPhone: value
    })
    this.isBtnSelect()
  },
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  // 标签
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
  // 设置默认地址
  change(e) {
    this.setData({
      defaultAddr: e.detail.value ? 1 : 0,
    })
  },
  isBtnSelect() {
    let {address, tuaHouseNum, tuaName, tuaPhone} = this.data;
    this.setData({
      btnSelect: address && tuaHouseNum && tuaName && tuaPhone.length == 11
    })
  },
  // 新增/编辑-地址
  save: function () {
    let { btnSelect, type, aid, tuaName, tuaPhone, addressComponent, province, city, area, street, tuaHouseNum, tagIndex, address, latitude, longitude, defaultAddr } = this.data;
    if (!btnSelect) {
      tt.showToast({
        title: '请完善信息',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
      return
    }
    let params = {
      name: tuaName,
      phone: tuaPhone,
      province: addressComponent.province || province,
      city: addressComponent.city || city,
      area: addressComponent.district || area,
      street: addressComponent.street || street,
      village: '',
      road: '',
      houseNum: tuaHouseNum,
      sortNum: tagIndex !== '' ? tagIndex : '5',
      detail: address,
      dataStt: '00',
      lat: latitude,
      lon: longitude,
      tuaDef: defaultAddr,
    }
    // 编辑地址
    if (type == 'edit') {
      apiRequest.updateAddressInfoForThree({...params, aid})
        .then(res => {
          if (res.errCode == '0') {
            wx.navigateBack({
              detail: 1
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
    }
    apiRequest.addAddressForThree(params)
      .then(res => {
        if (res.errCode == '0') {
          wx.navigateBack({
            detail: 1
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
  // 返回
  back() {
    let that = this;
    tt.showModal({
      title: "",
      content: "确定退出编辑吗？",
      success(res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          });
        }
      },
      fail(res) {
        console.log(`showModal调用失败`);
      },
    });
  },
  // 删除
  delete() {
    let that = this;
    tt.showModal({
      title: "",
      content: "确定删除该地址吗？",
      success(res) {
        if (res.confirm) {
          that.sureDelete()
        }
      },
      fail(res) {
        console.log(`showModal调用失败`);
      },
    });
  },

  sureDelete: function () {
    var that = this;
    let {aid, latitude, longitude} = this.data;
    apiRequest.updateAddressInfoForThree({
        aid,
        dataStt: '99',
        lat: latitude,
        lon: longitude,
      })
      .then(res => {
        if (res.errCode == '0') {
          wx.navigateBack({
            detail: 1
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