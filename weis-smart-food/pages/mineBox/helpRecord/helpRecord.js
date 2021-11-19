// pages/mineBox/helpRecord/helpRecord.js
import day from '../../../libs/day'
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    queryCapitalFlows: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryUserReplacePayLog()
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

  queryUserReplacePayLog(){
    apiRequest.queryUserReplacePayLog({

    }).then((res)=>{
      let cardPurchaseRecords = res.obj.cardPurchaseRecords || [];
      cardPurchaseRecords.forEach((item)=>{
        item.utime = day(item.utime).format('YYYY/MM/DD HH:mm');
        item.total = (item.cardPrice + item.payDonation).toFixed(2)
      })
      this.setData({
        cardPurchaseRecords,
      })
    })
  },

  tapDetail(e){
    wx.navigateTo({
      url: `/pages/mineBox/helpRecordDetail/helpRecordDetail?index=${e.currentTarget.dataset.index}`,
    });
      
  },

  back(){
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
    
  }
})