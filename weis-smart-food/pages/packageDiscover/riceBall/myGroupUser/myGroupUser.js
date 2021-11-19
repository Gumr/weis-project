import apiRequest from '../../../../service/index'
import day from '../../../../libs/day';
Page({


  data: {
    trrrTrrId: null,
    riceRallRecordInfoList: [],
    tipDialog: false

  },
  onLoad: function (options) {
    console.log(options.riceRallRecordBeans);
    const pages = getCurrentPages()
    const page = pages.find(item => item.route.includes('riceBallDetail/riceBallDetail' || 'fail/fail'))
    let riceRallRecordBeans = page.data.riceRallRecordBeans

    riceRallRecordBeans.map(item => {
      item.reportTime = String(item.reportTime).substring(4, 6) + '月' + String(item.reportTime).substring(6, 8) + '日';
      return item
    })
    this.setData({
      trrrTrrId: options.trrrTrrId || null,
      riceRallRecordInfoList: riceRallRecordBeans,
      isLeader: options.isLeader,
      type: options.type || false // 上级页是否是创建失败页面
    })

  },
  exit(e) {
    let trrrUid = e.currentTarget.dataset.uid
    let trrrId = e.currentTarget.dataset.trrid
    let uindex = e.currentTarget.dataset.uindex
    this.setData({
      tipDialog: true,
      trrrUid: trrrUid,
      trrrId: trrrId,
      uindex: uindex
    })

  },
  clearUser() {
    apiRequest.changeMyRiceBall({
      trrrUid: this.data.trrrUid,
      trrrId: this.data.trrrId,
      trrrTrrId: this.data.trrrTrrId,
      dataStt: '01'
    }).then((res) => {
      if (res.errCode == 0) {
        this.data.riceRallRecordInfoList.splice(this.data.uindex, 1)
        this.setData({
          riceRallRecordInfoList: this.data.riceRallRecordInfoList
        })
      }
    })
  },
  onShow: function () {

  },

  onShareAppMessage: function () {

  }
})