// pages/solution/dayPlan/dayPlan.js
import {
  datedifference
} from '../../../utils/common'
import {
  getStorage
} from '../../../utils/storage'

import apiRequest from '../../../service/index'
import day from '../../../libs/day';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/smartFood/',
    navStatusHeight: getStorage('navStatusHeight'),
    name: '自定义吃法',
    tabList: [{
      name: '综合比例法',
      index: 0
    }, {
      name: '固定蛋白法',
      index: 1
    }],
    tabIndex: 0,
    fixedProtein: false,
    dataList: [],
    mealIndex: '',
    shortD: 0,
    shortZ: 0,
    shortT: 0,
    symbolIndex: 0,
    categoryKind: {
      '01': {
        name: '早餐',
        src: '/images/scheme_breakfast.png'
      },
      '02': {
        name: '午餐',
        src: '/images/scheme_lunch.png'
      },
      '03': {
        name: '晚餐',
        src: '/images/scheme_dinner.png'
      },
    },
    calendarConfig: {
      showLunar: false,
      multi: false,
      highlightToday: true,
      onlyShowCurrentMonth: true,
      disableMode: {
        // 禁用某一天之前/之后的所有日期
        type: 'before', // [‘before’, 'after']
        // date: '2020-12-17' // 无该属性或该属性值为假，则默认为当天
      },
      markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
      chooseAreaMode: true,
      showSure: true,//显示确定按钮
      hideBackToday: true,//隐藏回到今天
    },
    deleteFlag: false,
    keyboardheight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      // id: options.id ? options.id : '',
      from: options.from || '',
      subToken: options.subToken || '',
      planId: options.planId,
    })
    this.init();
    this.getDetail();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.editPopup = this.selectComponent("#editPopup")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // ----------------------------------
  // 生成方案
  getDetail: function (checkedList) {
    var that = this;
    apiRequest.queryCustomizeInitPlan({
      id: this.data.planId,
      subToken: this.data.subToken,
    })
      .then(res => {
        if (res.errCode == '0') {
          this.setPageData(res)
        }
      })
      .catch(error => {

      })
  },
  setPageData(res, isOpen=true) {
    var that = this;
    // 把展开的选项带过去
    let checkedList = [];
    if(isOpen) {
      that.data.dataList.forEach(function (item, index) {
        if (item.checked) {
          checkedList.push(index)
        }
      })
    }
    if (checkedList && checkedList.length > 0) {
      let dataList = res.obj.dietPlan.planDetailList;
      for (var i = 0; i < checkedList.length; i++) {
        dataList[checkedList[i]].checked = true
      }
      that.setData({
        dataList: dataList,
        dietPlan: res.obj.dietPlan,
      })
    } else {
      that.setData({
        dataList: res.obj.dietPlan.planDetailList,
        dietPlan: res.obj.dietPlan,
      })
    }
    if (res.obj.dietPlan.calculationMethod == '01') {
      that.setData({
        tabIndex: 0
      })
    } else {
      that.setData({
        tabIndex: 1
      })
    }
  },
  tab: function (e) {
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    })
    this.updateCustomizeInitPlan()
  },
  // 使用方案
  use: function () {
    this.useCustomizeInitPlan();
    
  },
  // 应用方案
  useCustomizeInitPlan() {
    apiRequest.useCustomizeInitPlan({
      id: this.data.planId,
      subToken: this.data.subToken,
    }).then(res => {
      if (res.errCode == '0') {
        this.updateUserTarget()
        this.back()
      }
    })
    .catch(error => { });
  },
   // 增加用户目标
   updateUserTarget() {
    // 增加用户目标
    apiRequest.updateUserTarget({
      planningType: 24,
      dataStt: '00', // 数据类型为修改
      subToken: this.data.subToken,
    })
    .then(res => {
      
    })
    .catch(error => {

    })
  },
  // 返回
  back() {
    let pageRoute = ''
    switch (this.data.from) {
      case 'question':
        pageRoute = 'pages/index/index'
        break;
      case 'addSubAccount':
        pageRoute = 'pages/packSubAccount/switchAccount/switchAccount'
        break;
      case 'questionPlan':
        pageRoute = 'pages/packageOrder/plan/plan'
        break;
      case 'personal':
        pageRoute = 'pages/mineBox/personal/personal'
        break;
    }
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === pageRoute
    );
    wx.navigateBack({
      delta: index > -1 ? pages.length - (index + 1) : 1
    });
  },
  // 修改方案数据
  updateCustomizeInitPlan(fixedProteinRatioList) {
    var that = this;
    let { type, dietPlan, tabIndex, name, shortFixedData, } = this.data;
    apiRequest.updateCustomizeInitPlan({
      id: dietPlan.id,
      calculationMethod: tabIndex == 0 ? '01': '02', // tab-综合比例法/固定蛋白法
      planName: name, // 修改方案名传
      totalIntake: type == '7' ? shortFixedData: '', // 修改摄入传
      energyRatio: type == '1' ? shortFixedData: '', // 修改单位体重摄入蛋白比例
      fixedProteinRatioList: fixedProteinRatioList || '',// 固定蛋白法修改多餐比例
      subToken: this.data.subToken,
    }).then(res => {
      if (res.errCode == '0') {
        this.setPageData(res)
      }
    })
    .catch(error => { });
  },
  inputFixed: function (e) {
    this.setData({
      shortFixedData: e.detail.value
    })
  },

  cancelFixed: function () {
    this.setData({
      fixedProtein: false,
      shortFixedData: '',
    }, () => {
      this.setData({
        symbol: false
      })
    })
  },
  sureFixed() {
    if(this.data.type == '4') {
      let params = {
        id: this.data.planId,
        dId: this.data.dataList[this.data.mealIndex].id,
        proteinRatio: '',
        fatRatio: this.data.shortFixedData,
        carbohydrateRatio: '',
        subToken: this.data.subToken,
      }
      this.updateCustomizeDetail(params)
      this.setData({
        fixedProtein: false,
      })
    } else {
      this.updateCustomizeInitPlan()
    }
    
  },
  paraEnergy: function () {
    this.setData({
      showParaEnergy: false,
      categoryRatioList: [],
    })
  },
  // 吃法名称-点击
  editName(){
    this.setData({
      showEdit: true,
      iptType: 1,
      iptVal: this.data.name,
      title: '吃法名称',
      btnText: '保存',
      editType: 'editName'
    })
  },
  // 吃法名称-确定
  update(e){
    this.setData({
      name: e.detail.iptVal
    })
    this.updateCustomizeInitPlan()
    this.editPopup.handleClickOverlay()
  },
  // 键盘高度
  keyboardheight(e) {
    wx.onKeyboardHeightChange(res => {
      this.setData({
        keyboardheight: res.height
      })
    })
  },
  // 键盘高度
  bindblur(){
    this.setData({
      keyboardheight: 0
    })
  },
  // 当餐摄入热量-修改
  goalEnergy: function (e) {
    let index = e.currentTarget.dataset.index;
    let categoryRatioList = 'categoryRatioList[' + index + '].totalRatio';
    this.setData({
      [categoryRatioList]: e.detail.value
    })
    let totalValue = 0;
    this.data.categoryRatioList.forEach((item, index) => {
      totalValue += Number(item.totalRatio)
    })
    this.setData({
      warnEnergy: totalValue > 100 ? true : false,
      shortGoalEnergy: totalValue == 100 ? true : false
    })
  },
  // 当餐摄入热量-确定
  editParaEnergy: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    for (var i = 0; i < this.data.categoryRatioList.length; i++) {
      if (!pattern.test(this.data.categoryRatioList[i].totalRatio)) {
        wx.showToast({
          title: '数值不合法',
          icon: 'none',
          duration: 1500,
        });
        return
      }
    }
    if (this.data.shortGoalEnergy) {
      var that = this;
      // let categoryRatioList = [{category: '01',totalRatio: this.data.shortDl},{category: '02',totalRatio: this.data.shortTb},{category: '03',totalRatio: this.data.shortZd}];
      let categoryRatioList = this.data.categoryRatioList;
      apiRequest.updateCustomizeDetailRatio({
          id: that.data.dietPlan.id,
          categoryRatioList: categoryRatioList,
          subToken: this.data.subToken,
        })
        .then(res => {
          that.setData({
            showParaEnergy: false,
            categoryRatioList: []
          })
          this.setPageData(res)
        })
        .catch(error => {

        })
    } else {
      wx.showToast({
        title: '热量比例之和需要等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },
  // 早餐三大营养素比例-修改
  goal: function (e) {
    if (e.currentTarget.dataset.index === '0') {
      if (Number(e.detail.value) + Number(this.data.shortT) + Number(this.data.shortZ) > 100) {
        this.setData({
          warn: true,
          shortD: e.detail.value
        })
      } else {
        this.setData({
          warn: false,
          shortD: e.detail.value
        })
      }
    }
    if (e.currentTarget.dataset.index === '1') {
      if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortZ) > 100) {
        this.setData({
          warn: true,
          shortT: e.detail.value
        })
      } else {
        this.setData({
          warn: false,
          shortT: e.detail.value
        })
      }
    }
    if (e.currentTarget.dataset.index === '2') {
      if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortT) > 100) {
        this.setData({
          warn: true,
          shortZ: e.detail.value
        })
      } else {
        this.setData({
          warn: false,
          shortZ: e.detail.value
        })
      }
    }
    if (Number(this.data.shortZ) + Number(this.data.shortD) + Number(this.data.shortT) == 100) {
      this.setData({
        shortGoal: true
      })
    } else {
      this.setData({
        shortGoal: false
      })
    }
  },
  updateCustomizeDetail(params) {
    apiRequest.updateCustomizeDetail(params)
      .then(res => {
        this.setPageData(res)
      })
      .catch(error => {

      })
  },
  // 早餐三大营养素比例-确定
  editPara: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    if (!pattern.test(this.data.shortT) || !pattern.test(this.data.shortD) || !pattern.test(this.data.shortZ)) {
      wx.showToast({
        title: '数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if (this.data.shortGoal) {
      var that = this;
      let params = {
        id: this.data.planId,
        dId: this.data.dataList[this.data.mealIndex].id,
        proteinRatio: this.data.shortD,
        fatRatio: this.data.shortZ,
        carbohydrateRatio: this.data.shortT,
        subToken: this.data.subToken,
      }
      this.updateCustomizeDetail(params)
      that.setData({
        showPara: false,
        shortT: 0,
        shortD: 0,
        shortZ: 0,
      })
    } else {
      wx.showToast({
        title: '三项之和需等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },
  // 早餐三大营养素比例-清空
  para: function () {
    this.setData({
      showPara: false,
      shortT: 0,
      shortD: 0,
      shortZ: 0,
    })
  },
  // 每餐蛋白/全天蛋白总量-清空
  paraFixed: function () {
    this.setData({
      showParaFixed: false,
      fixedProteinRatioList: [],
    })
  },
  // 每餐蛋白/全天蛋白总量-修改
  goalFixed: function (e) {
    let index = e.currentTarget.dataset.index;
    let fixedProteinRatioList = 'fixedProteinRatioList[' + index + '].proteinRatio';
    this.setData({
      [fixedProteinRatioList]: e.detail.value
    })
    let totalValue = 0;
    this.data.fixedProteinRatioList.forEach((item, index) => {
      totalValue += Number(item.proteinRatio)
    })
    this.setData({
      warnFixed: totalValue > 100 ? true : false,
      shortGoalFixed: totalValue == 100 ? true : false
    })
  },
  // 每餐蛋白/全天蛋白总量-确定
  editParaFixed: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    for (var i = 0; i < this.data.fixedProteinRatioList.length; i++) {
      if (!pattern.test(this.data.fixedProteinRatioList[i].proteinRatio)) {
        wx.showToast({
          title: '数值不合法',
          icon: 'none',
          duration: 1500,
        });
        return
      }
    }
    if (this.data.shortGoalFixed) {
      var that = this;
      let fixedProteinRatioList = this.data.fixedProteinRatioList;
      
      this.updateCustomizeInitPlan(fixedProteinRatioList)
      that.setData({
        showParaFixed: false,
        fixedProteinRatioList: []
      })
    } else {
      wx.showToast({
        title: '当日总蛋白之和需等于100%',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },
  toAdd: function (value) {
    return value && parseInt(value) - Number(3) > 1 ? parseInt(value) - Number(3) : '';
  },
  // 固蛋法
  fixed: function (e) {
    // 单位体重摄入蛋白
    if (e.currentTarget.dataset.type == '1') {
      this.setData({
        fixedProtein: true,
        placeholder: '单位体重摄入蛋白',
        title: '单位体重摄入蛋白',
        unit: 'g/kg',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
        mealIndex: 0,
        category: this.data.dataList[0].category,
        value: e.currentTarget.dataset.value,
      })
    }
    // 蛋白质总量
    if (e.currentTarget.dataset.type == '2') {
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title: '蛋白量/每日总蛋白',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: '',
        mealIndex: e.currentTarget.dataset.index,
      })
    }
    // 能量总占比
    if (e.currentTarget.dataset.type == '3') {
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title: '能量总占比',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: '',
        mealIndex: e.currentTarget.dataset.index,
      })
    }
    // 脂肪比例
    if (e.currentTarget.dataset.type == '4') {
      let item = this.data.dataList[e.currentTarget.dataset.index];
      let categoryName = this.data.categoryKind[item.category] ?  this.data.categoryKind[item.category].name : '加餐' + this.toAdd(item.category);
      this.setData({
        fixedProtein: true,
        placeholder: '比例',
        title:  categoryName + '脂肪比例',
        unit: '%',
        type: e.currentTarget.dataset.type,
        category: this.data.dataList[e.currentTarget.dataset.index].category,
        shortFixedData: e.currentTarget.dataset.value,
        mealIndex: e.currentTarget.dataset.index,
        value: e.currentTarget.dataset.value,
      })
    }
    // 方案参数 能量差
    if (e.currentTarget.dataset.type == '5') {
      this.setData({
        fixedProtein: true,
        placeholder: '能量差',
        title: '能量差',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
        symbol: true,
        symbolIndex: 0,
      })
    }
    // 计划运动消耗
    if (e.currentTarget.dataset.type == '6') {
      this.setData({
        fixedProtein: true,
        placeholder: '计划运动消耗',
        title: '计划运动消耗',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
      })
    }
    // 全天摄入热量
    if (e.currentTarget.dataset.type == '7') {
      this.setData({
        fixedProtein: true,
        placeholder: '全天摄入热量',
        title: '全天摄入热量',
        unit: 'kcal',
        type: e.currentTarget.dataset.type,
        shortFixedData: '',
        value: e.currentTarget.dataset.value,
      })
    }
  },
  // 加餐
  add: function () {
    var that = this;
    apiRequest.addCustomizeDetail({
        id: that.data.planId,
        dataStt: '00',
        subToken: this.data.subToken,
      })
      .then(res => {
        if (res.errCode == '0') {
          this.setPageData(res)
        }else{
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
            success: (result) => {
              
            },
            fail: () => {},
            complete: () => {}
          });
            
        }
      })
      .catch(error => {

      })
  },
  // 删除该餐别
  preDeleteFn: function(e) {
    const {index} = e.currentTarget.dataset
    index
    this.setData({
      deleteFlag: true,
      preDeleteIndex: index
    })
  },
  // 删除指定的加餐
  deleteAddedFn: function(e) {
    const {dataList, preDeleteIndex} = this.data;
    apiRequest.delCustomizeDetail({
      id: this.data.planId,
      dId: dataList[preDeleteIndex].id,
      subToken: this.data.subToken,
    }).then(res => {
      if(res.errCode === 0) {
        this.setPageData(res, false)
      }
    })
  },
  // ----------------------------------
  init: function () {
    this.setData({
      navStatusHeight: wx.getStorageSync('navStatusHeight')
    })
  },
  edit: function (e) {
    let item = this.data.dataList[e.currentTarget.dataset.index]
    this.setData({
      showPara: true,
      shortT: item.carbohydrateRatio,
      shortD: item.proteinRatio,
      shortZ: item.fatRatio,
      mealIndex: e.currentTarget.dataset.index,
      category: this.data.dataList[e.currentTarget.dataset.index].category
    })
    // 判断值相加是否 = 100
    if (Number(this.data.shortZ) + Number(this.data.shortD) + Number(this.data.shortT) == 100) {
      this.setData({
        shortGoal: true
      })
    } else {
      this.setData({
        shortGoal: false
      })
    }
  },
   // 当餐总能量修改三餐
   heat: function (e) {
    let categoryRatioList = [];
    let dataList = this.data.dataList;
    dataList.forEach((item, index) => {
      let childArr = {};
      childArr.category = item.category;
      childArr.totalRatio = item.totalRatio;
      categoryRatioList.push(childArr)
    })

    this.setData({
      showParaEnergy: true,
      warnEnergy: false,
      shortGoalEnergy: true,
      categoryRatioList
      // shortTb: this.data.dataList[1].totalRatio,//午餐
      // shortDl: this.data.dataList[0].totalRatio,//早餐
      // shortZd: this.data.dataList[2].totalRatio,//晚餐
    })
  },
   // 当餐总蛋白修改三餐
   heatFixed: function (e) {
    let fixedProteinRatioList = [];
    let dataList = this.data.dataList;
    dataList.forEach((item, index) => {
      let childArr = {};
      childArr.category = item.category;
      childArr.proteinRatio = item.fixedProteinRatio;
      fixedProteinRatioList.push(childArr)
    })

    this.setData({
      showParaFixed: true,
      warnFixed: false,
      shortGoalFixed: true,
      fixedProteinRatioList
    })
  },
  // 能量差符号选择
  symbol: function (e) {
    this.setData({
      symbolIndex: e.detail
    })
  },


  input: function (e) {
    this.setData({
      shortData: e.detail.value
    })
  },

  // 修改当餐总能量

  sure: function (e) {
    var that = this;

    apiRequest.updateUserPlanDetailRatio({
        totalRatio: that.data.shortData,
        pId: that.data.dataList[that.data.mealIndex].pid,
        dId: that.data.dataList[that.data.mealIndex].id,
        category: that.data.category,
        dataStt: '00',
        subToken: this.data.subToken,
      })
      .then(res => {
        if (res.obj.updateStt) {
          that.setData({
            shortData: '',
          })
          // 把展开的选项带过去
          let checkedList = [];
          that.data.dataList.forEach(function (item, index) {
            if (item.checked) {
              checkedList.push(index)
            }
          })
          that.getDetail(checkedList)
        }
      })
      .catch(error => {

      })
  },
  
  // 展开
   shrink: function (e) {
    // this.data.dataList[e.currentTarget.dataset.index].checked = !this.data.dataList[e.currentTarget.dataset.index].checked;
    // this.setData({
    //   dataList: this.data.dataList
    // })
  },
  // existActivityPlan() {
  //   apiRequest
  //     .existActivityPlan({
  //       subToken: this.data.subToken,
  //     })
  //     .then((res) => {
  //       this.isExistPlanJudge = true;
  //       if (res.errCode === 0) {
  //         const today = day().startOf('day');
  //         let activityDateList = res.obj.activityDateList.filter((i) => day(i) >= today);
  //         let dateList = [];
  //         activityDateList.forEach((item) => {
  //           let date = {
  //             year: item.substring(0, 4),
  //             month: item.substring(4, 6),
  //             day: item.substring(6, 8)
  //           }
  //           dateList.push(date)
  //         })
  //         this.setData({
  //           activityDateList: dateList
  //         });
  //         this.forbiddenCal();
  //       }
  //     });
  // },

  // afterCalendarRender() {
  //   if (this.isExistPlanJudge) {
  //     this.forbiddenCal();
  //   }else{
  //     // this.existActivityPlan();
  //   }
  // },
  // forbiddenCal(){
  //   let activityDateList = this.data.activityDateList || [];
  //   if(activityDateList && activityDateList.length > 0){
  //     this.calendar.disableDay(activityDateList);
  //   }
  // },
 
  // getDetail: function (checkedList) {
  //   var that = this;
  //   apiRequest.queryUserProgramme({
  //       supId: that.data.id ? that.data.id : '0',
  //       isMainPlan: '1',
  //       planStt: '00',
  //       needGoods: true,
  //       subToken: this.data.subToken,
  //     })
  //     .then(res => {
  //       if (res.errCode == '0') {
  //         if (checkedList && checkedList.length > 0) {
  //           let dataList = res.obj.planDetailList;
  //           for (var i = 0; i < checkedList.length; i++) {
  //             dataList[checkedList[i]].checked = true
  //           }
  //           that.setData({
  //             dataList: dataList,
  //             dietPlan: res.obj.dietPlan,
  //           })
  //         } else {
  //           that.setData({
  //             dataList: res.obj.planDetailList,
  //             dietPlan: res.obj.dietPlan,
  //           })
  //         }
  //         if (res.obj.dietPlan.calculationMethod == '01') {
  //           that.setData({
  //             tabIndex: 0
  //           })
  //         } else {
  //           that.setData({
  //             tabIndex: 1
  //           })
  //         }
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },


  // tab: function (e) {
  //   this.setData({
  //     tabIndex: e.currentTarget.dataset.index
  //   })
  //   let calculationMethod = e.currentTarget.dataset.index === 0 ? '01' : '02';
  //   this.way(calculationMethod);
  // },

 
  // goal: function (e) {
  //   if (e.currentTarget.dataset.index === '0') {
  //     if (Number(e.detail.value) + Number(this.data.shortT) + Number(this.data.shortZ) > 100) {
  //       this.setData({
  //         warn: true,
  //         shortD: e.detail.value
  //       })
  //     } else {
  //       this.setData({
  //         warn: false,
  //         shortD: e.detail.value
  //       })
  //     }
  //   }
  //   if (e.currentTarget.dataset.index === '1') {
  //     if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortZ) > 100) {
  //       this.setData({
  //         warn: true,
  //         shortT: e.detail.value
  //       })
  //     } else {
  //       this.setData({
  //         warn: false,
  //         shortT: e.detail.value
  //       })
  //     }
  //   }
  //   if (e.currentTarget.dataset.index === '2') {
  //     if (Number(e.detail.value) + Number(this.data.shortD) + Number(this.data.shortT) > 100) {
  //       this.setData({
  //         warn: true,
  //         shortZ: e.detail.value
  //       })
  //     } else {
  //       this.setData({
  //         warn: false,
  //         shortZ: e.detail.value
  //       })
  //     }
  //   }
  //   if (Number(this.data.shortZ) + Number(this.data.shortD) + Number(this.data.shortT) == 100) {
  //     this.setData({
  //       shortGoal: true
  //     })
  //   } else {
  //     this.setData({
  //       shortGoal: false
  //     })
  //   }
  // },

  // editPara: function () {
  //   var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
  //   if (!pattern.test(this.data.shortT) || !pattern.test(this.data.shortD) || !pattern.test(this.data.shortZ)) {
  //     wx.showToast({
  //       title: '数值不合法',
  //       icon: 'none',
  //       duration: 1500,
  //     });
  //     return
  //   }
  //   if (this.data.shortGoal) {
  //     var that = this;
  //     let detailList = [{
  //       carbohydrateRatio: this.data.shortT,
  //       proteinRatio: this.data.shortD,
  //       fatRatio: this.data.shortZ,
  //       pId: this.data.dataList[this.data.mealIndex].pid,
  //       dId: this.data.dataList[this.data.mealIndex].id,
  //       category: this.data.category,
  //       dataStt: '00',
  //       subToken: this.data.subToken,
  //     }];
  //     apiRequest.updateUserProgrammeDetail(detailList[0])
  //       .then(res => {
  //         if (res.obj.updateStt) {
  //           that.setData({
  //             showPara: false,
  //             shortT: 0,
  //             shortD: 0,
  //             shortZ: 0,
  //           })
  //           // 把展开的选项带过去
  //           let checkedList = [];
  //           that.data.dataList.forEach(function (item, index) {
  //             if (item.checked) {
  //               checkedList.push(index)
  //             }
  //           })
  //           that.getDetail(checkedList)
  //         }
  //       })
  //       .catch(error => {

  //       })
  //   } else {
  //     wx.showToast({
  //       title: '三项之和需等于100%',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //   }
  // },

  // para: function () {
  //   this.setData({
  //     showPara: false,
  //     shortT: 0,
  //     shortD: 0,
  //     shortZ: 0,
  //   })
  // },

 
  // goalEnergy: function (e) {
  //   let index = e.currentTarget.dataset.index;
  //   let categoryRatioList = 'categoryRatioList[' + index + '].totalRatio';
  //   this.setData({
  //     [categoryRatioList]: e.detail.value
  //   })
  //   let totalValue = 0;
  //   this.data.categoryRatioList.forEach((item, index) => {
  //     totalValue += Number(item.totalRatio)
  //   })
  //   this.setData({
  //     warnEnergy: totalValue > 100 ? true : false,
  //     shortGoalEnergy: totalValue == 100 ? true : false
  //   })

  //   // if(e.currentTarget.dataset.index === '0'){
  //   //   if(Number(e.detail.value) + Number(this.data.shortTb) + Number(this.data.shortZd) > 100){
  //   //     this.setData({
  //   //       warnEnergy: true,
  //   //       shortDl: e.detail.value
  //   //     })
  //   //   }else{
  //   //     this.setData({
  //   //       warnEnergy: false,
  //   //       shortDl: e.detail.value
  //   //     })
  //   //   }
  //   // }
  //   // if(e.currentTarget.dataset.index === '1'){
  //   //   if(Number(e.detail.value) + Number(this.data.shortDl) + Number(this.data.shortZd) > 100){
  //   //     this.setData({
  //   //       warnEnergy: true,
  //   //       shortTb: e.detail.value
  //   //     })
  //   //   }else{
  //   //     this.setData({
  //   //       warnEnergy: false,
  //   //       shortTb: e.detail.value
  //   //     })
  //   //   }
  //   // }
  //   // if(e.currentTarget.dataset.index === '2'){
  //   //   if(Number(e.detail.value) + Number(this.data.shortDl) + Number(this.data.shortTb) > 100){
  //   //     this.setData({
  //   //       warnEnergy: true,
  //   //       shortZd: e.detail.value
  //   //     })
  //   //   }else{
  //   //     this.setData({
  //   //       warnEnergy: false,
  //   //       shortZd: e.detail.value
  //   //     })
  //   //   }
  //   // }
  //   // if(Number(this.data.shortZd) + Number(this.data.shortDl) + Number(this.data.shortTb) == 100){
  //   //   this.setData({
  //   //     shortGoalEnergy: true
  //   //   })
  //   // }else{
  //   //   this.setData({
  //   //     shortGoalEnergy: false
  //   //   })
  //   // }
  // },

  // editParaEnergy: function () {
  //   var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
  //   for (var i = 0; i < this.data.categoryRatioList.length; i++) {
  //     if (!pattern.test(this.data.categoryRatioList[i].totalRatio)) {
  //       wx.showToast({
  //         title: '数值不合法',
  //         icon: 'none',
  //         duration: 1500,
  //       });
  //       return
  //     }
  //   }
  //   if (this.data.shortGoalEnergy) {
  //     var that = this;
  //     // let categoryRatioList = [{category: '01',totalRatio: this.data.shortDl},{category: '02',totalRatio: this.data.shortTb},{category: '03',totalRatio: this.data.shortZd}];
  //     let categoryRatioList = this.data.categoryRatioList;
  //     apiRequest.updateUserPlanDetailRatio({
  //         pId: that.data.dataList[0].pid,
  //         categoryRatioList: categoryRatioList,
  //         subToken: this.data.subToken,
  //       })
  //       .then(res => {
  //         if (res.obj.updateStt) {
  //           that.setData({
  //             showParaEnergy: false,
  //             // shortTb: 0,
  //             // shortDl: 0,
  //             // shortZd: 0,
  //             categoryRatioList: []
  //           })
  //           // 把展开的选项带过去
  //           let checkedList = [];
  //           that.data.dataList.forEach(function (item, index) {
  //             if (item.checked) {
  //               checkedList.push(index)
  //             }
  //           })
  //           that.getDetail(checkedList)
  //         }
  //       })
  //       .catch(error => {

  //       })
  //   } else {
  //     wx.showToast({
  //       title: '当日总能量之和需等于100%',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //   }
  // },

  // paraEnergy: function () {
  //   // console.log('1')
  //   this.setData({
  //     showParaEnergy: false,
  //     // shortTb: 0,
  //     // shortDl: 0,
  //     // shortZd: 0,
  //     categoryRatioList: [],
  //   })
  // },


  
  // goalFixed: function (e) {
  //   let index = e.currentTarget.dataset.index;
  //   let fixedProteinRatioList = 'fixedProteinRatioList[' + index + '].proteinRatio';
  //   this.setData({
  //     [fixedProteinRatioList]: e.detail.value
  //   })
  //   let totalValue = 0;
  //   this.data.fixedProteinRatioList.forEach((item, index) => {
  //     totalValue += Number(item.proteinRatio)
  //   })
  //   this.setData({
  //     warnFixed: totalValue > 100 ? true : false,
  //     shortGoalFixed: totalValue == 100 ? true : false
  //   })
  // },

  // editParaFixed: function () {
  //   var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
  //   for (var i = 0; i < this.data.fixedProteinRatioList.length; i++) {
  //     if (!pattern.test(this.data.fixedProteinRatioList[i].proteinRatio)) {
  //       wx.showToast({
  //         title: '数值不合法',
  //         icon: 'none',
  //         duration: 1500,
  //       });
  //       return
  //     }
  //   }
  //   if (this.data.shortGoalFixed) {
  //     var that = this;
  //     let fixedProteinRatioList = this.data.fixedProteinRatioList;
  //     apiRequest.updateUserProgramme({
  //         sportsConsume: that.data.dietPlan.sportsConsume,
  //         energyDifference: that.data.dietPlan.energyDifference,
  //         totalIntake: that.data.dietPlan.totalIntake,
  //         calculationMethod: '02',
  //         dataStt: '00',
  //         dateTime: that.data.dietPlan.dateTime,
  //         id: that.data.dietPlan.id,
  //         energyRatio: that.data.dataList[0].energyRatio,
  //         fixedProteinRatioList: fixedProteinRatioList,
  //         isMainPlan: '1',
  //         subToken: this.data.subToken,
  //       })
  //       .then(res => {
  //         if (res.obj.updateStt) {
  //           that.setData({
  //             showParaFixed: false,
  //             fixedProteinRatioList: []
  //           })
  //           // 把展开的选项带过去
  //           let checkedList = [];
  //           that.data.dataList.forEach(function (item, index) {
  //             if (item.checked) {
  //               checkedList.push(index)
  //             }
  //           })
  //           that.getDetail(checkedList)
  //         }
  //       })
  //       .catch(error => {

  //       })
  //   } else {
  //     wx.showToast({
  //       title: '当日总蛋白之和需等于100%',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //   }
  // },

  // paraFixed: function () {
  //   this.setData({
  //     showParaFixed: false,
  //     fixedProteinRatioList: [],
  //   })
  // },

  // 综合、固蛋
  // way: function (calculationMethod) {
  //   var that = this;
  //   if (calculationMethod == '02') {
  //     var fixedProteinRatioList = [];
  //     var dataList = this.data.dataList;
  //     dataList.forEach((item, index) => {
  //       let childArr = {};
  //       childArr.category = item.category;
  //       childArr.proteinRatio = item.fixedProteinRatio;
  //       fixedProteinRatioList.push(childArr)
  //     })
  //   }
  //   apiRequest.updateUserProgramme({
  //       sportsConsume: that.data.dietPlan.sportsConsume,
  //       totalIntake: that.data.dietPlan.totalIntake,
  //       calculationMethod: calculationMethod,
  //       dataStt: '00',
  //       dateTime: that.data.dietPlan.dateTime,
  //       id: that.data.dietPlan.id,
  //       energyRatio: calculationMethod == '02' ? that.data.dataList[0].energyRatio : undefined,
  //       fixedProteinRatioList: fixedProteinRatioList && fixedProteinRatioList.length > 0 ? fixedProteinRatioList : undefined,
  //       isMainPlan: '1',
  //       subToken: this.data.subToken,
  //     })
  //     .then(res => {
  //       if (res.obj.updateStt) {
  //         that.getDetail();
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },
  // preDeleteFn: function(e) {
  //   const {index} = e.currentTarget.dataset
  //   this.setData({
  //     deleteFlag: true,
  //     preDeleteIndex: index
  //   })
  // },
  // // 删除指定的加餐
  // deleteAddedFn: function(e) {
  //   let categoryRatioList = [],
  //     obj = {}
  //   const {dataList, preDeleteIndex} = this.data,
  //     {category, totalRatio} = dataList[preDeleteIndex]
  //   dataList.forEach((item, index) => {
  //     obj = {
  //       category: item.category,
  //       totalRatio: category == item.category ? 0 : item.totalRatio + parseInt(totalRatio / (dataList.length - 1))
  //     }
  //     if(index === 0) {
  //       obj.totalRatio += totalRatio % (dataList.length - 1)
  //     }
  //     categoryRatioList.push(obj)
  //   })
  //   apiRequest.updateUserPlanDetailRatio({
  //     pId: dataList[0].pid,
  //     categoryRatioList,
  //     subToken: this.data.subToken,
  //   }).then(res => {
  //     if(res.errCode === 0) {
  //       this.getDetail()
  //     }
  //   })
  // },
  // // 加餐
  // add: function () {
  //   var that = this;
  //   apiRequest.addUserProgrammeDetail({
  //       pId: that.data.dataList[0].pid,
  //       dataStt: '00',
  //       subToken: this.data.subToken,
  //     })
  //     .then(res => {
  //       if (res.errCode == '0') {
  //         // 把展开的选项带过去
  //         let checkedList = [];
  //         that.data.dataList.forEach(function (item, index) {
  //           if (item.checked) {
  //             checkedList.push(index)
  //           }
  //         })
  //         that.getDetail(checkedList)
  //       }else{
  //         wx.showToast({
  //           title: res.errMsg,
  //           icon: 'none',
  //           image: '',
  //           duration: 1500,
  //           mask: false,
  //           success: (result) => {
              
  //           },
  //           fail: () => {},
  //           complete: () => {}
  //         });
            
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },

  // // 固蛋法
  // fixed: function (e) {
  //   // 蛋白质总量
  //   if (e.currentTarget.dataset.type == '1') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '蛋白质总量',
  //       title: '蛋白质总量',
  //       unit: 'g/kg',
  //       type: e.currentTarget.dataset.type,
  //       shortFixedData: '',
  //       mealIndex: 0,
  //       category: this.data.dataList[0].category,
  //     })
  //   }
  //   // 蛋白质总量
  //   if (e.currentTarget.dataset.type == '2') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '比例',
  //       title: '蛋白量/每日总蛋白',
  //       unit: '%',
  //       type: e.currentTarget.dataset.type,
  //       category: this.data.dataList[e.currentTarget.dataset.index].category,
  //       shortFixedData: '',
  //       mealIndex: e.currentTarget.dataset.index,
  //     })
  //   }
  //   // 能量总占比
  //   if (e.currentTarget.dataset.type == '3') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '比例',
  //       title: '能量总占比',
  //       unit: '%',
  //       type: e.currentTarget.dataset.type,
  //       category: this.data.dataList[e.currentTarget.dataset.index].category,
  //       shortFixedData: '',
  //       mealIndex: e.currentTarget.dataset.index,
  //     })
  //   }
  //   // 脂肪
  //   if (e.currentTarget.dataset.type == '4') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '比例',
  //       title: '脂肪',
  //       unit: '%',
  //       type: e.currentTarget.dataset.type,
  //       category: this.data.dataList[e.currentTarget.dataset.index].category,
  //       shortFixedData: '',
  //       mealIndex: e.currentTarget.dataset.index,
  //     })
  //   }
  //   // 方案参数 能量差
  //   if (e.currentTarget.dataset.type == '5') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '能量差',
  //       title: '能量差',
  //       unit: 'kcal',
  //       type: e.currentTarget.dataset.type,
  //       shortFixedData: '',
  //       symbol: true,
  //       symbolIndex: 0,
  //     })
  //   }
  //   // 计划运动消耗
  //   if (e.currentTarget.dataset.type == '6') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '计划运动消耗',
  //       title: '计划运动消耗',
  //       unit: 'kcal',
  //       type: e.currentTarget.dataset.type,
  //       shortFixedData: '',
  //     })
  //   }
  //   // 应摄入
  //   if (e.currentTarget.dataset.type == '7') {
  //     this.setData({
  //       fixedProtein: true,
  //       placeholder: '应摄入',
  //       title: '应摄入',
  //       unit: 'kcal',
  //       type: e.currentTarget.dataset.type,
  //       shortFixedData: '',
  //     })
  //   }
  // },

  // inputFixed: function (e) {
  //   this.setData({
  //     shortFixedData: e.detail.value
  //   })
  // },

  // cancelFixed: function () {
  //   this.setData({
  //     fixedProtein: false,
  //     shortFixedData: '',
  //   }, () => {
  //     this.setData({
  //       symbol: false
  //     })
  //   })
  // },

  // sureFixed: function () {
  //   var that = this;
  //   if (this.data.type == 5 || this.data.type == 6 || this.data.type == 7) {
  //     that.editParam() //更改能量差运动消耗
  //     return
  //   }
  //   let detailList = [{
  //     pId: this.data.dataList[this.data.mealIndex].pid,
  //     dId: this.data.dataList[this.data.mealIndex].id,
  //     category: this.data.category,
  //     dataStt: '00',
  //     subToken: this.data.subToken,
  //   }];
  //   if (this.data.type == 1) { //蛋白质总量
  //     // detailList[0].totalRatio = this.data.shortFixedData;
  //     // 修改蛋白质总量 带蛋白比例
  //     if (that.data.shortFixedData > 4) {
  //       wx.showToast({
  //         title: '数值不合法，最大值为4',
  //         icon: 'none',
  //         image: '',
  //         duration: 1500,
  //         mask: false,
  //       });
  //       return
  //     }
  //     var fixedProteinRatioList = [];
  //     var dataList = this.data.dataList;
  //     dataList.forEach((item, index) => {
  //       let childArr = {};
  //       childArr.category = item.category;
  //       childArr.proteinRatio = item.fixedProteinRatio;
  //       fixedProteinRatioList.push(childArr)
  //     })
  //     apiRequest.updateUserProgramme({
  //         sportsConsume: that.data.type == 6 ? that.data.shortFixedData : that.data.dietPlan.sportsConsume,
  //         energyDifference: that.data.type == 5 ? (that.data.symbolIndex == 0 ? '-' + that.data.shortFixedData : that.data.shortFixedData) : that.data.dietPlan.energyDifference,
  //         totalIntake: that.data.dietPlan.totalIntake,
  //         calculationMethod: that.data.tabIndex === 0 ? '01' : '02',
  //         dataStt: '00',
  //         dateTime: that.data.dietPlan.dateTime,
  //         id: that.data.dietPlan.id,
  //         energyRatio: that.data.shortFixedData,
  //         fixedProteinRatioList: fixedProteinRatioList && fixedProteinRatioList.length > 0 ? fixedProteinRatioList : undefined,
  //         isMainPlan: '1',
  //         subToken: this.data.subToken,
  //       })
  //       .then(res => {
  //         if (res.obj.updateStt) {
  //           that.setData({
  //             shortFixedData: '',
  //             fixedProtein: false
  //           }, () => {
  //             that.setData({
  //               symbol: false, //取消符号选择+-
  //             })
  //           })
  //           // 把展开的选项带过去
  //           let checkedList = [];
  //           that.data.dataList.forEach(function (item, index) {
  //             if (item.checked) {
  //               checkedList.push(index)
  //             }
  //           })
  //           that.getDetail(checkedList)
  //         }
  //       })
  //       .catch(error => {

  //       })
  //     return
  //   } else if (this.data.type == 2) {
  //     detailList[0].fixedProteinRatio = this.data.shortFixedData
  //   } else if (this.data.type == 3) {
  //     detailList[0].energyRatio = this.data.shortFixedData
  //   } else if (this.data.type == 4) {
  //     detailList[0].fatRatio = this.data.shortFixedData
  //   }
  //   apiRequest.updateUserProgrammeDetail(detailList[0])
  //     .then(res => {
  //       if (res.obj.updateStt) {
  //         that.setData({
  //           shortFixedData: '',
  //           fixedProtein: false
  //         }, () => {
  //           that.setData({
  //             symbol: false, //取消符号选择+-
  //           })
  //         })
  //         // 把展开的选项带过去
  //         let checkedList = [];
  //         that.data.dataList.forEach(function (item, index) {
  //           if (item.checked) {
  //             checkedList.push(index)
  //           }
  //         })
  //         that.getDetail(checkedList)
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },

  

  // 更改能量差运动消耗
  // editParam: function () {
  //   var that = this;
  //   if (that.data.type == 5 && that.data.shortFixedData > 3000) {
  //     wx.showToast({
  //       title: '不能超过最大值3000',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //     return
  //   }
  //   if (that.data.type == 7 && that.data.shortFixedData < (that.data.dietPlan.basalMetabolism / 0.85)) {
  //     wx.showToast({
  //       title: '每日应摄入能量不能低于基础代谢' + parseInt(that.data.dietPlan.basalMetabolism / 0.85) + 'kcal',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //   }
  //   // 修改能量差运动消耗 带蛋白比例
  //   var fixedProteinRatioList = [];
  //   var dataList = this.data.dataList;
  //   dataList.forEach((item, index) => {
  //     let childArr = {};
  //     childArr.category = item.category;
  //     childArr.proteinRatio = item.fixedProteinRatio;
  //     fixedProteinRatioList.push(childArr)
  //   })
  //   apiRequest.updateUserProgramme({
  //       sportsConsume: that.data.type == 6 ? that.data.shortFixedData : that.data.dietPlan.sportsConsume,
  //       energyDifference: that.data.type == 5 ? (that.data.symbolIndex == 0 ? '-' + that.data.shortFixedData : that.data.shortFixedData) : that.data.dietPlan.energyDifference,
  //       totalIntake: that.data.type == 7 ? that.data.shortFixedData : that.data.dietPlan.totalIntake,
  //       calculationMethod: that.data.tabIndex === 0 ? '01' : '02',
  //       dataStt: '00',
  //       dateTime: that.data.dietPlan.dateTime,
  //       id: that.data.dietPlan.id,
  //       energyRatio: that.data.dataList[0].energyRatio,
  //       fixedProteinRatioList: fixedProteinRatioList && fixedProteinRatioList.length > 0 ? fixedProteinRatioList : undefined,
  //       isMainPlan: '1',
  //       subToken: this.data.subToken,
  //     })
  //     .then(res => {
  //       if (res.obj.updateStt) {
  //         that.setData({
  //           shortFixedData: '',
  //           fixedProtein: false
  //         }, () => {
  //           that.setData({
  //             symbol: false,
  //           })
  //         })
  //         // 把展开的选项带过去
  //         let checkedList = [];
  //         that.data.dataList.forEach(function (item, index) {
  //           if (item.checked) {
  //             checkedList.push(index)
  //           }
  //         })
  //         that.getDetail(checkedList)
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },


  // // 使用方案
  // use: function () {
  //   this.time();
  // },

  // time: function () {
  //   this.setData({
  //     showTime: true,
  //   })
  // },

  // // 键盘高度
  // keyboardheight(e) {
  //   wx.onKeyboardHeightChange(res => {
  //     this.setData({
  //       keyboardheight: res.height
  //     })
  //   })
  // },

  // bindblur(){
  //   this.setData({
  //     keyboardheight: 0
  //   })
  // },
  // cancelTime: function () {
  //   this.setData({
  //     showTime: false
  //   })
  // },

  // sureTime: function () {
  //   let date = this.calendar.getSelectedDay();
  //   let dateArr = [];
  //   if (date.length == 0 || date.length == 1) {
  //     wx.showToast({
  //       title: '请选择一个时间段',
  //       icon: 'none',
  //       image: '',
  //       duration: 1500,
  //       mask: false,
  //     });
  //     return
  //   }
  //   date.forEach((item, index) => {
  //     dateArr.push(new Date(item.year + '/' + (item.month < 10 ? ('0' + item.month) : item.month) + '/' + (item.day < 10 ? ('0' + item.day) : item.day)).getTime())
  //   })
  //   let start = day(new Date(Math.min(...dateArr))).format('YYYY/MM/DD');
  //   let end = day(new Date(Math.max(...dateArr))).format('YYYY/MM/DD');
  //   this.setData({
  //     showTime: false,
  //     startTime: start,
  //     endTime: end,
  //   }, () => {
  //     this.checkIsCustomizePlan()
  //   })
  // },

  // checkIsCustomizePlan() {
  //   var that = this;
  //   apiRequest.checkIsCustomizePlan({
  //     date: day(new Date(this.data.startTime)).format('YYYYMMDD'),
  //     cycle: datedifference(this.data.startTime, this.data.endTime) + 1,
  //     subToken: this.data.subToken,
  //   }).then((res) => {
  //     if (res.obj.result) {
  //       wx.showModal({
  //         title: '提示',
  //         content: '当前已有正在执行的方案，是否要覆盖？',
  //         confirmText: '不覆盖',
  //         cancelText: '是',
  //         cancelColor: '#FE5E0F',
  //         confirmColor: '#000000',
  //         success: function (res) {
  //           if (res.cancel) {
  //             that.useSolution()
  //           }
  //         }
  //       })
  //     } else {
  //       that.useSolution()
  //     }
  //   }).catch(() => {

  //   })
  // },

  // useSolution: function () {
  //   var that = this;
  //   apiRequest.applicationDietPlan({
  //       supId: that.data.id ? that.data.id : '0',
  //       dateSTime: day(new Date(that.data.startTime)).format('YYYYMMDD'),
  //       dateETime: day(new Date(that.data.endTime)).format('YYYYMMDD'),
  //       subToken: this.data.subToken,
  //     })
  //     .then(res => {
  //       if (res.errCode == '0') {
  //         const pages = getCurrentPages();
  //         const prePage = pages[pages.length - 2];
  //         if(that.data.from != 'question' && !this.data.subToken){
  //           prePage.setData({
  //             tabIndex: 3
  //           })
  //         }else{
  //           // 注册 自定义方案 && 子账户自定义吃法 调用更新目标接口 自定义吃法planningType 24
  //           this.updateUserTarget();
  //         }
  //         wx.navigateBack({
  //           delta: that.data.from == 'question' || this.data.subToken ? 2 : 1
  //         });
            
  //       }
  //     })
  //     .catch(error => {

  //     })
  // },

  // updateUserTarget(){
  //   apiRequest.updateUserTarget({
  //     planningType: '24',
  //     dataStt: '00', // 数据类型为修改
  //     subToken: this.data.subToken,
  //   }).then(res => {

  //   })
  // },

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
  onShareAppMessage: function (options) {
    return {
      title: '维士健身饮食，健康美味！',
      path: '/pages/index/index',
      imageUrl: "https://prodstatic.weis1606.cn/api/mini/small_program_share.png",
      success: (res) => {

      },
      fail: (res) => {

      }
    }
  }
})