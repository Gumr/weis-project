// pages/mine/fans/fans.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    followList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.queryMyFollowList()
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
  queryMyFollowList() {
    let {followList} = this.data
    basicService.queryMyFollowList({
      pageNo: this.$pageNo,
      pageSize: 10
    }).then(res => {
      if(res.errCode === 0) {
        followList = followList.concat(res.obj.followList)
        this.setData({
          followList
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  updateFollow(e) {
    const {uid, status} = e.currentTarget.dataset
    basicService.updateFollow({
      followUid: uid,
      flag: 'follow'
    }).then(res => {
      const {result} = res.obj
      if(result) {
        // wx.showToast({
        //   title: status === 1 ? '成功关注' : '已取消关注',
        //   icon: 'none'
        // })
        this.$pageNo=1
        this.setData({
          followList: []
        })
        this.queryMyFollowList()
      }
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
    this.$pageNo++
    this.queryMyFollowList()
  }
})