//index.js
//获取应用实例
const app = getApp()
import BasicService from '../../service/BasicService'
import CookService from '../../service/CookService'
const basicService = new BasicService()
const cookService = new CookService()
import {switch2Chinese, formatDate, long2Timestamp} from '../../utils/util'
import {reorganization} from '../../utils/dataFilters'
import {waterfall} from '../../lib/waterfall/waterfall'

// let leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
const getMonthday = formatDate('MD')
const long2Timestamp24 = long2Timestamp()

Page({
  data: {
    tabs: [{
      id: 0,
      name: '广场'
    }, {
      id: 1,
      name: '名厨菜谱'
    }],
    nowTab: 0,
    loginInfo: {},
    userInfo: {},
    originData: [],
    cookList: [[], []],
    ranklist: [], // 榜单列表
    bannerList: [],
    term: '',
    refreshSuccess: false,
    loadmoreFlag: false,
    banners: [],
    fixedTab: false,
    navBarHeight: 0,
    platform: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.$userType = '01'
    this.$pageNo = 1
    this.$pageNo_rl = 1
    this.$pageSize = 10
    // 刷新组件
    this.$refreshing = false
    this.$refresh = this.selectComponent('#refresh')
    if(app.globalData.userInfo) {
      this.setData({
        loginInfo: app.globalData.loginInfo,
        userInfo: app.globalData.userInfo,
        platform: app.globalData.systemInfo.platform,
        originData: [],
        cookList: [[], []],
        ranklist: []
      }, async () => {
        this.getBannerInfo()
        this.queryHomeRecipesList()
        await this.queryActivityList()
        this.queryRankingListByTrPhase()
      })
    } else {
      app.userInfoReadyCallback = () => {
        this.setData({
          loginInfo: app.globalData.loginInfo,
          userInfo: app.globalData.userInfo,
          platform: app.globalData.systemInfo.platform,
          originData: [],
          cookList: [[], []],
          ranklist: []
        }, async () => {
          this.getBannerInfo()
          this.queryHomeRecipesList()
          await this.queryActivityList()
          this.queryRankingListByTrPhase()
        })
      }
    }

    // 配置自定义导航
    if(typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  onReady: function() {
    this.setData({
      navBarHeight: app.globalData.navBarHeight
    })
  },
  onShow: function() {
    this.setData({
      loginInfo: app.globalData.loginInfo,
      userInfo: app.globalData.userInfo
    })
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
  refresh({detail}) {
    if(!this.$refreshing) {
      this.$refreshing = true
      this.$pageNo = this.$pageNo_rl = 1
      this.getBannerInfo()
      this.queryActivityList().then(res => {
        this.queryRankingListByTrPhase()
      })
      this.queryHomeRecipesList().catch(err => {
        this.$refreshing = false
        // detail.success()
        wx.showToast({
          title: '网络错误，请重试~',
          icon: 'none'
        })
        detail.success()
      })
    }
  },
  carouselChange(e) {
    const {current} = e.detail
  },
  voteRecipes(e) {
    let {cookList, platform} = this.data
    const {id, status, index, subindex} = e.currentTarget.dataset
    const isLogin = app.checkLogin()
    if(!isLogin) return
    platform !== 'devtools' && wx.vibrateShort();
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
  queryHomeRecipesList() {
    return new Promise((resolve, reject) => {
      cookService.queryHomeRecipesList({
        userType: this.$userType,
        pageNo: this.$pageNo,
        pageSize: this.$pageSize
      }).then(res => {
        if(res.errCode === 0) {
          const {recipesList} = res.obj
          if(recipesList.length === 0) {
            if(this.$pageNo === 1) {
              this.setData({
                originData: [],
                cookList: [[], []]
              }, () => {
                waterfall(this)
              })
            } else if(this.$pageNo > 1) {
              this.$pageNo--
              this.setData({
                loadmoreFlag: false
              })
            }
          } else {
            recipesList.forEach(item => {
              item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
              item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
            })
            this.setData({
              originData: recipesList,
            }, async () => {
               waterfall(this)
            })
          }
          resolve()
        } else {
          resolve()
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  queryRankingListByTrPhase() {
    let {ranklist} = this.data
    if(!this.$term) return
    cookService.queryRankingListByTrPhase({
      trPhase: this.$term,
      pageNo: this.$pageNo_rl,
      pageSize: this.$pageSize
    }).then(res => {
      if(res.errCode === 0) {
        const {recipesList} = res.obj

        // recipesList.forEach((item, index) => {
        //   promiseList[index] = getImageInfo(item.trCoverImageUrl)
        // })
        // Promise.all(promiseList).then(res => {
        //   res.forEach((val, index) => {
        //     const {width, height} = val
        //     recipesList[index].trCoverImageWide = width
        //     recipesList[index].trCoverImageHeight = height
        //   })
        //   let nowCookList = reorganization(recipesList, 4)
        //   if(this.$pageNo_rl === 1) {
        //     ranklist = []
        //   }
        //   ranklist = ranklist.concat(nowCookList)
        //   this.setData({
        //     ranklist
        //   })
        // })
        recipesList.forEach(item => {
          item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
          item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
        })
        let nowCookList = reorganization(recipesList, 4)
        if(this.$pageNo_rl === 1) {
          ranklist = []
        }
        ranklist = ranklist.concat(nowCookList)
        this.setData({
          ranklist
        })
      }
    })
  },
  queryActivityList() {
    return new Promise(resolve => {
      cookService.queryActivityList().then(res => {
        //最新期数
        const now = +new Date()
        const {activityBean, activityList} = res.obj
        if(activityBean) {
          this.$collectterm = activityBean.taPhase
          this.getTabBar().setData({
            collectterm: switch2Chinese(this.$collectterm)
          })
          wx.setStorageSync('endCollectDate', getMonthday(long2Timestamp24(activityBean.taEndCollect)))
          wx.setStorageSync('collectterm', switch2Chinese(this.$collectterm))
        } else {
          wx.setStorageSync('collectterm', '')
        }
        if(res.obj.activityList.length > 0) {
          this.$term = activityList[0].taPhase
          this.$endVote = activityList[0].taEndVote
          this.setData({
            term: switch2Chinese(activityList[0].taPhase),
            processing: now <= long2Timestamp24(activityList[0].taEndVote) ? true : false
          })
          wx.setStorageSync('endVoteDate', getMonthday(long2Timestamp24(activityList[0].taEndVote)))
        }
        resolve()
      })
    })
  },
  toCookDetail(e) {
    // type: 00:榜单进入，02广场列表进入
    const {id, index, subindex,type} = e.currentTarget.dataset
    app.checkLogin(() => {
      wx.navigateTo({
        url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&subIndex=${subindex}&from=${type}`
      })
    })
  },
  toLeaderboard() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: `/pages/leaderboard/leaderboard`
      })
    })
  },
  toUserInfo(e) {
    const {uid, subitem} = e.currentTarget.dataset
    const isLogin = app.checkLogin()
    if(!isLogin) return
    wx.navigateTo({
      url: `/pages/userInfo/userInfo?uid=${uid}&uname=${subitem.uname}&avatar=${subitem.headImgUrl}&sex=${subitem.sex}`
    })
  },
  toBannerView(e) {
    const {index} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/basic/bannerView/bannerView?index=${index}`
    })
  },
  goSearchCook(e) {
    const {url} = e.detail
    app.checkLogin(() => {
      wx.navigateTo({url})
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getBannerInfo() {
    basicService.getBannerInfo().then(res => {
      if(res.errCode === 0) {
        const {bannerInfo} = res.obj
        this.setData({
          banners: bannerInfo ? JSON.parse(bannerInfo) : []
        })
      }
    })
  },
  async switchTab(e) {
    const {index}= e.currentTarget.dataset
    this.$userType = index === 0 ? '01' : '02'
    this.$pageNo = 1
    this.queryHomeRecipesList()
    this.setData({
      nowTab: index
    })
  },
  //页面滚动
  onPageScroll: async function (e) {
    const {scrollTop} = e
    let {fixedTab, platform} = this.data
    this.$refresh.onPageScroll(e)
    if(!this.$fixedDistance) {
      const carouselHeight = await this.calcHeight('.carousel')
      const leaderboardHeight = await this.calcHeight('.leaderboard')
      this.$fixedDistance = carouselHeight + leaderboardHeight
    }

    if(!fixedTab && scrollTop + 10 >= this.$fixedDistance) {
      platform !== 'devtools' && wx.vibrateShort()
      fixedTab = true
    } else if(fixedTab && scrollTop + 20 < this.$fixedDistance) {
      fixedTab = false
    }
    this.setData({
      fixedTab
    })
  },
  // 计算开始顶部固定距离
  calcHeight(obj) {
    return new Promise(resolve => {
      const query = wx.createSelectorQuery()
      query.select(obj).boundingClientRect().exec(function(res) {
        resolve(res[0].height)
      })
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    const {originData} = this.data
    if(originData.length === 0 && this.$pageNo === 1) return
    if(this.$refreshing) return
    if(!this.$handleEnd) return
    this.setData({
      loadmoreFlag: true
    })
    this.$pageNo++
    this.queryHomeRecipesList(this.$userType )
  },
  onShareAppMessage: function (res) {
    return {
      title: '我想吃',
      path: `/pages/index/index`,
      imageUrl: '/images/logo.png',
      success: function (res) {
        console.log('成功', res)
      }
    }
  }
})
