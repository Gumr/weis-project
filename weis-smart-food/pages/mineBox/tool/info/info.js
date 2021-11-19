// pages/mineBox/tool/info/info.js
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day'
import { getStorage, setStorage } from '../../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 年龄
    thisYear: new Date().getFullYear(),
    // 性别
    sexList: [{
      name: '男',
      id: 1,
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%205%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%94%B7%E5%A3%AB2.png'
    }, {
      name: '女',
      id: 2,
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%206%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E5%A5%B3%E5%A3%AB2.png'
    }],
    sexIndex: 0,
    sexId: '',
    // 日常活动强度
    activityList: [{
        name: '久坐',
        title: '如程序员，设计师，运营，会计，办公室职员等',
        id: '01'
      },
      {
        name: '轻体力活动',
        title: '如学生，教师，司机，医生等',
        id: '02'
      },
      {
        name: '中体力活动',
        title: '如销售员，服务员，家庭主妇等',
        id: '03'
      }
    ],
    activityIndex: 1,
    activity: '',
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
    this.queryUserInfo()
  },
  // 年龄----------
  ageChange(e) {
    const val = e.detail.value;
    this.setData({
      age: val,
    });
    this.isBtnSelect()
  },
  // 性别----------
  sexTap() {
    this.setData({
      sexShow: true
    })
  },
  sexHide: function () {
    this.setData({
      sexShow: false,
    })
  },
  sexChange(e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      sexIndex: index,
    })
  },
  sexConfirm() {
    let { sexList, sexIndex } = this.data;
    this.setData({
      sexShow: false,
      sexId: sexList[sexIndex].id,
      sex: sexList[sexIndex].name,
    })
    this.isBtnSelect()
  },
  // 身高----------
  heightChange(e) {
    const val = e.detail.value;
    this.setData({
      height: val,
      heightErr: val && (val < 50 || val > 200),
    });
    this.isBtnSelect()
  },
  // 体重----------
  weightChange(e) {
    const val = e.detail.value;
    this.setData({
      weight: val,
      weightErr: val && (val < 5 || val > 200),
    });
    this.isBtnSelect()
  },
  // 运动强度----------
  activityTap() {
    this.setData({
      activityShow: true
    })
  },
  activityHide() {
    this.setData({
      activityShow: false
    })
  },
  activityChange(e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      activityIndex: index,
    })
  },
  activityConfirm() {
    let { activityList, activityIndex } = this.data;
    this.setData({
      activityShow: false,
      activityId: activityList[activityIndex].id,
      activity: activityList[activityIndex].name,
    })
    this.isBtnSelect()
  },
  // 其它----------
  // 获取用户信息
  queryUserInfo() {
    apiRequest.queryUserInfo({})
      .then(res => {
        console.log(res.obj)
        let { thisYear, sexList, activityList } = this.data;
        // 用户信息
        let userInfo = res.obj;
        // 新用户授权登录 && 没走注册流程（没有身体数据）
        if(!userInfo.isPerProfile) {
          this.setData({
            userInfo,
          })
          this.isBtnSelect()
          return;
        }
        // 年龄
        let age = thisYear - String(userInfo.userProfile.birthday).substring(0, 4);
        // 性别
        let sexIndex = sexList.findIndex(item => item.id == userInfo.sex);
        let sexId = userInfo.sex;
        let sex = sexList[sexIndex].name;
        // 身高
        let height = userInfo.userProfile.height;
        // 体重
        let weight = userInfo.userProfile.weight;
        // 运动强度
        let activityIndex = activityList.findIndex(item => item.id == userInfo.userProfile.motion);
        let activityId = userInfo.userProfile.motion;
        let activity = activityList[activityIndex].name;
        this.setData({
          userInfo,
          age,
          sexIndex,
          sexId,
          sex,
          height,
          weight,
          activityIndex,
          activityId,
          activity
        })
        this.isBtnSelect()
      })
      .catch(error => {

      })
  },
  // 按钮是否可选
  isBtnSelect() {
    let { age, sex, height, weight, activity, heightErr, weightErr } = this.data;
    this.setData({
      btnSelect: age && sex && height && weight && activity && !heightErr && !weightErr ? true : false
    })
  },
  // 提交
  submit() {
    if(!this.data.btnSelect) {
      return
    }
    let { thisYear, age, sexId, height, weight, activityId, userInfo } = this.data;
    let obj = {
      invokeMethod: 'toolkit',
      plan: '01', // 目标 - 01减脂减重
      date: day(Date.now()).format('YYYYMMDD'), // 日期
      bodyFat: userInfo.userProfile.bodyfat || 0, // 体脂率 
      birthday: thisYear - age + '0101',
      sex: sexId, // 性别
      height, // 身高
      weight, // 体重
      motion: activityId, // 日常活动消耗
    }
    if(!userInfo.isPerProfile) {
      this.perfectProfile(obj)
      this.addUserTarget()
    }
    wx.navigateTo({
      url: `/pages/mineBox/scheme/scheme?from=toolInfo&apiParams=${JSON.stringify(obj)}`
    });
  },
  // 提交身体数据
  perfectProfile(obj) {
      // 注册绑定客户经理或营养师
      apiRequest.bindCounselor({
        // marketType
      }).then(res => {})
      .catch(error => { });
      // 完善身体数据
      apiRequest.perfectProfile({
        sex: obj.sex,
        birthday: obj.birthday,
        height: obj.height,
        weight: obj.weight,
        bodyfat: 0,
        motion: obj.motion,
      }).then(res => {
        if (res.errCode == 0) {
          const loginInfo = getStorage('loginInfo');
          loginInfo.isPerProfile = true
          setStorage('loginInfo', loginInfo);
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      })
      .catch(error => { });
  },
  // 增加用户目标
  addUserTarget() {
    // 增加用户目标
    apiRequest.addUserTarget({
      planningType: '01' // 默认 '减脂减重'
    }).then(res => { })
    .catch(error => { });
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