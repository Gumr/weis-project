// pages/mineBox/question/question.js
const app = getApp();
import { getStorage, setStorage } from '../../../utils/storage'
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import { targetTip, chronicTip, liveTip } from '../../../utils/map'
const date = new Date();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thisYear: date.getFullYear(),
    // ---目标---
    targetList: [
      {
        name: '营养均衡',
        detail: '参考《中国居民膳食指南》',
        value: '11', // 23
        planningType: '23',
      },
      // {
      //   name: '七分饱健康饮食',
      //   value: '11', // 26
      //   planningType: '26',
      // },
      {
        name: '减脂减重',
        detail: '参考《中国超重/肥胖医学营养治疗专家共识》',
        value: '01', // 01
        planningType: '01',
      },
      {
        name: '保持体型', // 由营养均衡 改为 保持体型
        detail: '参考《中国居民膳食营养素参考摄入量》',
        value: '03', // 03
        planningType: '03',
      },
      {
        name: '增肌增重',
        detail: '参考《美国国家体能协会运动营养指南》',
        value: '02', // 02
        planningType: '02',
      },
      {
        name: '孕妇饮食',
        value: '11',  // 25
        planningType: '25',
      },
      // {
      //   name: '控制血糖',
      //   title: '出控制血糖方案',
      //   value: '04'
      // },
      {
        name: '少儿发育',
        detail: '参考《中国学龄儿童膳食指南》',
        value: '05', // 12
        planningType: '12',
      },
      {
        name: '青少年成长',
        detail: '参考《WS/T 554-2017学生餐营养指南》',
        value: '06', // 13
        planningType: '13',
      },
      {
        name: '老年人膳食',
        detail: '参考《WST556--2017老年人膳食指导》',
        value: '08',//22
        planningType: '22',
      },
      {
        name: '慢病饮食干预',
        value: '04'   // 04 05 06 07 08 09 11
      },
      // {
      //   name: '住院饮食干预',
      //   value: '07'  // 14 15 16 17 18 21 19 20
      // },
      
      {
        name: '自定义吃法',
        // detail: '创建健康饮食吃法',
        value: '09', // 24
        planningType: '24',
      },
    ],
    targetSelect: '',
    targetValue: '',
    isTarget: false,

    // ---慢病饮食干预---
    chronicList: [{
        name: '糖尿病',
        detail: '参考《中国糖尿病医学营养治疗指南》',
        value: '04'
      },
      {
        name: '妊娠糖尿病',
        detail: '参考《妊娠合并糖尿病的营养治疗》',
        value: '05'
      },
      {
        name: '高血压',
        detail: '参考《高血压患者膳食指导》',
        value: '06'
      },
      {
        name: '高血脂',
        detail: '参考《高脂血症治疗指南》',
        value: '07'
      },
      {
        name: '高尿酸血症',
        detail: '参考《高尿酸血症》',
        value: '08'
      },
      {
        name: '脂肪肝',
        detail: '参考《脂肪肝患者的饮食与营养治疗》',
        value: '09'
      },
      {
        name: '慢性肾病',
        detail: '参考《WS/T 557-2017 慢性肾脏病患者膳食指导》',
        value: '11'
      }
    ],
    chronicSelect: '',
    chronicValue: '',
    isChronic: false,

    // ---住院饮食干预---
    liveList: [{
        name: '糖尿病', 
        detail: '参考《中国糖尿病医学营养治疗指南》',
        value: '14'
      },
      {
        name: '妊娠糖尿病',
        detail: '参考《妊娠合并糖尿病的营养治疗》',
        value: '15'
      },
      {
        name: '高血压',
        detail: '参考《高血压患者膳食指导》',
        value: '16'
      },
      {
        name: '高血脂',
        detail: '参考《高脂血症治疗指南》',
        value: '17'
      },
      {
        name: '高尿酸血症',
        detail: '参考《高尿酸血症》',
        value: '18'
      },
      // {
      //   name: '肿瘤',
      //   value: '21'
      // },
      {
        name: '外科手术后',
        detail: '参考《成人围手术期营养支持指南》',
        value: '19'
      },
      {
        name: '慢性肾病',
        detail: '参考《WS/T 557-2017 慢性肾脏病患者膳食指导》',
        value: '20'
      }
    ],
    liveSelect: '',
    liveValue: '',
    isLive: false,

    // ---血糖值&主食---
    sugarList: [{
        name: '4-7.8',
        title: 'mmol/L',
        value: '1'
      },
      {
        name: '7.9-11.1',
        title: 'mmol/L',
        value: '2'
      },
      {
        name: '大于11.1',
        title: 'mmol/L',
        value: '3'
      }
    ],
    sugarSelect: '',
    sugarValue: '',

    foodList: [{
        name: '1碗',
        title: '',
        value: '1'
      },
      {
        name: '1.5碗',
        title: '',
        value: '1.5'
      },
      {
        name: '2碗',
        title: '',
        value: '2'
      },
      {
        name: '2碗以上',
        title: '',
        value: '100'
      }
    ],
    foodSelect: '',
    foodValue: '',
    isSugar: false,
    // ---怀孕周期---
    pregnantList: [
      {
        name: '孕早期',
        title: '(1-13周)',
        value: '01'
      },
      {
        name: '孕中期',
        title: '(14-27周)',
        value: '02'
      },
      {
        name: '孕晚期',
        title: '(28周及以后)',
        value: '03'
      },
    ],
    pregnantSelect: '',
    pregnantValue: '',
    isPregnant: false,
    // ---你的肾病是第几期---
    kidneyList: [
      {
        name:"肾病1期",
        value:"01"
      },
      {
        name:"肾病2期",
        value:"02"
      },
      {
        name:"肾病3期",
        value:"03"
      },
      {
        name:"肾病4期",
        value:"04"
      },
      {
        name:"肾病5期",
        value:"05"
      },
      {
        name:"血液透析与\n腹膜透析",
        value:"06"
      },
      {
        name:"合并高分解\n代谢疾病",
        value:"07"
      }
    ],
    kidneySelect: '',
    kidneyValue: '',
    isKidney: false,
    // ---其它---
    // 步骤按钮
    overBtn: 0,// 下一步0、显示完成（协议）1、确定2
    btnSelected:true,
    complete: '',
    px2rpx: app.globalData.px2rpx,
    scrollHeight: '',
    navTitle: '选择吃法',
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
    this.calculat();
    // 取微信性别，否则设默认值
    // const userInfo = getStorage('userInfo');
    // this.setData({
    //   sexIndex: userInfo.gender && userInfo.gender != 0?userInfo.gender-1:0,
    // })
    let subToken = getStorage("subToken") || '';
    let subInfo = getStorage('subInfo',subInfo)
    this.setData({
      tsuSubUid: subInfo.tsuSubUid,
      subToken
    })
    this.init()
  },
  // 获取用户注册信息
  init: function () {
    let requestObj = this.data.tsuSubUid ? {
      subUid: this.data.tsuSubUid
    } : {
      mainUid: true
    }
    apiRequest[this.data.tsuSubUid ? 'querySubUserInfo' : 'queryUserInfo'](
      requestObj
    )
      .then(res => {
        let infoObj = res.obj;
        infoObj.userProfile.year = String(infoObj.userProfile.birthday).substring(0, 4);
        this.setData({
          info: infoObj,
          sex: infoObj.userProfile.sex,
          age: this.data.thisYear - infoObj.userProfile.year,
        })
        this.targetFilter()
      })
      .catch(error => {

      })
  },
  // 目标过滤
  targetFilter() {
    // 目标根据用户年龄和性别显示
    let { age, sex, targetList, chronicList, liveList } = this.data;
    let targetListFliter = []
    if(age >= 1 && age <= 6) {
      // 1-6岁-少儿发育
      targetListFliter = targetList.filter((item, index) => ['12', '24',].includes(item.planningType));
    } else if(age >= 7 && age <= 17) {
      // 7-17岁-青少年成长
      targetListFliter = targetList.filter((item, index) => ['13', '24',].includes(item.planningType));
    } else if(age >= 18 && age <= 64) {
      // 18-64岁
      targetListFliter = targetList.filter((item, index) => ['23', '03', '01', '02', '25', '24',].includes(item.planningType) || ['04'].includes(item.value));
    } else if(age >= 65) {
      // 65岁以上
      targetListFliter = targetList.filter((item, index) => ['22', '24',].includes(item.planningType) || ['04'].includes(item.value));
    } else {
      targetListFliter = targetList
    }
    // 男性 || 65岁以上用户 -- 不显示"孕妇饮食" “妊娠糖尿病”
    if(sex == 1 || age >= 65) {
      // 孕妇饮食
      targetListFliter = targetListFliter.filter((item, index) => !['25'].includes(item.planningType));
      // 妊娠糖尿病
      this.setData({
        chronicList: chronicList.filter(item => !['05'].includes(item.value)),
        liveList: liveList.filter(item => !['15'].includes(item.value))
      })
    }
    this.setData({
      targetList: targetListFliter,
      complete: '目标'
    });
  },
  // 计算滚动高度
  calculat: function () {
    let { px2rpx } = this.data;
    let query = wx.createSelectorQuery();
    let that = this;
    query.select('.next').boundingClientRect(function (rect) {
    let mobileInfo = wx.getSystemInfoSync();
    // let scrollHeight = (设备屏幕高度的px - 下一步按钮高度的px) * 设备px转rpx的换算比例 - 下一步按钮下边距的rpx - 滚动与底部内容需拉开间距的rpx
    let scrollHeight = (mobileInfo.windowHeight - rect.height) * px2rpx - 65 - 268;
      that.setData({
        scrollHeight
      })
    }).exec();
  },

  // 目标（4/4）
  targetSelect: function (e) {
    const {index, value, planningtype} = e.currentTarget.dataset;
    const {age, overBtn} = this.data;
    switch (value) {
      case '04':
      case '07':
        this.setData({
          overBtn: 0,
          btnSelected:true
        })
        break;
      case '11':
        if(planningtype == '25') {
          this.setData({
            overBtn: 0,
            btnSelected:true
          })
        } else {
          this.setData({
            overBtn: 2,
            btnSelected: true
          })
        }
        break;
      default: 
        this.setData({
            overBtn: 2,
            btnSelected: value == '09' ? false : true
        })
    }
    this.setData({
      targetSelect: index,
      targetValue: value,
      targetPlanningType: planningtype,
    });
    // 自定义吃法
    // if(value == '09') {
    //   wx.navigateTo({
    //     url: '/pages/packageDiscover/planSet/planSet?from=question',
    //   })
    //   this.updateUserProfile(); // 提交数据
    //   this.updateUserTarget(); // 增加用户目标
    // }
    if(value == '09') {
      this.createCustomizeInitPlan()
    }
  },
  // 创建方案
  createCustomizeInitPlan() {
    apiRequest.createCustomizeInitPlan({
      subToken: getStorage("subToken") || ''
    })
      .then(res => {
        if (res.errCode == '0') {
          let planId = res.obj.dietPlan.id,
          subToken = getStorage("subToken") || '';
          wx.navigateTo({
            url: `/pages/packageDiscover/customPlan/customPlan?planId=${planId}&subToken=${subToken}&from=questionPlan`,
          })
        }
      })
      .catch(error => {

      })
  },
  // 慢病饮食干预
  chronicSelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    const {overBtn} = this.data;
    switch (value) {
      case '04':
      case '05':
      case '11':
        this.setData({
            overBtn: 0,
            btnSelected:true
        })
        break;
      default: 
        this.setData({
            overBtn: 2,
            btnSelected: true
        })
    }
    this.setData({
      chronicSelect: index,
      chronicValue: value,
    });
  },
  // 住院饮食干预
  liveSelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    const {overBtn} = this.data;
    switch (value) {
      case '14':
      case '15':
      case '20':
        this.setData({
            overBtn: 0,
            btnSelected:true
        })
        break;
      default: 
        this.setData({
            overBtn: 2,
            btnSelected: true
        })
    }
    this.setData({
      liveSelect: index,
      liveValue: value,
    });
  },
  // 血糖值（选择慢病饮食干预-糖尿病(控制血糖)目标的用户增加这个附加信息）
  sugarSelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    const {foodValue} = this.data;
    this.setData({
      sugarSelect: index,
      sugarValue: value,
      btnSelected: foodValue && value
    });
  },
  // 主食（选择慢病饮食干预-糖尿病(控制血糖)目标的用户增加这个附加信息）
  foodSelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    const {sugarValue} = this.data;
    this.setData({
      foodSelect: index,
      foodValue: value,
      btnSelected: sugarValue && value
    });
  },
  // 你的怀孕周期
  pregnantSelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    this.setData({
      pregnantSelect: index,
      pregnantValue: value,
      btnSelected: value
    });
  },
  // 你的肾病是第几期
  kidneySelect: function (e) {
    const {index, value} = e.currentTarget.dataset;
    this.setData({
      kidneySelect: index,
      kidneyValue: value,
      btnSelected: value
    });
  },
  // 下一步
  nextStep: function () {
    if (this.data.btnSelected) {
      // 目标-慢病
      if (this.data.complete == '目标' && this.data.targetValue == '04') {
        this.setData({
          isTarget: true,
          btnSelected: false,
          complete: '慢病',
          overBtn: 2
        });
        return;
      }
      // 目标-住院
      if (this.data.complete == '目标' && this.data.targetValue == '07') {
        this.setData({
          isTarget: true,
          btnSelected: false,
          complete: '住院',
          overBtn: 2
        });
        return;
      }
      // 目标-慢病-糖尿病
      if (this.data.complete == '慢病'  && this.data.chronicValue == '04') {
        this.setData({
          isChronic: true,
          btnSelected: false,
          complete: '血糖值',
          overBtn: 2
        });
        return;
      }
      // 目标-住院-糖尿病
      if (this.data.complete == '住院'  && this.data.liveValue == '14') {
        this.setData({
          isLive: true,
          btnSelected: false,
          complete: '血糖值',
          overBtn: 2
        });
        return;
      }
      // 目标-慢病-妊娠糖尿病
      if (this.data.complete == '慢病'  && this.data.chronicValue == '05') {
        this.setData({
          isChronic: true,
          btnSelected: false,
          complete: '妊娠糖尿病',
          overBtn: 2
        });
        return;
      }
      // 目标-住院-妊娠糖尿病
      if (this.data.complete == '住院'  && this.data.liveValue == '15') {
        this.setData({
          isLive: true,
          btnSelected: false,
          complete: '妊娠糖尿病',
          overBtn: 2
        });
        return;
      }
      // 目标-慢病-慢性肾病
      if (this.data.complete == '慢病'  && this.data.chronicValue == '11') {
        this.setData({
          isChronic: true,
          btnSelected: false,
          complete: '慢性肾病',
          overBtn: 2
        });
        return;
      }
      // 目标-住院-慢性肾病
      if (this.data.complete == '住院'  && this.data.liveValue == '20') {
        this.setData({
          isLive: true,
          btnSelected: false,
          complete: '慢性肾病',
          overBtn: 2
        });
        return;
      }
      // 目标-孕妇饮食
      if (this.data.complete == '目标' && this.data.targetValue == '11' && this.data.targetPlanningType == '25') {
        this.setData({
          isTarget: true,
          btnSelected: false,
          complete: '孕妇饮食',
          overBtn: 2
        });
        return;
      }
      this.updateUserProfile(); // 提交数据
      this.updateUserTarget(); // 增加用户目标
      wx.navigateBack({
        delta: 1
      });
    }
  },
  // 提交数据
  updateUserProfile() {
    const { sugarValue, foodValue, pregnantValue, kidneyValue} = this.data
    // 完善身体数据
    apiRequest.updateUserProfile({
      bloodValue: sugarValue,
      appetite: foodValue,
      pregnancyCycle: pregnantValue,
      nephroticCycle: kidneyValue,
      subToken: this.data.subToken,
    }).then(res => {
      if (res.errCode == 0) {

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
  updateUserTarget(customPlan) {
    const {targetList, targetSelect, targetValue, chronicValue, liveValue, age} = this.data;
    // 一级选项决定二级选项数据
    let planningType = ''
    switch (targetValue) {
      case '04':
        planningType = chronicValue
        break;
      case '07':
        planningType = liveValue
        break;
      case '09':
        age >= 1 && age <= 6 ? planningType = '12' : (age >= 7 && age <= 17 ? planningType = '13' : planningType = '23')//自定义方案先传默认 方案成功后修改为 24 自定义
        break;
      default:
        // planningType = targetValue
        planningType = targetList[targetSelect] ? targetList[targetSelect].planningType : ''
    }
    // 增加用户目标
    apiRequest.updateUserTarget({
      planningType,
      dataStt: '00', // 数据类型为修改
      subToken: this.data.subToken,
    })
    .then(res => {

    })
    .catch(error => {

    })
  },
  // 吃法介绍-弹窗
  conneTip(e) {
    const {planningtype, from, value} = e.currentTarget.dataset;
    let conneTip = {}
    switch (from) {
      case 'target':
        conneTip = targetTip;
        break;
      case 'chronic':
        conneTip = chronicTip;
        break;
      case 'live':
        conneTip = liveTip;
        break;
      default: 
      conneTip = {}
    }
    this.setData({
      conneTipShow: true,
      conneTipData: conneTip[value]
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
    // return {
    //   title: '维士健身饮食，健康美味！',
    //   path: '/pages/index/index',
    //   imageUrl: 'https://prodstatic.weis1606.cn/api/mini/small_program_share.png',
    //   success: res => {},
    //   fail: res => {}
    // };
  }
})