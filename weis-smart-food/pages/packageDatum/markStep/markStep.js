import requests from '../../../service/index'
import day from '../../../libs/day'
import { promisify, loginPromise } from '../../../utils/common'
Page({
  data: {
    showWhite: true,
    steps: []
  },
  onLoad() {
    loginPromise.then((res) => {
      this.$wxSessionKey = res.wxSessionKey;
    })
    this.$pageNo = 1;
    this.getUserStepList();
  },
  onReady() {
    this.refreshView = this.selectComponent('#refresh-view')
  },
  chartTap() {
    if (this.data.steps.length <= 0) {
      wx.showToast({
        title: '未有记步数据',
        icon: 'none'
      })

      return;
    }
    wx.navigateTo({
      url: '/pages/packageDatum/bodyLine/bodyLine?type=step',
      success: ({ eventChannel }) => {
        eventChannel.emit('data', this.data.steps)
      }
    })
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
  onPullDownRefresh: function () {
    wx.getWeRunData({
      success: (res) => {
        requests.getRunData({
          sessionKey: this.$wxSessionKey,
          encryptedData: res.encryptedData,
          iv: res.iv
        }).then((runRes) => {
          if (runRes.errCode === 0) {
            this.$pageNo = 1
            this.getUserStepList();
          }
        })
      },
    });
    setTimeout(() => {
      this.refreshView.stopPullRefresh();
    }, 1000);
  },
  getUserStepList() {
    return requests.getUserStepList({
      pageNo: this.$pageNo,
      pageSize: 12
    }).then((res) => {
      if (res.errCode === 0) {
        const stepInfoList = res.obj.stepInfoList.map(step => {
          const date = day(String(step.date));
          step.$date = date.format('MM月DD日')
          step.date = date.format('YYYYMMDD')
          step.value = step.step;
          return step;
        })

        const steps = this.$pageNo <= 1 ? stepInfoList : this.data.steps.concat(stepInfoList);
        this.setData({
          steps,
          showWhite: steps.length <= 0
        })
      }
    })
  },
  onReachBottom() {
    this.$pageNo += 1;
    this.getUserStepList();
  }
})