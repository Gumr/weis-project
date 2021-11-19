// pages/mineBox/mineActive/mineActive.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day';
import {
  campStatus,
  onLineCampStatus
} from '../../../utils/map';
//type 02 企业减脂营 type 01 线上减脂营
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // selectTab: 0,
    campStatus, //企业减脂营
    onLineCampStatus, //线上减脂营
    list: [],
    activityList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryMyActivityList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.queryUserActivityList();
    // this.queryCampActivityList();

  },

  queryMyActivityList() {
    apiRequest.queryMyActivityList({

    }).then((res) => {
      let activityList = res.obj;
      activityList = activityList.map((item) => {
        item.sTime = day(String(item.sTime).slice(0, 8)).format('YYYY/MM/DD');
        item.eTime = day(String(item.eTime).slice(0, 8)).format('YYYY/MM/DD');
        return item;
      })
      this.setData({
        activityList,
      })
    })
  },

  detail(e) {
    let index = e.currentTarget.dataset.index;
    let activityList = this.data.activityList;
    let item = activityList[index];
    if (item.type == '02') {
      // 企业减脂营
      const status = Number(item.stt)
      if (status < 3) {
        wx.navigateTo({
          url: `/pages/mineBox/fatDetail/fatDetail?id=${item.activityId}`
        })
      } else {
        wx.navigateTo({
          url: `/pages/mineBox/fatRank/fatRank?id=${item.activityId}`
        })
      }
    } else {
      // 线上减脂营
      wx.navigateTo({
        url: `/pages/packageDiscover/onLineFat/reduceFatDetail/reduceFatDetail?campId=${item.campId}&activityId=${item.activityId}`
      })
    }
  },


  campTap({
    currentTarget
  }) {
    const {
      label,
      index
    } = currentTarget.dataset;
    const item = this.data.activityList[index];
    switch (label) {
      case '正在进行中':
      case '成功预约入营':
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/slimmingCampDetail/slimmingCampDetail?aid=${item.activityId}&cid=${item.leaderId}&campId=${item.campId}`
        })
        break;
      case '已结营':
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/campReport/campReport?id=${item.campId}`
        })
        break;
      case '开始订餐':
        wx.navigateTo({
          url: `/pages/packageDiscover/slimmingCamp/bodyForm/bodyForm?aid=${item.activityId}`
        })
        break;
    }
  },
  queryUserActivityList() {
    apiRequest.queryUserActivityList()
      .then((res) => {
        if (res.errCode === 0) {
          // campStatusMap
          this.setData({
            activityList: res.obj.activityList.map((item) => {
              item.startDate = day(String(item.sDate).slice(0, 8)).format('M月D日');
              item.endDate = day(String(item.eDate).slice(0, 8)).format('M月D日');
              item.$label = {
                '00': '成功预约入营',
                '01': '开始订餐',
                '02': '正在进行中',
                '03': '已失效',
                '05': '已结营',
              } [item.stt]
              return item;
            })
          })
        }
      })
  },
  queryCampActivityList() {
    apiRequest.queryCampActivityList().then(res => {
      const data = res.errCode === 0 ? res.obj.activityList : [];
      const list = data.map(item => {
        const sTime = String(item.startTime).substring(4, 6) + '月' + String(item.startTime).substring(6, 8) + '日';
        const eTime = String(item.endTime).substring(4, 6) === String(item.startTime).substring(4, 6) ? String(item.endTime).substring(6, 8) + '日' : String(item.endTime).substring(4, 6) + '月' + String(item.endTime).substring(6, 8) + '日'
        item.date = sTime + '-' + eTime
        return item
      })
      this.setData({
        list
      })
    })
  },
  // 去到-排行榜
  rankList(e) {
    let {
      campid,
      name,
      stt
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mineBox/rankList/rankList?campid=${campid}&name=${name}&stt=${stt}`,
    });
  },
  // tab-保留勿删,后续需加
  // switchTab(e) {
  //   const {index} = e.currentTarget.dataset
  //   this.setData({
  //     selectTab: index,
  //   }, () => {
  //     this.queryCampActivityList()
  //   })
  // },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});