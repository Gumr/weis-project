// pages/mineBox/nickName/nickName.js
import apiRequest from '../../../service/index';
import { getStorage, setStorage } from '../../../utils/storage';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      nickName: options.nickName,
      subToken: options.subToken || '',
      tsuSubUid: options.tsuSubUid || '',
      subInfo: getStorage("subInfo") || {},
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
  // 输入框改变
  changeNick: function (e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  // 保存
  save: function () {
    var patt = /^[ ]*$/;
    if (!patt.test(this.data.nickName)) {
      var that = this;
      apiRequest.updateUserUnameAndHeadImgUrl({
        uname: that.data.nickName,
        subToken: this.data.subToken
      })
      .then(res => {
        wx.navigateBack({
          delta: 1
        });
        // 更新storage 子账户名字
        this.updateName(that.data.nickName);
      })
      .catch(error => {

      })
    } else {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },
  // 删除
  cancel: function () {
    this.setData({
      nickName: ''
    })
  },

  updateName(uname){
    let {subInfo, tsuSubUid} = this.data;
    console.log(subInfo.tsuSubUid)
    console.log(tsuSubUid)
    if(subInfo.tsuSubUid && subInfo.tsuSubUid == tsuSubUid){
      subInfo.tsuSubUname = uname;
      setStorage("subInfo", subInfo)
    }
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
  onShareAppMessage: function (options) {
    // return {
    //   title: '维士健身饮食，健康美味！',
    //   path: '/pages/index/index',
    //   imageUrl: "https://prodstatic.weis1606.cn/api/mini/small_program_share.png",
    //   success: (res) => {

    //   },
    //   fail: (res) => {

    //   }
    // }
  }
})