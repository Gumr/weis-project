// pages/mineBox/agentDetail/agentDetail.js
let app = getApp();
import apiRequest from "../../../service/index";
import {
  getStorage, setStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    IMG_URL: app.globalData.IMG_URL,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    this.setData({
      id: options.id,
      from: options.from ? options.from : '',
      planType: getStorage('planType'),
      campPrincipalInfo: options.campPrincipalInfo ? JSON.parse(options.campPrincipalInfo) : null
    }, () => {
      this.init()
    })


    this.statusBarHeight()
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
    if (this.loadPage) {
      this.init()
    } else {
      this.loadPage = true;
    }
  },

  statusBarHeight: function () {
    this.setData({
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
      navStatusHeight: wx.getStorageSync('navStatusHeight'),
    })
  },

  init: function () {
    var that = this;
    if (that.data.campPrincipalInfo) {
      let campPrincipalInfo = that.data.campPrincipalInfo
      campPrincipalInfo.tpiCoachImageUrl = campPrincipalInfo.tpiCoachImageUrl ? JSON.parse(campPrincipalInfo.tpiCoachImageUrl) : []
      campPrincipalInfo.tpiQualificationImageUrl = campPrincipalInfo.tpiQualificationImageUrl ? JSON.parse(campPrincipalInfo.tpiQualificationImageUrl) : []
      this.setData({
        campPrincipalInfo: campPrincipalInfo
      })
      return
    }
    apiRequest.getCounselorApplicationInfo({
      id: that.data.id,
    })
      .then(res => {
        let counselorApplication = res.obj.counselorApplication;
        counselorApplication.wxQrcode = counselorApplication.wxQrcode ? JSON.parse(counselorApplication.wxQrcode)[0].imageUrl : ''
        counselorApplication.qualificationImageUrl = counselorApplication.qualificationImageUrl ? JSON.parse(counselorApplication.qualificationImageUrl) : [],
          counselorApplication.coachImageUrl = counselorApplication.coachImageUrl ? JSON.parse(counselorApplication.coachImageUrl) : [],
          that.setData({
            counselorApplication: counselorApplication
          })
      })
      .catch(error => {

      })
  },

  add: function () {
    var that = this;
    apiRequest.replaceCounselor({
      counselorId: that.data.counselorApplication.counselorId
    })
      .then(res => {
        if (res.obj && res.obj.replaceStt) {
          that.init()
          if (that.data.from == 'myagent') {
            wx.navigateBack({
              delta: 1
            });
          } else {
            wx.navigateBack({
              delta: 2
            });
          }
        }
      })
      .catch(error => {

      })
  },

  showCode: function () {
    this.setData({
      showCode: !this.data.showCode
    })
  },
  showBigImg(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    let imgs = []

    urls.map(v => {
      imgs.push(v.imageUrl)
    })
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    })
  },
  copyCode(e) {
    let code = e.currentTarget.dataset.code
    if (!code) {
      return
    }
    wx.setClipboardData({
      data: code,
      success: function (res) {
        // wx.getClipboardData({
        //   success: function (res) {
        wx.showToast({
          title: '复制成功'
        })
        //   }
        // })
      }
    })

  },
  call(e) {
    let number = e.currentTarget.dataset.number;
    if (!number) {
      return
    }
    wx.makePhoneCall({
      phoneNumber: number + '',
    }).catch((e) => {
      // console.log(e)  //用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })

  },
  change: function () {
    wx.navigateTo({
      url: '/pages/mineBox/agentList/agentList',
    });


    // var that = this;
    // apiRequest.unbindCounselor({
    //   params: [{
    //     counselorId: that.data.counselorApplication.counselorId
    //   }]
    // })
    //   .then(res => {
    //     if (res.obj && res.obj.unbindStt) {
    //       that.init()
    //       wx.navigateBack({
    //         delta: 1
    //       });
    //     }
    //   })
    //   .catch(error => {

    //   })
  },

  forbiden: function () {
    return
  },

  save: function (e) {
    let url = this.data.counselorApplication.wxQrcode;
    let that = this;
    //用户需要授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              // 同意授权
              that.saveImg(url);
            },
            fail: (res) => {
              that.setting(url)
            }
          })
        } else {
          // 已经授权了
          that.saveImg(url);
        }
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },

  // 拒绝授权打开设置
  setting: function (url) {
    var that = this;
    wx.getSetting({
      success: function (res) {
        var statu = res.authSetting;
        if (!statu['scope.writePhotosAlbum']) {
          wx.showModal({
            title: '保存图片需开启权限',
            content: '请确认授权，否则将无法保存图片',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#FE5E0F',
            success: function (tip) {
              if (tip.confirm) {
                wx.openSetting({
                  success: function (data) {
                    if (data.authSetting["scope.writePhotosAlbum"] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //授权成功之后，再调用保存相册
                      that.saveImg(url);
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
            }
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '调用授权窗口失败',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },

  saveImg(url) {
    let that = this;
    if (url.indexOf('http') > -1) {
      if (url.substring(0, 5) == 'http:') {
        url = url.replace('http', 'https')
      }
    }
    wx.getImageInfo({
      src: url,
      success: (res) => {
        let path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: (res) => {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              image: '',
              duration: 1500,
              mask: false,
              success: (result) => {
                that.setData({
                  showCode: !that.data.showCode
                })
              },
              fail: () => { },
              complete: () => { }
            });

          },
          fail: (res) => {
            wx.showToast({
              title: '保存失败',
              icon: 'none',
              image: '',
              duration: 1500,
              mask: false,
              success: (result) => {
                that.setData({
                  showCode: !that.data.showCode
                })
              },
              fail: () => { },
              complete: () => { }
            });
          }
        })
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 80) {
      this.setData({
        showBlack: true
      })
    } else {
      this.setData({
        showBlack: false
      })
    }
  },

  back: function () {
    wx.navigateBack({
      delta: 1
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
  onShareAppMessage: function () {

  }
})