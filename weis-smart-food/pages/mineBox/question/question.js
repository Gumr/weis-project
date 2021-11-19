// pages/mineBox/question/question.js
const app = getApp();
import {
  getStorage,
  setStorage
} from '../../../utils/storage'
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import {
  targetTip,
  chronicTip,
  liveTip
} from '../../../utils/map'
// 年龄-出生年月
const date = new Date();
const years = [],
  months = [],
  days = []
for (let i = 1919; i <= date.getFullYear(); i++) {
  years.push(i);
}

for (let i = 1; i <= 12; i++) {
  months.push(i);
}

for (let i = 1; i <= 31; i++) {
  days.push(i);
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // ---性别&年龄---
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
    sexIndex: 0,
    sexId: 1,

    years: years,
    year: date.getFullYear() - 40,
    months: months,
    month: '01',
    days: days,
    day: '01',
    age: '',
    // isBirth: false,

    // ---身高&体重
    height: 0,
    weight: 0,
    // isWeight: false,

    // ---日常活动强度---
    activityList: [{
        name: '久坐',
        title: '如程序员，设计师，运营，会计，办公室职员等',
        value: '01'
      },
      {
        name: '轻体力活动',
        title: '如学生，教师，司机，医生等',
        value: '02'
      },
      {
        name: '中体力活动',
        title: '如销售员，服务员，家庭主妇等',
        value: '03'
      }
    ],
    activitySelect: 0,
    activityValue: '01',
    // isActivity: false,

    // ---目标---
    targetList: [
      {
        name: '保持体型', // 由营养均衡 改为 保持体型
        detail: '参考《中国居民膳食营养素参考摄入量》',
        value: '03', // 03
        planningType: '03',
      },
      {
        name: '减脂减重',
        detail: '参考《中国超重/肥胖医学营养治疗专家共识》',
        value: '01', // 01
        planningType: '01',
      },
      {
        name: '增肌增重',
        detail: '参考《美国国家体能协会运动营养指南》',
        value: '02', // 02
        planningType: '02',
      },
      {
        name: '慢病饮食干预（18岁及以上）',
        value: '04' // 04 05 06 07 08 09 11
      },
      // {
      //   name: '住院饮食干预',
      //   value: '07'  // 14 15 16 17 18 21 19 20
      // },
      {
        name: '少儿发育（2-6岁）',
        detail: '参考《中国学龄儿童膳食指南》',
        value: '05', // 12
        planningType: '12',
      },
      {
        name: '青少年成长（7-17岁）',
        detail: '参考《WS/T 554-2017学生餐营养指南》',
        value: '06', // 13
        planningType: '13',
      },
      {
        name: '孕妇饮食（18-65岁，女性）',
        value: '11', // 25
        planningType: '25',
      },
      {
        name: '老年人膳食（65岁及以上）',
        detail: '参考《WST556--2017老年人膳食指导》',
        value: '08', //22
        planningType: '22',
      },
      // {
      //   name: '热量控制，营养均衡',
      //   detail: '参考《中国居民膳食指南》',
      //   value: '11', // 23
      //   planningType: '23',
      // },
      // {
      //   name: '七分饱健康饮食',
      //   value: '11', // 26
      //   planningType: '26',
      // },
      // {
      //   name: '控制血糖',
      //   title: '出控制血糖方案',
      //   value: '04'
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
    // isTarget: false,

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
    // isChronic: false,

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
    // isLive: false,

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
    // isSugar: false,
    // ---怀孕周期---
    pregnantList: [{
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
    // isPregnant: false,
    // ---你的肾病是第几期---
    kidneyList: [{
        name: "肾病1期",
        value: "01"
      },
      {
        name: "肾病2期",
        value: "02"
      },
      {
        name: "肾病3期",
        value: "03"
      },
      {
        name: "肾病4期",
        value: "04"
      },
      {
        name: "肾病5期",
        value: "05"
      },
      {
        name: "血液透析与\n腹膜透析",
        value: "06"
      },
      {
        name: "合并高分解\n代谢疾病",
        value: "07"
      }
    ],
    kidneySelect: '',
    kidneyValue: '',
    // isKidney: false,
    // ---其它---
    // 步骤按钮
    overBtn: 0, // 下一步0、显示完成（协议）1、确定2
    btnSelected: false,
    complete: '出生年月',
    xy: true,
    // isShowLoad: false,
    // inviteUid: app.globalData.inviteUid,
    // aldId: app.globalData.aldId,
    // channelType: app.globalData.channelType,
    px2rpx: app.globalData.px2rpx,
    scrollHeight: '',
    navTitle: '制定数字饮食吃法',
    // more: false, //更多吃法 是否展开
    stepNum: 1,
    overBtn: 0,
    targetDesc: {
      '少儿发育': '少儿发育饮食方案以《中国学龄儿童膳食指南（2016）》、《中国0-6岁儿童膳食指南》、《中国居民膳食营养素参考摄入量》 [2017版] 、《临床营养学》、《世界卫生组织儿童生长发育标准》为基础，结合少儿个体身体情况对于每日摄入能量以及蛋白质、脂肪、碳水摄入比例进行进行个性化设置。此饮食方案仅供参考，具体专业指导请咨询专业人士。',
      '营养均衡': '中国居民健康饮食吃法以《中国居民膳食指南（2016）》、《中国居民膳食营养素参考摄入量》 [2017版]作为指导，推荐摄入量（RNI）作为营养素摄入参考标准，遵循少油少盐少糖，七八分饱、均衡营养的健康饮食原则，制定满足绝大多数（97％～98％）个体的合理能量以及蛋白质、脂肪、碳水化合物的健康饮食吃法。此饮食方案仅供参考，具体专业指导请咨询专业人士。',
      '青少年成长': '青少年成长饮食方案以《WS/T 554-2017学生餐营养指南》、中国居民膳食营养素参考摄入量》 [2017版]、《临床营养学》、《GBT 31178--2014 儿童青少年发育水平的综合评价》、《中国超重／肥胖医学营养治疗专家共识》(2016年版)为基础，结合个人身体情况对于每日摄入能量以及蛋白质、脂肪、碳水摄入比例进行进行个性化设置。此饮食方案仅供参考，具体专业指导请咨询专业人士。',
      '老年人膳食': '老年人膳食方案以《WST556--2017 老年人膳食指导》、《中国居民膳食营养素参考摄入量》2013版 、《WST552_2017老年人营养不良风险评估》为基础，结合老年人患者个体身体情况对每日摄入能量以及蛋白质、脂肪、碳水、盐量摄入进行进行个性化设置。此饮食方案仅供参考，具体专业指导请咨询专业人士。',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({
    //   go: options.go
    // })
    // this.checkUserSource()
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
    const userInfo = getStorage('userInfo');
    this.setData({
      // sexIndex: userInfo.gender?userInfo.gender-1:0
      sexIndex: userInfo.gender && userInfo.gender != 0 ? userInfo.gender - 1 : 0
    })
  },
  // 计算滚动高度
  calculat: function () {
    let {
      px2rpx
    } = this.data;
    let query = wx.createSelectorQuery();
    let that = this;
    query.select('.next').boundingClientRect(function (rect) {
      let mobileInfo = wx.getSystemInfoSync();
      // let scrollHeight = (设备屏幕高度的px - 下一步按钮高度的px) * 设备px转rpx的换算比例 - 下一步按钮下边距的rpx - 滚动与底部内容需拉开间距的rpx - 头部说明图片的高度rpx
      let scrollHeight = (mobileInfo.windowHeight - rect.height) * px2rpx - 65 - 268 - 344;
      that.setData({
        scrollHeight
      })
    }).exec();
  },
  // 用户来源 - selectID的值为 0.新用户 1.健身餐老用户(默认选中 减脂减重) 2.数搭老用户（默认选中 营养均衡） 3.糖三彩，营养餐用户（默认选中 控制血糖）
  // checkUserSource: function () {
  //   apiRequest.checkUserSource()
  //   .then(res => {
  // let selectID = res.obj.selectID;
  // 新用户(不需要selectID为0判断新用户，因为只有新用户能进来完善信息)
  // 扫拓展码inviteUid或渠道码aldId进来的
  // if(this.data.inviteUid || (this.data.aldId && this.data.aldId != '12345')) {
  // 扫的客户经理的码
  // if(this.data.channelType == 1) {
  //   this.setData({
  //     targetList:[{
  //       name: '减脂减重',
  //       value: '01' // 01
  //     },
  //     {
  //       name: '增肌增重',
  //       value: '02' // 02
  //     }]
  //   })
  // }
  // 扫的营养师的码
  // if(this.data.channelType == 2) {
  //   this.setData({
  //     targetList: [{
  //       name: '少儿发育 （1-6岁）',
  //       value: '05' // 12
  //     },
  //     {
  //       name: '青少年成长（7-17岁）',
  //       value: '06' // 13
  //     },
  //     {
  //       name: '慢病饮食干预',
  //       value: '04'   // 04 05 06 07 08 09 11
  //     },
  //     {
  //       name: '住院饮食干预',
  //       value: '07'  // 14 15 16 17 18 21 19 20
  //     }]
  //   })
  //   // this.setData({
  //   //   targetList: [{
  //   //     name: '控制血糖',
  //   //     title: '出控制血糖方案',
  //   //     value: '04'
  //   //   }],
  //   //   targetSelect: 0,
  //   //   targetValue: '04',
  //   //   btnSelected: true,
  //   //   complete: '目标'
  //   // })
  // }
  // return;
  // }
  // 老用户
  // this.setData({
  //   targetSelect: selectID == 1?0:selectID == 2?3:selectID == 3?2:'',
  //   targetValue: selectID == 1?'01':selectID == 2?'03':selectID == 3?'04':'',
  //   btnSelected: true,
  //   complete: '出生年月'
  // });
  //   })
  //   .catch(error => {})
  // },

  // 性别（1/4）
  sexChange: function (e) {
    const {
      index,
      id,
    } = e.currentTarget.dataset;
    this.setData({
      sexIndex: index,
      sexId: id,
      btnSelected: this.birthCheck(this.data.age, id)
    })
  },
  // 年龄-出生年月
  birthChange: function (e) {
    const val = e.detail.value;
    this.setData({
      age: val,
      year: date.getFullYear() - val,
      month: '01',
      day: '01',
      btnSelected: this.birthCheck(val, this.data.sexId)
      // btnSelected: val ? true : false
    })
    if (val < 1) {
      wx.showToast({
        title: '年龄不能小于1岁',
        icon: 'none',
      });
    }
  },
  // 年龄-出生年月-校验
  birthCheck(age, sexId) {
    // 目标根据用户年龄和性别显示
    let {
      targetValue,
      targetPlanningType
    } = this.data;
    // 年龄 & 性别 根据选中目标限制
    // 慢病饮食干预（18岁及以上）
    if(targetValue == '04') {
      if(age < 18) {
        wx.showToast({
          title: '年龄需要18岁及以上哦',
          icon: 'none',
        });
        return false
      }
      return true
    }
    // 少儿发育（2-6岁）
    if(targetPlanningType == '12') {
      if(age < 2 || age > 6) {
        wx.showToast({
          title: '年龄需要2-6岁之间哦',
          icon: 'none',
        });
        return false
      }
      return true
    }
    // 青少年成长（7-17岁）
    if(targetPlanningType == '13') {
      if(age < 7 || age > 17) {
        wx.showToast({
          title: '年龄需要7-17岁之间哦',
          icon: 'none',
        });
        return false
      }
      return true
    }
    // 孕妇饮食（18-65岁，女性）
    if(targetPlanningType == '25') {
      if(sexId == 1) {
        wx.showToast({
          title: '孕妇饮食只能选女士',
          icon: 'none',
        });
        return false
      }
      if(!age || age < 18 || age > 65) {
        wx.showToast({
          title: '年龄需要18-65岁之间哦',
          icon: 'none',
        });
        return false
      }
      return true
    }
    // 老年人膳食（65岁及以上）
    if(targetPlanningType == '22') {
      if(age < 65) {
        wx.showToast({
          title: '年龄需要65岁及以上哦',
          icon: 'none',
        });
        return false
      }
      return true
    }
    // 其它目标只需填了就可以
    if(age && sexId) {
      return true
    } else {
      return false
    }
  },
  // 身高（2/4）
  heightChange: function (e) {
    const val = e.detail.value;
    const {
      weight
    } = this.data;
    this.setData({
      height: val,
      btnSelected: val && weight ? true : false
    });
    if (val < 50 || val > 200) {
      wx.showToast({
        title: '身高不能小于50cm或超过200cm',
        icon: 'none',
      });
    }
  },
  // 体重
  weightChange: function (e) {
    const val = e.detail.value;
    const {
      height
    } = this.data;
    this.setData({
      weight: val,
      btnSelected: val && height ? true : false
    });
    if (val < 5 || val > 200) {
      wx.showToast({
        title: '体重不能小于5kg或超过200kg',
        icon: 'none',
      });
      return
    }
    if (val.indexOf('.') != -1 && val.toString().split('.')[1].length > 1) {
      wx.showToast({
        title: '体重只保留一位小数点',
        icon: 'none',
      });
      return
    }
  },
  // 日常活动强度（3/4）
  activitySelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      xy
    } = this.data;
    this.setData({
      activitySelect: index,
      activityValue: value,
      btnSelected: value && xy
    });
  },
  // 目标（4/4）
  targetSelect: function (e) {
    const {
      index,
      value,
      planningtype
    } = e.currentTarget.dataset;
    // const {
    //   age,
    //   xy,
    //   overBtn
    // } = this.data;
    // // 少儿发育05 （1-6岁）,青少年成长06（7-17岁）
    // let reg = false
    // switch (value) {
    //   case '05':
    //     if (age < 1 || age > 6) {
    //       reg = true
    //     } else {
    //       this.setData({
    //         // overBtn: 2,
    //         btnSelected: true
    //       })
    //     }
    //     break;
    //   case '06':
    //     if (age < 7 || age > 17) {
    //       reg = true
    //     } else {
    //       this.setData({
    //         // overBtn: 2,
    //         btnSelected: true
    //       })
    //     }
    //     break;
    //   case '04':
    //   case '07':
    //     this.setData({
    //       // overBtn: 0,
    //       btnSelected: true
    //     })
    //     break;
    //   case '11':
    //     if (planningtype == '25') {
    //       this.setData({
    //         // overBtn: 0,
    //         btnSelected: true
    //       })
    //     } else {
    //       this.setData({
    //         // overBtn: 2,
    //         btnSelected: true
    //       })
    //     }
    //     break;
    //   default:
    //     this.setData({
    //       // overBtn: 2,
    //       btnSelected: value == '09' ? false : true
    //     })
    // }
    // if (reg) {
    //   wx.showToast({
    //     title: '你填写的年龄不在该年龄段',
    //     icon: 'none'
    //   })
    //   return;
    // }
    this.setData({
      targetSelect: index,
      targetValue: value,
      targetPlanningType: planningtype,
      btnSelected: true,
      // btnSelected: !overBtn || (overBtn && xy)
      // btnSelected: (value == '04' || value == '07') || (value != '04' && value != '07' && xy)
    });
    // 自定义吃法
    // if(value == '09') {
    //   wx.navigateTo({
    //     url: '/pages/packageDiscover/planSet/planSet?from=question',
    //   })
    //   this.submit(); // 提交数据
    //   this.addUserTarget('customPlan'); // 增加用户目标 自定义吃法
    // }
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
            url: `/pages/packageDiscover/customPlan/customPlan?planId=${planId}&subToken=${subToken}&from=question`,
          })
        }
      })
      .catch(error => {

      })
  },
  // 慢病饮食干预
  chronicSelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      xy,
      overBtn
    } = this.data;
    // switch (value) {
    //   case '04':
    //   case '05':
    //   case '11':
    //     this.setData({
    //       // overBtn: 0,
    //       btnSelected: true
    //     })
    //     break;
    //   default:
    //     this.setData({
    //       // overBtn: 2,
    //       btnSelected: xy
    //     })
    // }
    this.setData({
      chronicSelect: index,
      chronicValue: value,
      btnSelected: true,
      // btnSelected: !overBtn || (overBtn && xy)
      // btnSelected: value == '04' || (value != '04' && xy)
    });
  },
  // 住院饮食干预
  liveSelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    // const {
    //   xy,
    //   overBtn
    // } = this.data;
    // switch (value) {
    //   case '14':
    //   case '15':
    //   case '20':
    //     this.setData({
    //       // overBtn: 0,
    //       btnSelected: true
    //     })
    //     break;
    //   default:
    //     this.setData({
    //       // overBtn: 2,
    //       btnSelected: xy
    //     })
    // }
    this.setData({
      liveSelect: index,
      liveValue: value,
      btnSelected: true,
      // btnSelected: !overBtn || (overBtn && xy)
      // btnSelected: value == '14' || (value != '14' && xy)
    });
  },
  // 血糖值（选择慢病饮食干预-糖尿病(控制血糖)目标的用户增加这个附加信息）
  sugarSelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      foodValue,
      xy
    } = this.data;
    this.setData({
      sugarSelect: index,
      sugarValue: value,
      btnSelected: foodValue && value && xy
    });
  },
  // 主食（选择慢病饮食干预-糖尿病(控制血糖)目标的用户增加这个附加信息）
  foodSelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      sugarValue,
      xy
    } = this.data;
    this.setData({
      foodSelect: index,
      foodValue: value,
      btnSelected: sugarValue && value && xy
    });
  },
  // 你的怀孕周期
  pregnantSelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      xy
    } = this.data;
    this.setData({
      pregnantSelect: index,
      pregnantValue: value,
      btnSelected: value && xy
    });
  },
  // 你的肾病是第几期
  kidneySelect: function (e) {
    const {
      index,
      value
    } = e.currentTarget.dataset;
    const {
      xy
    } = this.data;
    this.setData({
      kidneySelect: index,
      kidneyValue: value,
      btnSelected: value && xy
    });
  },
  // 协议
  xy: function () {
    const {
      xy,
      activityValue
    } = this.data;
    this.setData({
      xy: !xy,
      btnSelected: (activityValue && !xy)
    });
  },
  // // 协议
  // xy: function () {
  //   const {xy, targetValue, chronicValue, liveValue, foodValue, sugarValue, pregnantValue, kidneyValue} = this.data;
  //   this.setData({
  //     xy: !xy,
  //     btnSelected: 
  //     (targetValue && targetValue != '04' && targetValue != '07' && !xy) || 
  //     (chronicValue && chronicValue != '04' && chronicValue != '05' && !xy) || 
  //     (liveValue && liveValue != '14' && liveValue != '15' && !xy) || 
  //     (foodValue && sugarValue && !xy) || 
  //     (pregnantValue && !xy) ||
  //     (kidneyValue && !xy)
  //   });
  // },
  // 下一步
  nextStep: function () {
    if (this.data.btnSelected) {
      let { stepNum, targetValue, targetPlanningType, chronicValue, liveValue, } = this.data;
      // if (this.data.stepNum == '出生年月') {
      //   if (this.data.age < 1) {
      //     wx.showToast({
      //       title: '年龄不能小于1岁',
      //       icon: 'none',
      //     });
      //     return
      //   }
      //   // 目标根据用户年龄和性别显示
      //   let {
      //     age,
      //     sexList,
      //     sexIndex,
      //     targetList,
      //     chronicList,
      //     liveList
      //   } = this.data;
      //   let targetListFliter = []
      //   if (age >= 1 && age <= 6) {
      //     // 1-6岁-少儿发育
      //     targetListFliter = targetList.filter((item, index) => ['12', '24',].includes(item.planningType));
      //   } else if (age >= 7 && age <= 17) {
      //     // 7-17岁-青少年成长
      //     targetListFliter = targetList.filter((item, index) => ['13', '24',].includes(item.planningType));
      //   } else if (age >= 18 && age <= 64) {
      //     // 18-64岁
      //     targetListFliter = targetList.filter((item, index) => ['23', '03', '01', '02', '25', '24',].includes(item.planningType) || ['04'].includes(item.value));
      //   } else if (age >= 65) {
      //     // 65岁以上
      //     targetListFliter = targetList.filter((item, index) => ['22', '24',].includes(item.planningType) || ['04'].includes(item.value));
      //   } else {
      //     targetListFliter = targetList
      //   }
      //   // 男性 || 65岁以上用户 -- 不显示"孕妇饮食" “妊娠糖尿病”
      //   if (sexList[sexIndex].id == 1 || age >= 65) {
      //     // 孕妇饮食
      //     targetListFliter = targetListFliter.filter((item, index) => !['25'].includes(item.planningType));
      //     // 妊娠糖尿病
      //     this.setData({
      //       chronicList: chronicList.filter(item => !['05'].includes(item.value)),
      //       liveList: liveList.filter(item => !['15'].includes(item.value))
      //     })
      //   }
      //   this.setData({
      //     targetList: targetListFliter,
      //     isBirth: true,
      //     btnSelected: false,
      //     complete: '身高体重'
      //   });
      //   return;
      // }
      // if (this.data.complete == '身高体重') {
      //   if (this.data.height < 50 || this.data.height > 200 || this.data.weight < 5 || this.data.weight > 200) {
      //     wx.showToast({
      //       title: this.data.height < 50 || this.data.height > 200 ? '身高不能小于50cm或超过200cm' : '体重不能小于5kg或超过200kg',
      //       icon: 'none',
      //     });
      //     return
      //   }
      //   if (this.data.weight.indexOf('.') != -1 && this.data.weight.toString().split('.')[1].length > 1) {
      //     wx.showToast({
      //       title: '体重只保留一位小数点',
      //       icon: 'none',
      //     });
      //     return
      //   }
      //   this.setData({
      //     isWeight: true,
      //     btnSelected: true,
      //     complete: '日常活动',
      //     overBtn: 1
      //   });
      //   return;
      // }
      // if (this.data.complete == '日常活动') {
      //   this.setData({
      //     isActivity: true,
      //     btnSelected: false,
      //     complete: '目标',
      //     // targetSelect: 0,
      //     // targetValue: '01',
      //     overBtn: 2,
      //     navTitle: '选择数字饮食吃法'
      //   });
      //   this.submit(); // 提交数据
      //   this.addUserTarget(); // 增加用户目标
      //   // 默认选中第一个吃法
      //   this.targetSelect({
      //     currentTarget: {
      //       dataset: {
      //         index: 0,
      //         value: this.data.targetList[0].value,
      //         planningtype: this.data.targetList[0].planningType,
      //       }
      //     }
      //   })
      //   return;
      // }

      // --------
      // 1 目标
      if(stepNum == 1) {
        if (targetValue == '04') { // 慢病
          this.setData({
            stepNum: 'chronic',
            btnSelected: false,
            // complete: '慢病',
            // overBtn: 2
          });
        } else if (targetValue == '07') { // 住院
          this.setData({
            stepNum: 'live',
            btnSelected: false,
            // complete: '住院',
            // overBtn: 2
          });
        }else if (targetValue == '11') { // 孕妇饮食
          this.setData({
            stepNum: 'pregnant',
            btnSelected: false,
            // complete: '孕妇饮食',
            // overBtn: 2
          });
        } else { // 其它情况下一步是-年龄
          this.setData({
            stepNum: 2,
            btnSelected: false,
            // complete: '孕妇饮食',
            // overBtn: 2
          });
        }
        return
      }
      // 目标-慢病-糖尿病
      if (stepNum == 'chronic' && chronicValue == '04') {
        this.setData({
          stepNum: 'sugar',
          btnSelected: false,
          // complete: '血糖值',
          // overBtn: 2
        });
        return;
      }
      // 目标-住院-糖尿病
      if (stepNum == 'live' && liveValue == '14') {
        this.setData({
          stepNum: 'sugar',
          btnSelected: false,
          // complete: '血糖值',
          // overBtn: 2
        });
        return;
      }
      // 目标-慢病-妊娠糖尿病
      if (stepNum == 'chronic' && chronicValue == '05') {
        this.setData({
          stepNum: 'pregnant',
          btnSelected: false,
          // complete: '妊娠糖尿病',
          // overBtn: 2
        });
        return;
      }
      // 目标-住院-妊娠糖尿病
      if (stepNum == 'live' && liveValue == '15') {
        this.setData({
          stepNum: 'pregnant',
          btnSelected: false,
          // complete: '妊娠糖尿病',
          // overBtn: 2
        });
        return;
      }
      // 目标-慢病-慢性肾病
      if (stepNum == 'chronic' && chronicValue == '11') {
        this.setData({
          stepNum: 'kidney',
          btnSelected: false,
          // complete: '慢性肾病',
          // overBtn: 2
        });
        return;
      }
      // 目标-住院-慢性肾病
      if (stepNum == 'live' && liveValue == '20') {
        this.setData({
          stepNum: 'kidney',
          btnSelected: false,
          // complete: '慢性肾病',
          // overBtn: 2
        });
        return;
      }
      if(stepNum == 'chronic' || stepNum == 'live' || stepNum == 'sugar' || stepNum == 'pregnant' || stepNum == 'kidney') {
        this.setData({
          stepNum: 2,
          btnSelected: this.birthCheck('', 1),
          // complete: '血糖值',
          // overBtn: 2
        });
      }
      // 2 年龄
      if (stepNum == 2) {
        if (this.data.age < 1) {
          wx.showToast({
            title: '年龄不能小于1岁',
            icon: 'none',
          });
          return
        }
        
        this.setData({
          // targetList: targetListFliter,
          stepNum: 3,
          btnSelected: false,
        });
        return;
      }
      // 3 身高体重
      if (stepNum == 3) {
        if (this.data.height < 50 || this.data.height > 200 || this.data.weight < 5 || this.data.weight > 200) {
          wx.showToast({
            title: this.data.height < 50 || this.data.height > 200 ? '身高不能小于50cm或超过200cm' : '体重不能小于5kg或超过200kg',
            icon: 'none',
          });
          return
        }
        if (this.data.weight.indexOf('.') != -1 && this.data.weight.toString().split('.')[1].length > 1) {
          wx.showToast({
            title: '体重只保留一位小数点',
            icon: 'none',
          });
          return
        }
        this.setData({
          stepNum: 4,
          btnSelected: true,
          // complete: '日常活动',
          overBtn: 2
        });
        return;
      }
      // // 目标-慢病
      // if (stepNum == 'chronic' && targetValue == '04') {
      //   this.setData({
      //     isTarget: true,
      //     btnSelected: false,
      //     // complete: '慢病',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-住院
      // if (stepNum == 'live' && targetValue == '07') {
      //   this.setData({
      //     isTarget: true,
      //     btnSelected: false,
      //     // complete: '住院',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-慢病-糖尿病
      // if (stepNum == 'chronic' && chronicValue == '04') {
      //   this.setData({
      //     isChronic: true,
      //     btnSelected: false,
      //     // complete: '血糖值',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-住院-糖尿病
      // if (stepNum == 'live' && liveValue == '14') {
      //   this.setData({
      //     isLive: true,
      //     btnSelected: false,
      //     // complete: '血糖值',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-慢病-妊娠糖尿病
      // if (stepNum == 'chronic' && chronicValue == '05') {
      //   this.setData({
      //     isChronic: true,
      //     btnSelected: false,
      //     // complete: '妊娠糖尿病',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-住院-妊娠糖尿病
      // if (stepNum == 'live' && liveValue == '15') {
      //   this.setData({
      //     isLive: true,
      //     btnSelected: false,
      //     // complete: '妊娠糖尿病',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-慢病-慢性肾病
      // if (stepNum == 'chronic' && chronicValue == '11') {
      //   this.setData({
      //     isChronic: true,
      //     btnSelected: false,
      //     // complete: '慢性肾病',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-住院-慢性肾病
      // if (stepNum == 'live' && liveValue == '20') {
      //   this.setData({
      //     isLive: true,
      //     btnSelected: false,
      //     // complete: '慢性肾病',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // // 目标-孕妇饮食
      // if (stepNum == 1 && targetValue == '11') {
      //   this.setData({
      //     isTarget: true,
      //     btnSelected: false,
      //     // complete: '孕妇饮食',
      //     overBtn: 2
      //   });
      //   return;
      // }
      // 4 日常活跃强度
      if (stepNum == 4) {
        this.setData({
          isActivity: true,
          btnSelected: false,
          complete: '目标',
          // targetSelect: 0,
          // targetValue: '01',
          overBtn: 2,
          navTitle: '选择数字饮食吃法'
        });
        this.submit(); // 提交数据
        this.addUserTarget(); // 增加用户目标
      }
      // // 显示动画
      // this.setData({
      //   isShowLoad: true
      // })
    }
  },
  // 提交数据
  submit() {
    const {
      targetValue,
      sexList,
      sexIndex,
      year,
      month,
      day,
      height,
      weight,
      activityValue,
      sugarValue,
      foodValue,
      pregnantValue,
      kidneyValue
    } = this.data
    // marketType：01 健身市场(对应目标01,02) 02 慢病市场(对应目标04) 03 轻食市场(对应目标10,03)
    // const marketType = ['01', '02'].includes(targetValue)?'01':['04'].includes(targetValue)?'02':'03'
    // // 注册绑定客户经理或营养师
    apiRequest.bindCounselor({
        // marketType
      }).then(res => {})
      .catch(error => {});

    // 完善身体数据
    apiRequest.perfectProfile({
        sex: sexList[sexIndex].id,
        // sex: userInfo.gender?userInfo.gender:sexList[sexIndex].id,
        birthday: `${year}${month}${day}`,
        height: height ? height : '170',
        weight: weight ? weight : '60',
        bodyfat: 0,
        motion: activityValue ? activityValue : '01',
        bloodValue: sugarValue,
        appetite: foodValue,
        pregnancyCycle: pregnantValue,
        nephroticCycle: kidneyValue
      }).then(res => {
        if (res.errCode == 0) {
          const loginInfo = getStorage('loginInfo');
          loginInfo.isPerProfile = true
          setStorage('loginInfo', loginInfo);
          if(targetValue == '09') {
            // this.setData({
            //   btnSelected: false,
            // })
            this.createCustomizeInitPlan()
            return
          }
          this.toPage(); // 判断跳转哪个页面
          // // 显示动画
          // this.setData({
          //   isShowLoad: true
          // })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }

      })
      .catch(error => {});
  },
  // 增加用户目标
  addUserTarget(customPlan) {
    const {
      targetList,
      targetSelect,
      targetValue,
      chronicValue,
      liveValue,
      age
    } = this.data
    // 一级选项决定二级选项数据
    let planningType = ''
    switch (targetValue) {
      case '04':
        planningType = chronicValue
        break;
      case '07':
        planningType = liveValue
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
        //   if(targetSelect == 0) {
        //     planningType ='23'
        //   } else if(targetSelect == 1) {
        //     planningType ='26'
        //   } else {
        //     planningType ='25'
        //   }
        //   break;
      case '09':
        age >= 1 && age <= 6 ? planningType = '12' : (age >= 7 && age <= 17 ? planningType = '13' : planningType = '23') //自定义方案先传默认 方案成功后修改为 24 自定义
        break;
      default:
        // planningType = targetValue
        planningType = targetList[targetSelect] ? targetList[targetSelect].planningType : ''
    }
    // 增加用户目标
    apiRequest.addUserTarget({
        // 自定义方案先默认 膳食指南 23 应用方案成功后更改为 planningType 24
        planningType: (planningType || '23')
      }).then(res => {
        wx.setStorageSync('theme', planningType == '01' ? 'panel' : 'simple');
      })
      .catch(error => {});
  },
  // 协议
  agreement: function () {
    wx.navigateTo({
      url: '/pages/mineBox/agreement/agreement',
    });
  },
  // 判断跳转哪个页面
  toPage: function () {
    apiRequest.announceConf().then(res => {
        // loginJump：00方案页，01套餐页，02点餐页
        let {
          loginJump
        } = res.obj;
        if (loginJump == '00') {
          const {
            age,
            activityList,
            activitySelect
          } = this.data;
          const activityName = activityList[activitySelect].name;
          wx.navigateTo({
            url: `/pages/mineBox/scheme/scheme?from=question&sex=${this.data.sexList[this.data.sexIndex].id}&age=${age}&activityName=${activityName}`
          });
          return
        }
        if (loginJump == '01') {
          wx.navigateTo({
            url: `/pages/packSubAccount/recommend/recommend`
          });
          return
        }
        if (loginJump == '02') {
          wx.switchTab({
            url: `/pages/index/index`,
            success(res) {
              const pages = getCurrentPages()
              const indexPage = pages.find(page => page.route.includes('index/index'))
              indexPage.doubleElevenRedBag()
            }
          });
          return
        }
      })
      .catch(error => {});
  },
  // 中国居民-弹窗
  residentDiet() {
    let longdate = day(Date.now()).format('YYYYMMDD'),
      subToken = getStorage("subToken") || '';
    let {
      sex,
      age,
      activityList,
      activitySelect
    } = this.data;
    const activityName = activityList[activitySelect].name;
    apiRequest.createH5Plan({
        date: longdate,
        sex,
        subToken: subToken || '',
      })
      .then(res => {
        if (res.errCode === 0) {
          // 每日应摄入-数据
          let {
            resultCarbohydrateWeight,
            resultProteinWeight,
            resultFatWeight,
            dietPlan
          } = res.obj;
          let intake = {
            resultCarbohydrateWeight,
            resultProteinWeight,
            resultFatWeight,
            total: Math.round(dietPlan.totalIntake),
          }
          let obj = {
            age,
            activityName,
            intake
          }
          this.setData({
            residentDietData: obj,
            residentDietShow: true
          })
        }
      })
  },
  // 吃法介绍-弹窗
  conneTip(e) {
    const {
      planningtype,
      from,
      value
    } = e.currentTarget.dataset;
    if (planningtype == 23) {
      this.residentDiet()
    } else {
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
    }
  },

  // 查看更多吃法
  checkMore() {
    this.setData({
      more: true
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