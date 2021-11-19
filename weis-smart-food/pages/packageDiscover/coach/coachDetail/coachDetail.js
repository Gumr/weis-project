// pages/packageDiscover/coach/coachDetail/coachDetail.js
import apiRequest from '../../../../service/index';
import { getStorage } from "../../../../utils/storage";
import day from "../../../../libs/day";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage("navStatusHeight"),
    px2rpx: app.globalData.px2rpx,
    personalDetail: [
      {sort: 1, name: '教练风采', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/coach_head.png'},
      {sort: 2, name: '专业证书', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/certificate.png'},
      {sort: 3, name: '学员案例', iconUrl: 'https://prodstatic.weis1606.cn/api/smartFood/case.png'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tcaId: options.tcaId
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
    this.queryCoachDetail()
  },
  // 教练专区-数据
  queryCoachDetail() {
    const { tcaId } = this.data;
    apiRequest.queryCoachDetail({
      tcaId
    }).then((res) => {
      if (res.errCode === 0) {
        const { coachDTO } = res.obj;
        this.setData({
          // coach: coachDTO
          coach: {
            ...coachDTO,
            star: coachDTO.star?coachDTO.star.toFixed(1):coachDTO.star,
            domain: coachDTO.domainList.join("·"),
            commentDTOList: coachDTO.commentDTOList.map(item => {
              item.ctime = day(item.ctime).format('YYYY.MM.DD')
              return item
            }),
            coachAddressList: coachDTO.coachAddressList.map(item => {
              item.tcaAddresList = item.tcaAddresList.join("")
              return item
            }),
            coachInstantiateList: coachDTO.coachInstantiateList.map(item => {
              item.weightLoss = parseFloat((item.tciDrillAfter - item.tciDrillBefore).toFixed(2))
              return item
            }),
          }
        })
      }
    })
  },
  // 预览图片
  previewImage() {
    const { coach } = this.data;
    wx.previewImage({
      urls: [coach.headImageUrl] // 需要预览的图片http链接列表
    })
  },
  previewImage2(e) {
    const { url, urllist } = e.currentTarget.dataset;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urllist // 需要预览的图片http链接列表
    })
  },
  // 教练风采 & 专业证书 & 学员案例
  personalDetail(e) {
    const { sort } = e.currentTarget.dataset;
    const { coach } = this.data;
    let url = ''
    switch (sort) {
      case 1:
        url = `/pages/packageDiscover/coach/coachScene/coachScene?dataList=${JSON.stringify(coach.coachImageUrlList)}`
        break;
      case 2:
        url = `/pages/packageDiscover/coach/certificate/certificate?dataList=${JSON.stringify(coach.qualificationImageUrlList)}`
        break;
      case 3:
        url = `/pages/packageDiscover/coach/case/case?dataList=${JSON.stringify(coach.coachInstantiateList)}`
        break;
    }
    wx.navigateTo({
      url
    });
  },
  // 服务地址-导航
  goMap(e) {
    const { name, address,  lat, lon} = e.currentTarget.dataset;
    wx.openLocation({
      name,
      address,
      latitude: Number(lat),
      longitude: Number(lon),
      scale: 18,
    });
  },
  // 课程详情
  courseDetail(e) {
    let { item } = e.currentTarget.dataset;
    let { coach } = this.data;
    let obj = {
      wechat: coach.wechat,
      phone: coach.phone,
    }
    wx.navigateTo({
      url: `/pages/packageDiscover/coach/courseDetail/courseDetail?detail=${JSON.stringify(item)}&coach=${JSON.stringify(obj)}`
    });
  },
  // 评价该教练
  comment() {
    const { coach } = this.data;
    wx.navigateTo({
      url: `/pages/packageDiscover/coach/comment/comment?tcaId=${coach.tcaId}`
    });
  },
  // 删除
  delete(e) {
    const { id, uid } = e.currentTarget.dataset;
    this.setData({
      showDelete: true,
      delParams: {
        id,
        uid
      }
    })
  },
  // 确定删除
  sureDelete() {
    const { delParams } = this.data;
    apiRequest.deleteComment({
      id: delParams.id,
      uid: delParams.uid
    }).then((res) => {
      if (res.obj.result !== 0) {
        this.queryCoachDetail()
        this.setData({
          showDelete: false,
        })
      }
    })
  },
  // 复制微信
  copyCode() {
    const { coach } = this.data;
    if(!coach.wechat){
      return
    }
    wx.setClipboardData({
      data: coach.wechat,
      success: function (res) {
        wx.showToast({
          title: '微信已复制'
        })
      }
    })
  },
  // 拨打
  call() {
    const { coach } = this.data;
    if(!coach.phone){
      return
    }
    this.setData({
      showCall: true
    })
  },
  // 确定拨打
  sureCall() {
    const { coach } = this.data;
    wx.makePhoneCall({
      phoneNumber: coach.phone + '',
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})