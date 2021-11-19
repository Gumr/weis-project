// pages/packSubAccount/inviteNew/inviteNew.js
import {loginPromise,} from '../../../utils/common'
import apiRequest from '../../../service/index'
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then((res)=>{
      this.setData({
        uid: res.uid
      })
    })
    wx.hideShareMenu({});
    this.listNewInviteUser();
  },

  listNewInviteUser(){
    apiRequest.listNewInviteUser({

    }).then((res)=>{
      let info = res.obj;
      info.list.forEach((item)=>{
        item.registerTime = day(item.registerTime).format('YYYY.MM.DD')
      })
      this.setData({
        info,
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
  onShareAppMessage: function (e) {
    let {uid} = this.data;
    if(e.from == "button" && e.target.dataset.type == 'order'){
      return {
        title: '维士小盒饭既美味又营养，快用优惠券点一餐试试吧',
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/invite-eat.png',
        path: `/pages/index/index?invite=${uid}&scene=10440`,
      }
    }else{
      return {
        title: '健康更美味的维士数字餐，快来体验吧，80元红包等你拿～',
        imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/inviteNew/share.png?a=1',
        path: `/pages/index/index?invite=${uid}&scene=10440`,
      }
    }
  }
})