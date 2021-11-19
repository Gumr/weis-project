// pages/mineBox/coupon/coupon.js
const app = getApp();
import apiRequest from '../../../service/index';
const util = require('../../../utils/util');
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //  01:已激活,02:已绑定,03:已兑换/已使用,04:已失效 后端卡券状态
    status: {
      '00': '未开始',
      '01': '正常',
      '02': '即将过期',
      '03': '已过期',
      '04': '已使用',
      '05': '卡券正常，不满足消费金额'
    },
    IMG_URL: app.globalData.IMG_URL,
    navHeight: wx.getSystemInfoSync().system.indexOf('iOS') > -1 ? 44 : 48, //状态栏高度,
    typeList: [{
      name: '优惠券',
      value: 0,
    }, {
      name: '维士红包',
      value: 1,
    }],
    typeValue: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from: options.from || '',
      price: options.price || '',
      existReserve: options.existReserve  || false,
      tcuStackable: options.tcuStackable || '',
      typeValue: options.from == 'redPacket' ? 1 : 0
    })
    if (options.price && options.from == 'coupon') {
      this.goodsIdArr = wx.getStorageSync('goodsIdArr');
    }
    this.queryCouponList()
    this.queryRedPacketByUser()
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
  // 导航栏
  cutType(e) {
    let {value} = e.currentTarget.dataset;
    if (value == this.data.typeValue) {
      return
    }
    this.setData({
      typeValue: value,
    })
  },
  // 优惠券
  queryCouponList: function () {
    var that = this;
    apiRequest.queryCouponList({
      stt: '01',//已激活
    })
      .then(res => {
        let existReserve = this.data.existReserve;
        let currentDate = new Date().getTime();
        let goodsIdArr = this.goodsIdArr || [];
        let skuArr = [];
        let couponUserVos = (res.obj.couponUserVos ? res.obj.couponUserVos : []).filter((item) => {
          return item.tcuStt != '03' //排除已使用
        });
        let price = that.data.price;
        couponUserVos.forEach((item, index) => {
          item.sTime = day(Number(item.tcuStime)).format('YYYY.MM.DD HH:mm');
          item.eTime = day(Number(item.tcuEtime)).format('YYYY.MM.DD HH:mm');
          item.tcaIntro = item.tcaIntro.split(';');
          item.tcuAmount = Number(item.tcuAmount);
          if (item.tcuUseType == '02') {
            skuArr = item.couponSys.map((v) => {
              return v.skuCid
            })
          }
          if (currentDate < item.tcuStime) {
            item.status = '00' //未开始
          } else if (currentDate > item.tcuEtime) {
            item.status = '03' //已过期
          } else {
            if (price && item.tcuUseType == '00' && (price < Number(item.tcuRestrictAmount) || price <= Number(item.tcuAmount) || (item.tcuOrderThreshold == '01' && !existReserve))) {
              // 普通券 不满足金额 或 预定券，不属于预订单
              item.status = '05'
            } else if (price && item.tcuUseType == '02' && (price < Number(item.tcuRestrictAmount) || price <= Number(item.tcuAmount) || !this.check(goodsIdArr,skuArr) || (item.tcuOrderThreshold == '01' && !existReserve))) {
              // 菜品券 不满足金额 或不存在卡券对应sku 或预定券，不属于预订单
              item.status = '05'
            }else if(item.tcuEtime - currentDate <= 24 * 60 * 60 * 1000){
              item.status = '02'//即将过期
            }else{
              item.status = '01'//正常
            }
          }
        })
        // 存在价格代表入口为订单结算页面，只显示 "01正常" & "02即将过期" & "05卡券正常，不满足消费金额" 否则 只显示 "01正常" & "02即将过期"
        that.setData({
          couponUserVos: price ? couponUserVos.filter((item) => {
            return item.status == '01' || item.status == '02' || item.status == '05'
          }) : couponUserVos.filter((item) => {
            return item.status == '01' || item.status == '02'
          })
        })
      })
      .catch(error => {

      })
  },
  // 红包
  queryRedPacketByUser: function () {
    var that = this;
    apiRequest.queryRedPacketByUser({
      stt: '00'
    })
      .then(res => {
        let currentDate = new Date().getTime();
        // let redPacketList = (res.obj.redPacketList ? res.obj.redPacketList : []).filter((item) => {
        //   return  ['00'].includes(item.stt) // stt 红包状态 00:未使用,01:使用中,02:已使用,03:已失效
        // });
        let redPacketList = res.obj.redPacketList ? res.obj.redPacketList : []
        let price = Number(that.data.price);
        let tcuStackable = this.data.tcuStackable;
        redPacketList.forEach((item, index) => {
          item.sTime = day(Number(item.stime)).format('YYYY.MM.DD HH:mm');
          item.eTime = day(Number(item.etime)).format('YYYY.MM.DD HH:mm');
          if(tcuStackable == 1 || (price && (currentDate < item.stime || currentDate > item.etime || price < Number(item.restrictAmount) || price < Number(item.amount)))) {
            item.status = '05'
            return
          }
          if(item.stime - currentDate <= 24 * 60 * 60 * 1000){
            item.status = '02'//即将过期
          }
        })
        that.setData({
          redPacketList
        })
      })
      .catch(error => {

      })
  },
  // 查询订单中是否包含菜品券中菜品
  check(goodsIdArr,skuArr) {
    let isInclude = false;
    for(var i = 0; i < skuArr.length; i++){
      if(goodsIdArr.indexOf(skuArr[i]) >= 0){
        isInclude = true;
        break;
      }
    }
    if (isInclude) {
      return true
    } else {
      return false
    }
  },

  // 使用规则
  use: function (e) {
    let {
      index,
      status
    } = e.currentTarget.dataset;
    // 05 卡券正常，不满足消费金额,点击无效
    if (status == '05') {
      return
    }
    wx.navigateTo({
      url: `/pages/mineBox/couponRule/couponRule?index=${index}&typeValue=${this.data.typeValue}`,
    });
  },
  // 查看失效券
  invalid: function () {
    wx.navigateTo({
      url: `/pages/mineBox/coupon-invalid/coupon-invalid?typeValue=${this.data.typeValue}`,
    });
  },
  // 去使用-优惠券
  goUseCoupon: function (e) {
    let {
      index,
      status
    } = e.currentTarget.dataset;
    // 05 卡券正常，不满足消费金额,点击无效
    if (status == '05') {
      return
    }
    let couponUserVos = this.data.couponUserVos;
    if (this.data.price) {
      if (couponUserVos[index].status != '01' && couponUserVos[index].status != '02') {
        return
      }
      let lastPage = getCurrentPages()[getCurrentPages().length - 2];
      lastPage.setData({
        coupon: couponUserVos[index]
      }, () => {
        wx.navigateBack({
          delta: 1
        });
      })
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
  // 去使用-红包
  goUseRedPacket: function (e) {
    let {
      index,
      status
    } = e.currentTarget.dataset;
    // 05 红包正常，不满足消费金额,点击无效
    if (status == '05') {
      return
    }
    let redPacketList = this.data.redPacketList;
    if (this.data.price) {
      if (redPacketList[index].stt != '00') {
        return
      }
      let lastPage = getCurrentPages()[getCurrentPages().length - 2];
      lastPage.setData({
        redPacket: redPacketList[index]
      }, () => {
        wx.navigateBack({
          delta: 1
        });
      })
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  toCoupon(e){
    let type = e.currentTarget.dataset.type;
    switch(type){
      case 'coupon':
        wx.navigateTo({
          url: '/pages/mineBox/coupon-center/coupon-center',
        });
        break;
      case 'redpacket':
        wx.navigateTo({
          url: '/pages/packageDiscover/signIn/signIn',
        });
        break;   
    }
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