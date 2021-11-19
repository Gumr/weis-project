// pages/mineBox/agentList/agentList.js
const util = require('../../../utils/util.js');
import tool from "../../../libs/tool";
import Counselor from "../../../service/CounselorService";
import {
  getStorage, setStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    pageSize: 10,
    pageNo: 0,
    searchNo: 0,
    searchMore: true,
    more: true,
    recordList: [],
    searchList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.eventChannel = this.getOpenerEventChannel()
    this.setData({
      navStatusHeight: wx.getStorageSync('navStatusHeight'),
      from: options.from || '',
      recordList: options.from == 'channelCode' ? [{ counselorIcon: 'https://prodstatic.weis1606.cn/api/mini/forbiden.png', id: '0', counselorName: '不需要' }] : [],
      planType: getStorage('planType')
    }, () => {
      this.init();
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

  init: function () {
    var that = this;
    if (this.data.more == false) {
      return
    }
    this.data.pageNo++;
    Counselor.getCounselorList({

      pageSize: this.data.pageSize,
      pageNo: this.data.pageNo,
      counselorName: ''

    })
      .then(res => {
        if (!res.obj || (res.obj && res.obj.queryCounselorApplication.record.length < that.data.pageSize)) {
          that.setData({
            more: false
          })
        }
        let recordList = res.obj.queryCounselorApplication.record;
        let newList = this.data.recordList.concat(recordList)
        that.setData({
          recordList: newList
        })
      })
      .catch(error => {

      })
  },

  search: tool.debounce(function (e) {
    var that = this;
    that.setData({
      searchValue: e[0].detail.value,
      searchNo: 0,
      searchMore: true,
      searchList: [],
    }, () => {
      if (this.data.searchValue) {
        that.searchInit()
      }
    })
  }, 500),

  searchInit: function () {
    var that = this;
    if (this.data.searchMore == false) {
      return
    }
    this.data.searchNo++;
    Counselor.getCounselorList({

      pageSize: this.data.pageSize,
      pageNo: this.data.searchNo,
      counselorName: this.data.searchValue

    })
      .then(res => {
        if (!res.obj || (res.obj && res.obj.queryCounselorApplication.record.length < that.data.pageSize)) {
          that.setData({
            searchMore: false
          })
        }
        let searchList = res.obj.queryCounselorApplication.record;
        let newList = this.data.searchList.concat(searchList)
        that.setData({
          searchList: newList
        })
      })
      .catch(error => {

      })
  },

  detail: function (e) {
    if (this.data.from == 'channelCode') {
      return
    }
    let { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../agentDetail/agentDetail?id=' + id,
    });
  },

  add: function (e) {
    let { state, index, id, counselorid, name } = e.currentTarget.dataset;
    let that = this;
    if (this.data.from == 'channelCode') {
      wx.navigateBack({
        delta: 1,
        success: function (res) {
          that.eventChannel.emit('acceptDataFromOpenedPage', {
            data: {
              id,
              name
            }
          });
        }
      });
      return
    }
    if (state == '01') {
      return
    }
    Counselor.replaceCounselor({

      counselorId: counselorid

    })
      .then(res => {
        if (res.obj && res.obj.replaceStt) {
          // 绑定改变状态
          that.unbind(false, counselorid);
          var pages = getCurrentPages();   //当前页面
          var prevPage = pages[pages.length - 2];   //上个页面
          // 直接给上一个页面赋值
          prevPage.setData({
            id: id
          });
          wx.navigateBack({
            delta: 1,

          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
          });

        }
      })
      .catch(error => {

      })
  },

  // 解除绑定 绑定
  unbind: function (bindType, counselorid) {
    let that = this;
    let recordList = that.data.recordList;
    let searchList = that.data.searchList;
    recordList.forEach((item, index) => {
      if (bindType == true) {
        item.bindState = '00'
      } else {
        if (counselorid == item.counselorId) {
          item.bindState = '01'
        } else {
          item.bindState = '00'
        }
      }
    })
    searchList.forEach((item, index) => {
      if (bindType == true) {
        item.bindState = '00'
      } else {
        if (counselorid == item.counselorId) {
          item.bindState = '01'
        } else {
          item.bindState = '00'
        }
      }
    })
    that.setData({
      recordList,
      searchList
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
    if (!this.data.searchValue) {
      this.init();
    } else {
      this.searchInit()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})