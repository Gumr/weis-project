// pages/mineBox/operate/payStatus/payStatus.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      status: options.status || false, //true 成功 false 失败
      staffWeChat: options.staffWeChat || '',
      staffPhone: options.staffPhone || '',
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
  // 返回
  back(){
    const pages = getCurrentPages();
    const index = pages.findIndex(
      page => page.route === 'pages/mineBox/operate/operate/operate'
    );
    wx.navigateBack({
      delta: pages.length - index - 1
    });
  },
  // 重新支付
  rePay() {
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/mineBox/operate/operate/operate'
    );
    const lastpage = pages[index]
    // const lastpage = pages[pages.length - 2]
    //调用上一个页面中的pay方法
    lastpage.pay()
  },
  // 查看订单
  checkOrder(){
    wx.navigateTo({
      url: `/pages/mineBox/operate/operate/operate?boxtype=checkOrder`
    })
  },
  // 复制微信
  copyCode(e) {
    let code = e.currentTarget.dataset.code
    if(!code){
      return
    }
    wx.setClipboardData({
      data: code,
      success: function (res) {
        wx.showToast({
          title: '微信号复制成功'
        })
      }
    })
  },
  // 拨打
  call(e) {
    let number = e.currentTarget.dataset.number;
    if(!number){
      return
    }
    wx.makePhoneCall({
      phoneNumber: number + '',
    }).catch((e) => {
      // console.log(e)  //用catch(e)来捕获错误{makePhoneCall:fail cancel}
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
})