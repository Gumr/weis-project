
Page({

  
  data: {

  },

  
  onLoad: function (options) {
   
    this.setData({
      tgcaEmpId:options.tgcaEmpId,
      corpId:options.corpId,
      tgcaId:options.tgcaId,
      tgerole:options.tgerole,
      type:options.type // 自定义地址


    })

  },
  selChild() {
  if (this.data.tgcaEmpId>0 ) {
    wx.navigateTo({
      url:'/pages/mineBox/groupSelChild/groupSelChild?tgcaId='+ this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type
    })
  } else {   
    wx.navigateTo({
      url:'/pages/mineBox/groupSelectMeal/index?tgcaId=' + this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type+'&selchild=true&isshowchild=true&selType=01'
    })

  }
  },
  selTeacher() {
    wx.navigateTo({
      url:'/pages/mineBox/groupSelectMeal/index?tgcaId=' + this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type+ '&selType=02'
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

  
  onPullDownRefresh: function () {

  },

  
  onReachBottom: function () {

  },

  
  onShareAppMessage: function () {

  }
})