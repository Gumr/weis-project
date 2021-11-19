// pages/mine/fans/fans.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fansList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$pageNo = 1
    this.queryMyFansList()
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
  queryMyFansList() {
    let {fansList} = this.data
    basicService.queryMyFansList({
      pageNo: this.$pageNo,
      pageSize: 10
    }).then(res => {
      if(res.errCode === 0) {
        fansList = fansList.concat(res.obj.fansList)
        this.setData({
          fansList
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
      followUid: uid
    }).then(res => {
      const {result} = res.obj
      if(result) {
        // wx.showToast({
        //   title: status === 1 ? '成功关注' : '已取消关注',
        //   icon: 'none'
        // })
        this.$pageNo=1
        this.setData({
          fansList: []
        })
        this.queryMyFansList()
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
    this.queryMyFansList()
  }
})