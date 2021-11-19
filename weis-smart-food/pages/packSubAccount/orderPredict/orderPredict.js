// pages/packSubAccount/orderPredict/orderPredict.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day';
const util = require('../../../utils/util');
import {loginPromise,} from '../../../utils/common'
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
    loginPromise.then((res) => {
      this.setData({
        type: options.type
      })
      if(this.data.type == '00'){
        // 预测单
        this.queryForecastOrder();
      }else if(this.data.type == '01'){
        // 下单统计
        this.queryBuyOrder()
      }else if(this.data.type == '02'){
        // 菜品售卖时间报告
        this.querySkuByPastDue()
      }
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

  queryForecastOrder(){
    apiRequest.queryForecastOrder({

    }).then((res)=>{
      let list = (res.obj && res.obj.data) || [];
      list.forEach((item,index)=>{
        item.comboInfo.forEach((item2,index2)=>{
          item2.weekInfo.forEach((item3,index3)=>{
            item3.forecastDate = day(item3.forecastDate).format('MM.DD');
            item3.week = util.Arabia_To_SimplifiedChinese(Number(item3.week));
          })
        })
      })
      this.setData({
        list,
        title: (res.obj && res.obj.title) || '',
        notForecast: (res.obj && res.obj.notForecast) || []
      })
    })
  },

  // 下单统计
  queryBuyOrder(){
    apiRequest.queryBuyOrder({

    }).then((res)=>{
      let list = (res.obj && res.obj.data) || [];
      this.setData({
        eatDate: (res.obj && day(res.obj.eatDate).format('MM月DD日')) || '',
        list,
        title: res.obj && res.obj.title,
        notForecast: (res.obj && res.obj.notForecast) || []
      })
    })
  },

  // 菜品售卖时间报告
  querySkuByPastDue(){
    apiRequest.querySkuByPastDue({

    }).then((res)=>{
      this.setData({
        comboData: res.obj.comboData || [],
        douData: res.obj.douData || [],
        skuData: res.obj.skuData || [],
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

  }
})