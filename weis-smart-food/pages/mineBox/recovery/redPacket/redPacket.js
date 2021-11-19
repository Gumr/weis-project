// pages/packageDiscover/signIn/signIn.js
import {
  getStorage,
} from '../../../../utils/storage'
import apiRequest from '../../../../service/index';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/signin/',
    isOpen: false, // 红包是否已打开
    navStatusHeight: getStorage('navStatusHeight'),
    px2rpx: app.globalData.px2rpx,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this._animation = animation
    this.setData({
      status: options.status || false, //true 成功 false 失败
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.unClickBtnAm()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  // 回收-确认回收某一餐单的餐盒
  recyclingRedBag() {
    apiRequest.recyclingRedBag()
      .then((res) => {
        // isGet 是否获得红包 (true是)
        // recordId 红包的唯一主键
        let { isGet, recordId, redPacket } = res.obj;
        if(isGet || recordId > 0) {
          this.setData({
            amount: redPacket[0].amount
          })
        }
      })
  },
  // 开红包
  signinFn() {
    const {todayIsSign} = this.data;
    this.setData({
      todayIsSign: !todayIsSign
    })
    this.recyclingRedBag()
  },
  // 开启红包按钮点击动画
  openBtnAm() {
    clearInterval(this._timer)
    this._animation.rotateY(180).step()
    this._animation.rotateY(0).step()
    this.setData({
      amData: this._animation.export(),
    }, () => {
      setTimeout(() => {
        this.setData({
          isOpen: true
        })
      }, 1500)
    })
  },
  // 开启红包按钮未点击动画
  unClickBtnAm() {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
    })
    this._timer = setInterval(function() {
      animation.scale(1.2, 1.2).step()
      animation.scale(1, 1).step()
      this.setData({
        amData: animation.export()
      })
    }.bind(this), 800)
  },
  toRedPage() {
    wx.navigateTo({
      url: '/pages/mineBox/coupon-valid/coupon-valid?from=redPacket'
    })
  },
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  reset() {
    wx.navigateTo({
      url: '/pages/mineBox/recovery/menuList/menuList',
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