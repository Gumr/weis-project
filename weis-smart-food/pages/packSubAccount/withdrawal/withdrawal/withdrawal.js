// pages/packSubAccount/withdrawal/withdrawal/withdrawal.js
import apiRequest from '../../../../service/index';
import {
  setStorage,
  getStorage,
  removeStorage
} from '../../../../utils/storage'
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
    let xy = wx.getStorageSync('xy')
    if(!xy) {
      this.getYzhAgreement()
    }
    this.queryEffectivePay()
    // this.queryEmployeeInfo()
  },
  // 查询销售人员信息
  // queryEmployeeInfo() {
  //   apiRequest.queryEmployeeInfo()
  //     .then(res => {
  //       let saleEmployeeDTOS = res.obj.saleEmployeeDTOS[0];
  //       this.setData({
  //         employeeInfo: saleEmployeeDTOS || {}
  //       })
  //       this.queryEffectivePay()
  //       // 仅【个人消耗类渠道】展示此弹窗
  //       if(saleEmployeeDTOS.tseRoleId == '100005') {
  //         this.setData({
  //           contractShow: true
  //         })
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },
  // 获取云账户提现协议
  getYzhAgreement() {
    apiRequest.getYzhAgreement()
      .then(res => {
        if(res.errCode == 0) {
          this.setData({
            contractHtml: res.obj.yzhAgreement,
            contractShow: true
          })
        }
      })
      .catch(error => {

      })
  },
  // 提示信息
  tipInfo() {
    this.setData({
      tipInfoShow: true
    })
  },
  // 提示-关闭
  tipInfoSure() {
    this.setData({
      tipInfoShow: false
    })
  },
  // 查询可提成金额
  queryEffectivePay() {
    let { employeeInfo } = this.data;
    apiRequest.queryEffectivePay({
      empId: employeeInfo[0].tseId // 销售人员主键id
    })
      .then(res => {
        this.setData({
          effectivePay: res.obj.effectivePay,
          completePay: res.obj.completePay,
          totalIncome: res.obj.totalIncome,
        })
      })
      .catch(error => {

      })
  },
  
  // 签约协议
  xy() {
    const {xy} = this.data;
    this.setData({
      xy: !xy
    });
  },
  // 签约协议-确定
  sure() {
    this.setData({
      contractShow: false
    })
    setStorage('xy', this.data.xy)
  },
  // 业绩
  myAchievement() {
    wx.navigateTo({
      url: `/pages/mineBox/achievement/achievement`,
    });
  },
  // 提现明细
  detail() {
    let { employeeInfo } = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/withdrawal/detail/detail?employeeInfo=${JSON.stringify(employeeInfo)}`,
    });
  },
  // 立即提现
  withdrawal(){
    let { employeeInfo, effectivePay } = this.data;
    wx.navigateTo({
      url: `/pages/packSubAccount/withdrawal/wallet/wallet?employeeInfo=${JSON.stringify(employeeInfo)}&effectivePay=${effectivePay}`,
    });
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