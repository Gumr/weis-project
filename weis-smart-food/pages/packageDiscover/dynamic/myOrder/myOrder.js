// pages/packageDiscover/dynamic/myOrder/myOrder.js
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
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
    this.isOrderClick = true; // 是否“点赞”可点击，控制频繁点赞
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
  // 动态列表数据
  queryDynamicByType() {
    apiRequest.queryDynamicByType({
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
      queryType: 'QUERY_MY_LIKED_DYNAMIC_TYPE',// 查询我赞过的动态
    }).then((res) => {
      if (res.errCode === 0) {
        let regSign = /^#http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?#$/; // 包含#号url
        let reg = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/; // 不含#号url
        this.setData({
          dynamic: res.obj.fanCircleDynamicList.map(item => {
            item.tbdCtimeFilter = day(item.tbdCtime).format('YYYY.MM.DD')
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
        }, () => {
          this.isOrderClick = true; // 点赞结果返回，才可再次点赞
        })
      }
    })
  },
  // 链接点击
  linkTap(e) {
    let { item1 } = e.currentTarget.dataset;
    if(item1.isUrl) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${item1.text}`,
      });
    }
  },
  // 动态详情
  dynamicDetail(e) {
    let { index } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageDiscover/dynamic/dynamicDetail/dynamicDetail?index=${index}`,
    });
  },
  // 点赞
  order(e) {
    if(!this.isOrderClick) {
      return
    }
    this.isOrderClick = false;
    const { likestatus, tbdid } = e.currentTarget.dataset;
    apiRequest.clickLikeButton({
      likeType: likestatus ? 'CANCEL_LIKE_DYNAMIC_TYPE' : 'LIKE_DYNAMIC_TYPE',
      bodyId: tbdid
    }).then((res) => {
      if (res.errCode === 0) {
       this.queryDynamicByType()
      }
    })
  },
  // 删除
  delete(e) {
    let { tbdid } = e.currentTarget.dataset;
    this.setData({
      showDelete: true,
      tbdIdDelete: tbdid
    })
  },
  // 确定删除
  sureDelete() {
    apiRequest.delDynamic({
      dynamicId: this.data.tbdIdDelete
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          showDelete: false
        })
        this.queryDynamicByType()
      }
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