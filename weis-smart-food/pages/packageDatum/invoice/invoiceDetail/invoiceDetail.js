// pages/packageDatum/invoice/invoiceDetail/invoiceDetail.js
import apiRequest from '../../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: {
      '00': '待开票',
      '10': '开票中',
      '20': '已开票',
      '99': '开票失败'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel.on) {
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('acceptDataFromOpenerPage', function (data) {
        that.setData({
          invoice: data.invoice
        })
      })
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

  send() {
    wx.showLoading({
      title: '请稍后',
      mask: true,
    });
    setTimeout(() => {
      let {
        invoice,
      } = this.data;
      apiRequest.sendInvoicePDF({
        tirId: invoice.tirId,
      }).then((res) => {
        if (res.errCode == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '已发送',
            icon: 'success',
          }); 
        }
      }).catch(() => {
        wx.hideLoading();
      })
    }, 200)
  },

  category(){
    let invoice = this.data.invoice;
    wx.navigateTo({
      url: '/pages/packageDatum/invoice/invoiceCategory/invoiceCategory',
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          invoice: invoice.recordDetails
        });
      },
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
  // onShareAppMessage: function () {

  // }
})