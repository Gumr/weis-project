
import requests from '../../../service/index'
// pages/mineBox/myRank/myRank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('data', (data) => {
      data.$typeLabel = {
        '01': '管住嘴',
        '02': '迈开腿',
        '03': '热情参与',
        '04': '减脂效果'
      }[data.type]
      this.setData(data)

      requests.queryUserGroupCorpScoreDetail({
        scoreType: data.type,
        tclwrClwgId: data.groupId,
        range: '02',
        tclwrClwId: data.id
      }).then((res) => {
        if (res.errCode === 0) {

          function setValue(item) {
            item.rankScore = (data.type === '02' ? Number(item.rankScore) * 2 : Number(item.rankScore))
            item.$value = item.rankScore + (data.type === '02' ? '斤' : '分')
            item.isLeader = item.uid === res.obj.groupUid
            // item.uname = `${item.uname}(${item.tclwrStep || 0}人)`
            if (data.type === '02') {
              item.rankPart = `${item.rankPart}%`
            }
            return item;
          }
          this.setData({
            counselorApplication: res.obj.counselorApplication,
            todayValue: data.type === '02' ? res.obj.intakeScoreRepose.rankScore : res.obj.intakeScoreReposeList.rankScore,
            rankList: data.type === '02' ? res.obj.intakeScoreRepose.map(setValue) : res.obj.intakeScoreReposeList.map(setValue),
            myTeam: setValue(res.obj.intakeScoreReposeUid)
          })
        }
      })
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

  },
  counselorTap() {
    wx.navigateTo({
      url: `/pages/mineBox/agentDetail/agentDetail?id=${this.data.counselorApplication.id}`
    })
  }
})