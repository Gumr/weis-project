import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
Page({


  data: {
    showtips: false,
    totalIncome: '',
    IncomeList: []

  },


  onLoad: function (options) {

    this.setData({
      campId: options.campId,
      campDiscount:options.campDiscount
    })
    this.queryUserOnLineIncome()
    this.queryUserOnLineIncomeList()

  },
  showusertips() {
    this.setData({
      showtips: true
    })

  },
  queryUserOnLineIncome() {
    apiRequest.queryUserOnLineIncome({
      campId: this.data.campId
    }).then(res => {
      if (res.errCode == 0) {
       
        let actratio = res.obj.royaltyRatio+Number(this.data.campDiscount)
        this.setData({
          totalIncome: res.obj,
          actratio:actratio
        })

      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }

    })

  },
  queryUserOnLineIncomeList() {
    apiRequest.queryUserOnLineIncomeList({
      campId: this.data.campId
    }).then(res => {
      let IncomeList = res.obj.incomeDetails || [];
      IncomeList.forEach((item) => {
        item.dateTime = day(String(item.dateTime)).format('YYYY/MM/DD')
      })
      this.setData({
        IncomeList: IncomeList
      })

    })

  },
  myPerformanceDetail(e) {
    let date = day(e.currentTarget.dataset.mydate).format('YYYYMMDD')
    wx.navigateTo({
      url: '/pages/packageDiscover/onLineFat/myPerformanceDetail/myPerformanceDetail?date=' + date + '&campId=' + this.data.campId,
    });
  },


  onReady: function () {
    this.refreshView = this.selectComponent('#refresh-view')

  },


  onShow: function () {

  },


  onHide: function () {

  },


  onUnload: function () {

  },

//触摸开始
handletouchstart: function (event) {

  this.refreshView.handletouchstart(event);
},
//触摸移动
handletouchmove: function (event) {
  this.refreshView.handletouchmove(event);
},
//触摸结束
handletouchend: function (event) {
  this.refreshView.handletouchend(event);
},
//触摸取消
handletouchcancel: function (event) {
  this.refreshView.handletouchcancel(event);
},
//页面滚动
onPageScroll: function (event) {
  this.refreshView.onPageScroll(event);
},

/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
onPullDownRefresh: function () {
  this.queryUserOnLineIncome()
  this.queryUserOnLineIncomeList()
  setTimeout(() => {
    this.refreshView.stopPullRefresh();
  }, 1000);
},



  onReachBottom: function () {

  },


  onShareAppMessage: function () {

  }
})