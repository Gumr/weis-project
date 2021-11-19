// pages/packageDiscover/dynamic/dynamicDetail/dynamicDetail.js
import apiRequest from '../../../../service/index';
import {
  loginPromise
} from '../../../../utils/common'
import day from '../../../../libs/day';
import {
  categoryMap
} from '../../../../utils/map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryMap,
    isAndriod: wx.getStorageSync('isAndriod'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //调用上一个页面中的数据
    const pages = getCurrentPages()
    const prepage = pages[pages.length - 2];
    let item = prepage.data.dynamic[options.index]
    // 获取子账号uid
    const {tsuSubUid} = wx.getStorageSync('subInfo')
    this.setData({
      item,
      tsuSubUid,
    })
    this.queryCommentListById()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    const { item } = this.data;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: item.picturesArr // 需要预览的图片http链接列表
    })
  },
  // 动态列表数据
  queryCommentListById() {
    let { item } = this.data;
    apiRequest.queryCommentListById({
      pageNO: 1,// 页数
      pageSize: 9999,// 长度
      dynamicId: item.tbdId,
      queryType: 'QUERY_DYNAMIC_COMMENTS_TYPE',
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          comments: res.obj.comments.map(item => {
            item.tbcCtimeFilter = day(item.tbcCtime).format('YYYY.MM.DD')
            return item
          })
        })
      }
    })
  },
  // 删除-动态
  deleteDynamic(e) {
    let { tbdid } = e.currentTarget.dataset;
    this.setData({
      showDeleteDynamic: true,
      tbdIdDelete: tbdid
    })
  },
  // 确定删除-动态
  sureDeleteDynamic() {
    apiRequest.delDynamic({
      dynamicId: this.data.tbdIdDelete
    }).then((res) => {
      if (res.errCode === 0) {
        this.setData({
          showDeleteDynamic: false
        })
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  // 删除-评价
  deleteEvaluate(e) {
    let { tbcid } = e.currentTarget.dataset;
    this.setData({
      showDeleteEvaluate: true,
      tbcidDelete: tbcid
    })
  },
  // 确定删除-评价
  sureDeleteEvaluate() {
    let { item, tbcidDelete } = this.data;
    apiRequest.delComment({
      dynamicId: item.tbdId, // 动态id
      commentId: tbcidDelete, // 评论id
    }).then((res) => {
      if (res.errCode === 0) {
        this.queryCommentListById()
        this.setData({
          showDeleteEvaluate: false,
        })
      }
    })
  },
  // 点赞
  order(e) {
    const { likestatus, tbdid } = e.currentTarget.dataset;
    let { item } = this.data;
    apiRequest.clickLikeButton({
      likeType: likestatus ? 'CANCEL_LIKE_DYNAMIC_TYPE' : 'LIKE_DYNAMIC_TYPE',
      bodyId: tbdid
    }).then((res) => {
      if (res.errCode === 0) {
        item.likeStatus = !item.likeStatus
        item.tbdLikeSum = item.likeStatus ? item.tbdLikeSum + 1 : item.tbdLikeSum - 1
        this.setData({
          item
        })
      }
    })
  },
  // 评论输入框点击
  inputTap() {
    this.setData({
      commentInputShow: true
    })
  },
  // 遮罩层
  mask() {
    this.setData({
      commentInputShow: false
    })
  },
  // 输入改变
  commentInput(e) {
    let { value } = e.detail;
    this.setData({
      comment: value
    })
  },
  // 输入完成
  commentConfirm(e) {
    let { value } = e.detail;
    if(!value.trim()) {
      return
    }
    this.addComment(value)
    this.setData({
      commentInputShow: false,
      comment: ''
    })
  },
  // 发表评论
  addComment(value) {
    let { item } = this.data;
    apiRequest.addComment({
      commentType: 'COMMENT_DYNAMIC_TYPE',
      dynamicId: item.tbdId,
      commentText: value
    }).then((res) => {
      if (res.errCode === 0) {
        this.queryCommentListById()
      }
    })
  },
  // 去到-营养健康分
  toHealthScore(e) {
    const {uid, oid} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageOrder/healthScore/healthScore?oid=${oid}&invite=${uid}`
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