// pages/solution/solutionSet/solutionSet.js]

import day from '../../../libs/day';
import apiRequest from '../../../service/index'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // kindList: [{
    //   id: '01',
    //   name: '减脂'
    // }, {
    //   id: '02',
    //   name: '增肌'
    // }, {
    //   id: '03',
    //   name: '保持体型'
    // }],
    // targets: ['减脂', '增肌', '保持体型']
    id: '01'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from: options.from || '',
      subToken: options.subToken || '',
    })
    this.init();

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

  init: function () {
    this.setData({
      navStatusHeight: wx.getStorageSync('navStatusHeight')
    })
    this.queryUserBasalMetabolism()
  },

  // 获取用户基础代谢及日常消耗
  queryUserBasalMetabolism: function () {
    var that = this;
    apiRequest.queryUserBasalMetabolism({
        planningType: that.data.id,
        initStt: that.data.from == 'question' || that.data.subToken ? '00' : '',
        subToken: that.data.subToken,
      })
      .then(res => {
        res.obj.metabolize = Number(res.obj.metabolize);
        res.obj.daily = Number(res.obj.daily);
        that.setData({
          param: res.obj,
          expenditure: res.obj.sportsConsume,
          carbohydrateRatio: res.obj.thermalEffectCarbohydrate,
          proteinRatio: res.obj.thermalEffectProtein,
          fatRatio: res.obj.thermalEffectFat,
          dailyEnergy: Number(res.obj.totalIntake),
          showRecom: true,
        })
      })
      .catch(error => {

      })
  },

  // 点击食物热效应
  effect: function () {
    this.setData({
      effect: !this.data.effect
    })
  },


  // targetConfirm(e){
  //   let {kindList} = this.data;
  //   let index = e.detail.value[0];
  //   this.setData({
  //     aimName: kindList[index].name,
  //     id: kindList[index].id,
  //   })
  //   this.queryUserBasalMetabolism()
  // },

  // 吃法名称
  editName(){
    this.setData({
      showEdit: true,
      iptType: 1,
      iptVal: this.name,
      title: '吃法名称',
      btnText: '保存',
      editType: 'editName'
    })
  },

  // 每日应摄入
  editDailyEnergy(){
    const oneObj = {
      val: this.data.dailyEnergy || '',
      unit: 'kcal'
    }
    this.setData({
      title: '摄入量',
      subTitle: '',
      btnText: '确定',
      showEdit: true,
      iptType: '3',
      oneObj,
      editType: 'editDailyEnergy',
    })
  },

  update(e){
    let {editType} = this.data;
    if(editType == 'editName'){
      this.setData({
        name: e.detail.iptVal
      })
    }else if(editType == 'editDailyEnergy'){
      if (e.detail.oneObj.val < (this.data.param.metabolize / 0.85)) {
        wx.showToast({
          title: '每日应摄入能量不能低于基础代谢' + parseInt(this.data.param.metabolize / 0.85) + 'kcal',
          icon: 'none',
        });
        // return
      }
      this.setData({
        dailyEnergy: e.detail.oneObj.val
      })
    }
    this.editPopup.handleClickOverlay()
  },

  // 键盘高度
  keyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },

  bindblur(){
    this.setData({
      keyboardheight: 0
    })
  },



  energy: function (e) {
    if (e.currentTarget.dataset.type == '1') {
      this.setData({
        energy: true,
        placeholder: '请输入',
        type: 'text',
        title: '吃法名称',
        unit: '',
        shortData: '',
        maxlength: 15
      })
    }
    if (e.currentTarget.dataset.type == '2') {
      this.setData({
        energy: true,
        placeholder: '请输入',
        type: 'digit',
        title: '数值',
        unit: 'kg',
        shortData: '',
        maxlength: 5
      })
    }
    if (e.currentTarget.dataset.type == '3') {
      this.setData({
        energy: true,
        placeholder: '请输入',
        type: 'number',
        title: '能量差',
        unit: 'kcal',
        shortData: '',
        symbol: true,
        symbolIndex: 0,
      })
    }
    if (e.currentTarget.dataset.type == '4') {
      this.setData({
        energy: true,
        placeholder: '请输入',
        type: 'digit',
        title: '运动消耗',
        unit: 'kcal',
        shortData: '',
        maxlength: 5
      })
    }
    if (e.currentTarget.dataset.type == '5') {
      this.setData({
        energy: true,
        placeholder: '请输入',
        type: 'number',
        title: '每日应摄入',
        unit: 'kcal',
        shortData: '',
        maxlength: 5
      })
    }
  },

  // 目标数值显示
  // aim: function () {
  //   this.setData({
  //     showAim: !this.data.showAim
  //   })
  // },

  // 能量差符号选择
  symbol: function (e) {
    this.setData({
      symbolIndex: e.detail
    })
  },


  nexStep: function () {
    var that = this;
    if (!that.data.name) {
      wx.showToast({
        title: '请填写吃法名称',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if (!that.data.id) {
      wx.showToast({
        title: '请选择目标',
        icon: 'none',
        duration: 1500,
      });
      return
    }

    that.addUserProgramme()
  },


  addUserProgramme: function () {
    var that = this;
    apiRequest.addUserProgramme({
        planName: that.data.name,
        targetWeight: that.data.aimNum,
        basalMetabolism: that.data.param.metabolize,
        dailyConsume: that.data.param.daily,
        totalIntake: that.data.dailyEnergy,
        dailyCalorieIntake: '1',
        thermalEffectProtein: that.data.proteinRatio,
        thermalEffectFat: that.data.fatRatio,
        thermalEffectCarbohydrate: that.data.carbohydrateRatio,
        planningType: that.data.id,
        initStt: that.data.from == 'question' || that.data.subToken ? '00' : '',
        subToken: that.data.subToken,
      })
      .then(res => {
        if (res.errCode == '0') {
          // saveId
          wx.redirectTo({
            url: `/pages/packageDiscover/customPlan/customPlan?id=${res.obj.saveId}&from=${that.data.from}&subToken=${that.data.subToken}`
          });
        }
      })
      .catch(error => {

      })
  },




  getTime: function (planId) {
    var that = this;
    solutionService.queryProgrammeList({
        params: [{
          isMainPlan: 0,
          planStt: '01',
          supId: planId ? planId : '0',
          planRestrict: false
        }]
      })
      .then(res => {
        let list = res.obj.dietPlanList;
        let existArr = [];
        list.forEach(function (item, index) {
          existArr.push(util.dateSwitch(item.dateTime))
        })
        that.setData({
          existArr
        })
      })
      .catch(error => {

      })
  },



  edit: function (e) {
    this.setData({
      showPara: true,
      shortT: '',
      shortD: '',
      shortZ: '',
    })
  },

  para: function () {
    this.setData({
      showPara: false,
      shortT: 0,
      shortD: 0,
      shortZ: 0,
    })
  },

  goal: function (e) {
    if (e.currentTarget.dataset.index === '0') {
      this.setData({
        warn: false,
        shortD: e.detail.value
      })
    }
    if (e.currentTarget.dataset.index === '1') {
      this.setData({
        warn: false,
        shortT: e.detail.value
      })
    }
    if (e.currentTarget.dataset.index === '2') {
      this.setData({
        warn: false,
        shortZ: e.detail.value
      })
    }
    if (Number(this.data.shortZ) >= 0 && Number(this.data.shortZ) <= 5 && Number(this.data.shortD) >= 20 && Number(this.data.shortD) <= 30 && Number(this.data.shortT) >= 5 && Number(this.data.shortT) <= 10) {
      this.setData({
        shortGoal: true
      })
    } else {
      this.setData({
        shortGoal: false
      })
    }
  },

  editPara: function () {
    var pattern = /^[1-9](\d+)?(\.\d+)?$|^0(\.\d+)?$/;
    if ((this.data.shortT.length >= 2 && this.data.shortT.substr(0, 1) == 0 && (this.data.shortT.substr(1, 1) == 0 || this.data.shortT.substr(this.data.shortT.length - 1, 1) == 0))) {
      wx.showToast({
        title: '碳水数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if ((this.data.shortD.length >= 2 && this.data.shortD.substr(0, 1) == 0 && (this.data.shortD.substr(1, 1) == 0 || this.data.shortD.substr(this.data.shortD.length - 1, 1) == 0))) {
      wx.showToast({
        title: '蛋白质数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if ((this.data.shortZ.length >= 2 && this.data.shortZ.substr(0, 1) == 0 && (this.data.shortZ.substr(1, 1) == 0 || this.data.shortZ.substr(this.data.shortZ.length - 1, 1) == 0))) {
      wx.showToast({
        title: '脂肪数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if (!pattern.test(this.data.shortT) || !pattern.test(this.data.shortD) || !pattern.test(this.data.shortZ)) {
      wx.showToast({
        title: '数值不合法',
        icon: 'none',
        duration: 1500,
      });
      return
    }
    if (this.data.shortGoal) {
      this.setData({
        carbohydrateRatio: this.data.shortT,
        proteinRatio: this.data.shortD,
        fatRatio: this.data.shortZ,
        showPara: false
      })
    } else {
      wx.showToast({
        title: '数据不合法',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
      });
    }
  },

  // 日常消耗弹窗
  know: function (e) {
    let type = e.currentTarget.dataset.type;
    let title1 = '什么是日常消耗？';
    let content1 = '除基础代谢消耗和额外运动消耗以外，日常生活引发活动所消耗的能量。';
    let title2 = '食物热效应';
    let content2 = '当食物在体内吸收代谢的过程中，身体付出的热量为食物热效应。';
    this.setData({
      showTitle: type == '1' ? title1 : (type == '2' ? title2 : ''),
      showContent: type == '1' ? content1 : (type == '2' ? content2 : ''),
      dailyDialog: !this.data.dailyDialog
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