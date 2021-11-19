// pages/packageDiscover/riceBall/scoreDetail/scoreDetail.js
import apiRequest from '../../../../service/index'
const dayjs = require('../../../../libs/day')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: 0,
    tabname: {
      '01': '积分',
      '02': '饮食',
      '03': '体重',
      '04': '血糖',
      '05': '血压',
    },
    toView: '_0',
    tabs: [],
    userInfo: {
      uname: '吉他蝙蝠女侠'
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.$uid = options.uid
    this.$trrrId = options.trrrId
    this.$trrrTrrId = options.trrrTrrId
    await this.queryUserInfo()
    this.setData({
      uid: this.$uid,
      chiefUid: options.chiefUid,
      seeIndex: options.index // 当前积分人所在排名表中的索引
    }, () => {
      this.queryScore()
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
  // async switchTab(e) {
  //   const that = this
  //   const {
  //     index
  //   } = e.currentTarget.dataset
  //   this.setData({
  //     selectIndex: index,
  //     toView: `_${index}`
  //   })

  //   function selectorQuery(ele) {
  //     return new Promise(resolve => {
  //       const query = wx.createSelectorQuery().in(that)
  //       query.select(ele).selectViewport(res => {
  //         console.log(res);
  //       }).exec()
  //     })
  //   }
  // },
  preOperateFn() {
    this.setData({
      showConfirm: true
    })
  },
  // 团长解散饭团
  dismissRiceBall() {
    this.setData({
      showConfirm: false
    })
    let that = this
    apiRequest.createRiceBall({
      trrrUid: this.$uid,
      trrrId: this.$trrrId,
      trrrTrrId: this.$trrrTrrId,
      dataStt: '02',
      operationType: '04'
    }).then((res) => {
      if (res.errCode == 0) {
        // wx.navigateBack({
        //   delta: 2
        // })
        wx.redirectTo({
          url: `/pages/packageDiscover/riceBall/preRiceBall/preRiceBall`
        })
        // that.queryisjoin()
      }
    })
    // wx.showModal({
    //   title: '',
    //   content: '确定退出你的饭团吗?',
    //   confirmText: '确定',
    //   // showCancel: false,
    //   confirmColor: '#FE5E0F',
    //   success: function (res) {
    //     if (res.confirm) {
    //       apiRequest.changeMyRiceBall({
    //         trrrUid: that.data.uid,
    //         trrrId: that.data.trrrId,
    //         trrrTrrId: that.data.trrrTrrId,
    //         dataStt: '02'
    //       }).then((res) => {
    //         if (res.errCode == 0) {
    //           wx.redirectTo({
    //             url: `/pages/packageDiscover/riceBall/rules/rules`
    //           })
    //           // that.queryisjoin()
    //         }
    //       })
    //     }
    //   }
    // })
  },
  queryScore() {
    apiRequest.queryMyRiceBallRankDetail({
        trrrTrrId: this.$trrrTrrId,
        trrrUid: this.$uid
      })
      .then(res => {
        if (res.errCode === 0) {
          let tabs = []
          const {
            stringListMap
          } = res.obj
          const pages = getCurrentPages(),
            {
              groupInfo,
              myRank,
              rankList
            } = pages[pages.length - 2].data

          for (var key in stringListMap) {
            stringListMap[key].map(item => {
              item.time = dayjs(item.scoreTime).format('MM月DD日')
            })
            stringListMap[key].sort(function (a, b) {
              return b.scoreTime - a.scoreTime
            })
            tabs.push({
              name: this.data.tabname[key],
              score: stringListMap[key]
            })
          }
          this.setData({
            tabs,
            groupInfo,
            seeInfo: this.data.seeIndex == -1 ? myRank : rankList[this.data.seeIndex]
          }, () => {
            // console.log(this.data.seeInfo.uid, 'selfInfo', this.data.selfInfo.uid, 'groupInfo', this.data.groupInfo.uid);
          })
        }
      })
  },
  clear() {
    this.setData({
      tipDialog: true
    })
  },
  // 移出TA
  clearUser() {
    apiRequest.changeMyRiceBall({
      trrrUid: this.$uid,
      trrrId: this.$trrrId,
      trrrTrrId: this.$trrrTrrId,
      operationType: '03'
    }).then((res) => {
      if (res.errCode == 0 && res.obj.saveFlg) {
        wx.showToast({
          title: '移除成功',
          icon: 'none',
          complete: () => {
            wx.navigateBack()
          }
        })
      }
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