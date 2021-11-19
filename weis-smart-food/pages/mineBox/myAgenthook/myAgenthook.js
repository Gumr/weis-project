// pages/mineBox/myAgenthook/myAgenthook.js
var utils = require('../../../utils/week-utils.js');
var util = require('../../../utils/util');
import apiRequest from "../../../service/index";
import {
  t
} from '../../../utils/common';
import { planTypeStatus } from '../../../utils/map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planTypeStatus,
    pageSize: 10,
    pageNo: 0,
    more: true,
    historyList: [],
    replaceList: [],
    rightWidth: '', // 左移删除按钮距离
    options: {}, // 上页面过来的参数
    showTip: '', // 消息弹框-是否显示
    noTipSelect: false // 不再提示-是否选中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let lastPages = getCurrentPages()[getCurrentPages().length - 2];
    this.uid = lastPages && lastPages.data.info.userInfo.uid;
    const showTip = wx.getStorageSync('showTip')
    this.setData({
      identifer: options.identifer,
      // showTip: showTip === false ? showTip : true, // 消息弹框-是否显示
      rightWidth: t(98), // 删除按钮移动距离，rpx转px
      options: {
        ...options,
        result: JSON.parse(options.result),
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
    this.setData({
      pageNo: 0,
      more: true,
      historyList: []
    }, () => {
      this.init();
      this.queryHistoryCounselor();
    })
  },
  // 弹框-“不再提示”改变
  noTipChange: function () {
    this.setData({
      noTipSelect: !this.data.noTipSelect
    }, () => {
      wx.setStorageSync('showTip', !this.data.noTipSelect);
    })
  },
  // 弹框-“好的”
  handleConfirm: function () {
    var that = this;
    apiRequest.replaceCounselor({
        counselorId: that.data.options.counselorId,
      })
      .then(res => {
        this.setData({
          showTip: false
        }, () => {
          wx.setStorageSync('showTip', false);
        })
        this.init();
      })
      .catch(error => {})
  },
  replace: function () {
    if (!this.data.counselorInfo) {
      return
    }
    wx.navigateTo({
      url: '/pages/packageOrder/replace/replace',
    });
  },

  init: function () {
    var that = this; 
    apiRequest.queryCurrUserCounselor({
      
    })
      .then(res => {
        if (res.obj && res.obj.counselorInfo) {
          that.setData({
            counselorInfo: res.obj.counselorInfo
          }, () => {
            // that.getProgram();
            that.queryList();
          })
        } else {
          that.setData({
            replaceList: [],
            counselorInfo: '',
            day: 0,
            name: '',
          })
        }
      })
      .catch(error => {

      })
  },

  // 查询代点餐
  queryList: function () {
    var that = this;
    apiRequest.queryReplaceRelation({
        targetUid: that.uid,
        counselorId: that.data.counselorInfo.counselorId,
      })
      .then(res => {
        let replaceRelations = res.obj.replaceRelations;
        let replaceList = replaceRelations.filter((item) => {
          return item.dataStt == '01';
        });
        this.setData({
          replaceList
        })
      })
      .catch(error => {

      })
  },

  queryHistoryCounselor: function () {
    var that = this;
    if (this.data.more == false) {
      return
    }
    this.data.pageNo++;
    apiRequest.queryHistoryCounselor({
        pageSize: this.data.pageSize,
        pageNo: this.data.pageNo,
        counselorName: '',
      })
      .then(res => {
        if (!res.obj || (res.obj && res.obj.historyCounselor.record.length < that.data.pageSize)) {
          that.setData({
            more: false
          })
        }
        let historyList = res.obj.historyCounselor.record;
        let newList = this.data.historyList.concat(historyList)
        that.setData({
          historyList: newList
        })
      })
      .catch(error => {

      })
  },

  // 查询方案
  getProgram: function () {
    var that = this;
    apiRequest.queryCounselorToUserPlan({
        counselorId: that.data.counselorInfo.counselorId,

      })
      .then(res => {
        if (res.obj.queryCounselorPlan[0] && res.obj.queryCounselorPlan[0].planName) {
          that.setData({
            day: res.obj.queryCounselorPlan[0].countNum,
            name: res.obj.queryCounselorPlan[0].planName
          })
        } else {
          that.setData({
            day: 0,
            name: '',
          })
        }
      })
      .catch(error => {

      })
  },

  detail: function (e) {
    let {
      id,
      from
    } = e.currentTarget.dataset;

    wx.navigateTo({
      url: '../agentDetail/agentDetail?id=' + id + '&from=' + from,
    });
  },

  list: function () {
    wx.navigateTo({
      url: '../agentList/agentList',
    });
  },
  // 删除/清空（存在counselorId为删除，否则为清空）
  delete: function (e) {
    var that = this;
    let {
      counselorid
    } = e.currentTarget.dataset;
    apiRequest.deleteHistoryCounselor({
        uid: that.uid,
        counselorId: counselorid ? counselorid : 0,
      })
      .then(res => {
        this.setData({
          pageNo: 0,
          more: true,
          historyList: []
        }, () => {
          this.queryHistoryCounselor();
          if (!counselorid) {
            wx.showToast({
              title: '清空已完成',
              icon: 'none',
            });
          }
        })
      })
      .catch(error => {})
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
    this.queryHistoryCounselor();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})