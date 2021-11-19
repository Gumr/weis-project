// pages/packageDiscover/groupMeal/groupMeal.js
import apiRequest from '../../../service/index';
import {
  loginPromise,
} from '../../../utils/common'
import {
  debounce,
} from '../../../utils/throttle';
import day from '../../../libs/day';
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
    loginPromise.then(async () => {
      this.userQueryBusiness()
    })
    
  },
  //查询是否加入团餐
  userQueryBusiness() {
    apiRequest.userQueryBusiness({
      tgcllType: '00',
      tgcAreaType: '',
      keyWord: this.data.searchName || '',
    }).then((res) => {
      if (res.errCode == 0) {
        this.setData({
          joincompanyimg: res.obj.userCorpList,
          Allcompany: res.obj.groupCorpList,
        })
      }
    })
  },
  goAllmeal(e) {
    let { corpId, type, tgerole , tgeintertype} = e.currentTarget.dataset
    this.type = type
    let ifhas = this.data.joincompanyimg.filter((item) => {
      return item.tgcId == corpId
    })
    if (ifhas.length > 0 || type == '01' || corpId == '100097') {
      if (type == '01') {
        apiRequest.querySaveGroupCorpLoginLog({
          tgcllGroupCorpId: corpId,
          tgcllType: '00' //00 列表 01搜索
        }).then((res) => {
        })
      }
      apiRequest.queryComBranchCorpList({
        corpId: corpId,
        tgcllType: '00' //00 列表 01搜索

      }).then((res) => {
        if (res.errCode == '0') {
          this.setData({
            corpAddress: res.obj.corpAddress,
            corpId: corpId,
            tgerole:tgerole,
            tgeintertype:tgeintertype
          })
          if (corpId == '100097') { //中行点餐 单独处理   
            apiRequest.ValidateEmployee({ //验证员工信息
              corpId: '100097',
            }).then((res) => {
              if (res.obj.result) {
                // 如果是公司员工-根据是否存在日期判断明天是否营业
                this.queryTimeList()
              } else {
                this.setData({
                  showUserCheck: true
                })
              }
            })
          } else {
            this.jump()
          }
        }
      })
    } else {
      wx.showToast({
        title: '您未加入该公司',
        icon: 'none',
        image: ''
      });

    }
  },
  search: debounce(500, function (e) {
    let that = this;
    that.setData({
      searchName: e.detail.value,
    })
    that.userQueryBusiness()
  }),
  jump() {
    let tgcaId = this.data.corpAddress[0].tgcaId
    let corpId = this.data.corpId
    let tgerole = this.data.tgerole
    let tgctype = this.type // 公司类型 00对公  01对私
    let tgeintertype =this.data.tgeintertype
      wx.navigateTo({
        url: '/pages/mineBox/groupAddressList/index?corpId=' + corpId + '&tgcaId=' + tgcaId + '&tgctype=' + tgctype+'&tgerole='+tgerole+'&tgeintertype='+tgeintertype
      })
  },
  // 根据是否存在日期判断明天是否营业
  queryTimeList() {
    apiRequest.queryBusinessSendTime({
      corpId: this.data.corpId,
      tgcaId: this.data.corpAddress[0].tgcaId
    })
      .then(res => {
        if (res.errCode == '0') {
          this.setData({
            groupCorp: res.obj.groupCorp,
            hpid: res.obj.groupCorp.corpAddress.tgcaHeatingPoint
          })
          this.queryGoodsDateList()
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          });
        }
      })
  },
  // 查询日期
  queryGoodsDateList() {
    apiRequest.queryGoodsDateList({
      beginTime: this.data.groupCorp && this.data.groupCorp.corpAddress.tgcaDistributionType == '01' ? day(utils.DateAddDay(day(), 1)).format('YYYYMMDD') : day().format('YYYYMMDD'), // 01 企业专送 不能现点 日期推后一天
      hpid: this.data.hpid || 100000,
      addTimes: 15,
      corpId: this.data.corpId // 中行点餐-对私的corpId为100097（只显示明天的午餐和晚餐日历）
    }).then((res) => {
      let list = res.obj.resultDateList || [];
      if (list.length == 0) {
        wx.showToast({
          title: '明天暂不营业',
          icon: 'none'
        });
      } else {
        this.jump()
      }
    })
  },
  inputname(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  inpucode(e) {
    this.setData({
      userCode: e.detail.value
    })
  },

  tojump() {
    wx.navigateTo({
      url: '/pages/mineBox/groupStep/groupStep'
    })
  },

  //中行点餐绑定员工
  confirmcheck() {
    apiRequest.bindEmployee({
      corpId: '100097',
      jobNo: this.data.userCode,
      staffName: this.data.userName,
    }).then((res) => {
      if (res.errCode == 0) {
        this.setData({
          showUserCheck: false
        })
        wx.showToast({
          title: '验证成功',
          icon: 'none',
          image: ''
        });
        // 如果是公司员工-根据是否存在日期判断明天是否营业
        this.queryTimeList()
      } else {
        this.setData({
          errortips: res.errMsg
        })
      }

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