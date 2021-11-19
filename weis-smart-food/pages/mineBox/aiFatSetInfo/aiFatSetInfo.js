// pages/mineBox/aiFatSetInfo/aiFatSetInfo.js
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    curWeight: '',
    tarWeight: '',
    help: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      reset: options.reset
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
    this.queryUserInfo()
  },
  // --------------设置目标--------------
  // 获取当前体重
  queryUserInfo: function () {
    apiRequest.queryUserInfo({
      mainUid: true
    })
      .then(res => {
        let infoObj = res.obj;
        this.setData({
          curWeight: infoObj.userProfile.weight
        }, () => {
          this.curWeightCheck()
        })
      })
      .catch(error => {

      })
  },
  // 当前体重-输入完
  curWeightBlur(e) {
    let curWeight = e.detail.value;
    this.setData({
      curWeight
    },()=>{
      if(curWeight) {
        if(curWeight.toString().indexOf('.') != -1 && curWeight.toString().split('.')[1].length > 1){
          wx.showToast({
            title: '体重只保留一位小数点',
            icon: 'none',
          });
          return
        }
        this.updateUserProfile()
      }
    })
  },
  // 目标体重-输入完
  tarWeightBlur(e) {
    let tarWeight = e.detail.value;
    this.setData({
      tarWeight
    },()=>{
      if(tarWeight) {
        if(tarWeight.toString().indexOf('.') != -1 && tarWeight.toString().split('.')[1].length > 1){
          wx.showToast({
            title: '体重只保留一位小数点',
            icon: 'none',
          });
          return
        }
        this.tarWeightCheck()
      }
    })
  },
  // 更新当前体重
  updateUserProfile() {
    const { curWeight } = this.data;
    apiRequest.updateUserProfile({
      weight: curWeight,
    })
      .then(res => {
        if(res.errCode == 0 && res.obj.result) {
          this.curWeightCheck()
        }
      })
      .catch(error => {

      })
  },
   // 当前体重-校验
   curWeightCheck() {
    let { curWeight, tarWeight , tarWeightErr } = this.data;
    apiRequest.queryUserBmi().then(res => {
      if(res.errCode == 0) {
        // 初始体重计算的BMI=体重(kg)/身高(m)2，小于17则直接显示“你的体重过轻，不建议继续减肥”，
        let curWeightErr = res.obj.bmi < 17;
        this.setData({
          curWeightErr,
          btnSelect: curWeight && tarWeight && !curWeightErr && !tarWeightErr
        })
      }
    })
      .catch(error => {

      })
  },
  // 目标体重-校验
  tarWeightCheck() {
    let { curWeight, tarWeight, curWeightErr } = this.data;
    // 输入目标体重需要小于当前体重，否则给予提示.
    let tarWeightErr = tarWeight?Number(tarWeight) >= Number(curWeight):false
    this.setData({
      tarWeightErr,
      btnSelect: curWeight && tarWeight && !curWeightErr && !tarWeightErr
    })
  },
  // 获取减肥所需天数
  queryStandardDay(sign) {
    const { tarWeight, days } = this.data;
    apiRequest.queryStandardDay({
      targetWeight: tarWeight,
      days
    })
      .then(res => {
        if(res.errCode == 0) {
          const {stt, standardDay} = res.obj;
          // stt 01标准天数  02非标准天数  03减肥速度过快
          if(sign == 'nextStep') {
            this.setData({
              stt,
              standardDay,// 标准天数
              step: 2,
              btnSelect: true,
              btnText: '完成'
            })
          }else {
            this.setData({
              stt,
              btnSelect: stt == '03'?false:true
            })
          }
          
        }
      })
      .catch(error => {

      })
  },
  // --------------设置时长--------------
  // 时长
  dayChange(e) {
    let days = e.detail.value;
    this.setData({
      days
    }, () => {
      this.queryStandardDay('dayChange')
    })
  },
  // 最科学推荐
  standardDay() {
    this.setData({
      days: this.data.standardDay
    }, () => {
      this.queryStandardDay('standardDay')
    })
  },
  // 问号信息
  help() {
    this.setData({
      help: true
    })
  },
  // --------------下一步/完成--------------
  nextStep() {
    let {
      btnSelect,
      step,
      curWeight,
      tarWeight,
      days,
      standardDay,
      reset
    } = this.data;
    let day = days?days:standardDay;
    if (btnSelect) {
      switch (step) {
        case 1:
          if((curWeight.toString().indexOf('.') != -1 && curWeight.toString().split('.')[1].length > 1) || (tarWeight.toString().indexOf('.') != -1 && tarWeight.toString().split('.')[1].length > 1)){
            wx.showToast({
              title: '体重只保留一位小数点',
              icon: 'none',
            });
            return
          }
          this.queryStandardDay('nextStep')
          break;
        case 2:
          wx.navigateTo({
            url: '/pages/mineBox/scheme/scheme?from=aiFat&tarWeight=' + tarWeight + '&days=' + day + '&reset=' + reset
          });
          break;
      }
    }
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
  // onShareAppMessage: function () {

  // }
})