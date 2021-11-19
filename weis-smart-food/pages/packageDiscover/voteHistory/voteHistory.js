// pages/packageDiscover/voteHistory/voteHistory.js
import {getStorage} from '../../../utils/storage'
import apiRequest from '../../../service/index'
import day from '../../../libs/day'
import {Arabia_To_SimplifiedChinese} from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage('navStatusHeight'),
    pageNo: 1,
    pageSize: 10,
    voteInfo: [],
    voteSkuList: {},
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVoteList()
  },
  getVoteList() {
    const {pageNo, pageSize, historyFlag} = this.data
    apiRequest.queryVoteActivity({
      historyFlag: true,
      pageNo,
      pageSize
    }).then(res => {
      if(res.errCode == 0) {
        const {voteInfo, voteSkuMap} = res.obj
        if(!voteInfo || voteInfo.length == 0) {
          if(pageNo > 1) {
            this.data.pageNo--
          }
          return
        }
        voteInfo.forEach(item => {
          const recoverImg = voteSkuMap[item.id][0].skuImgBeanList[0]
          item.beginTime = day(String(item.beginTime)).format('YYYY/MM/DD')
          item.endTime = day(String(item.endTime)).format('YYYY/MM/DD')
          item.recoverImg = recoverImg ? recoverImg.imgUrl : ''
        })
        this.setData({
          voteInfo: this.data.voteInfo.concat(voteInfo),
          voteSkuList: Object.assign(this.data.voteSkuList, voteSkuMap)
        })
      }
    })
  },
  getMoreFn() {
    this.data.pageNo++
    this.getVoteList()
  },
  goEachVoteFn(e) {
    const {index} = e.currentTarget.dataset
    // const {voteInfo, voteSkuList} = this.data
    wx.navigateTo({
      url: `/pages/packageDiscover/dishesVote/dishesVote?term=${index}&from=ht`
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