// pages/packageDiscover/vote/vote.js
import apiRequest from '../../../service/index'
import day from '../../../libs/day'
import {isLoginClick} from '../../../utils/common'
import {getStorage} from '../../../utils/storage'
const loginInfo = getStorage('loginInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
    isNull: true,
    historyFlag: false,
    pageNo: 1,
    pageSize: 10,
    voteInfo: {},
    voteSkuList: [],
    isLogin: loginInfo.isAuthorized && loginInfo.isLogin
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const from = options.from
    const term = options.term
    // 往期投票
    if(from == 'ht') {
      const pages = getCurrentPages(),
        prePage = pages[pages.length - 2],
        {voteInfo: preVoteInfo, voteSkuList: preVoteSkuList} = prePage.data,
        voteInfo = preVoteInfo[term]
      preVoteSkuList[voteInfo.id].forEach(item => {
        item.skuSaleTime = item.skuSaleTime ? day(String(item.skuSaleTime)).format('MM月DD日') : ''
      })
      this.setData({
        from,
        term,
        voteInfo,
        voteSkuList: preVoteSkuList[voteInfo.id]
      })
      return
    }
    this.getVoteList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 投票
  doVoteFn: isLoginClick(function (e) {
    const {index} = e.currentTarget.dataset
    const {voteSkuList, pageNo, pageSize, from} = this.data
    const sku = voteSkuList[index]
    if(sku.skuStt == 60 || from == 'ht') return
    wx.vibrateShort()
    apiRequest.voteForFavoriteGood({
      id: sku.id,
      cid: sku.skuId,
      voteFlag: !sku.voteStatus
    })
    .then(res => {
      if(res.errCode == 0) {
        if(!sku.voteStatus) {
          wx.showToast({
            title: '投票成功',
            icon: 'none'
          })
        }
        // 获取当前页最新数据，替换旧数据
        this.getVoteList()
        return
      }
      wx.showToast({
        title: res.errMsg,
        icon: 'none'
      })
    })
  }),
  getVoteList() {
    const {pageNo, pageSize, historyFlag} = this.data
    apiRequest.queryVoteActivity({
      historyFlag,
      pageNo,
      pageSize
    }).then(res => {
      if(res.errCode == 0) {
        const {pageNo} = this.data
        const {voteInfo, voteSkuMap} = res.obj
        if(!voteInfo) return
        const latestVote = {
            ...voteInfo[0],
            beginTime: day(String(voteInfo[0].beginTime)).format('MM月DD日'),
            endTime: day(String(voteInfo[0].endTime)).format('MM月DD日')
          },
          voteSkuList = voteSkuMap[latestVote.id]
        // if((!voteSkuMap || voteSkuList.length == 0) && pageNo > 1) {
        //   this.data.pageNo--
        //   return
        // }
        voteSkuList.forEach(item => {
          item.skuSaleTime = day(String(item.skuSaleTime)).format('MM月DD日')
        })
        
        this.setData({
          voteSkuList: voteSkuList.sort(sortFn),
          voteInfo: latestVote,
        })
        function sortFn(a, b) {
          return b.voteNum - a.voteNum
        }
      }
    })
  },
  // getMoreFn() {
  //   this.data.pageNo++
  //   this.getVoteList()
  // },
  // 跳转往期投票
  goHistoryFn() {
    wx.navigateTo({
      url: '/pages/packageDiscover/voteHistory/voteHistory'
    })
  },
  goDetailFn: isLoginClick(function(e) {
    const {index} = e.currentTarget.dataset
    const {voteSkuList} = this.data
    const sku = voteSkuList[index]
    this._detailIndex = index // 当前查看的菜品指针
    const obj = {
      from: 'vote',
      id: sku.skuPk,
      type: 'detail'
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`
    })
  }),
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onShareAppMessage: function() {
    if(!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    return {
      title: '快来给你喜欢的菜品投票吧',
      imageUrl: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/vote_share.png',
      path: `/pages/packageDiscover/dishesVote/dishesVote`,
    }
  }
})