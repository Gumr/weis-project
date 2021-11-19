// pages/searchCook/searchCook.js
import CookService from '../../service/CookService'
import {waterfall} from '../../lib/waterfall/waterfall'
const cookService = new CookService()
const app = getApp()
// let leftHeight = 0, rightHeight = 0, column1 = [], column2 = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSearched: false,
    originData: [],
    cookList: [[], []]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$refreshing = false
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
  searchFn(e) {
    const value = e.detail
    if(!this.$refreshing) {
      this.$refreshing = true
      cookService.searchCook({
        keyWord: value
      }).then(res => {
        if(res.errCode === 0) {
          // leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
          const {recipesList} = res.obj
          this.setData({
            originData: recipesList,
            isSearched: true
          }, () => {
            waterfall(this)
          })
        }
      })
    }
  },
  toCookDetail(e) {
    const {id, index, subindex} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&subIndex=${subindex}&from=02`
    })
  },
  voteRecipes(e) {
    let {cookList} = this.data
    const {id, status, index, subindex} = e.currentTarget.dataset
    const isLogin = app.checkLogin()
    if(!isLogin) return
    wx.vibrateShort();
    cookService.voteRecipes({
      trId: id,
      trState: status ? 0 : 1
    }).then(res => {
      if(res.errCode === 0) {
        cookList[index][subindex].vote = !status
        status ? cookList[index][subindex].trVoteNumber-- : cookList[index][subindex].trVoteNumber++
        this.setData({
          cookList
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        })
      }
    })
  },
  toUserInfo(e) {
    const {uid, subitem} = e.currentTarget.dataset
    const isLogin = app.checkLogin()
    if(!isLogin) return
    wx.navigateTo({
      url: `/pages/userInfo/userInfo?uid=${uid}&uname=${subitem.uname}&avatar=${subitem.headImgUrl}`
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

  }
})