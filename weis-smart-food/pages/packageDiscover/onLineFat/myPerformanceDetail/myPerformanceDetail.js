import day from '../../../../libs/day';
import apiRequest from '../../../../service/index';

Page({


  data: {

    today: '',

  },


  onLoad: function (options) {
    let date = options.date
    this.setData({
      today: day(date).format('MM月DD日'),
      campId: options.campId,
      date:date
    })
    this.queryUserOnLineIncome(date)
    this.queryUserOnLineIncomeList(date)


  },
  queryUserOnLineIncome(date) {
    apiRequest.queryUserOnLineIncome({
      dateTime: date,
      campId: this.data.campId
    }).then(res => {
      if (res.errCode == 0) {
        this.setData({
          totalIncome: res.obj
        })

      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }

    })

  },
  queryUserOnLineIncomeList(date) {
    apiRequest.queryUserOnLineIncomeList({
      dateTime: date,
      campId: this.data.campId
    }).then(res => {
      this.setData({
        IncomeList: res.obj.incomeDetails || []
      })

    })

  },
  onReady: function () {

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
  this.queryUserOnLineIncome(this.data.date)
  this.queryUserOnLineIncomeList(this.data.daye)
  setTimeout(() => {
    this.refreshView.stopPullRefresh();
  }, 1000);
},


  onReachBottom: function () {

  },


  onShareAppMessage: function () {

  }
})