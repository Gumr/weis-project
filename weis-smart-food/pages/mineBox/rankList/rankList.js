// pages/mineBox/rankList/rankList.js
const app = getApp();
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // // 调试数据
    // rankRecordList: [
    //   {
    //     headImgUrl: 'https://ss0.baidu.com/7Po3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/9c16fdfaaf51f3de9ba8ee1194eef01f3a2979a8.jpg',
    //     uname: '111',
    //     scoreRecord: 100
    //   },
    //   {
    //     headImgUrl: 'https://wx.qlogo.cn/mmopen/vi_32/yAtsOR1mQF6Yf6mmdVTUHicMaexkaQAkibxSFPiapAVe2Xfuv8vaWEoSDrVelia4wVwEvGQ37uzFOVfeM5nziavFrmA/132',
    //     uname: '22',
    //     scoreRecord: 30
    //   }
    // ],
    // rankRecord: {
    //   rank: '20',
    //   headImgUrl: 'https://ss0.baidu.com/7Po3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/9c16fdfaaf51f3de9ba8ee1194eef01f3a2979a8.jpg',
    //   uname: '我自己',
    //   scoreRecord: 100
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const index = options.name.indexOf('第')
    const lastIndex = options.name.lastIndexOf('期')
    this.setData({
      campid: options.campid,
      name: options.name.substring(index, lastIndex+1),
      stt: options.stt
    }, () => {
      this.queryUsersRankList()
    })
    
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
  queryUsersRankList() {
    apiRequest.queryUsersRankList({
      tacid:  this.data.campid
    }).then((res) => {
      this.setData({
        rankRecordList: res.obj.rankRecordList,
        rankRecord: res.obj.rankRecord[0]
      })
    }).catch((error) => {

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