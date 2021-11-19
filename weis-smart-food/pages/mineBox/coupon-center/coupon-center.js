// pages/mineBox/coupon-center/coupon-center.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  isLoginClick,round, loginPromise, saveUseLog
} from '../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map:{
      '01': '已抢完',
      '02': '热抢中',
      '03': '即将开始',
    },
    selectIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryDiscoverCarousel();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.refreshView = this.selectComponent('#refresh-view')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    loginPromise.then(()=>{
      this.queryActivityCouponForCentre()
    })
  },

  queryDiscoverCarousel(){
    apiRequest.queryDiscoverCarousel({
      type: '03'
    }).then((res) => {
      this.setData({
        imgUrls: res.obj && res.obj.discoverCarousels || []
      })
    })
  },

  slideshowTap: isLoginClick(function (e) {
    const {
      url, type, id
    } = e.currentTarget.dataset;
    if(type == '01' || type == '02'){
      saveUseLog('03', id, '02');
    }
    if (type == '01') {
      wx.navigateTo({
        url,
        fail() {
          wx.switchTab({
            url
          })
        }
      })
    } else if (type == '02') {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${url}`
      })
    }
  }),

  select(e){
    let selectIndex = this.data.selectIndex;
    let index = e.currentTarget.dataset.index;
    if(index == selectIndex){
      return
    }
    this.setData({
      selectIndex: index
    })
  },

  queryActivityCouponForCentre() {
    apiRequest.queryActivityCouponForCentre({

    }).then((res) => {
      if (res.errCode === 0) {
        let infoVoResponseList = res.obj.infoVoResponseList || [];
        let curHour = day().format('H');
        infoVoResponseList.forEach((item1,index1)=>{
          item1.couponUsers.forEach((item2,index2)=>{
            item2.tcuEtime = day(Number(item2.tcuEtime)).format('YYYY.MM.DD HH:mm');
            item2.tcuAmount = round(item2.tcuAmount, 0);
            if(item1.couponActivityStt != '03'){
              item2.percent = `${round((item2.tcaNumTotal - item2.curCouponNum)/item2.tcaNumTotal * 100, 0)}%`
            }
          })
          if(!this.data.infoVoResponseList && curHour >= item1.startTime && curHour < item1.endTime){
            this.setData({
              selectIndex: index1
            })
          }
        })
        this.setData({
          infoVoResponseList
        })
      }
    })
    // 判断是否是今天
    function isToday(date) {
      return day(date).format('YYYY/MM/DD') === day().format('YYYY/MM/DD')
    }
  },

  // 领取
  receive: isLoginClick(function (e) {
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s', 'Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'],
      success(res) {
        that.getActivityCoupon(e)
      },
      fail(res) {
        that.getActivityCoupon(e)
      }
    })
  }),

  getActivityCoupon(e) {
    let couponUsers = this.data.infoVoResponseList[this.data.selectIndex].couponUsers;
    let {
      index
    } = e.currentTarget.dataset;
    apiRequest.getActivityCoupon({
      activityType: '06', // 06领券中心，默认05
      // activityCode: code,
      couponRecordId: couponUsers[index].tcuId,
    }).then((res) => {
      if (res.obj && res.obj.couponUsers.length > 0) {
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        this.queryActivityCouponForCentre();
      }
    })
  },
  // 去使用
  goUse() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  
  // 提醒我
  remind: isLoginClick(function(e){
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s', 'Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'],
      success(res) {
        if(res['SzBXGFlK7fUely6WFn0ybRLeY69Q1RGQQaiEO6m9D4s'] == 'accept' || res['Py6z4SSzwOVYfXhN6UnaOc9tcgwD9MPZM0r1RIkaVuA'] == 'accept'){
          that.setCouponReminderNotice(e)
        }
      },
      fail(res) {
        // that.setCouponReminderNotice(e)
      }
    })
  }),

  setCouponReminderNotice(e){
    let couponUsers = this.data.infoVoResponseList[this.data.selectIndex].couponUsers;
    let {
      index
    } = e.currentTarget.dataset;
    apiRequest.setCouponReminderNotice({
      tcuId: couponUsers[index].tcuId
    }).then((res) => {
      if (res.errCode === 0) {
        wx.showToast({
          title: '成功~~~',
          icon: 'success',
        }); 
      }
    })
  },

  rule(e){
    let index = e.currentTarget.dataset.index;
    let selectIndex = this.data.selectIndex;
    let couponUserVos = this.data.infoVoResponseList[selectIndex].couponUsers;
    couponUserVos.forEach((item)=>{
      item.sTime = day(Number(item.tcuStime)).format('YYYY.MM.DD HH:mm');
      item.eTime = item.tcuEtime
    })
    this.setData({
      couponUserVos,
    })
    wx.navigateTo({
      url: `/pages/mineBox/couponRule/couponRule?index=${index}`,
    });
  },

  //触摸开始
  handletouchstart: function (event) {
    this.refreshView.handletouchstart(event);
  },
  //触摸移动
  handletouchmove: function (event) {
    this.refreshView.handletouchmove(event);
  },
  //触摸结束
  handletouchend: function (event) {
    this.refreshView.handletouchend(event);
  },
  //触摸取消
  handletouchcancel: function (event) {
    this.refreshView.handletouchcancel(event);
  },

  onPullDownRefresh: function () {
    this.queryActivityCouponForCentre();
    setTimeout(() => {
      this.refreshView.stopPullRefresh();
    }, 1000);
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