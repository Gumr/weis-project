// pages/mine/mine.js
import CookService from '../../service/CookService'
const cookService = new CookService()
import BasicService from '../../service/BasicService'
const basicService = new BasicService()
import IncomeService from '../../service/IncomeService'
const incomeService = new IncomeService()
import {waterfall} from '../../lib/waterfall/waterfall'
const app  = getApp()

// let leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    loginInfo: {},
    userInfo: {},
    tabs: [{
      id: 0,
      name: '菜谱'
    }, {
      id: 1,
      name: '投票'
    }, {
      id: 2,
      name: '收藏'
    }],
    nowTab: 0,
    originData: [],
    cookList: [[], []],
    followNum: '',
    fans: '',
    hideIncome: true,
    balance: 0,
    fixedTab: false,
    isCook: false //是否是名厨
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 配置自定义导航
    if(typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
        collectterm: wx.getStorageSync('collectterm')
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const isHide = wx.getStorageSync('isHide')
    this.setData({
      hideIncome: isHide === '' ? true : isHide
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.$pageNo = 1
    this.$pageSize = 10
    // leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
    const {nowTab} = this.data
    if(app.globalData.userInfo) {
      const {navBarHeight, userInfo, loginInfo} = app.globalData
      this.setData({
        navBarHeight,
        userInfo,
        loginInfo,
      }, () => {
        nowTab === 0 ? this.getMyCook() : nowTab === 1 ? this.getMyVote() : this.getMyCollect()
        this.queryMyFollowAndFansNumber()
        this.queryIncome()
      })
    } else {
      app.userInfoReadyCallback = () => {
        const {navBarHeight, userInfo, loginInfo} = app.globalData
        this.setData({
          navBarHeight,
          userInfo,
          loginInfo,
        }, () => {
          nowTab === 0 ? this.getMyCook() : nowTab === 1 ? this.getMyVote() : this.getMyCollect()
          this.queryMyFollowAndFansNumber()
          this.queryIncome()
        })
      }
    }
  },
  toFans() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: '/pages/mine/fans/fans'
      })
    })
  },
  toFollows() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: '/pages/mine/follows/follows'
      })
    })
  },
  toIncome() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: '/pages/mine/income/income'
      })
    })
  },
  voteRecipes(e) {
    let {cookList} = this.data
    const {id, status, index, subindex} = e.currentTarget.dataset
    if(cookList[index][subindex].trAuditResult !== '05') return
    wx.vibrateShort();
    cookService.voteRecipes({
      trId: id,
      trState: status ? 0 : 1
    }).then(res => {
      if(res.errCode === 0) {
        cookList[index].splice(subindex, 1)
        // cookList[index][subindex].vote = !status
        // status ? cookList[index][subindex].trVoteNumber-- : cookList[index][subindex].trVoteNumber++
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
  toCookDetail(e) {
    const {nowTab} = this.data
    const {id, index, subindex} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/cookDetail/cookDetail?id=${id}&index=${index}&subIndex=${subindex}&from=${nowTab === 0 ? '01' : '02'}`
    })
  },
  toIntroduction() {
    wx.navigateTo({
      url: `/pages/basic/editInfos/editInfos?type=intro`
    })
  },
  switchTab(e) {
    const {index}= e.currentTarget.dataset
    // leftHeight = 0, rightHeight = 0, column1 = [], column2 = []
    this.setData({
      nowTab: index,
      originData: [],
      cookList: [[], []]
    })
    this.$pageNo = 1
    switch(index) {
      case 1:
        this.getMyVote()
        break
      case 2:
        this.getMyCollect()
        break
      default:
        this.getMyCook()
    }
  },
  toggleIncome() {
    const {hideIncome} = this.data
    wx.vibrateShort()
    this.setData({
      hideIncome: !hideIncome
    })
    wx.setStorageSync('isHide', !hideIncome)
  },
  // 查看我的食谱
  getMyCook() {
    cookService.getMyCook({
      pageNo: this.$pageNo,
      pageSize: this.$pageSize
    }).then(res => {
      if(res.errCode === 0) {
        const {recipesList, isCook} = res.obj
        if(recipesList.length === 0 && this.$pageNo > 1) {
          wx.showToast({
            title: '没有更多了',
            icon: 'none'
          })
        } else {
          recipesList.forEach(item => {
            item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
            item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
          })
          this.setData({
            originData: recipesList,
            isCook
          }, () => {
            waterfall(this)
          })
        }
      }
    })
  },
  // 查看我的收藏
  getMyCollect() {
    cookService.getMyCollect({
      pageNo: this.$pageNo,
      pageSize: this.$pageSize
    }).then(res => {
      if(res.errCode === 0) {
        const {collectList, isCook} = res.obj
        if(collectList.length === 0 && this.$pageNo > 1) {
          wx.showToast({
            title: '没有更多了',
            icon: 'none'
          })
        } else {
          collectList.forEach(item => {
            item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
            item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
          })
          this.setData({
            originData: collectList,
            isCook
          }, () => {
            waterfall(this)
          })
        }
      }
    })
  },
  //查看我的投票
  getMyVote() {
    cookService.getMyVote({
      pageNo: this.$pageNo,
      pageSize: this.$pageSize
    }).then(res => {
      if(res.errCode === 0) {
        const {voteList, isCook} = res.obj
        
        if(voteList.length === 0 && this.$pageNo > 1) {
          wx.showToast({
            title: '没有更多了',
            icon: 'none'
          })
        } else {
          voteList.forEach(item => {
            item.trCoverImageWide = Math.ceil(+item.trCoverImageWide)
            item.trCoverImageHeight = Math.ceil(+item.trCoverImageHeight)
          })
          this.setData({
            originData: voteList,
            isCook
          }, () => {
            waterfall(this)
          })
        }
      }
    })
  },
  queryMyFollowAndFansNumber() {
    basicService.queryMyFollowAndFansNumber().then(res => {
      if(res.errCode === 0) {
        this.setData({
          followNum: res.obj.followNum,
          fans: res.obj.fans
        })
      }
    })
  },
  queryIncome() {
    incomeService.queryIncomeTotal().then(res => {
      if(res.errCode === 0) {
        const {balanceCurrent} = res.obj
        this.setData({
          balance: balanceCurrent ? balanceCurrent : 0
        })
      }
      
    })
  },
  toInfos() {
    app.checkLogin(() => {
      wx.navigateTo({
        url: '/pages/basic/infos/infos'
      })
    })
  },
  //页面滚动
  onPageScroll: async function (e) {
    const {scrollTop} = e
    let {fixedTab} = this.data
    let fixedDistance = await this.calcFixedDistance('.userInfo')
    if(!fixedTab && scrollTop + 10 >= fixedDistance) {
      fixedTab = true
    } else if(fixedTab && scrollTop + 20 < fixedDistance) {
      fixedTab = false
    }
    this.setData({
      fixedTab
    })
  },
  // 计算开始顶部固定距离
  calcFixedDistance(obj) {
    return new Promise(resolve => {
      const query = wx.createSelectorQuery()
      query.select(obj).boundingClientRect().exec(function(res) {
        resolve(res[0].height)
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
    const {nowTab, originData} = this.data
    if(this.$pageNo === 1 && originData.length < this.$pageSize) return
    this.$pageNo++
    nowTab === 0 ? this.getMyCook() : nowTab === 1 ? this.getMyVote() : this.getMyCollect()
  }
})