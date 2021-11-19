// pages/mineAddress/mineAddress.js
import apiRequest from '../../../service/index';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activityId: null,
    freightPrice: 0,
    showRefundFreightDialog: false,
    showPayFreightDialog: false,
    showTipDialog: false,
    title: '地址管理',
    addressId: '', // 上一个页面选择得addressId
    sortStatus: {
      '1': {
        name: '家',
        class: 'home'
      },
      '2': {
        name: '公司',
        class: 'company'
      },
      '3': {
        name: '医院',
        class: 'hospital'
      },
      '4': {
        name: '学校',
        class: 'school'
      },
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.eventChannel = this.getOpenerEventChannel();
    this.setData({
      addressId: options.adrId,
      activityId: options.activityId,
      type: options.type ? options.type : '',
      businessType: options.businessType ? options.businessType : '00', // '00' 5公里 '01' 10公里
    });
    if (options.type != 'my') {
      this.setData({
        title: '选择收货地址',
      });
    }
  },
  handleTipConfim() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //说明有上一页存在
      var prePage = pages[pages.length - 2];
      prePage
        .switchShipOrderAddress(this.data.addressList[this.dataIndex].id, true)
        .then((res) => {
          if (res.errCode === 0) {
            wx.navigateBack({
              delta: 1,
            });
            this.setData({
              showTipDialog: false,
            });
          }
        });
    }
  },
  handleTipCancel() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //说明有上一页存在
      var prePage = pages[pages.length - 2];
      prePage
        .switchShipOrderAddress(this.data.addressList[this.dataIndex].id)
        .then((res) => {
          if (res.errCode === 0) {
            wx.navigateBack({
              delta: 1,
            });
            this.setData({
              showTipDialog: false,
            });
          }
        });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddress();
  },

  add: function () {
    wx.navigateTo({
      url: `/pages/packageOrder/addAddress/addAddress?businessType=${this.data.businessType}&from=${this.data.type}`,
    });
  },

  getAddress: function () {
    var that = this;
    apiRequest.queryAddressListForThree({
      sortNum: '',
      dataStt: '',
      businessType: that.data.businessType,
    })
      .then((res) => {
        if (that.data.businessType == '01') {
          that.setData({
            addressList: res.obj.isExisList,
          });
        } else {
          that.setData({
            addressList: res.obj.addressInfos,
          });
        }
      })
      .catch((error) => { });
  },

  select: function (e) {
    //获取页面栈
    var pages = getCurrentPages();
    let index = e.currentTarget.dataset.index;
    let that = this;
    if (pages.length > 1) {
      //说明有上一页存在
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      switch (this.data.type) {
        case 'submit':
          prePage.updateAddress(
            this.data.addressList[index],
            function (res, hpidAddress) {
              if (res == '1') {
                wx.showModal({
                  title: '提示',
                  content: `超出热食配送范围将以冷链配送。送达后需自行加热`,
                  confirmText: '知道了',
                  confirmColor: '#FE5E0F',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      prePage.switchAddress(
                        that.data.addressList[index], '',
                        function (res) {
                          wx.navigateBack({
                            delta: 1,
                          });
                        }
                      )
                    }
                  }
                })

              } else if (res == '2') {
                // 配送改自取
                wx.showModal({
                  title: '提示',
                  content: `距离当前地址${hpidAddress.shipDistance / 1000}km的加热点${hpidAddress.hpName}仅自取，是否自取?`,
                  confirmText: '自取',
                  confirmColor: '#FE5E0F',
                  cancelText: '否',
                  // showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      prePage.switchAddress(
                        that.data.addressList[index],
                        '1',
                        function (res) {
                          wx.navigateBack({
                            delta: 1,
                          });
                        }
                      )
                    }
                  }
                })
              } else {
                prePage.switchAddress(
                  that.data.addressList[index], '',
                  function (res) {
                    wx.navigateBack({
                      delta: 1,
                    });
                  }
                )
              }
            }
          );
          break;
        case 'updateOrder':
          this._addressId = this.data.addressList[
            e.currentTarget.dataset.index
          ].id;

          if (this.data.activityId > 0) {
            // 判断是套餐 直接修改
            prePage.switchShipOrderAddress(this._addressId).then(() => {
              wx.navigateBack({
                delta: 1,
              });
            });
          } else {
            prePage.checkChangeAddress(this._addressId).then((res) => {
              if (res.errCode === 0) {
                switch (res.obj.operationType) {
                  case '01': // 01:退钱
                    this.setData({
                      showRefundFreightDialog: true,
                    });
                    break;
                  case '02': // 02:补钱
                    this.setData({
                      freightPrice: res.obj.changeFee,
                      showPayFreightDialog: true,
                    });
                    break;
                  case '03': // 03:不退不补
                    prePage.switchShipOrderAddress(this._addressId).then(() => {
                      wx.navigateBack({
                        delta: 1,
                      });
                    });
                    break;
                }
              }
            });
          }

          break;
        case 'orderDetailDistribution':
          prePage
            .changeShipOrderDelivery(
              this.data.addressList[e.currentTarget.dataset.index].id
            )
            .then((res) => {
              if (res.errCode === 0) {
                wx.navigateBack({
                  delta: 1,
                });
              } else {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                });

              }
            });
          break;
        case 'tenMeal':
          prePage.updateAddress(
            this.data.addressList[e.currentTarget.dataset.index].id
          );
          wx.navigateBack({
            delta: 1,
          });
          break;
        case 'sevenMeal':
          prePage
            .setAddress(this.data.addressList[e.currentTarget.dataset.index])
            .then((res) => {
              console.log(res)
              if(res && res == 'pause'){
                return
              }
              wx.navigateBack({
                delta: 1,
              });
            });

          break;
        case 'aiMeal':
          prePage
            .updateAddress(
              this.data.addressList[e.currentTarget.dataset.index].id
            )
            .then((res) => {
              if (res.errCode === 1009) {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.emit('beyond-address');
              }
              wx.navigateBack({
                delta: 1,
              });
            });

          break;
      }
    }
  },

  handleRefundFreightConfirm() {
    // 退运费弹窗处理函数
    // 确定更换地址退钱
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    prePage.switchShipOrderAddress(this._addressId).then((res) => {
      if (res.errCode === 0) {
        // 退运费不需要支付 直接调接口退款就行了 把新的orderid 放进orderDetail页面
        prePage.setOrderId(res.obj.newShipOid);
      }
      wx.showToast({
        title: '已退款',
        icon: 'success',
      });
      wx.navigateBack({
        delta: 1,
      });
    });
  },

  async handlePayConfirm(e) {
    // 支付弹窗处理函数
    // 支付弹窗确认时间
    const {
      detail
    } = e;
    const changeRes = await this.createChangeOrderPay({
      ocId: this._changeOrderNo,
      payType: detail.type,
      payChannel: 'mina',
    });

    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    if (changeRes.errCode === 0) {
      if (detail.type === 'wechat') {
        try {
          await detail.wxPay(changeRes.obj);
        } catch (e) {
          detail.done();
          return;
        }
      }
      detail.done();
      // 支付成功了 设置orderId
      prePage.setOrderId(this._newShipOid);
      wx.navigateBack({
        delta: 1,
      });
    }
  },
  handlePayFreightDialogConfirm() {
    this.setData({
      showPayFreightDialog: false
    })
    // 补运费弹窗处理函数
    // 确定更换地址补差价
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    prePage
      .switchShipOrderAddress(this._addressId) // 调用更新地址接口 拿到补差价订单的id
      .then((res) => {
        if (res.errCode === 0) {
          this._changeOrderNo = res.obj.changeOrderNo;
          this._newShipOid = res.obj.newShipOid; // 补运费还需要支付确认 先保存一下新的orderId 调起支付弹窗
          this.selectComponent('#pay').pay(this.data.freightPrice); // 显示支付弹窗
        }
      });
  },
  createChangeOrderPay(params) {
    return apiRequest.createChangeOrderPay(params);
  },
  matchHeatingPoint: function (lat, lon, prePage, e) {
    var that = this;
    apiRequest
      .matchHeatingPointForThree({
        lat: lat,
        lon: lon,
      })
      .then((res) => {
        if (res.obj && res.obj.heatingPointId) {
          if (res.obj.selfTaking == '2') {
            wx.showToast({
              title: '该地址不支持配送',
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
            });

            return;
          }
          // 预定购物车
          prePage.setData({
            jumpSelf: false,
            deliveryAddress: that.data.addressList[e.currentTarget.dataset.index],
          },
            () => {
              wx.navigateBack({
                delta: 1,
              });
            }
          );
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
      .catch((error) => { });
  },

  // 编辑
  edit: function (e) {
    wx.navigateTo({
      url: `/pages/packageOrder/addAddress/addAddress?index=${e.currentTarget.dataset.index}&type=edit&businessType=${this.data.businessType}&from=${this.data.type}`,
    });
  },

  // 删除
  delItem: function (e) {
    let index = e.currentTarget.dataset.index;
    var that = this;
    apiRequest
      .updateAddressInfoForThree({
        aid: that.data.addressList[index].id,
        dataStt: '99',
        lat: that.data.addressList[index].lat,
        lon: that.data.addressList[index].lon,
      })
      .then((res) => {
        if (res.errCode == '0') {
          // 告诉上一个页面 选择的地址被删除了 让处理函数执行

          if (this.data.type == 'sevenMeal') {
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 2];
            prePage.emptyAddress()
          }

          if (this.data.addressId == that.data.addressList[index].id) this.eventChannel.emit('delete')
          that.getAddress();
        }
      })
      .catch((error) => { });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    return {
      title: '维士健身饮食，健康美味！',
      path: '/pages/index/index',
      imageUrl: 'https://prodstatic.weis1606.cn/api/mini/small_program_share.png',
      success: (res) => { },
      fail: (res) => { },
    };
  },
});