
import apiRequest from "../../../service/index";
const app = getApp();
var location = require('../../../libs/location');
var utils = require('../../../utils/week-utils.js');
var util = require('../../../utils/util');
import day from '../../../libs/day'
import {
  getStorage, setStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekText: ['日', '一', '二', '三', '四', '五', '六'],
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    circleWidth: parseInt((128 / 750) * wx.getSystemInfoSync().windowWidth), //圆环转成px宽度,
    category: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
    },
    status: {
      '01': '未支付',
      '04': '已失效',
      '14': '已完成'
    },
    allSelect: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let options = {id:100000,targetUid: 100008,counselorId: 100031,}
    this.setData({
      complete: options.complete ? options.complete : false,
      planType: getStorage('planType')
    })
    this.scrollHeight();
    let { id, targetUid, counselorId } = options;
    this.id = id;
    this.targetUid = targetUid;
    this.counselorId = counselorId;
    this.queryHpid();
    this.init();
    this.queryCurrUserCounselor();
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

  queryHpid: function () {
    var that = this;
    that.checkLat(function () {
      that.queryHpidList(app.globalData.lat, app.globalData.lon)
    })
  },

  // 查询经纬度
  checkLat: function (callBack) {
    var that = this;
    if (app.globalData.lat && app.globalData.lon) {
      callBack()
    } else {
      location.getCity(function (res) {
        app.globalData.lat = res.latitude;
        app.globalData.lon = res.longitude;
        callBack()
      })
    }
  },

  queryHpidList: function (lat, lon) {
    var that = this;
    apiRequest.heatingPointListForRange({
      userLat: lat,
      userLng: lon,
      key: '5'
    })
      .then(res => {
        let hpidList = res.obj.queryHeatingPoints;
        let hpidArr = hpidList.map((v) => {
          return v.id
        })
        that.hpidList = hpidList;
        that.hpidArr = hpidArr;
      })
      .catch(error => {

      })
  },

  scrollHeight: function () {
    // 减去状态栏高度 减去上部高度
    let navStatusHeight = wx.getStorageSync('navStatusHeight')
    let mobileInfo = wx.getSystemInfoSync();
    let ratio = 750 / mobileInfo.windowWidth;
    let tabHeight = 88 / ratio;
    let scrollHeight = mobileInfo.windowHeight - navStatusHeight - tabHeight;
    this.setData({
      scrollHeight
    })
  },

  queryCurrUserCounselor: function () {
    var that = this;
    apiRequest.queryCurrUserCounselor({
    })
      .then(res => {
        if (res.obj && res.obj.counselorInfo) {
          let counselorInfo = res.obj.counselorInfo;
          that.setData({
            counselorInfo
          })
        }
      })
      .catch(error => {

      })
  },

  init: function () {
    var that = this;
    apiRequest.queryReplaceRelationDetail({

      targetUid: that.targetUid,
      counselorId: that.counselorId,
      rrid: that.id

    })
      .then(res => {
        let categoryList = ['01', '02', '03'];
        let planDetails = res.obj.planDetails;
        let resList = res.obj.resList;
        let allCategoryNum = 0;
        let allDay = 0;
        resList.forEach((item1, index1) => {
          let dayPrice = 0;//当天总价
          item1.detailList.forEach((item2, index2) => {
            item2.heatPoint.forEach((item3, index3) => {
              let actualCarbonwater = 0;//实际碳水
              let actualProtein = 0;//实际蛋白质
              let actualFat = 0;//实际脂肪
              let actualEnergy = 0;//实际能量
              let allNum = 0;//总件数
              let allPrice = 0;//当餐总价格
              item3.detailMapList.forEach((item4, index4) => {
                actualCarbonwater = actualCarbonwater + item4.carbonwater * item4.num;
                actualProtein = actualProtein + item4.protein * item4.num;
                actualFat = actualFat + item4.fat * item4.num;
                actualEnergy = actualEnergy + item4.energy * item4.num;
                allNum = allNum + item4.num;
                allPrice = allPrice + item4.num * item4.price;
                dayPrice = dayPrice + item4.num * item4.price;
              })
              item3.actualCarbonwater = actualCarbonwater.toFixed(1);
              item3.actualProtein = actualProtein.toFixed(1);
              item3.actualFat = actualFat.toFixed(1);
              item3.actualEnergy = parseInt(actualEnergy);
              // 计划碳水
              item3.planCarbonwater = planDetails[index1].planDetailList[categoryList.indexOf(item2.category)].carbohydrateTotal;
              // 计划蛋白质 calculationMethod 01 综合
              item3.planProtein = planDetails[index1].dietPlan.calculationMethod == '01' ? planDetails[index1].planDetailList[categoryList.indexOf(item2.category)].proteinTotal : planDetails[index1].planDetailList[categoryList.indexOf(item2.category)].fixedProteinTotal;
              // 计划脂肪
              item3.planFat = planDetails[index1].planDetailList[categoryList.indexOf(item2.category)].fatTotal;
              // 计划能量
              item3.planEnergy = planDetails[index1].planDetailList[categoryList.indexOf(item2.category)].totalKcal;
              item3.allNum = allNum;
              item3.allPrice = allPrice.toFixed(2);
              // 餐别状态
              item3.dataStt = item3.detailMapList[0].dataStt;
              // 总共餐量
              allCategoryNum++
            })
          })
          allDay++
          item1.dayPrice = dayPrice.toFixed(2);
        })
        that.setData({
          resList,
          allDay,
          allCategoryNum
        }, () => {
          that.allChecked();
        })
      })
      .catch(error => {

      })
  },

  allChecked: function (e) {
    console.log(e)
    if (this.data.complete) {
      return
    }
    let allSelect = e ? !this.data.allSelect : this.data.allSelect;
    let resList = this.data.resList;
    resList.forEach((item, index) => {
      item.checked = allSelect ? true : false
    })
    this.setData({
      allSelect,
      resList
    })
  },

  selectDate: function (e) {
    let index = e.currentTarget.dataset.index;
    let resList = this.data.resList;
    resList[index].checked = !resList[index].checked;
    let allSelect = true;
    for (var i = 0; i < resList.length; i++) {
      if (!resList[i].checked) {
        allSelect = false;
        break
      }
    }
    this.setData({
      allSelect,
      resList
    })
  },

  // 反转数据
  overturnReplaceRelation(e) {
    var that = this;
    let dateList = [];
    let resList = this.data.resList;
    let type = e.currentTarget.dataset.type;
    let dateIndex = '';
    resList.forEach((item, index) => {
      if (item.checked) {
        dateList.push(item.date)
        if (dateIndex === '') {
          dateIndex = index
        }
      }
    })
    if (dateList.length == 0) {
      wx.showToast({
        title: type == 'edit' ? '请选择要修改商品' : '请选择结算商品',
        icon: 'none',
      });
      return
    }
    let overDate = false;

    for (var i = 0; i < dateList.length; i++) {
      if (day(dateList[i]).format("YYYY/MM/DD") <= day().format("YYYY/MM/DD")) {
        overDate = true;
        break
      }
    }

    if (overDate) {
      wx.showToast({
        title: '订单中不能包含当天及之前日期',
        icon: 'none',
      });
      return
    }

    apiRequest.overturnReplaceRelation({

      targetUid: that.targetUid,
      counselorId: that.counselorId,
      rrid: that.id,
      dateList: dateList,

    })
      .then(res => {
        if (res.errCode == '1009') {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
          return
        }
        if (type == 'edit') {
          let replaceOrder = [];
          resList.forEach((item1) => {
            if (item1.checked) {
              item1.detailList.forEach((item2, index2) => {
                let d = {};
                d.date = day(item1.date).format("YYYY/MM/DD");
                d.year = item1.date.substring(0, 4);
                d.month = item1.date.substring(4, 6);
                d.day = item1.date.substring(6, 8);
                d.categoryType = item2.category;
                d.hpid = item2.heatPoint[0].hpid;
                d.hpName = item2.heatPoint[0].hpName;
                d.selfTaking = item2.heatPoint[0].selfTaking;
                d.addressId = item2.heatPoint[0].addressId || 0;
                d.shipType = item2.heatPoint[0].selfTaking == 0 ? '00' : '02',
                replaceOrder.push(d)
              })
            }
          })
          console.log(replaceOrder)
          wx.setStorageSync('replaceOrder', replaceOrder);
          wx.switchTab({
            url: '/pages/index/index'
          });
        } else if (type == 'buy') {
          wx.redirectTo({
            url: '/pages/packageOrder/submit/submit?from=replaceDetail',
          });
        }
      })
      .catch(error => {

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