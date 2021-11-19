import requests from '../../../../service/index'
import { debounce } from '../../../../utils/throttle'

// pages/marketing/slimmingCamp/bodyForm/bodyForm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile: {},
    targetWeightMode: 0,
    targetWeight: '',
    buttonDisabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.aid = options.aid;
    this.getUserProfile();
    requests.queryCampCaseId()
      .then((res) => {
        if (res.errCode === 0) {
          this.caseId = res.obj.caseId;
        }
      })

    this.debounceTargetWeightCheck = debounce(400, () => {
      this.targetWeightCheck()
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
  weightInput(evt) {
    const { key } = evt.currentTarget.dataset;
    const { value } = evt.detail
    this.setData({
      [key]: Number(value)
    })

    this.debounceTargetWeightCheck();
  },
  targetWeightCheck() {
    const { weight, targetWeight } = this.data;
    const NUMBERS = /^[0-9]+(\.[0-9]+)?$/;

    let targetWeightMode = 0;
    if (NUMBERS.test(targetWeight) && NUMBERS.test(weight)) {
      if (targetWeight > weight) {// 大于当前体重
        targetWeightMode = 1;
      }
      if (targetWeight == weight) {// 等于当前体重
        targetWeightMode = 2;
      }
      if (targetWeight < (weight - 5)) {// 小于当前体重超于5kg
        targetWeightMode = 3;
      }
    }

    this.setData({
      targetWeightMode,
      buttonDisabled: !targetWeight || !weight || targetWeightMode !== 0
    })
  },
  updateUserProfile() {
    return requests.updateUserProfile({
      weight: this.data.weight,
      targetWeight: this.data.targetWeight,
    })
  },
  buttonHeight(evt) {
    this.setData({
      buttonHeight: evt.detail
    })
  },
  buttonTap() {
    if (this.data.buttonDisabled) {
      wx.showToast({
        title: '请输入规范的体重数值',
        icon: 'none'
      })
      return;
    }

    this.updateUserProfile()
      .then((res) => {
        if (res.errCode === 0) {
          wx.reLaunch({
            url: `/pages/packageDiscover/netRedPlan/netRedPlan?id=${this.caseId}&from=slimmingCamp&activityId=${this.aid}`
          });
        }
      })
  },
  getUserProfile() {
    return requests.queryUserInfo()
      .then((res) => {
        if (res.errCode === 0) {
          const profile = res.obj.userProfile
          this.setData({
            profile,
            weight: String(profile.weight)
          })
        }
      })
  },
})