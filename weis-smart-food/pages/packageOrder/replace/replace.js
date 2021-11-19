// pages/orderFood/replace/replace.js
import apiRequest from "../../../service/index";
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [{ name: '未支付', stt: 0, }, { name: '代点记录', stt: 1 }],
    selectIndex: 0,
    status: {
      '01': '待付款',
      '04': '已失效',
      '14': '已完成'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 计算滚动高度
    this.scrollHeight();
    // 查询用户
    this.queryUser();
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
    if (this.init) {
      this.queryList();
    } else {
      this.init = true;
    }
  },

  scrollHeight: function () {
    // 减去状态栏高度 减去上部高度
    let navStatusHeight = wx.getStorageSync('navStatusHeight')
    let mobileInfo = wx.getSystemInfoSync();
    let ratio = 750 / mobileInfo.windowWidth;
    let tabHeight = 88 / ratio;
    let scrollHeight = mobileInfo.windowHeight - navStatusHeight - tabHeight;
    this.setData({
      scrollHeight
    })
  },

  select: function (e) {
    let { index } = e.currentTarget.dataset;
    let { selectIndex, replaceRelations } = this.data;

    if (index == selectIndex) {
      return
    }

    let list = replaceRelations.filter((item) => {
      return index == 0 ? item.dataStt == '01' : item.dataStt != '01';
    });

    this.setData({
      selectIndex: index,
      list
    })
  },

  queryUser() {
    var that = this;
    apiRequest.queryUserInfo({
    })
      .then(res => {
        that.info = res.obj
        that.queryManager();
      })
      .catch(error => {

      })
  },

  queryManager: function () {
    var that = this;
    apiRequest.queryCurrUserCounselor({
    })
      .then(res => {
        if (res.obj && res.obj.counselorInfo) {
          that.counselorInfo = res.obj.counselorInfo;
          that.queryList()
        }
      })
      .catch(error => {

      })
  },

  queryList: function () {
    var that = this;
    apiRequest.queryReplaceRelation({
      targetUid: that.info.userInfo.uid,
      counselorId: that.counselorInfo.counselorId,
      dataStt: 'all'
    })
      .then(res => {
        let replaceRelations = res.obj.replaceRelations;
        replaceRelations.forEach((item, index) => {
          item.sdate = util.dateUtil.dateSwitch(item.sdate);
          item.edate = util.dateUtil.dateSwitch(item.edate);
          item.losedate = util.dateUtil.format(new Date(new Date(item.sdate).getTime() - 24 * 60 * 60 * 1000), 'Y/M/D')
        })
        let list = replaceRelations.filter((item) => {
          return that.data.selectIndex == 0 ? item.dataStt == '01' : item.dataStt != '01';
        });
        this.setData({
          replaceRelations,
          list
        })
      })
      .catch(error => {

      })
  },

  detail: function (e) {
    let { id } = e.currentTarget.dataset;
    let targetUid = this.info.userInfo.uid;
    let counselorId = this.counselorInfo.counselorId;
    wx.navigateTo({
      url: `/pages/packageOrder/replaceDetail/replaceDetail?id=${id}&targetUid=${targetUid}&counselorId=${counselorId}`,
    });
  },

  go(e) {
    let { stt, id } = e.currentTarget.dataset;
    let targetUid = this.info.userInfo.uid;
    let counselorId = this.counselorInfo.counselorId;
    if (stt == '01') {//待付款
      return
    }
    wx.navigateTo({
      url: `/pages/packageOrder/replaceDetail/replaceDetail?id=${id}&targetUid=${targetUid}&counselorId=${counselorId}&complete=true`,
    });
  },

  pay(e) {
    var that = this;
    let { id } = e.currentTarget.dataset;
    let targetUid = this.info.userInfo.uid;
    let counselorId = this.counselorInfo.counselorId;
    apiRequest.overturnReplaceRelation({
      targetUid: targetUid,
      counselorId: counselorId,
      rrid: id,
    })
      .then(res => {
        if (res.errCode == '1009') {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        wx.navigateTo({
          url: '/pages/packageOrder/submit/submit?from=replace',
        });
      })
      .catch(error => {

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