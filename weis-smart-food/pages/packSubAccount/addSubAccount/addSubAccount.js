// pages/packSubAccount/addSubAccount/addSubAccount.js
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
import { targetTip, chronicTip, liveTip } from '../../../utils/map'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
    scrollHeight: '',
    sexList: [{
      name: '男士',
      id: '1',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%205%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%94%B7%E5%A3%AB2.png'
    }, {
      name: '女士',
      id: '2',
      img: 'https://prodstatic.weis1606.cn/api/smartFood/%E7%BC%96%E7%BB%84%206%E5%A4%87%E4%BB%BD.png',
      imgSelected: 'https://prodstatic.weis1606.cn/api/smartFood/%E5%A5%B3%E5%A3%AB2.png'
    }],
    sexId: 1,
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
    activityIndex: 0,
    activityValue: '01',
    // targetList: [{
    //     name: '减脂减重',
    //     title: '出减脂饮食方案',
    //     value: '01'
    //   },
    //   {
    //     name: '增肌增重',
    //     title: '出增肌饮食方案',
    //     value: '02'
    //   },
    //   {
    //     name: '控制血糖',
    //     title: '出控制血糖方案',
    //     value: '04'
    //   },
    //   {
    //     name: '营养均衡',
    //     title: '出健康七分饱饮食方案',
    //     value: '03'
    //   }
    // ],
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
    // targetList: [
    //   {
    //     name: '营养均衡',
    //     title: '参考《中国居民膳食指南》',
    //     value: '11', // 23
    //     planningType: '23',
    //   },
    //   // {
    //   //   name: '七分饱健康饮食',
    //   //   value: '11', // 26
    //   //   planningType: '26',
    //   // },
    //   {
    //     name: '减脂减重',
    //     title: '参考《中国超重/肥胖医学营养治疗专家共识》',
    //     value: '01', // 01
    //     planningType: '01',
    //   },
    //   {
    //     name: '保持体型', // 由营养均衡 改为 保持体型
    //     title: '参考《中国居民膳食营养素参考摄入量》',
    //     value: '03', // 03
    //     planningType: '03',
    //   },
    //   {
    //     name: '增肌增重',
    //     title: '参考《美国国家体能协会运动营养指南》',
    //     value: '02', // 02
    //     planningType: '02',
    //   },
    //   {
    //     name: '孕妇饮食',
    //     value: '11',  // 25
    //     planningType: '25',
    //   },
    //   // {
    //   //   name: '控制血糖',
    //   //   title: '出控制血糖方案',
    //   //   value: '04'
    //   // },
    //   {
    //     name: '少儿发育',
    //     title: '参考《中国学龄儿童膳食指南》',
    //     value: '05', // 12
    //     planningType: '12',
    //   },
    //   {
    //     name: '青少年成长',
    //     title: '参考《WS/T 554-2017学生餐营养指南》',
    //     value: '06', // 13
    //     planningType: '13',
    //   },
    //   {
    //     name: '老年人膳食',
    //     title: '参考《WST556--2017老年人膳食指导》',
    //     value: '08',//22
    //     planningType: '22',
    //   },
    //   {
    //     name: '慢病饮食干预',
    //     value: '04'   // 04 05 06 07 08 09 11
    //   },
    //   // {
    //   //   name: '住院饮食干预',
    //   //   value: '07'  // 14 15 16 17 18 21 19 20
    //   // },
      
    //   // {
    //   //   name: '自定义吃法',
    //   //   title: '创建健康饮食吃法',
    //   //   value: '09', // 24
    //   //   planningType: '24',
    //   // },
    // ],
    // ---慢病饮食干预---
    chronicList: [{
        name: '糖尿病',
        title: '参考《中国糖尿病医学营养治疗指南》',
        value: '04'
      },
      {
        name: '妊娠糖尿病',
        title: '参考《妊娠合并糖尿病的营养治疗》',
        value: '05'
      },
      {
        name: '高血压',
        title: '参考《高血压患者膳食指导》',
        value: '06'
      },
      {
        name: '高血脂',
        title: '参考《高脂血症治疗指南》',
        value: '07'
      },
      {
        name: '高尿酸血症',
        title: '参考《高尿酸血症》',
        value: '08'
      },
      {
        name: '脂肪肝',
        title: '参考《脂肪肝患者的饮食与营养治疗》',
        value: '09'
      },
      {
        name: '慢性肾病',
        title: '参考《WS/T 557-2017 慢性肾脏病患者膳食指导》',
        value: '11'
      }
    ],
    // ---住院饮食干预---
    liveList: [{
        name: '糖尿病',
        title: '参考《中国糖尿病医学营养治疗指南》',
        value: '14'
      },
      {
        name: '妊娠糖尿病',
        title: '参考《妊娠合并糖尿病的营养治疗》',
        value: '15'
      },
      {
        name: '高血压',
        title: '参考《高血压患者膳食指导》',
        value: '16'
      },
      {
        name: '高血脂',
        title: '参考《高脂血症治疗指南》',
        value: '17'
      },
      {
        name: '高尿酸血症',
        title: '参考《高尿酸血症》',
        value: '18'
      },
      // {
      //   name: '肿瘤',
      //   value: '21'
      // },
      {
        name: '外科手术后',
        title: '参考《成人围手术期营养支持指南》',
        value: '19'
      },
      {
        name: '慢性肾病',
        title: '参考《WS/T 557-2017 慢性肾脏病患者膳食指导》',
        value: '20'
      }
    ],
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
    stepNum: 1,
    more: false,//更多吃法 是否展开
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
    this.setData({
      tsuSubType: options.tsuSubType || '00', //00 私人账号 01 企业账号
      from: options.from || '',
      subToken: options.subToken,
    })
    if (this.data.tsuSubType == '01') {
      this.queryUserCorpAddressList()
    }
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
    // let scrollHeight = (设备屏幕高度的px - 下一步按钮高度的px) * 设备px转rpx的换算比例 - 下一步按钮下边距的rpx - 滚动与底部内容需拉开间距的rpx - 头部说明图片的高度rpx
    let scrollHeight = (mobileInfo.windowHeight - 44) * px2rpx - 65 - 228 - 344;
      this.setData({
        scrollHeight
      })
  },
  // 请求校区
  queryUserCorpAddressList() {
    apiRequest.queryUserCorpAddressList({

    }).then((res) => {
      this.setData({
        messageBeans: res.obj.messageBeans
      })
    })
  },

  // 选择校区
  select(e) {
    let index = e.currentTarget.dataset.index;
    let {
      messageBeans,
      nickName
    } = this.data;
    this.setData({
      corpId: messageBeans[index].corpId,
      tgcaId: messageBeans[index].tgcaId,
      tgcaName: messageBeans[index].tgcaName,
      btnSelect: nickName ? true : false,
    })
    this.campusClose();
  },

  campusClose() {
    this.setData({
      showCampus: !this.data.showCampus
    })
  },

  nickChange(e) {
    let nickName = e.detail.value;
    let {
      tsuSubType,
      tgcaId
    } = this.data;
    this.setData({
      nickName,
      btnSelect: nickName && (tsuSubType == '00' || (tgcaId && tsuSubType == '01')) ? true : false
    })
  },

  sexSelect(e) {
    let id = e.currentTarget.dataset.id;
    let {
      sexList,
      year
    } = this.data;
    this.setData({
      sexId: id,
      btnSelect: this.birthCheck(year, id)
      // btnSelect: year && id ? true : false
    })
  },

  yearChange(e) {
    let year = e.detail.value;
    this.setData({
      year,
      btnSelect: this.birthCheck(year, this.data.sexId),
      // btnSelect: year && this.data.sexId ? true : false,
      yearBir: new Date().getFullYear() - year
    })
    if (year < 1) {
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
  heightChange(e) {
    let height = e.detail.value;
    this.setData({
      height,
      btnSelect: height && this.data.weight ? true : false
    })
    if (height < 50 || height > 200) {
      wx.showToast({
        title: '身高不能小于50cm或超过200cm',
        icon: 'none',
      });
    }
  },

  weightChange(e) {
    let weight = e.detail.value;
    this.setData({
      weight,
      btnSelect: weight && this.data.height ? true : false
    })
    if (weight < 5 || weight > 200) {
      wx.showToast({
        title: '体重不能小于5kg或超过200kg',
        icon: 'none',
      });
      return
    }
    if (weight.indexOf('.') != -1 && weight.toString().split('.')[1].length > 1) {
      wx.showToast({
        title: '体重只保留一位小数点',
        icon: 'none',
      });
      return
    }
  },

  activitySelect(e) {
    let activityValue = e.currentTarget.dataset.value;
    let activityIndex = e.currentTarget.dataset.index;
    this.setData({
      activityValue,
      activityIndex,
      btnSelect: true
    })
  },

  async targetSelect (e) {
    let targetValue = e.currentTarget.dataset.value;
    let targetSelect = e.currentTarget.dataset.index;
    let planningtype = e.currentTarget.dataset.planningtype;
    // const {
    //   year
    // } = this.data;
    // // 少儿发育05 （1-6岁）,青少年成长06（7-17岁）
    // let reg = false
    // switch (targetValue) {
    //   case '05':
    //     if (year < 1 || year > 6) {
    //       reg = true
    //     } else {
    //       this.setData({
    //         btnText: '添加子账号'
    //       })
    //     }
    //     break;
    //   case '06':
    //     if (year < 7 || year > 17) {
    //       reg = true
    //     } else {
    //       this.setData({
    //         btnText: '添加子账号'
    //       })
    //     }
    //     break;
    //   case '04':
    //   case '07':
    //     this.setData({
    //       btnText: ''
    //     })
    //     break;
    //   case '11':
    //     if(planningtype == '25') {
    //       this.setData({
    //         btnText: ''
    //       })
    //     } else {
    //       this.setData({
    //         btnText: '添加子账号'
    //       })
    //     }
    //     break;
    //   default:
    //     this.setData({
    //       btnText: '添加子账号'
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
      targetSelect,
      targetValue,
      targetPlanningType: planningtype,
      btnSelect: true,
      // btnText: targetValue == '04' ? '' : '添加子账号'
    })
    // if (targetValue == '09') {
    //   await this.createSub('customPlan');
    //   let subToken = this.data.subToken;
    //   wx.navigateTo({
    //     url: `/pages/packageDiscover/planSet/planSet?subToken=${subToken}`,
    //   });
    // }
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
            url: `/pages/packageDiscover/customPlan/customPlan?planId=${planId}&subToken=${subToken}&from=addSubAccount`,
          })
        }
      })
      .catch(error => {

      })
  },
  // ----------------
  // 慢病饮食干预
  chronicSelect: function (e) {
    const {
      value
    } = e.currentTarget.dataset;
    // switch (value) {
    //   case '04':
    //   case '05':
    //   case '11':
    //     this.setData({
    //       btnText: ''
    //     })
    //     break;
    //   default:
    //     this.setData({
    //       btnText: '添加子账号'
    //     })
    // }

    this.setData({
      chronicValue: value,
      btnSelect: true
    });
  },
  // 住院饮食干预
  liveSelect: function (e) {
    const {
      value
    } = e.currentTarget.dataset;
    // switch (value) {
    //   case '14':
    //   case '15':
    //   case '20':
    //     this.setData({
    //       btnText: ''
    //     })
    //     break;
    //   default:
    //     this.setData({
    //       btnText: '添加子账号'
    //     })
    // }

    this.setData({
      liveValue: value,
      btnSelect: true
    });
  },
  // ----------------
  // 血糖值（选择控制血糖目标的用户增加这个附加信息）
  sugarSelect: function (e) {
    let sugarValue = e.currentTarget.dataset.value;
    this.setData({
      sugarValue,
      btnSelect: sugarValue && this.data.foodValue ? true : false
    });
  },
  // 主食（选择控制血糖目标的用户增加这个附加信息）
  foodSelect: function (e) {
    let foodValue = e.currentTarget.dataset.value;
    this.setData({
      foodValue,
      btnSelect: foodValue && this.data.sugarValue
    });
  },
  // 你的怀孕周期
  pregnantSelect: function (e) {
    const {
      value
    } = e.currentTarget.dataset;
    this.setData({
      pregnantValue: value,
      btnSelect: true
    });
  },
  // 你的肾病是第几期
  kidneySelect: function (e) {
    const {
      value
    } = e.currentTarget.dataset;
    this.setData({
      kidneyValue: value,
      btnSelect: true
    });
  },
  async nextStep() {
    let {
      btnSelect,
      stepNum,
      targetValue,
      targetPlanningType,
      chronicValue,
      liveValue,
      year,
      height,
      weight
    } = this.data;
    if (btnSelect) {
      switch (stepNum) {
        case 1:
          if (targetValue == '04') {
            this.setData({
              stepNum: 'chronic',
              btnSelect: false,
              showChronic: true,
              // btnText: ''
            })
            // this.setData({
            //   stepNum: 'sugar',
            //   btnSelect: false,
            //   showSugar: true,
            //   btnText: '添加子账号'
            // })
          } else if (targetValue == '07') {
            this.setData({
              stepNum: 'live',
              btnSelect: false,
              showLive: true,
              // btnText: ''
            })
          } else if (targetValue == '11') {
            this.setData({
              stepNum: 'pregnant',
              btnSelect: false,
              showPregnant: true,
              // btnText: ''
            })
          } else {
            // 提交数据
          //  await this.createSub();
            this.setData({
              stepNum: 2,
              btnSelect: false,
            });
          }
          break;
        case 'chronic':
          if (chronicValue == '04') {
            this.setData({
              stepNum: 'sugar',
              btnSelect: false,
              showSugar: true,
              // btnText: ''
            })
          } else if (chronicValue == '05') {
            this.setData({
              stepNum: 'pregnant',
              btnSelect: false,
              showPregnant: true,
              // btnText: ''
            })
          } else if (chronicValue == '11') {
            this.setData({
              stepNum: 'kidney',
              btnSelect: false,
              showKidney: true,
              // btnText: ''
            })
          } else {
            // 提交数据
          //  await this.createSub();
            this.setData({
              stepNum: 2,
              btnSelect: false,
              // complete: '孕妇饮食',
              // overBtn: 2
            });
          }
          break;
        case 'live':
          if (liveValue == '14') {
            this.setData({
              stepNum: 'sugar',
              btnSelect: false,
              showSugar: true,
              // btnText: ''
            })
          } else if (liveValue == '15') {
            this.setData({
              stepNum: 'pregnant',
              btnSelect: false,
              showPregnant: true,
              // btnText: ''
            })
          } else if (liveValue == '20') {
            this.setData({
              stepNum: 'kidney',
              btnSelect: false,
              showKidney: true,
              // btnText: ''
            })
          } else {
            // 提交数据
          //  await this.createSub();
            this.setData({
              stepNum: 2,
              btnSelect: false,
            });
          }
          break;
        case 'chronic':
        case 'live':
        case 'sugar':
        case 'pregnant':
        case 'kidney':
          this.setData({
            stepNum: 2,
            btnSelect: false,
          });
          //  提交数据
        //  await this.createSub();
          break;
          // case 'pregnant':
          //   //  提交数据
          //   this.createSub()
          //   break;
        case 2:
          this.setData({
            stepNum: 3,
            btnSelect: this.birthCheck('', 1),
            // btnText: ''
          })
          break;
        case 3:
          if (year < 1) {
            wx.showToast({
              title: '年龄不能小于1岁',
              icon: 'none',
            });
            return
          }
          // 目标根据用户年龄和性别显示
          // let { sexId, targetList, chronicList, liveList } = this.data;
          // let targetListFliter = []
          // if(year >= 1 && year <= 6) {
          //   // 1-6岁-少儿发育
          //   targetListFliter = targetList.filter((item, index) => ['12'].includes(item.planningType));
          // } else if(year >= 7 && year <= 17) {
          //   // 7-17岁-青少年成长
          //   targetListFliter = targetList.filter((item, index) => ['13'].includes(item.planningType));
          // } else if(year >= 18 && year <= 64) {
          //   // 18-64岁
          //   targetListFliter = targetList.filter((item, index) => ['23', '03', '01', '02', '25'].includes(item.planningType) || ['04'].includes(item.value));
          // } else if(year >= 65) {
          //   // 65岁以上
          //   targetListFliter = targetList.filter((item, index) => ['22'].includes(item.planningType) || ['04'].includes(item.value));
          // } else {
          //   targetListFliter = targetList
          // }
          // // 男性 || 65岁以上用户 -- 不显示"孕妇饮食" “妊娠糖尿病”
          // if(sexId == 1 || year >= 65) {
          //   // 孕妇饮食
          //   targetListFliter = targetListFliter.filter((item, index) => !['25'].includes(item.planningType));
          //   // 妊娠糖尿病
          //   this.setData({
          //     chronicList: chronicList.filter(item => !['05'].includes(item.value)),
          //     liveList: liveList.filter(item => !['15'].includes(item.value))
          //   })
          // }
          this.setData({
            // targetList: targetListFliter,
            stepNum: 4,
            btnSelect: false
          })
          break;
        case 4:
          if (height < 50 || height > 200 || weight < 5 || weight > 200) {
            wx.showToast({
              title: height < 50 || height > 200 ? '身高不能小于50cm或超过200cm' : '体重不能小于5kg或超过200kg',
              icon: 'none',
            });
            return
          }
          if (weight.indexOf('.') != -1 && weight.toString().split('.')[1].length > 1) {
            wx.showToast({
              title: '体重只保留一位小数点',
              icon: 'none',
            });
            return
          }
          this.setData({
            stepNum: 5,
            btnSelect: true,
            btnText: '添加子账号'
          })
          break;
        case 5:
          // this.setData({
          //   // stepNum: 5,
          //   // btnSelect: false,
          //   // btnText: '添加子账号'
          // })
          // if(this.data.from != 'update') {
            // 提交数据
            await this.createSub();
          // }
          // 默认选中第一个吃法
          // this.targetSelect({
          //   currentTarget: {
          //     dataset: {
          //       index: 0,
          //       value: this.data.targetList[0].value,
          //       planningtype: this.data.targetList[0].planningType,
          //     }
          //   }
          // })
          break;
        
      }
    }
  },

  // 创建子账号
  createSub(customPlan) {
    const {
      sexId,
      height,
      weight,
      activityValue,
      sugarValue,
      foodValue,
      nickName,
      yearBir,
      tsuSubType,
      pregnantValue,
      kidneyValue,
      targetSelect,
      targetList,
      targetValue,
      chronicValue,
      liveValue,
      corpId,
      tgcaId,
      year,
      stepNum
    } = this.data;
    // 一级选项决定二级选项数据
    let planningType = ''
    switch (targetValue) {
      case '04':
        planningType = chronicValue
        break;
      case '07':
        planningType = liveValue
        break;
      // case '05':
      //   planningType = '12'
      //   break;
      // case '06':
      //   planningType = '13'
      //   break;
      // case '08':
      //   planningType = '22'
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
        year >= 1 && year <= 6 ? planningType = '12' : (year >= 7 && year <= 17 ? planningType = '13' : planningType = '23')//自定义方案先传默认 方案成功后修改为 24 自定义
        break;
      default:
        // planningType = targetValue
        planningType = targetList[targetSelect] ? targetList[targetSelect].planningType : ''
    }

    if(this.data.from == 'update') {
      // 修改数据
      apiRequest.updateUserProfile({
        birthday: `${yearBir}0101`,
        sex: sexId,
        height: height,
        weight: weight,
        motion: activityValue,
        bloodValue: sugarValue ? sugarValue : '',
        appetite: foodValue ? foodValue : '',
        pregnancyCycle: pregnantValue || '',
        nephroticCycle: kidneyValue || '',
        // subName: nickName,
        subToken: this.data.subToken,
      })
      .then(res => {
      })
      .catch(error => {
  
      })
      // 修改昵称
      apiRequest.updateUserUnameAndHeadImgUrl({
        uname: nickName,
        subToken: this.data.subToken
      })
      .then(res => {
      })
      .catch(error => {

      })
      // 修改目标
      apiRequest.updateUserTarget({
        planningType,
        dataStt: '00', // 数据类型为修改
        subToken: this.data.subToken,
      }).then(res => {
        this.toPage(); // 判断跳转哪个页面
      })
      return
    }
    
    if(this.data.subToken){
      // 已经创建子账号 修改
      if(sugarValue || foodValue || pregnantValue || kidneyValue){
        apiRequest.updateUserProfile({
          bloodValue: sugarValue || undefined,
          appetite: foodValue || undefined,
          pregnancyCycle: pregnantValue || undefined,
          nephroticCycle: kidneyValue || undefined,
          subToken: this.data.subToken,
        })
       }
     return apiRequest.updateUserTarget({
        planningType,
        dataStt: '00', // 数据类型为修改
        subToken: this.data.subToken,
      }).then(res => {
        if(!customPlan){
          this.toPage(); // 判断跳转哪个页面
          // this.setData({
          //   stepNum: 'loading',
          // })
        }
      })
    }else{
      //创建子账号
      return apiRequest.perfectProfileForSubUser({
        birthday: `${yearBir}0101`,
        sex: sexId,
        height: height,
        weight: weight,
        motion: activityValue,
        bloodValue: sugarValue ? sugarValue : '',
        appetite: foodValue ? foodValue : '',
        pregnancyCycle: pregnantValue || '',
        nephroticCycle: kidneyValue || '',
        subName: nickName,
        tsuSubType, //子账号类型
        registerFrom: '01',
        planningType: planningType || '23',
        tgcuTgcId: corpId || 0,
        tgcuTgcaId: tgcaId || 0,
      }).then(res => {
        this.setData({
          subToken: res.obj.subToken
        })
        if(targetValue == '09') {
          this.createCustomizeInitPlan()
          return
        }
        if(!customPlan){
          this.toPage(); // 判断跳转哪个页面
          // this.setData({
          //   stepNum: 'loading',
          // })
        }
      })
    }
    this.toPage(); // 判断跳转哪个页面
  },
  // 判断跳转哪个页面
  toPage: function () {  
    if(this.data.from != 'update') {
      const pages = getCurrentPages()
      // const prepage = pages.length - 2
      const index = pages.findIndex(
        page => page.route === 'pages/packSubAccount/switchAccount/switchAccount'
      );
      wx.navigateBack({
        delta: index > -1 ? pages.length - (index + 1) : 1
      });
    } else {
      wx.navigateBack({
        delta: 1
      });
    }
    
    // apiRequest.announceConf().then(res => {
    //   // loginJump：00方案页，01套餐页，02点餐页
    //   let { loginJump } = res.obj;
    //   if(loginJump == '00') {
    //     let {sexId, year, activityList, activityIndex, subToken} = this.data;
    //     wx.redirectTo({
    //       url: `/pages/mineBox/scheme/scheme?from=question&sex=${sexId}&age=${year}&activityName=${activityList[activityIndex].name}&delta=1&subToken=${subToken}`
    //     });
    //     return
    //   }
    //   if(loginJump == '01') {
    //     wx.navigateTo({
    //       url: `/pages/packSubAccount/recommend/recommend`
    //     });
    //     return
    //   }
    //   if(loginJump == '02') {
    //     wx.switchTab({
    //       url: `/pages/index/index`,
    //     });
    //     return
    //   }
    // })
    // .catch(error => { });
  },

  // 中国居民-弹窗
  residentDiet() {
    let {sexId, year, activityList, activityIndex, subToken} = this.data;
    let longdate = day(Date.now()).format('YYYYMMDD');
    const activityName = activityList[activityIndex].name;
    apiRequest.createH5Plan({
      date: longdate,
      sex: sexId,
      subToken: subToken || '',
    })
    .then(res => { 
      if(res.errCode === 0) {
        // 每日应摄入-数据
        let {resultCarbohydrateWeight, resultProteinWeight, resultFatWeight, dietPlan} = res.obj;
        let intake = {
          resultCarbohydrateWeight,
          resultProteinWeight,
          resultFatWeight,
          total: Math.round(dietPlan.totalIntake),
        }
        let obj = {
          age: year,
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
    const {planningtype, from, value} = e.currentTarget.dataset;
    if(planningtype == 23) {
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
  checkMore(){
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

  }
})