const util = require('../../../utils/util')
import {
  round,
  genDispatchTag,
  filterTablewareSku
} from '../../../utils/common'
import {
  orderStatusMap,
  categoryMap
} from '../../../utils/map'
import day from '../../../libs/day'
import apiRequest from "../../../service/index";

// pages/mineBox/fatPackOrder/fatPackOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    orderTransferMap: [],
    loading: true,
    status: {
      '00': '待付款',
      '01': '已支付',
      '02': '处理中',
      '03': '已退款',
      '04': '已退款',
      '05': '待配送/待取餐',
      '06': '配送中',
      '07': '配送异常',
      '08': '异常取消',
      '09': '已失效',
      '10': '已签收',
      '99': '已删除',
      '14': '已收货',
    },
    handleStt: {
      '02': '退款中',
      '11': '退款关闭',
      '03': '退款成功',
    },
    stt: 'all',
    cart: {
      '00': '全部',
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐',
    },
    more: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      activityId: options.fatPackId,
      title: options.title
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
    this.queryShipListLimit()
      .then(() => {
        this.setData({
          loading: false
        })
      })
      .catch(() => {
        this.setData({
          loading: false
        })
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

  },

  handleCategory(category, date) {
    category.num = category.dietOrderDetailList.reduce((num, or) => {
      num += Number(or.num)
      return num
    }, 0)
    category.pieData = [{ // 处理生成饼图用的数据
      key: 'fatRatio',
      color: '#18C5C1'
    }, {
      key: 'carbonRatio',
      color: '#EEEEEE',
    }, {
      key: 'proteinRatio',
      color: '#FE5E0F'
    }].map((it) => {
      it.value = category.stringMap[it.key]
      return it
    }).filter((it) => Boolean(it.value))

    return category
  },
  queryShipListLimit() {
    return apiRequest.queryOrderListForThree({
      pageSize: 999,
      pageNo: 1,
      activityId: this.data.activityId,
      isNeedFatPack: '01'
    }).then((res) => {
      if (res.errCode === 0) {
        let orderTransferMap = (res.obj && res.obj.orderTransferMap) || [];
        orderTransferMap.forEach((item1) => {
          item1.orderSttText = orderStatusMap(item1.orderStt, item1.distributionMode, item1.subStt || undefined)
          item1.dateText = day(item1.date).format('MM月DD日');
          item1.psText = genDispatchTag(item1.shipWithCold, item1.deliveryFrequency, item1.distributionMode)
          item1.dietOrderResult.forEach((item2) => {
            item2.dietOrderDetailList = filterTablewareSku(item2.dietOrderDetailList);
            item2.totalPrice = round(item2.totalPrice, 2)
            // 当餐数据
            this.handleCategory(item2)
          })
        })
        this.setData({
          orderTransferMap,
        })
      }
    })

  },

  orderDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/packageOrder/orderDetail/orderDetail?id=' + id
    });
  },

})