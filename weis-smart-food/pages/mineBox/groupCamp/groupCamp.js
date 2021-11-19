// pages/mineBox/groupMeal/index.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
var utils = require('../../../utils/week-utils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab标签----
    currentTab: '',
    tabs: [
      {
        label: '企业点餐',
        value: '01'
      },
      {
        label: '企业减脂营',
        value: '02'
      }
    ],
    // 企业点餐----
    joincompanyimg: [],
    Allcompany: [],
    tgcAreaType: null,
    showUserCheck: false,
    searchName: '',
    showdelete: false,
    // 企业减脂营----
    fatList: []
  },
  onShow() {
    this.queryCampanyActivityList()
  },
  tojump() {
    wx.navigateTo({
      url: '/pages/mineBox/groupStep/groupStep'
    })

  },
  onLoad: function (options) {
    // this.setData({
    //   currentTab: this.data.tabs[0].value,
    //   tgcAreaType: options.tgcAreaType
    // }, () => {
    //   this.QueryBusiness()
    // })
  },
  toresever() {
    wx.navigateTo({
      url: `/pages/predefine/reserve/reserve`
    })
  },
  // 标签切换
  tabChange(e) {
    const currentTab = e.detail.value;
    this.setData({
      currentTab
    })
  },
  // 减脂营详情
  fatDetail({ currentTarget }) {
    const item = this.data.fatList[currentTarget.dataset.index]
    const status = Number(item.stt)
    if (status < 3) {
      wx.navigateTo({
        url: `/pages/mineBox/fatDetail/fatDetail?id=${item.tclwId}`
      })
    } else {
      wx.navigateTo({
        url: `/pages/mineBox/fatRank/fatRank?id=${item.tclwId}&status=${item.$status}`
      })
    }
  },
  queryCampanyActivityList() {
    apiRequest.queryCampanyActivityList()
      .then(res => {
        if (res.errCode === 0) {
          this.setData({
            fatList: res.obj.activityList.map(item => {
              item.startDate = day(String(item.tclwStartDate)).format('YYYY/MM/DD')
              item.endDate = day(String(item.tclwEndDate)).format('YYYY/MM/DD')

              item.$status = {
                '00': '已加入',
                '01': '报名中',
                '02': '准备开营',
                '03': '进行中',
                '04': '已结束'
              }[item.stt]
              return item
            })
          })
        }
      })
  },
  // 我也要申请企业减脂营
  goApplyFat() {
    wx.navigateTo({
      url: `/pages/mineBox/applyFat/applyFat`
    })
  },
  //查询是否加入团餐
  QueryBusiness() {

    apiRequest.userQueryBusiness({
      tgcllType: '00',
      tgcAreaType: this.data.tgcAreaType == '01' ? this.data.tgcAreaType : '',
      keyWord: this.data.searchName
    }).then((res) => {
      if (res.errCode == 0) {
        this.setData({
          joincompanyimg: res.obj.userCorpList,
          Allcompany: res.obj.groupCorpList,
        })
      }
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
        // this.jump()
      } else {
        this.setData({
          errortips: res.errMsg
        })
      }

    })
  },
  jump() {
    let tgcaId = this.data.corpAddress[0].tgcaId
    let corpId = this.data.corpId
    if (this.data.corpAddress.length <= 1) { // 公司地址只有一条时直接跳点餐 否则先选地址       
      wx.navigateTo({
        url: '/pages/mineBox/groupSelectMeal/index?corpId=' + corpId + '&tgcaId=' + tgcaId
      })
    } else {
      wx.navigateTo({
        url: `/pages/mineBox/groupAddressList/index?corpId=` + corpId + '&tgcaId=' + tgcaId
      })
    }
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

  goAllmeal(e) {
    let { corpId, type, item } = e.currentTarget.dataset

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
            corpId: corpId
          })
          if (corpId == '100097') { //中行点餐 单独处理   
            // wx.showToast({
            //   title: '敬请期待~',
            //   icon: 'none',
            //   image: ''
            // });
            // return

            apiRequest.ValidateEmployee({ //验证员工信息
              corpId: '100097',
            }).then((res) => {
              if (res.obj.result) {
                // 如果是公司员工-根据是否存在日期判断明天是否营业
                this.queryTimeList()
                // this.jump()
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
  gogroup() {
    wx.navigateTo({
      url: `/pages/mineBox/joinUs/index`
    })

  },
  deletename() {
    this.setData({
      searchName: '',

    })
    this.QueryBusiness()
  },
  search(e) {

    let iconsearch = e.currentTarget.dataset.value
    if (!e.detail.value && !this.data.searchName) {
      return
    }
    this.setData({
      searchName: iconsearch ? iconsearch : e.detail.value,
      showdelete: true,
    })
    this.QueryBusiness()
  },
})