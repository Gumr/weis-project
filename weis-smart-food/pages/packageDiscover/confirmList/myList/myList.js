import apiRequest from '../../../../service/index'
import day from '../../../../libs/day'
Page({


  data: {
    corpOrderSignBeans: [],
    pageSize: 10,
    pageNo: 0,
    more:true

  },


  onLoad: function (options) {
   

  },
  queryList() {
   
    if (this.data.more == false) {
      return
    }
    this.data.pageNo++

    apiRequest
      .queryCorpOrderList({
        pageNo:this.data.pageNo,
        pageSize:this.data.pageSize
      })
      .then(res => {
        if (res && res.errCode === 0) {
          

          let corpOrderSignBeans = res.obj.corpOrderSignBeans
          let lastdate = this.data.corpOrderSignBeans.length>0?this.data.corpOrderSignBeans.slice(-1)[0].orderDate : 0;         
          corpOrderSignBeans.forEach(item => {
            if (item.orderDate == lastdate) {
              item.isshowdate= true
            }
            item.orderDate2 = day(item.orderDate).format('MM月DD日');
           
          });

          if (res.obj.pageCount == this.data.pageNo) {
            this.setData({
              more: false
            })
          }
          this.setData({
            corpOrderSignBeans: this.data.corpOrderSignBeans.concat(corpOrderSignBeans)
          })
        }
      });
  },

  onShow: function () {
    this.setData({
      corpOrderSignBeans:[],
      more:true,
      pageNo:0,
    })
    this.queryList()
  },

  /*
   * 订单签收详情
   */
  toresever(e) {
    let { corpAddressId, orderDate, uid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/packageDiscover/confirmList/myListDetail/myListDetail?corpAddressId=${corpAddressId}&orderDate=${orderDate}&uid=${uid}`,
    });

  },


  onReachBottom: function() {
    this.queryList()

  },

  onShareAppMessage: function () {

  }
})