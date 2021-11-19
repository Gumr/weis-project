// pages/packageDiscover/dynamic/newsCenter/newsCenter.js
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: [
      {title: '我的动态', icon: 'https://prodstatic.weis1606.cn/api/smartFood/icon_new_dynamic@2x.png', url: '/pages/packageDiscover/dynamic/myDynamic/myDynamic' },
      {title: '我赞过', icon: 'https://prodstatic.weis1606.cn/api/smartFood/icon_new_like@2x.png', url: '/pages/packageDiscover/dynamic/myOrder/myOrder' },
      {title: '我的评论', icon: 'https://prodstatic.weis1606.cn/api/smartFood/icon_new_critic@2x.png', url: '/pages/packageDiscover/dynamic/myComment/myComment' },
    ],
    canPublish: wx.getStorageSync('canPublish')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.queryDynamicByType() // 动态列表数据
  },
  // 导航-点击
  navTap(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    });
  },
  // 动态列表数据
  queryDynamicByType() {
    apiRequest.queryDynamicByType({
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
      queryType: 'QUERY_LIKED_OR_COMMENTED_MY_DYNAMIC_TYPE',// 查询我那些被评论被人点赞或者评论的动态
    }).then((res) => {
      if (res.errCode === 0) {
        let regSign = /^#http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?#$/; // 包含#号url
        let reg = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/; // 不含#号url
        this.setData({
          dynamic: res.obj.fanCircleDynamicList.map(item => {
            item.sortTimeFilter = day(item.sortTime).format('YYYY.MM.DD'),
            item.tbdDynamicTextFilter = item.tbdDynamicText.length > 34 ? item.tbdDynamicText.slice(0, 34) + '~' : item.tbdDynamicText
            // 链接高亮可跳转
            // 包含#号，可能含有url
            if(item.tbdDynamicText.indexOf("#") != -1) {
              item.tbdDynamicTextArr = item.tbdDynamicText.split('#').filter(s => s && s.trim())
              item.tbdDynamicTextArr = item.tbdDynamicTextArr.map(item1 => {
                // 只有包含#号的url
                if(regSign.test(item.tbdDynamicText)) {
                  return {
                    text: item1,
                    isUrl: true
                  }
                } else {
                // 包含#号的url + 其他文字内容
                  return {
                    text: item1,
                    isUrl: reg.test(item1)
                  }
                }
              })
            }else {
              // 不含#号，没url
              item.tbdDynamicTextArr = [{
                text: item.tbdDynamicText,
                isUrl: false
              }]
            }
            return item
          }),
        })
      }
    })
  },
  // 动态详情
  dynamicDetail(e) {
    let { index } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/dynamicDetail/dynamicDetail?index=${index}`,
    });
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