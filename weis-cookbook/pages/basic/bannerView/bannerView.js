// pages/basic/bannerWv/bannerWv.js
import BasicService from '../../../service/BasicService'
const basicService = new BasicService()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    btnImg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      index: options.index
    })
    this.$index = options.index
    this.getBannerInfo()
  },
  getBannerInfo() {
    basicService.getBannerInfo().then(res => {
      if(res.errCode === 0) {
        const {jumpLink} = JSON.parse(res.obj.bannerInfo)[this.$index]
        const btnImg = jumpLink.splice(jumpLink.length - 1)
        this.setData({
          banners: jumpLink,
          btnImg
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const pages = getCurrentPages()
    this.setData({
      showBackHome: pages.length > 1 ? false : true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onShareAppMessage: function (res) {
    return {
      title: '传菜谱拿提成，入选菜谱最高可获10000元',
      path: `/pages/basic/bannerView/bannerView?index=${this.$index}`,
      imageUrl: '/images/banners/banner1_share.png',
      success: function (res) {
        console.log('成功', res)
      }
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

  }
})