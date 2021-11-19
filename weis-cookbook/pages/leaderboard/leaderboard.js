// pages/leaderboard/leaderboard.js
import CookService from '../../service/CookService'
const cookService = new CookService()
import {formatDate, long2Timestamp, switch2Chinese} from '../../utils/util'
import {getImageInfo} from '../../utils/basic'
const getDate = formatDate('MD')
const long2Timestamp24 = long2Timestamp(24)
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refreshSuccess: false,
    ranklist: null,
    canVote: false,
    title: '',
    term: '',
    processing: true,
    showBackHome: false,
    loginInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.$pageNo_rl = 1
    await this.queryActivityList()
    const now = +new Date()
    const endVote = long2Timestamp24(this.$endVote)
    this.setData({
      term: `第${switch2Chinese(this.$term)}期榜单`,
      canVote: now <= endVote ? true : false,
      title: now <= endVote ? `火热投票中，${getDate(endVote)}截止` : `第${switch2Chinese(this.$term)}期最终榜单`,
      processing: now <= endVote ? true : false,
      loginInfo: app.globalData.loginInfo
    })
    this.queryRankingListByTrPhase()
    app.userInfoReadyCallback = () => {
      this.setData({
        loginInfo: app.globalData.loginInfo
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 刷新组件
    this.$refresh = this.selectComponent('#refresh')
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
  touchstartEvent(e) {
    this.$refresh.touchStart(e)
  },
  touchmoveEvent(e) {
    this.$refresh.touchMove(e)
  },
  touchEndEvent(e) {
    this.$refresh.touchEnd(e)
  },
  async refresh({detail}) {
    this.$pageNo_rl = 1
    await this.queryRankingListByTrPhase().catch(err => {
      detail.success()
      return
    })
    this.setData({
      refreshSuccess: true
    }, () => {
      detail.success()
    })
  },
  voteRecipes(e) {
    let {ranklist, canVote} = this.data
    const {id, status, index} = e.currentTarget.dataset
    if(!canVote) return
    app.checkLogin(() => {
      cookService.voteRecipes({
        trId: id,
        trState: status ? 0 : 1
      }).then(res => {
        if(res.errCode === 0) {
          const {result} = res.obj
          if(result) {
            ranklist[index].vote = !status
            status ? ranklist[index].trVoteNumber-- : ranklist[index].trVoteNumber++
            this.setData({
              ranklist
            })
          } else {
            wx.showToast({
              title: '投票失败，请重试~',
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      })
    })
  },
  toPrevious() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: '/pages/preLeaderboard/preLeaderboard'
      })
    })
  },
  toCookDetail(e) {
    app.checkLogin(() => {
      const {id, index} = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&from=00`
      })
    })
  },
  queryRankingListByTrPhase() {
    return new Promise((resolve,reject) => {
      let {ranklist} = this.data
      cookService.queryRankingListByTrPhase({
        trPhase: this.$term,
        pageNo: this.$pageNo_rl,
        pageSize: 10
      }).then(res => {
        if(res.errCode === 0) {
          let promiseList = []
          const {recipesList} = res.obj
          if(this.$pageNo_rl > 1 && recipesList.length === 0) {
            wx.showToast({
              title: '没有更多了',
              icon: 'none'
            })
            this.$pageNo--
          } else {
            recipesList.forEach(item => {
              item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
              item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
            })
            if(this.$pageNo_rl === 1) ranklist = []
            ranklist = ranklist.concat(recipesList)
          }
          this.setData({
            ranklist
          })
          resolve()
        }
      }).catch(err => {
        reject()
      })
    })
  },
  queryActivityList() {
    return new Promise((resolve, reject) => {
      cookService.queryActivityList().then(res => {
        //最新期数
        const {activityList} = res.obj
        if(res.obj.activityList.length > 0) {
          this.$term = activityList[0].taPhase
          this.$endVote = activityList[0].taEndVote
          resolve()
        } else {
          reject()
        }
      })
    })
  },
  onShareAppMessage: function (res) {
    const {term} = this.data
    return {
      title: '',
      envVersion: 'trial',
      path: `/pages/leaderboard/leaderboard?term=${this.$term}&endvote=${this.$endVote}`,
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