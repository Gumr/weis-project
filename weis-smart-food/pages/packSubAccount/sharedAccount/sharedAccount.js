// pages/packSubAccount/sharedAccount/sharedAccount.js
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
let app =  getApp();

  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: app.globalData.uid,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      subToken: options.subToken,
      tsuSubUid: options.tsuSubUid || '',
      tsuUid: options.tsuUid || '',
      tsuSubUname: options.tsuSubUname,
    })
    this.getUserShareListForSubUser();
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

  getUserShareListForSubUser(){
    let tsuSubUid = this.data.tsuSubUid;
    apiRequest.getUserShareListForSubUser({
      tsuSubUid: tsuSubUid
    }).then((res)=>{
      this.setData({
        ubShareInfoList: res.obj.ubShareInfoList
      })
    })
  },

  // 停止共享
  stopShare(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      index,
      showDialog: true
    })
  },

  confirmStop(){
    let {ubShareInfoList, index, uid} = this.data;
    apiRequest.bindShareForSubUser({
      tssId: ubShareInfoList[index].tssId,
      tsuSubUid: ubShareInfoList[index].tsuSubUid,
      tssUid: ubShareInfoList[index].tssUid,
      tsuShareUid: ubShareInfoList[index].tsuShareUid,
      tssStt: 20,
      tsuRemoveUid: uid,
    }).then((res)=>{
      this.setData({
        showDialog: false
      })
      if(res.obj.saveFlg){
        this.getUserShareListForSubUser()
      }else{
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });  
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    let {tsuSubUid,tsuUid, tsuSubUname, subToken} = this.data;
    return {
      title: '我想与你共享该账号数据',
      imageUrl: 'https://prodstatic.weis1606.cn/api/smartFood/share.png',
      path: `/pages/packSubAccount/shareOther/shareOther?subToken=${subToken}&tsuSubUid=${tsuSubUid}&tsuUid=${tsuUid}&tsuSubUname=${tsuSubUname}`,
    }
  }
})