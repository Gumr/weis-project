// pages/packageDiscover/riceBall/riceBallList/riceBallList.js
import apiRequest from '../../../../service/index'
import day from '../../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: {
      pageNo: 1,
      pageSize: 10
    },
    selfInfo: {},
    preImg: 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood',
    riceBallList: [],
    ownRiceBall: {}, // 自己相关的饭团
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  queryRiceBallList() {
    const {
      page,
      preImg,
      selfInfo,
      totalPage
    } = this.data
    if (page.pageNo > totalPage) {
      this.data.page.pageNo--
      return
    }

    apiRequest.queryRiceBallList({
        pageNo: page.pageNo,
        pageSize: page.pageSize
      })
      .then(res => {
        const {
          score,
          totalPrice,
          riceRallRecord = null,
          riceRallInfoList: list
        } = res.obj
        if (riceRallRecord)
          riceRallRecord.trrActivityBTime = day(String(riceRallRecord.trrActivityBTime)).format('MM月DD日')
        list.forEach(item => {
          item.trrActivityBTime = day(String(item.trrActivityBTime)).format('MM月DD日')
          item.trrUrl = item.trrUrl ? item.trrUrl : preImg + '/riceball_fm.png'
        })
        this.setData({
          riceBallList: this.data.riceBallList.concat(list),
          ownRiceBall: {
            ...riceRallRecord,
            totalPrice,
            score,
            trrUrl: riceRallRecord.trrUrl ? riceRallRecord.trrUrl : preImg + '/riceball_fm.png'
          },
          hasOwnRiceBall: Boolean(riceRallRecord),
          totalPage: res.obj.pageCount
        })
      })
  },
  queryMoreRiceBall() {
    this.data.page.pageNo++
    this.queryRiceBallList()
  },
  establishFn() {
    wx.navigateTo({
      url: '/pages/packageDiscover/riceBall/establish/establish'
    })
  },
  detailFn(e) {
    const {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/packageDiscover/riceBall/riceBallDetail/riceBallDetail?trrrTrrId=${id}`
    })
  },
  queryUserInfo() {
    return new Promise(resolve => {
      apiRequest.queryUserInfo()
        .then(res => {
          if (res.errCode === 0) {
            this.setData({
              selfInfo: res.obj.userInfo
            })
            resolve()
          }
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
  onShow: async function () {
    this.data.page.pageNo = 1
    this.data.riceBallList = []
    if(Object.keys(this.data.selfInfo).length == 0) {
      await this.queryUserInfo()
    }
    this.queryRiceBallList()
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
    this.queryMoreRiceBall()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})