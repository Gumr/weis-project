// pages/mineBox/groupFat/index.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 企业减脂营----
    fatList: []
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
    this.queryCampanyActivityList()
  },
  queryCampanyActivityList() {
    apiRequest.queryCampanyActivityList()
      .then(res => {
        if (res.errCode === 0) {
          this.setData({
            fatList: res.obj.activityList.map(item => {
              item.startDate = day(String(item.tclwStartDate)).format('YYYY/MM/DD')
              item.endDate = day(String(item.tclwEndDate)).format('YYYY/MM/DD')

              item.$status = {
                '00': '已加入',
                '01': '报名中',
                '02': '准备开营',
                '03': '进行中',
                '04': '已结束'
              }[item.stt]
              return item
            })
          })
        }
      })
  },
  // 减脂营详情
  fatDetail({ currentTarget }) {
    const item = this.data.fatList[currentTarget.dataset.index]
    const status = Number(item.stt)
    if (status < 3) {
      wx.navigateTo({
        url: `/pages/mineBox/fatDetail/fatDetail?id=${item.tclwId}`
      })
    } else {
      wx.navigateTo({
        url: `/pages/mineBox/fatRank/fatRank?id=${item.tclwId}&status=${item.$status}`
      })
    }
  },
  // 我也要申请企业减脂营
  // goApplyFat() {
  //   wx.navigateTo({
  //     url: `/pages/mineBox/applyFat/applyFat`
  //   })
  // },
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