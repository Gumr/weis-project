// pages/packSubAccount/buyRecord/buyRecord.js
import apiRequest from '../../../../service/index';
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
    this.queryPurchaseVipRecordList()
  },
  queryUserInfo: function () {
    return new Promise((resolve, reject) => {
      apiRequest.queryUserInfo()
        .then(res => {
          resolve(res)
        })
        .catch(error => {

        })
    })
  },
  async queryPurchaseVipRecordList() {
    let res = await this.queryUserInfo()
    apiRequest.queryPurchaseVipRecordList({
      uid: res.obj.userInfo.uid,
      pageSize: 9999,
      pageNo: 1,
    })
      .then(res => {
        let { vipPurchaseRecordList } = res.obj;
        this.setData({
          record: vipPurchaseRecordList,
        })
        
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
  onShareAppMessage: function () {

  }
})