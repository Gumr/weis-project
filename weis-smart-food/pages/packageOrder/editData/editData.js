// pages/solution/dayPlan/dayPlan.js
import day from '../../../libs/day';
import apiRequest from '../../../service/index';

import { getStorage, setStorage, removeStorage } from '../../../utils/storage';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 01 综合 02 固蛋
    btnText: '保存',
    title: '修改吃法名称',
    status: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    this.setData({
      date: options.date,
      datePlan: day(options.date).format('YYYY年MM月DD日'),
      subInfo: getStorage('subInfo') || {},
      isshowchange:options.isshowchange || false // 对公企业-幼教类型，企业接口人和子账号接口人身份，无主账号切换按钮
    })
    this.queryUserPlanCacheThree();
    this.queryCurrUserCounselor();
    this.getUserListForSubUser()
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

  // 切换子账户
  select(e){
    let index = e.currentTarget.dataset.index;
    let {subUserInfoList, subInfo} = this.data;
    let tsuSubUid = subUserInfoList[index].tsuSubUid;
    if(tsuSubUid == subInfo.tsuSubUid){
      // 已选中当前子账户不执行
      return
    }
    this.setData({
      showDialog: true,
      selectIndex: index,
      mainAccount: false,
      showAccount: false,
    })
  },

  // 选择主账户
  selectMain(){
    let subInfo = this.data.subInfo;
    if(!subInfo.tsuSubUid){
      // 已选中当前主账户不执行
      return
    }
    this.setData({
      showDialog: true,
      mainAccount: true,
      showAccount: false,
    })
  },

  targetConfirmDialog(){
    let {mainAccount, selectIndex, subUserInfoList} = this.data;
    if(mainAccount){
      removeStorage('subToken');
      removeStorage('subInfo');
      this.queryUserPlanCacheThree();
      this.setData({
        subInfo: {},
        showDialog: false
      })
    }else{
      let subToken = subUserInfoList[selectIndex].subToken;
      let subInfo = subUserInfoList[selectIndex];
      setStorage('subToken', subToken).then(()=>{
        this.queryUserPlanCacheThree();
      })
      setStorage('subInfo',subInfo)
      this.setData({
        subInfo,
        showDialog: false
      })
    }
    wx.showToast({
      title: mainAccount ? '已切换为主账户' : '已切换为子账户',
      image: '/images/my/success.png',
      duration: 1500
    });
  },

  getUserListForSubUser(){
    let subInfo = this.data.subInfo;
    apiRequest.getUserListForSubUser({

    }).then((res)=>{
      let subUserInfoList = res.obj.subUserInfoList || [];
      let info = res.obj.userResult;
      let subUserInfoIdList = subUserInfoList.map((v)=>{
        return v.tsuSubUid
      });
      this.setData({
        subUserInfoList,
        info
      })
      if(subInfo.tsuSubUid && subUserInfoIdList.indexOf(subInfo.tsuSubUid) == -1){
        this.setData({
          subInfo: {},
        })
        removeStorage('subToken');
        removeStorage('subInfo');
        wx.showToast({    
          title: '子账户已失效，已切换为主账户',
          icon: 'none',
        }); 
      }
    })
  },

  close(){

    if(this.data.subUserInfoList.length == 0 || this.data.isshowchange == 'true'){
        return
    }
    this.setData({
      showAccount: !this.data.showAccount
    })
  },

  contact(){
    let id = this.data.counselorInfo.id;
    wx.navigateTo({
      url: `/pages/mineBox/agentDetail/agentDetail?id=${id}&from=check`,
    });
  },

  queryCurrUserCounselor: function () {
    apiRequest.queryCurrUserCounselor({
      
    })
      .then(res => {
        this.setData({
          counselorInfo: (res.obj && res.obj.counselorInfo) || {}
        })
      })
      .catch(error => {

      })
  },

  queryUserPlanCacheThree() {
    apiRequest.queryUserPlanCacheThree({
      date: day(this.data.date).format('YYYYMMDD')
    }).then((res) => {
      this.setData({
        dietPlan: res.obj.dietPlan
      })
    })
  },

  editName() {
    let {
      dietPlan
    } = this.data;
    this.setData({
      title: '修改吃法名称',
      subTitle: '',
      btnText: '保存',
      showEdit: true,
      iptType: '1',
      iptVal: dietPlan.planName,
      editType: 'planName'
    })
  },

  editEnergy() {
    let {
      dietPlan,
      status
    } = this.data;
    let listArr = [];
    dietPlan.planDetailList.forEach((item, index) => {
      let arr = {
        category: '',
        name: '',
        val: '',
        unit: '%'
      }
      arr.category = item.category;
      arr.name = status[item.category];
      arr.val = item.totalRatio;
      listArr.push(arr)
    })
    this.setData({
      title: '三餐能量比例',
      subTitle: '三餐能量比例之和需要等于100%',
      errTip: '三餐能量比例之和不等于100%',
      btnText: '确定',
      showEdit: true,
      iptType: '2',
      listArr,
      editType: 'categoryEnergy'
    })
  },

  // 修改一餐营养素
  editOneCategory(e) {
    let index = e.currentTarget.dataset.category;
    let {
      dietPlan,
      status
    } = this.data;
    let categoryObj = dietPlan.planDetailList[index];
    let listArr = [{
      name: '蛋白质',
      val: categoryObj.proteinRatio,
      unit: '%'
    }, {
      name: '脂肪',
      val: categoryObj.fatRatio,
      unit: '%'
    }, {
      name: '碳水',
      val: categoryObj.carbohydrateRatio,
      unit: '%'
    }];

    this.setData({
      title: '三大宏量元素比例',
      subTitle: '三大元素比例之和需要等于100%',
      errTip: '三大元素比例之和不等于100%',
      btnText: '确定',
      showEdit: true,
      iptType: '2',
      listArr,
      editType: 'editOneCategory',
      editCategory: categoryObj.category
    })

  },

  // 修改摄入量
  editIntake() {
    let {
      dietPlan,
    } = this.data;
    const oneObj = {
      val: dietPlan.totalIntake,
      unit: 'kcal'
    }

    this.setData({
      title: '摄入量',
      subTitle: '',
      btnText: '确定',
      showEdit: true,
      iptType: '3',
      oneObj,
      editType: 'editIntake',
    })
  },

  // 修改单位体重蛋白质
  editPro(){
    let {
      dietPlan,
    } = this.data;
    const oneObj = {
      val: dietPlan.planDetailList[0].energyRatio,
      unit: 'g/kg'
    }

    this.setData({
      title: '单位体重所需蛋白质',
      subTitle: '',
      btnText: '确定',
      showEdit: true,
      iptType: '3',
      oneObj,
      editType: 'editPro',
    })
  
  },

  // 固蛋 三餐蛋白
  editThreeCate(){
    let {
      dietPlan,
      status
    } = this.data;
    let listArr = [];
    dietPlan.planDetailList.forEach((item, index) => {
      let arr = {
        category: '',
        name: '',
        val: '',
        unit: '%'
      }
      arr.category = item.category;
      arr.name = status[item.category];
      arr.val = item.fixedProteinRatio;
      listArr.push(arr)
    })
    this.setData({
      title: '三餐蛋白质比例',
      subTitle: '三餐蛋白质之和需要等于100%%',
      errTip: '三餐蛋白质比例之和不等于100%%',
      btnText: '确定',
      showEdit: true,
      iptType: '2',
      listArr,
      editType: 'editThreeCate'
    })
  
  },

  // 修改单餐脂肪
  editOneFat(e) {
    let {index, category} = e.currentTarget.dataset;
    let {
      dietPlan,
    } = this.data;
    const oneObj = {
      val: dietPlan.planDetailList[index].fatRatio,
      unit: '%'
    }

    this.setData({
      title: '脂肪比例',
      subTitle: '',
      btnText: '确定',
      showEdit: true,
      iptType: '3',
      oneObj,
      editType: 'editOneFat',
      category,
    })
  },

  update(e) {
    let {
      editType, date, category, dietPlan
    } = this.data;
    if (editType == 'planName') {
      // 修改方案名
      apiRequest.updateUserProgrammeDetailThree({
        planName: e.detail.iptVal,
        type: '03',
        date: day(date).format('YYYYMMDD')

      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    } else if (editType == 'categoryEnergy') {
      // 修改三餐能量比
      let listArr = e.detail.listArr;
      const categoryRatioList = listArr.map(item => {
        return {
          totalRatio: item.val,
          category: item.category
        }
      })
      apiRequest.updateUserProgrammeDetailThree({
        categoryRatioList: categoryRatioList,
        type: '02',
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    } else if (editType == 'editOneCategory') {
      // 三大宏量元素
      let listArr = e.detail.listArr;
      apiRequest.updateUserProgrammeDetailThree({
        carbohydrateRatio: listArr[2].val,
        proteinRatio: listArr[0].val,
        fatRatio: listArr[1].val,
        category: this.data.editCategory,
        type: '01',
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    } else if (editType == 'editIntake') {
      // 摄入量
      let oneObj = e.detail.oneObj;
      var fixedProteinRatioList = [];
      dietPlan.planDetailList.forEach((item, index) => {
        let childArr = {};
        childArr.category = item.category;
        childArr.proteinRatio = item.fixedProteinRatio;
        fixedProteinRatioList.push(childArr)
      })
      apiRequest.updateUserProgrammeDetailThree({
        totalIntake: oneObj.val,
        type: '04',
        calculationMethod: dietPlan.calculationMethod,
        energyDifference: dietPlan.energyDifference,
        energyRatio: dietPlan.planDetailList[0].energyRatio,
        fixedProteinRatioList: fixedProteinRatioList,
        sportsConsume: dietPlan.sportsConsume,
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    }else if (editType == 'editPro') {
      // 修改单位体重所需蛋白
      let oneObj = e.detail.oneObj;
      if(oneObj.val == dietPlan.planDetailList[0].energyRatio){
        // 修改值和当前相等 不调用接口
        this.editPopup.handleClickOverlay()
        return
      }
      apiRequest.updateUserProgrammeDetailThree({
        energyRatio: oneObj.val,
        totalIntake: dietPlan.totalIntake,
        type: '04',
        calculationMethod: dietPlan.calculationMethod,
        energyDifference: dietPlan.energyDifference,
        fixedProteinRatioList: fixedProteinRatioList,
        sportsConsume: dietPlan.sportsConsume,
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    }else if (editType == 'editThreeCate') {
      // 修改三餐蛋白
      let listArr = e.detail.listArr;
      const categoryRatioList = listArr.map(item => {
        return {
          proteinRatio: item.val,
          category: item.category
        }
      })
      apiRequest.updateUserProgrammeDetailThree({
        totalIntake: dietPlan.totalIntake,
        calculationMethod: dietPlan.calculationMethod,
        energyDifference: dietPlan.energyDifference,
        energyRatio: dietPlan.planDetailList[0].energyRatio,
        fixedProteinRatioList: categoryRatioList,
        sportsConsume: dietPlan.sportsConsume,
        type: '04',
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    }else if (editType == 'editOneFat') {
      // 修改单餐脂肪
      let oneObj = e.detail.oneObj;
      apiRequest.updateUserProgrammeDetailThree({
        fatRatio: oneObj.val,
        category,
        type: '04',
        date: day(date).format('YYYYMMDD')
      }).then((res) => {
        this.queryUserPlanCacheThree()
      })
    }
    this.editPopup.handleClickOverlay()
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
  onShareAppMessage: function (options) {

  }
})