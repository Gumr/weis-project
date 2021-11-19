import apiRequest from '../../service/index';
import { isLoginClick } from '../../utils/common'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 轮播
    currentSlideshow: 0,
    // tab标签
    tab: [],
    tabIndex: 0,
    // 减脂餐
    fat: []
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
    this.queryDietBanner()
    this.getMeal()
  },
  // 轮播
  queryDietBanner(hpidInfo) {
    apiRequest.queryDiscoverCarousel({
      type: '04'
    }).then((res) => {
      this.setData({
        dietBanners: res.obj.discoverCarousels || []
      })
    })
  },
  slideshowChange(evt) {
    this.setData({
      currentSlideshow: evt.detail.current
    })
  },
  // 轮播-点击
  slideshowTap: isLoginClick(function(e) {
    const { url, type } = e.currentTarget.dataset;
    if (type == '01' || type == '04') {
      tt.navigateTo({
        url,
        fail() {
          tt.switchTab({
            url
          })
        }
      })
    } else if (type == '02') {
      tt.navigateTo({
        url: `/pages/packOne/webview/webview?url=${url}`
      })
    }
  }),
  // 获取套餐包列表
  getMeal(hpidInfo) {
    apiRequest.listQueryCombinationPackageGroupByType().then((res) => {
      if(res.errCode == 0) {
        let {result} = res.obj;
        this.setData({
          tab: result.map(item => item.tdps_name),
          meal: result || [],
        })
      }
      
    })
  },
  // 标签切换
  tabTap(e) {
    let { index } = e.currentTarget.dataset;
    let { tabIndex } = this.data;
    if (index == tabIndex) {
      return
    }
    this.setData({
      tabIndex: index,
    })
  },
  // 详情
  detail: function(e) {
    let { tdpid } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/packOne/goodsDetail/goodsDetail?tdpid=${tdpid}`
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});