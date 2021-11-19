// pages/packageOrder/spellSucc/spellSucc.js
import apiRequest from '../../../service/index';
import {
  categoryMap
} from '../../../utils/map'
const app = getApp()
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
    px2rpx: app.globalData.px2rpx,
    statusHeight: wx.getStorageSync('navStatusHeight'), //状态栏高度,
    screenHeight: wx.getSystemInfoSync().screenHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      spellOrder: options.spellOrder || '',
      spellGroup: options.spellGroup || '',
      price: options.price,
      playNunmber: options.playNunmber,
      shareprice: options.shareprice,
      corpId: options.corpId || '',
      tgcaId: options.tgcaId || '',
      // spellOrder: options.spellOrder,
      mergeCode: options.mergeCode,
      mode: options.mode || '',
      unShare: options.unShare || '',//不能分享返现
    })
    this.queryMergeTeamDetail()
  },

  queryMergeTeamDetail(){
    apiRequest.queryMergeTeamDetail({
      shipOid: this.data.mergeCode
    }).then((res) => {
      let spellInfo = res.obj;
      spellInfo.mergeTeamInfo.dietOrderMergeDetails = spellInfo.mergeTeamInfo.dietOrderMergeDetails.filter((item) => {
        return item.stt == '10'
      })
      this.setData({
        spellInfo,
      })
    })
  
  },

  goSucc(){
    let {price,playNunmber,shareprice,corpId,tgcaId,mergeCode,mode} = this.data;
    wx.redirectTo({
      url: `/pages/packageOrder/payStatus/payStatus?status=true&price=${price}&playNunmber=${playNunmber}&shareprice=${shareprice}&corpId=${corpId}&tgcaId=${tgcaId}&mergeCode=${mergeCode}&mode=${mode}`,
    });
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
  onShareAppMessage: function (e) {
    // let { type } = e.target.dataset || '';
    let mergeCode = this.data.mergeCode;
    let spellInfo = this.data.spellInfo;
    let categoryMap = this.data.categoryMap;
    let tgcaId = this.data.tgcaId;
    let corpId = this.data.corpId;
    if(this.data.spellOrder) {
      return {
        title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，一起拼单免配送费，快上车吧！`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/shareImg.png',
        path: `/pages/mineBox/order/index?spellOrder=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
      }
    }
    if(this.data.spellGroup) {
      return {
        title: `我正在拼${day(spellInfo.waybillRecord.expectDate).format('MM月DD日')}${categoryMap[spellInfo.category]}，越多人拼单返现越多，签收后立即返现到余额，快上车吧！`,
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/spellGroup_shareImg.png',
        path: `/pages/mineBox/order/index?spellGroup=true&mergeCode=${mergeCode}&date=${day(spellInfo.waybillRecord.expectDate).format('YYYY/MM/DD')}&category=${spellInfo.category}&tgcaId=${tgcaId || ''}&corpId=${corpId || ''}`,
      }
    }
  }
})