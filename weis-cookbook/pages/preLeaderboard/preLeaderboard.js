// pages/preLeaderboard/preLeaderboard.js
import CookService from '../../service/CookService'
const cookService = new CookService()
import {switch2Chinese} from '../../utils/util'
import {getImageInfo} from '../../utils/basic'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    ranklist: null,
    nowTab: 0,
    term: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      term: options.term
    })
    this.$pageNo_rl = 1
    this.queryActivityList().then(res => {
      this.queryRankingListByTrPhase()
    }).catch(err => {
      this.setData({
        ranklist: []
      })
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
  switchTab(e) {
    const {index} = e.currentTarget.dataset
    this.$pageNo_rl = 1
    this.setData({
      nowTab: index,
      ranklist: null
    }, () => {
      this.queryRankingListByTrPhase()
    })
  },
  toCookDetail(e) {
    const {id, index} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&from=00`
    })
  },
  queryActivityList() {
    return new Promise((resolve, reject) => {
      const now = +new Date()
      cookService.queryActivityList().then(res => {
        let {activityList} = res.obj
        const {term} = this.data
        activityList.splice(0, 1)
        // if(now <= long2Timestamp24(activityList[0].taEndVote)) activityList.splice(0, 1)
        activityList.forEach(item => {
          item.cycle = switch2Chinese(item.taPhase)
        })
        this.setData({
          activityList
        })
        activityList.forEach((item, index) => {
          if(item.taPhase == term) {
            this.setData({
              nowTab: index
            })
          }
        })
        activityList.length > 0 ? resolve(): reject()
      })
    })
  },
  queryRankingListByTrPhase() {
    return new Promise(resolve => {
      let {activityList, ranklist, nowTab} = this.data
      cookService.queryRankingListByTrPhase({
        trPhase: activityList[nowTab].taPhase,
        pageNo: this.$pageNo_rl,
        pageSize: 10
      }).then(res => {
        if(res.errCode === 0) {
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
    this.$pageNo_rl++
    this.queryRankingListByTrPhase()
  }
})