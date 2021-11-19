// pages/mineBox/role/role.js
import apiRequest from '../../../service/index';
const app = getApp();
const date = new Date();
import {
  getStorage,
  setStorage,
  removeStorage,
  setStorageSync
} from '../../../utils/storage'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
    scrollHeight: '',
    roleList: [
      {
        label: '女士-成人（18+岁)', 
        value: {
          sex: 2,
          age: 18,
          height: '160',
          weight: '55',
          motion: '01',
        }
      },
      // {
      //   label: '女士-老年人（65岁及以上)',
      //   value: {
      //     sex: 2,
      //     age: 65,
      //     height: '172',
      //     weight: '60',
      //     motion: '01',
      //   }
      // },
      {
        label: '男士-成人（18+岁)', 
        value: {
          sex: 1,
          age: 18,
          height: '170',
          weight: '65',
          motion: '01',
        }
      },
      // {
      //   label: '男士-老年人（65岁及以上)',
      //   value: {
      //     sex: 1,
      //     age: 65,
      //     height: '172',
      //     weight: '60',
      //     motion: '01',
      //   }
      // },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tsuSubType: options.tsuSubType, //00 私人账号 01 企业账号
      from: options.from || '',
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
    this.calculat();
  },
  // 计算滚动高度
  calculat: function () {
    let { px2rpx } = this.data;
    let mobileInfo = wx.getSystemInfoSync();
    // let scrollHeight = 设备屏幕高度的px * 设备px转rpx的换算比例 - 头部图片高度rpx - 头部图片下边距rpx - 底部按钮高度rpx
    let scrollHeight = mobileInfo.windowHeight * px2rpx - 264 - 30 - 300;
    // console.log(mobileInfo.windowHeight * px2rpx)
    this.setData({
      scrollHeight
    })
  },
  // 角色点击
  roleTap(e) {
    const {val, index} = e.currentTarget.dataset;
    this.setData({
      roleVal: val,
      roleIndex: index,
    })
  },
  change() {
    let { subToken, planningType } = this.data;
    if(planningType == '32') {
      if(subToken) {
        wx.navigateTo({
          url: `/pages/packSubAccount/addSubAccount/addSubAccount?tsuSubType=00&from=update&subToken=${subToken}`,
        }); 
      } else {
        wx.navigateTo({
          url: '/pages/mineBox/question/question'
        })
      }
      return
    }
    wx.navigateTo({
      url: '/pages/mineBox/questionPlan/questionPlan',
    });
  },
  // 去完善信息
  toQuestion() {
    if(this.data.tsuSubType) {
      wx.navigateTo({
        url: `/pages/packSubAccount/addSubAccount/addSubAccount?tsuSubType=${this.data.tsuSubType}`,
      }); 
    } else {
      wx.navigateTo({
        url: '/pages/mineBox/question/question'
      })
    }
  },
  // 完成
  submit() {
    // 创建子账号
    if(this.data.tsuSubType) {
      this.perfectProfileForSubUser()
    } else {
    // 创建主账号
      this.perfectProfile()
      this.addUserTarget()
    }
  },
  // 提交数据
  perfectProfile() {
    const { roleVal } = this.data;
    // marketType：01 健身市场(对应目标01,02) 02 慢病市场(对应目标04) 03 轻食市场(对应目标10,03)
    // const marketType = ['01', '02'].includes(targetValue)?'01':['04'].includes(targetValue)?'02':'03'
    // // 注册绑定客户经理或营养师
    apiRequest.bindCounselor({
      // marketType
    }).then(res => {})
    .catch(error => { });
    // 完善身体数据
    apiRequest.perfectProfile({
      sex: roleVal.sex,
      birthday: (date.getFullYear() - roleVal.age) + '0101',
      height: roleVal.height,
      weight: roleVal.weight,
      motion: roleVal.motion,
      bodyfat: 0,
      bloodValue: '',
      appetite: '',
      pregnancyCycle: '',
      nephroticCycle: ''
    }).then(res => {
      if (res.errCode == 0) {
        let loginInfo = {
          isAuthorized: res.obj.isAuthorized,
          isLogin: res.obj.isLogin,
          isPerProfile: res.obj.isPerProfile
        }
        setStorage('loginInfo', loginInfo)
        wx.switchTab({
          url: '/pages/index/index'
        });
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
    apiRequest.addUserTarget({
      planningType: '32' // 默认传32
    }).then(res => {
      
    })
    .catch(error => { });
  },
  // 创建子账号
  perfectProfileForSubUser() {
    const { roleVal, tsuSubType } = this.data;
    apiRequest.perfectProfileForSubUser({
      sex: roleVal.sex,
      birthday: (date.getFullYear() - roleVal.age) + '0101',
      height: roleVal.height,
      weight: roleVal.weight,
      motion: roleVal.motion,
      bloodValue: '',
      appetite: '',
      pregnancyCycle: '',
      nephroticCycle: '',
      subName: '子账号',
      tsuSubType, //子账号类型
      registerFrom: '01',
      planningType: '32',
      tgcuTgcId: 0,
      tgcuTgcaId: 0,
    }).then(res => {
      this.setData({
        subToken: res.obj.subToken
      })
      wx.navigateBack({
        delta: 1
      });
    })
  },
  
  // updateUserTarget() {
  //   apiRequest.updateUserTarget({
  //     planningType,
  //     dataStt: '00', // 数据类型为修改
  //     subToken: this.data.subToken,
  //   }).then(res => {
  //     if(!customPlan){
  //       this.toPage(); // 判断跳转哪个页面
  //       // this.setData({
  //       //   stepNum: 'loading',
  //       // })
  //     }
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
  onShareAppMessage: function () {

  }
})