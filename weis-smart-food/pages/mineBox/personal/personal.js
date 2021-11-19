// pages/mineBox/personal/personal.js
const app = getApp();
import apiRequest from '../../../service/index';
import { getStorage, removeStorage } from '../../../utils/storage';
let date = new Date();
import {
  loginPromise,
} from '../../../utils/common'
// const years = []
// const months = []
// const days = []
// for (let i = 1900; i <= date.getFullYear(); i++) {
//   years.push(i)
// }

// for (let i = 1; i <= 12; i++) {
//   months.push(i)
// }

// for (let i = 1; i <= 31; i++) {
//   days.push(i)
// }
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 个人信息-数据
    info: {},
    // 性别
    showSex: false,
    sexList: [{
      name: '男',
      id: '1',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%205%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%94%B7%E5%A3%AB2.png'
    }, {
      name: '女',
      id: '2',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%206%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E5%A5%B3%E5%A3%AB2.png'
    }],
    sexIndex: '',
    // 吃法
    // ---吃法---
    targetList: [
      // {
      //   name: '营养均衡',
      //   detail: '参考《中国居民膳食指南》',
      //   value: '11', // 23
      //   planningType: '23',
      // },
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
      {
        name: '慢病饮食干预',
        value: '04'   // 04 05 06 07 08 09 11
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
      
      // {
      //   name: '住院饮食干预',
      //   value: '07'  // 14 15 16 17 18 21 19 20
      // },
      {
        name: '自定义吃法',
        detail: '创建健康饮食吃法',
        value: '09', // 24
        planningType: '24',
      },
    ],
    showTarget: false,
    targetValue: [],
    // targets: ['减脂减重', '增肌增重', '保持体型', '控制血糖', '营养均衡'],
    // targets: ['减脂减重', '增肌增重', '控制血糖', '营养均衡'],
    // targets: ['减脂减重', '增肌增重', '少儿发育 （1-6岁）', '青少年成长（7-17岁）', '慢病饮食干预', '住院饮食干预', '营养均衡'],
    targets: ['减脂减重', '保持体型', '增肌增重', '孕妇饮食', '慢病饮食干预', '少儿发育', '青少年成长', '老年人膳食', '自定义吃法'],
    target: '',
    targetDialog: false,
    twoLeveLlist: [], // 二级的数据使用哪个
    // 出生年月（年龄）
    thisYear: date.getFullYear(),
    showAge: false,
    // years: years,
    // months: months,
    // days: days,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    // 身高
    showHeight: false,
    height: '',
    // 体重
    showWeight: false,
    weight: '',
    // 设置日常活动强度
    showActive: false,
    activeValue: [],
    actives: ['久坐', '轻体力活动', '中体力活动'],
    active: '',
    // ---慢病饮食干预---
    chronicList: [{
        name: '糖尿病',
        value: '04'
      },
      {
        name: '妊娠糖尿病',
        value: '05'
      },
      {
        name: '高血压',
        value: '06'
      },
      {
        name: '高血脂',
        value: '07'
      },
      {
        name: '高尿酸血症',
        value: '08'
      },
      {
        name: '脂肪肝',
        value: '09'
      },
      {
        name: '慢性肾病',
        value: '11'
      }
    ],
    // chronics: ['糖尿病', '高血压', '高血脂'],
    chronics: ['糖尿病', '妊娠糖尿病', '高血压', '高血脂', '高尿酸血症','脂肪肝', '慢性肾病'],
    chronicValue: [],
    chronic: '',
     // ---住院饮食干预---
     liveList: [{
        name: '糖尿病', 
        value: '14'
      },
      {
        name: '妊娠糖尿病',
        value: '15'
      },
      {
        name: '高血压',
        value: '16'
      },
      {
        name: '高血脂',
        value: '17'
      },
      {
        name: '高尿酸血症',
        value: '18'
      },
      // {
      //   name: '肿瘤',
      //   value: '21'
      // },
      {
        name: '外科手术后',
        value: '19'
      },
      {
        name: '慢性肾病',
        value: '20'
      }
    ],
    // lives: ['糖尿病', '高血压', '高血脂'],
    lives: ['糖尿病', '妊娠糖尿病', '高血压', '高血脂', '高尿酸血症', '外科手术后', '慢性肾病'],
    liveValue: [],
    live: '',
    // 血糖值
    sugarDialog: false,// 血糖值&主食-弹窗

    showSugar: false,
    sugarValue: [],
    sugars: ['4-7.8', '7.9-11.1', '大于11.1'],
    sugar: '',
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
    // sugarSelect: '',
    // sugarValue: '',
    // 主食
    showFood: false,
    foodValue: [],
    foods: ['1碗', '1.5碗', '2碗', '2碗以上'],
    food: '',
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
    // foodSelect: '',
    // foodValue: ''
    // 你的怀孕周期
    showPregnant: false,
    pregnantValue: [],
    pregnants: ['孕早期(1-13周)', '孕中期(14-27周)', '孕晚期(28周及以后)'],
    pregnant: '',
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
    // 你的肾病是第几期
    showKidney: false,
    kidneyValue: [],
    kidneys: ['肾病1期', '肾病2期', '肾病3期', '肾病4期', '肾病5期', '血液透析与腹膜透析', '合并高分解代谢疾病'],
    kidney: '',
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
    keyboardHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      subToken: options.subToken || '',
      tsuSubUid: options.tsuSubUid || '',
      tgcaName: options.tgcaName || '',
    })
    loginPromise.then((res) => {
      this.setData({
        uid: res.uid
      })
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
    this.init();
    this.labelErgy();
  },

  labelErgy: function () {
    apiRequest.queryUserAllergen({
      type: '02',
      subToken: this.data.subToken,
    })
      .then(res => {
        let eatingHabits = res.obj.eatingHabits || [];
        let str = '';
        eatingHabits.forEach((item,index)=>{
          str+=`${item.name}${index == eatingHabits.length-1 ? '' : '、'}`
        })
        this.setData({
          allergenText: str
        })
      })
      .catch(error => {

      })
  },

  allergen(){
    let subToken = this.data.subToken;
    wx.navigateTo({
      url: `/pages/mineBox/allergen/allergen?subToken=${subToken}`,
    });   
  },

  init: function () {
    var that = this;
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
        // 一级选项决定二级选项数据
        switch (infoObj.goalType) {
          case '04':
            this.setData({
              twoLeveLlist: that.data.chronicList
            })
            break;
          case '07':
            this.setData({
              twoLeveLlist: that.data.liveList
            })
            break;
        }
        wx.setStorageSync('userProfile', infoObj.userProfile);
        infoObj.userProfile.birthday = String(infoObj.userProfile.birthday).substring(0, 4) + '-' + String(infoObj.userProfile.birthday).substring(4, 6) + '-' + String(infoObj.userProfile.birthday).substring(6, 8)
        infoObj.userProfile.year = String(infoObj.userProfile.birthday).substring(0, 4);
        infoObj.userProfile.motion = parseInt(infoObj.userProfile.motion) - 1;
        // // planningType：10为其它（下标是4），所以值10则转为下标为4，否则按照正常取下标
        // // infoObj.healthGoal.planningType = infoObj.healthGoal.planningType == '10'?4:parseInt(infoObj.healthGoal.planningType) - 1;
        // // planningType：值 转-> 下标
        // infoObj.healthGoal.planningType = that.data.targetList.findIndex((item, index) => item.value == infoObj.healthGoal.planningType);
        infoObj.goalType = that.data.targetList.findIndex((item, index) => item.value == infoObj.goalType && (item.planningType ? item.planningType == infoObj.healthType : true));
        infoObj.healthGoal.planningType = that.data.twoLeveLlist.findIndex((item, index) => item.value == infoObj.healthGoal.planningType);
        // infoObj.userProfile.weight = infoObj.userProfile.weight * 2;
        // bloodValue 转-> 下标
        infoObj.userProfile.bloodValue = that.data.sugarList.findIndex((item, index) => item.value == infoObj.userProfile.bloodValue);
        // appetite 转-> 下标
        infoObj.userProfile.appetite = that.data.foodList.findIndex((item, index) => item.value == infoObj.userProfile.appetite);
        // pregnancyCycle 转-> 下标
        infoObj.userProfile.pregnancyCycle = that.data.pregnantList.findIndex((item, index) => item.value == infoObj.userProfile.pregnancyCycle);
        // nephroticCycle 转-> 下标
        infoObj.userProfile.nephroticCycle = that.data.kidneyList.findIndex((item, index) => item.value == infoObj.userProfile.nephroticCycle);
        // 赋值
        that.setData({
          info: infoObj,
          sexIndex: infoObj.userProfile.sex - 1,
          target: infoObj.goalType,
          targetValue: [infoObj.goalType],
          chronic: 0,
          chronicValue: [0],
          live: 0,
          liveValue: [0],
          // target: infoObj.healthGoal.planningType,
          // targetValue: [infoObj.healthGoal.planningType],

          age: this.data.thisYear - infoObj.userProfile.year,
          height: infoObj.userProfile.height,
          weight: infoObj.userProfile.weight,

          activeValue: [infoObj.userProfile.motion],
          sugarValue: [infoObj.userProfile.bloodValue, 0],
          foodValue: [infoObj.userProfile.appetite, 0],
          pregnantValue: [infoObj.userProfile.pregnancyCycle],
          kidneyValue: [infoObj.userProfile.nephroticCycle],
        })
        // 慢病
        if(that.data.targetList[infoObj.goalType].value =='04') {
          this.setData({
            chronic: infoObj.healthGoal.planningType,
            chronicValue: [infoObj.healthGoal.planningType]
          })
          return;
        }
        // 住院
        if(that.data.targetList[infoObj.goalType].value =='07') {
          this.setData({
            live: infoObj.healthGoal.planningType,
            liveValue: [infoObj.healthGoal.planningType]
          })
          return;
        }
      })
      .catch(error => {

      })
  },
  // 上传头像
  headImg() {
    const that = this;
    let tsuSubUid = this.data.tsuSubUid;
    if(tsuSubUid){
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (/\.(jpg|jpeg|png|JPG|PNG)$/.test(res.tempFilePaths[0])) {
          const tempFilePaths = res.tempFilePaths[0]
          wx.navigateTo({
            url: `/pages/mineBox/cropImg/cropImg?src=${tempFilePaths}`
          })
          return
        }
        wx.showToast({
          title: '只能上传静态图片',
          icon: 'none'
        })
      }
    })
  },
  // 昵称
  nick: function () {
    let subToken = this.data.subToken;
    let uname = this.data.tsuSubUid ? this.data.info.subUserInfo.tsuSubUname : this.data.info.userInfo.uname;
    wx.navigateTo({
      url: `/pages/mineBox/nickName/nickName?nickName=${uname}&subToken=${subToken}&tsuSubUid=${this.data.tsuSubUid}`,
    });
  },
  // 性别
  sex: function () {
    this.setData({
      showSex: true,
      sexIndex: this.data.info.userProfile.sex - 1,
    })
  },
  // 吃法
  target: function () {
    const {targetList, target, info} = this.data;
    this.setData({
      showTarget: true,
      step: '1',
      targetTitle: '切换吃法',
      closeImg: '/images/icon_down.png',
      confirmText: targetList[target] && (targetList[target].value == '04' || targetList[target].value == '07')?'下一步':'确定'
      // confirmText: targetList[target].value == '04' || targetList[target].value == '07'?'下一步':'确定'
    })
  },
  // 年龄
  age: function () {
    this.setData({
      showAge: true
    })
  },
  // 身高
  height: function () {
    this.setData({
      showHeight: true
    })
  },
  // 体重
  weight: function () {
    this.setData({
      showWeight: true
    })
  },
  // 日常活动强度
  active: function () {
    this.setData({
      showActive: true
    })
  },
  // 餐后2小时血糖值
  sugar: function () {
    this.setData({
      showSugar: true
    })
  },
  // 午餐吃几碗主食
  food: function () {
    this.setData({
      showFood: true
    })
  },
  // 你的怀孕周期
  pregnant: function () {
    this.setData({
      showPregnant: true
    })
  },
  // 你的肾病是第几期
  kidney: function () {
    this.setData({
      showKidney: true
    })
  },
  // ---------------
  // 性别
  sexChange: function (e) {
    this.setData({
      sexIndex: e.currentTarget.dataset.index,
    })
  },
  sexConfirm: function () {
    var that = this;
    apiRequest.updateUserProfile({
      sex: Number(that.data.sexIndex) + 1,
      subToken: this.data.subToken,
    })
    .then(res => {
      that.setData({
        showSex: false
      })
      that.init()
    })
    .catch(error => {

    })
  },
  hideSex: function () {
    this.setData({
      showSex: false
    })
  },
  // ------------------------------------------
  // 吃法
  targetChange: function (e) {
    const val = e.detail.value;
    // 赋值
    if (this.data.step == '1') {
      // 一级选项决定二级选项数据
      let confirmText = ''
      switch (this.data.targetList[val[0]].value) {
        case '04':
        case '07':
          confirmText = '下一步'
          break;
        default: 
          confirmText = '确定'
      }
      this.setData({
        targetValue: val,
        target: val[0],
        confirmText
      })
      return;
    }
    if (this.data.step == '2-1') {
      this.setData({
        chronicValue: val,
        chronic: val[0]
      })
      return;
    }
    if (this.data.step == '2-2') {
      this.setData({
        liveValue: val,
        live: val[0]
      })
      return;
    }
  },
  targetConfirm: function () {
    // 少儿发育05 （1-6岁）,青少年成长06（7-17岁）
    const age = this.data.thisYear - this.data.info.userProfile.year;
    let reg = false
    switch (this.data.targetList[this.data.target].value) {
      case '05':
        if (age < 1 || age > 6) {
          reg = true
        }
        break;
      case '06':
        if (age < 7 || age > 17) {
          reg = true
        }
        break;
    }
    if(reg) {
      wx.showToast({
        title: '你填写的年龄不在该年龄段',
        icon: 'none'
      })
      return;
    }

    if (this.data.confirmText == '确定') {
      this.setData({
        targetDialog: true
      })
    }else {
      // 一级选项决定二级选项数据
      let step = ''
      switch (this.data.targetList[this.data.target].value) {
        case '04':
          step = '2-1'
          break;
        case '07':
          step = '2-2'
          break;
      }
      this.setData({
        step,
        closeImg: '/images/icon_return.png',
        confirmText: '确定',
      })
    }
  },
  targetClose: function (e) {
    if (this.data.step == '1') {
      this.setData({
        showTarget: false
      })
      return;
    }
    if (this.data.step == '2-1' || this.data.step == '2-2') {
      this.setData({
        step: '1',
        closeImg: '/images/icon_down.png',
        confirmText: '下一步'
      })
      return;
    } 
  },
  targetConfirmDialog: function () {
    // let {sugars, foods, targets, target, info} = this.data;
    let {sugars, foods, info, targetList, chronicList, liveList, target, chronic, live, pregnants, kidneys} = this.data;
    // 一级选项决定二级选项数据
    let reg = false
    let reg2 = false
    let reg3 = false
    switch (targetList[target].value) {
      case '04':
        if (chronicList[chronic].value == '04') {
          reg = true
        }
        if (chronicList[chronic].value == '05') {
          reg2 = true
        }
        if (chronicList[chronic].value == '11') {
          reg3 = true
        }
        break;
      case '07':
        if (liveList[live].value == '14') {
          reg = true
        }
        if (liveList[live].value == '15') {
          reg2 = true
        }
        if (liveList[live].value == '20') {
          reg3 = true
        }
        break;
      case '11':
        if (targetList[target].planningType == '25') {
          reg2 = true
        }
        break;
    }
    if(reg && (!sugars[info.userProfile.bloodValue] || !foods[info.userProfile.appetite])) {
      this.setData({
        from: 'sugar',
        sugarDialog: true,
        targetDialog: false
      })
      return
    }
    if(reg2 && !pregnants[info.userProfile.pregnancyCycle]) {
      this.setData({
        from: 'pregnant',
        sugarDialog: true,
        targetDialog: false
      })
      return
    }
    if(reg3 && !kidneys[info.userProfile.nephroticCycle]) {
      this.setData({
        from: 'kidney',
        sugarDialog: true,
        targetDialog: false
      })
      return
    }
    if(targetList[target].value == '09') {
      this.checkCustomizeInitPlan()
      return
    }
    this.targetApi('target')
  },
    // 查询是否有自定义方案
    checkCustomizeInitPlan() {
      apiRequest.checkCustomizeInitPlan({
        subToken: this.data.subToken,
      })
        .then(res => {
          if(res.obj && res.obj.dietPlan) {
            this.targetApi('target')
            return
          }
          this.createCustomizeInitPlan()
        })
        .catch(error => {
  
        })
    },
    // 创建方案
    createCustomizeInitPlan() {
      apiRequest.createCustomizeInitPlan({
        subToken: this.data.subToken,
      })
        .then(res => {
          if (res.errCode == '0') {
            let planId = res.obj.dietPlan.id,
            subToken = this.data.subToken;
            wx.navigateTo({
              url: `/pages/packageDiscover/customPlan/customPlan?planId=${planId}&subToken=${subToken}&from=personal`,
            })
            this.setData({
              targetDialog: false,
              showTarget: false
            })
            this.init();
          }
        })
        .catch(error => {
  
        })
    },
  // 控糖算法升级(血糖值&主食)
  sugarConfirmDialog: function (e) {
    const val = e.detail.value
    const params =  val.from == 'sugar' ? {
      bloodValue: val.sugarValue,
      appetite: val.foodValue,
    } : val.from == 'pregnant'? {
      pregnancyCycle: val.pregnantValue
    } : val.from == 'kidney'? {
      nephroticCycle: val.kidneyValue
    }: {}
    var that = this;
    apiRequest.updateUserProfile({
      // bloodValue: val.sugarValue,
      // appetite: val.foodValue,
      subToken: this.data.subToken,
      ...params
    })
      .then(res => {
        that.targetApi('sugar')
        // that.setData({
        //   showActive: false,
        // }, () => {
        //   that.init()
        // })
      })
      .catch(error => {

      })
  },
  sugarCancelDialog: function (e) {
    const {targetList, target } = this.data;
    this.setData({
      showTarget: false
    }, () => {
      wx.showToast({
        title: '更换吃法失败',
        icon: 'none',
        duration: 1500
      });
    })
  },
  // 吃法接口（上下共用）
  targetApi: function (from) {
    // 一级选项决定二级选项数据
    let planningType = ''
    switch (this.data.targetList[this.data.target].value) {
      case '04':
        planningType = this.data.chronicList[this.data.chronic].value
        break;
      case '07':
        planningType = this.data.liveList[this.data.live].value
        break;
      // case '01':
      //   planningType ='01'
      //   break;
      // case '02':
      //   planningType ='02'
      //   break;
      // case '03':
      //   planningType ='03'
      //   break;
      // case '05':
      //   planningType ='12'
      //   break;
      // case '06':
      //   planningType ='13'
      //   break;
      // case '08':
      //   planningType ='22'
      //   break;
      // case '11':
      //   if(this.data.target == 0) {
      //     planningType ='23'
      //   } else if(this.data.target == 1) {
      //     planningType ='26'
      //   } else {
      //     planningType ='25'
      //   }
      //   break;
      case '09':
        planningType ='24'
        break;
      default:
        // planningType = this.data.targetList[this.data.target].value
        planningType = this.data.targetList[this.data.target] ? this.data.targetList[this.data.target].planningType : ''
    }
    var that = this;
    apiRequest.updateUserTarget({
      // planningType：10为其它（下标是4），所以下标为4则转为值10，否则按照正常传01 02 03 04...
      // planningType: that.data.target == 4?'10':'0' + (Number(that.data.target) + 1),
      // planningType：下标 转-> 值
      planningType,
      dataStt: '00', // 数据类型为修改
      subToken: this.data.subToken,
    })
    .then(res => {
      if(from == 'target') {
        that.setData({
          targetDialog: false,
          showTarget: false
        })
      }else {
        that.setData({
          showTarget: false
        },() => {
          // 糖尿病(慢病04, 住院14)和妊娠糖尿病(慢病05, 住院15)选择的附加信息才显示
          if(['04', '14', '05', '15'].includes(planningType)) {
            wx.showToast({
              title: '控糖方案已升级',
              image: '/images/my/success.png',
              duration: 1500
            });
          }
        })
      }
      
      that.init()
    })
    .catch(error => {

    })
  },
  // ------------------------------------------
  // 键盘高度
  bindfocus() {
    wx.onKeyboardHeightChange(res => {
      this.setData({
        keyboardHeight: res.height
      })
    })
  },
  bindblur() {
    this.setData({
      keyboardHeight: 0
    })
  },
  // ------------------------------------------
  // 出生年月（年龄）
  ageChange: function (e) {
    const val = e.detail.value
    this.setData({
      age: val,
      year: this.data.thisYear - val,
      month: '01',
      day: '01'
    })
    if(val < 1){
      wx.showToast({
        title: '年龄不能小于1岁',
        icon: 'none',
      }); 
    }
  },
  ageConfirm: function () {
    if(this.data.age < 1){
      wx.showToast({
        title: '年龄不能小于1岁',
        icon: 'none',
      });
      return
    }
    var that = this;
    apiRequest.updateUserProfile({
      birthday: (that.data.thisYear - that.data.age) + '0101',
      // birthday: that.data.year + '' + that.data.month + '' + that.data.day,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.setData({
          showAge: false
        })
        that.init()
      })
      .catch(error => {

      })
  },
  ageClose: function () {
    this.setData({
      age: this.data.thisYear - this.data.info.userProfile.year,
    })
  },
  // 身高
  heightChange: function (e) {
    const val = e.detail.value
    this.setData({
      height: val
    })
    if(val < 50 || val > 200){
      wx.showToast({
        title: '身高不能小于50cm或超过200cm',
        icon: 'none',
      }); 
    }
  },
  heightConfirm: function () {
    if(this.data.height < 50 || this.data.height > 200){
      wx.showToast({
        title: '身高不能小于50cm或超过200cm',
        icon: 'none',
      });
      return
    }
    var that = this;
    apiRequest.updateUserProfile({
      height: that.data.height,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.setData({
          showHeight: false,
        }, () => {
          that.init()
        })
      })
      .catch(error => {

      })
  },
  heightClose: function () {
    this.setData({
      height: this.data.info.userProfile.height,
    })
  },
  // 体重
  weightChange: function (e) {
    const val = e.detail.value
    this.setData({
      weight: val
    })
    if(val < 5 || val > 200){
      wx.showToast({
        title: '体重不能小于5kg或超过200kg',
        icon: 'none',
      }); 
    }
  },
  weightConfirm: function () {
    if(this.data.weight < 5 || this.data.weight > 200){
      wx.showToast({
        title: '体重不能小于5kg或超过200kg',
        icon: 'none',
      });
      return
    }
    if(this.data.weight.toString().indexOf('.') != -1 && this.data.weight.toString().split('.')[1].length > 1){
      wx.showToast({
        title: '体重只保留一位小数点',
        icon: 'none',
      });
      return
    }
    var that = this;
    apiRequest.updateUserProfile({
      weight: that.data.weight,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.setData({
          showWeight: false,
        }, () => {
          that.init()
        })
      })
      .catch(error => {

      })
  },
  weightClose: function () {
    this.setData({
      weight: this.data.info.userProfile.weight,
    })
  },
  // 日常活动消耗
  activeChange: function (e) {
    const val = e.detail.value
    this.setData({
      activeValue: val,
      active: val[0]
    })
  },
  activeConfirm: function () {
    var that = this;
    apiRequest.updateUserProfile({
      motion: '0' + (Number(that.data.active) + 1),
      subToken: this.data.subToken,
    })
      .then(res => {
        that.setData({
          showActive: false,
        }, () => {
          that.init()
        })
      })
      .catch(error => {

      })
  },
  // 餐后2小时血糖值
  sugarConfirm: function (e) {
    const val = e.detail.value
    this.setData({
      sugarValue: val,
      sugar: val[0]
    })
    var that = this;
    apiRequest.updateUserProfile({
      bloodValue: that.data.sugarList[that.data.sugar].value,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.init()
        // that.setData({
        //   showActive: false,
        // }, () => {
        //   that.init()
        // })
      })
      .catch(error => {

      })
  },
  // 午餐吃几碗主食
  foodConfirm: function (e) {
    const val = e.detail.value
    this.setData({
      foodValue: val,
      food: val[0]
    })
    var that = this;
    apiRequest.updateUserProfile({
      appetite: that.data.foodList[that.data.food].value,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.init()
        // that.setData({
        //   showActive: false,
        // }, () => {
        //   that.init()
        // })
      })
      .catch(error => {

      })
  },
  // 你的怀孕周期
  pregnantConfirm: function (e) {
    const val = e.detail.value
    this.setData({
      pregnantValue: val,
      pregnant: val[0]
    })
    var that = this;
    apiRequest.updateUserProfile({
      pregnancyCycle: that.data.pregnantList[that.data.pregnant].value,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.init()
      })
      .catch(error => {

      })
  },
  // 你的肾病是第几期
  kidneyConfirm: function (e) {
    const val = e.detail.value
    this.setData({
      kidneyValue: val,
      kidney: val[0]
    })
    var that = this;
    apiRequest.updateUserProfile({
      nephroticCycle: that.data.kidneyList[that.data.kidney].value,
      subToken: this.data.subToken,
    })
      .then(res => {
        that.init()
      })
      .catch(error => {

      })
  },
  // 共享账号
  share(){
    let {tsuSubUid, subToken} = this.data;
    let {tsuUid,tsuSubUname} = this.data.info.subUserInfo
    wx.navigateTo({
      url: `/pages/packSubAccount/sharedAccount/sharedAccount?subToken=${subToken}&tsuSubUid=${tsuSubUid}&tsuUid=${tsuUid}&tsuSubUname=${tsuSubUname}`,
    });
  },

  // 删除子账号
  delete(){
    this.setData({
      delete: true
    })
  },

  sureDelete(){
    let tsuSubUid = this.data.tsuSubUid;
    let subInfo = getStorage('subInfo') || {};
    let pages = getCurrentPages();
    let previousPage = pages[pages.length - 2];
    apiRequest.deleteSubUser({
      subUid: tsuSubUid
    }).then((res)=>{
      if(res.obj.result == '1'){
        if(subInfo && subInfo.tsuSubUid && subInfo.tsuSubUid == tsuSubUid){
          removeStorage('subToken');
          removeStorage('subInfo');
        }
        // 删除上页面subInfo
        if(previousPage && previousPage.route == 'pages/packSubAccount/switchAccount/switchAccount' && previousPage.data.subInfo.tsuSubUid && previousPage.data.subInfo.tsuSubUid == tsuSubUid){
          previousPage.setData({
            subInfo: {},
          })
        }
        wx.navigateBack({
          delta: 1
        });
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
  onShareAppMessage: function(options){
    // return {
    //   title: '维士健身饮食，健康美味！',
    //   path: '/pages/index/index',
    //   imageUrl: "https://prodstatic.weis1606.cn/api/mini/small_program_share.png",
    //   success: (res) => {
        
    //   },
    //   fail: (res) => {
        
    //   }
    // }
  }
})