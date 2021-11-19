// pages/packageDiscover/coach/coachDetail/coachDetail.js
import apiRequest from '../../../../service/index';
import { getStorage } from "../../../../utils/storage";
import day from "../../../../libs/day";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
    personalDetail: [
      {sort: 1, name: '专家风采', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/coach_head.png'},
      {sort: 2, name: '专业证书', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/certificate.png'},
      {sort: 3, name: '学员案例', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/case.png'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      index: options.index || 0
    })
    var pages = getCurrentPages();   //当前页面
    var prePage = pages[pages.length - 2];   //上个页面
    let coachDTO = prePage.data.expertOnline[this.data.index];  //上个页面-数据
    this.setData({
      coach: {
        ...coachDTO,
        coachAddressList: coachDTO.coachAddressList.map(item => { // 服务地址
          item.tcaAddresList = item.tcaAddresList.join("")
          return item
        }),
        imageUrlList: coachDTO.imageUrl.split(","), // 专家风采
        qualificationImageUrlList: coachDTO.qualificationImageUrl.split(","), // 专业证书
        coachInstantiateList: coachDTO.coachInstantiateList.map(item => { // 学员案例
          item.weightLoss = parseFloat((item.tciDrillAfter - item.tciDrillBefore).toFixed(2))
          return item
        }),
      }
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
  // 预览图片
  previewImage() {
    const { coach } = this.data;
    wx.previewImage({
      urls: [coach.headImageUrl] // 需要预览的图片http链接列表
    })
  },
  // 专家风采 & 专业证书 & 学员案例
  personalDetail(e) {
    const { sort } = e.currentTarget.dataset;
    const { coach } = this.data;
    let url = ''
    switch (sort) {
      case 1:
        url = `/pages/packageDiscover/expert/coachScene/coachScene?dataList=${JSON.stringify(coach.imageUrlList)}`
        break;
      case 2:
        url = `/pages/packageDiscover/expert/certificate/certificate?dataList=${JSON.stringify(coach.qualificationImageUrlList)}`
        break;
      case 3:
        url = `/pages/packageDiscover/expert/case/case?dataList=${JSON.stringify(coach.coachInstantiateList)}`
        break;
    }
    wx.navigateTo({
      url
    });
  },
  // 服务地址-导航
  goMap(e) {
    const { name, address,  lat, lon} = e.currentTarget.dataset;
    wx.openLocation({
      name,
      address,
      latitude: Number(lat),
      longitude: Number(lon),
      scale: 18,
    });
  },
  // 复制微信
  copyCode() {
    const { coach } = this.data;
    if(!coach.wxNumber){
      return
    }
    wx.setClipboardData({
      data: coach.wxNumber,
      success: function (res) {
        wx.showToast({
          title: '微信已复制'
        })
      }
    })
  },
  // 拨打
  call() {
    const { coach } = this.data;
    if(!coach.phone){
      return
    }
    this.setData({
      showCall: true
    })
  },
  // 确定拨打
  sureCall() {
    const { coach } = this.data;
    wx.makePhoneCall({
      phoneNumber: coach.phone + '',
    }).catch((e) => {
      // console.log(e)  //用catch(e)来捕获错误{makePhoneCall:fail cancel}
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