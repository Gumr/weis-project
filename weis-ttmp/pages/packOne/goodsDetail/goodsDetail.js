// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\packOne\goodsDetail\goodsDetail\goodsDetail.js
import apiRequest from '../../../service/index';
import { isLoginClick } from '../../../utils/common'
Page({
  data: {
    // 轮播
    currentSlideshow: 0,
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/index/',
  },
  onLoad: function (options) {
    this.setData({
      tdpid: options.tdpid
    })
  },
  onShow: function () {
    // 判断登录
    const loginInfo = tt.getStorageSync('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin;
    this.setData({
      isLogin
    })
    this.queryCombinationPackageDetailById()
  },
  slideshowChange(evt) {
    this.setData({
      currentSlideshow: evt.detail.current
    })
  },
  // 根据id查询套餐包详情
  queryCombinationPackageDetailById() {
    let { tdpid } = this.data;
    apiRequest.queryCombinationPackageDetailById({
      id: tdpid
    }).then((res) => {
      this.setData({
        mealDetail: res.obj || []
      })
    })
  },
  // // 分享
  share: isLoginClick(function() {

  }),
  // // 客服
  contact: isLoginClick(function() {

  }),
  // 立即购买
  buy: isLoginClick(function() {
    let { tdpid ,mealDetail } = this.data;
    tt.navigateTo({
      url: `/pages/packOne/submit/submit?tdpid=${tdpid}&dayNum=${mealDetail.tdp_days_num}&mealNum=${mealDetail.tdp_meals_num}`
    });
  }),
  onShareAppMessage: function (res) {
    let { tdpid, mealDetail } = this.data;
    return {
      title: mealDetail.tdp_name,
      path: `/pages/packOne/goodsDetail/goodsDetail?tdpid=${tdpid}`,
    }
  }
})