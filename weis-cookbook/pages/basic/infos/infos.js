// pages/basic/editInformation/editInformation.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    genders: [{
      id: 1,
      name: '男',
      selected: false
    }, {
      id: 2,
      name: '女',
      selected: false
    }],
    userInfo: {}, // sex: 1女，2男
    popGender: false,
    btnStatus: false
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
    let  {genders, userInfo, userInfo: {userProfile: {sex}}} = this.data
    sex = sex === 0 ? userInfo.sex : sex
    genders.forEach(item => {
      item.selected = sex === item.id ? true : false
    })
    this.setData({
      ['userInfo.userProfile.sex']: sex,
      genders
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  editGenders() {
    let btnStatus = false
    let {genders} = this.data
    genders.forEach(item => {
      if(item.selected) btnStatus = true
    })
    this.setData({
      popGender: true,
      btnStatus
    })
  },
  editOtherInfos(e) {
    const {type} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/basic/editInfos/editInfos?type=${type}`
    })
  },
  choosedFn() {
    let sex = 1
    const {genders, userInfo, btnStatus} = this.data
    genders.map(item => {
      if(item.selected) {
        sex = item.id
      }
    })
    if(!btnStatus) return
    basicService.updateProfile({
      sex
    }).then(res => {
      if(res.errCode === 0 && res.obj.result > 0) {
        userInfo.userProfile.sex = sex
        this.setData({
          userInfo,
          popGender: false
        })
      }
    })
  },
  chooseGender(e) {
    const {index} = e.currentTarget.dataset
    let {genders} = this.data
    let btnStatus = false
    if(genders[index].selected) return
    genders.map((item, i) => {
      item.selected = i === index ?  !item.selected : false
      if(item.selected === true ) btnStatus = true
    })
    this.setData({
      genders,
      btnStatus
    })
  },
  // 上传头像
  uploadAvator() {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (/\.(jpg|jpeg|png|JPG|PNG)$/.test(res.tempFilePaths[0])) {
          const tempFilePaths = res.tempFilePaths[0]
          wx.navigateTo({
            url: `/pages/basic/cropImg/cropImg?src=${tempFilePaths}`
          })
          return
        }
        wx.showToast({
          title: '只能上传静态图片',
          icon: 'none'
        })
      }
    })
  },
  hideOverlay() {
    this.setData({
      popGender: false
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