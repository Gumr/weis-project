// pages/packSubAccount/withdrawal/wallet/wallet.js
import apiRequest from '../../../../service/index';
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
      employeeInfo: JSON.parse(options.employeeInfo),
      effectivePay: options.effectivePay
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
    let name = wx.getStorageSync('name')
    let idCard = wx.getStorageSync('idCard')
    this.setData({
      name: name || '',
      idCard: idCard || '',
      isClick: true,
    })
    this.queryUserInfo()
  },
  // 获取用户信息
  queryUserInfo() {
    apiRequest.queryUserInfo().then((res) => {
      this.setData({
        userInfo: res.obj
      })
    })
  },
  // 填写提现金额
  inputPrice(e) {
    const { value } = e.detail;
    this.setData({
      price: value
    })
    this.check()
  },
  // 填写真实姓名
  inputName(e) {
    const { value } = e.detail;
    this.setData({
      name: value
    })
    this.check()
  },
  // 填写身份证号码
  inputIdCard(e) {
    const { value } = e.detail;
    this.setData({
      idCard: value
    })
    this.check()
  },
  // 全部提现
  allPrice() {
    let { effectivePay } = this.data;
    this.setData({
      price: effectivePay
    })
    this.check()
  },
  // 校验是否可点击提现
  check() {
    let { price, name, idCard, effectivePay } = this.data;
    let btnActive = false;
    if(price <= Number(effectivePay) && price >= 50 && name && idCard) {
      btnActive = true
    }
    this.setData({
      btnActive 
    })
  },
  // 确定提现-对接云账户，提现⾄⽤户微信零钱
  withdrawal() {
    let { btnActive, price, name, idCard, employeeInfo, isClick } = this.data;
    if(!btnActive) {
      return;
    }
    if(!isClick) {
      return;
    }
    this.setData({
      isClick: false
    })
    wx.setStorageSync('name', name)
    wx.setStorageSync('idCard', idCard)
    apiRequest.yunZhangHuToWxPay({
      realName: name, // 姓名
      idCard, // 身份证
      pay: price, // 打款⾦额
      channel: '01',// 提现来源（01：维士小盒饭；02：服务端）
      empId: employeeInfo[0].tseId// 销售人员主键id
    })
      .then(res => {
        let {result} = res.obj;
        let status = result.code == '02'?1:0;
        wx.navigateTo({
          url: `/pages/packSubAccount/withdrawal/submitStatus/submitStatus?status=${status}&employeeInfo=${JSON.stringify(employeeInfo)}`,
        });
      })
      .catch(error => {

      })
      .finally(error => {
        this.setData({
          isClick: true,
        })
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