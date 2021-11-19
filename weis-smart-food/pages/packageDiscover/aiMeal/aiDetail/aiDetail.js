
import requests from '../../../../service/index';
import day from '../../../../libs/day';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showDialog: false,
    activityDateList: [], // 其他套餐存在的日期
    qrcode: 'https://prodstatic.weis1606.cn/api/activity/10day_qr_1.png',
    imagePrefix: 'https://prodstatic.weis1606.cn/api/activity/',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.existActivityPlan();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      isIpx: getApp().globalData.isIpx,
    });
    this.queryCompWechatQrcode();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

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
  onShareAppMessage: function () { },
  existActivityPlan() {
    requests
      .existActivityPlan()
      .then((res) => {
        if (res.errCode === 0) {
          const today = day().startOf('day');
          this.setData({
            activityDateList: res.obj.activityDateList.filter((i) => day(i) >= today),
          });
        }
      });
  },
  previewQRCodeTap(evt) {
    wx.previewImage({
      current: '',
      urls: [evt.currentTarget.dataset.src],
      success: (result) => { },
      fail: () => { },
      complete: () => { },
    });
  },
  queryCompWechatQrcode() {
    var that = this;
    requests
      .queryCompWechatQrcode({
        packType: '02'
      })
      .then((res) => {
        that.setData({
          qrcode: res.obj.queryCompWechat.qrcodeImg,
        });
      })
  },
  handleDialogConfirm() {
    this.setData({
      showDialog: false,
    });
  },
  btnTap() {
    if (this.data.activityDateList.length > 0) {
      this.setData({
        showDialog: true,
      });
    } else {
      wx.navigateTo({
        url: `/pages/mineBox/submitBody/submitBody?url=${encodeURIComponent('/pages/packageDiscover/aiMeal/aiMealWeight/aiMealWeight')}`
      })
    }
  },
});
