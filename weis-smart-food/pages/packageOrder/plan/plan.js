// pages/plan/plan.js
import day from '../../../libs/day'
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
import apiRequest from '../../../service/index';
import {
  categoryMap
} from '../../../utils/map'
import {
  isLoginClick,
  loginPromise,
  t,
  round,
  judgeSubAccount,
  showDialog,
  saveUseLog
} from '../../../utils/common'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: 0,
    status: categoryMap,
    toPlanList: ['方案库', '自定义饮食方案'],
    weekText: ['日','一','二','三','四','五','六'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navStatusHeight: getStorage('navStatusHeight'),
      px2rpx: app.globalData.px2rpx,
      openCategory: [],
      subToken: getStorage('subToken'),
    })
    loginPromise.then(async (res) => {
      // 后台配置弹窗显示
      showDialog('04',this)
      this.setData({
        uid: res.uid
      })
    })
    // 调整本餐营养数据
    const pages = getCurrentPages()
    this.prePage = pages[pages.length - 2]
    // 营养素范围
    this.nutrientRange()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.editPopup = this.selectComponent("#editPopup");
    // 计算滚动高度
    let sysinfo = wx.getSystemInfoSync();
    let {
      navStatusHeight,
      px2rpx
    } = this.data;
    console.log(sysinfo.windowHeight + '----------' + navStatusHeight)
    this.setData({
      scrollHeight: (sysinfo.windowHeight - navStatusHeight - t(167)) * px2rpx
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    // 查询目标
    this.queryUserTarget();
    // 查询日期
    await this.queryGoodsDateList();
    // 查询方案
    this.queryUserProgramme();
    // 判断子账户是否有效
    judgeSubAccount()
  },

  // 查询目标
  queryUserTarget() {
    apiRequest.queryUserTarget()
      .then((res) => {
        if (res.errCode === 0) {
          this.setData({
            planningType: res.obj.healthGoal.planningType
          })
        }
      })
  },

  queryGoodsDateList() {
    return new Promise(async (resolve) => {
      // 查询点餐日期
      let orderDateList = getStorage('orderDateList') || [];
      let weekText = this.data.weekText;
      if (orderDateList.length == 0) {
        await this.getDate();
        orderDateList = this.resultDateList;
      }
      // console.log(orderDateList)
      let dateList = [];
      orderDateList.forEach((item, index) => {
        let idx = dateList.map(item => item.date).indexOf(item.date);
        if (idx >= 0) {
          dateList[idx].category.push(item.categoryType)
        } else {
          let obj = {
            date: item.date,
            month: day(item.date).format('MM'),
            day: day(item.date).format('DD'),
            category: [item.categoryType],
            week: item.date == day().format('YYYYMMDD') ? '今日' : weekText[day(item.date).day()],
          };
          dateList.push(obj)
        }
      })

      let dateArr = dateList.map(item => item.date);
      if (getStorage('toPlanDate') && dateArr.indexOf(day(getStorage('toPlanDate')).format('YYYYMMDD')) >= 0) {
        this.setData({
          selectIndex: dateArr.indexOf(day(getStorage('toPlanDate')).format('YYYYMMDD')),
        })
        removeStorage('toPlanDate')
      }
      this.setData({
        dateList
      })
      resolve();
    })
  },

  // 请求日期
  getDate() {
    return apiRequest.queryGoodsDateList({
      beginTime: day().format('YYYYMMDD'),
      hpid: 100000,
      addTimes: 15,
    }).then((res) => {
      this.resultDateList = res.obj.resultDateList;
    })
  },

  // 用户方案
  queryUserProgramme() {
    let {
      selectIndex,
      dateList,
      status,
      openCategory
    } = this.data;
    apiRequest.queryUserProgramme({
      isMainPlan: 0,
      planStt: '01',
      dateTime: dateList[selectIndex].date,
    }).then((res) => {
      let dietPlan = res.obj.dietPlan;
      dietPlan.planDetailList.forEach((item, index) => {
        // item.open = openCategory.indexOf(item.category) >= 0 ? true : false;
        item.open = true;
        item.canCard = Boolean(day(dateList[selectIndex].date) <= day());
        if (Number(item.category) > 3 || dateList[selectIndex].category.includes(item.category)) {
          item.canMeal = true
        } else {
          item.canMeal = false;
        }
        // 餐别名字
        item.categoryName = status[item.category] || (item.category == '04' ? '加餐' : `加餐${Number(item.category)-3}`)
      })
      this.setData({
        dietPlan,
        isModifiable: res.obj.isModifiable,
      })
    })
  },

  // 选中日期
  select: function (e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      selectIndex
    } = this.data;
    if (index == selectIndex) {
      return
    }
    this.setData({
      selectIndex: index,
    })
    this.queryUserProgramme();
  },

  // 展开
  open(e) {
    return
    let dietPlan = this.data.dietPlan;
    let index = e.currentTarget.dataset.index;
    let openCategory = [];
    dietPlan.planDetailList[index].open = !dietPlan.planDetailList[index].open;
    dietPlan.planDetailList.forEach((item, index) => {
      if (item.open) {
        openCategory.push(item.category)
      }
    })
    this.setData({
      dietPlan,
      openCategory
    })
  },

  editName() {
    let {
      dietPlan,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
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

  // 修改摄入量
  editIntake() {
    let {
      dietPlan,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
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

  // 三餐能量比例
  editEnergy() {
    let {
      dietPlan,
      status,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
    let listArr = [];
    dietPlan.planDetailList.forEach((item, index) => {
      let arr = {
        category: '',
        name: '',
        val: '',
        unit: '%'
      }
      arr.category = item.category;
      arr.name = status[item.category] || (item.category == '04' ? '加餐' : `加餐${Number(item.category)-3}`);
      arr.val = item.totalRatio;
      listArr.push(arr)
    })
    this.setData({
      title: '每餐能量比例',
      subTitle: '全天能量比例之和需要等于100%',
      errTip: '全天能量比例之和不等于100%',
      btnText: '确定',
      showEdit: true,
      iptType: '2',
      listArr,
      editType: 'categoryEnergy'
    })
  },

  //综合 修改一餐营养素
  editOneCategory(e) {
    let index = e.currentTarget.dataset.category;
    let {
      dietPlan,
      status,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
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
      editCategory: categoryObj.category,
      selectMealIndex: index
    })

  },

  // 固蛋 三餐蛋白
  editThreeCate() {
    let {
      dietPlan,
      status,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
    let listArr = [];
    dietPlan.planDetailList.forEach((item, index) => {
      let arr = {
        category: '',
        name: '',
        val: '',
        unit: '%'
      }
      arr.category = item.category;
      arr.name = status[item.category] || (item.category == '04' ? '加餐' : `加餐${Number(item.category)-3}`);
      arr.val = item.fixedProteinRatio;
      listArr.push(arr)
    })
    this.setData({
      title: '每餐蛋白质比例',
      subTitle: '全天蛋白质之和需要等于100%',
      errTip: '全天蛋白质比例之和不等于100%',
      btnText: '确定',
      showEdit: true,
      iptType: '2',
      listArr,
      editType: 'editThreeCate'
    })

  },

  //固蛋 修改单餐脂肪
  editOneFat(e) {
    let {
      index,
      category
    } = e.currentTarget.dataset;
    let {
      dietPlan,
      isModifiable
    } = this.data;
    if (!isModifiable) {
      return
    }
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
      selectMealIndex: index,
    })
  },

  // 确定更改
  update(e) {
    let {
      editType,
      dateList,
      category,
      dietPlan,
      selectIndex,
      selectMealIndex,
    } = this.data;
    if (editType == 'planName') {
      // 修改方案名
      apiRequest.updateUserProgramme({
        planName: e.detail.iptVal,
        isMainPlan: 0,
        dateTime: dateList[selectIndex].date,
        id: dietPlan.id,
        totalIntake: dietPlan.totalIntake,
        calculationMethod: dietPlan.calculationMethod
      }).then((res) => {
        if (res.obj.updateStt) {
          this.setData({
            ['dietPlan.planName']: e.detail.iptVal
          })
        }
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
      apiRequest.updateUserPlanDetailRatio({
        categoryRatioList: categoryRatioList,
        dateTime: dateList[selectIndex].date,
        pId: dietPlan.planDetailList[0].pid,
      }).then((res) => {
        this.queryUserProgramme()
      })
    } else if (editType == 'editOneCategory') {
      // 三大宏量元素
      let listArr = e.detail.listArr;
      apiRequest.updateUserProgrammeDetail({
        carbohydrateRatio: listArr[2].val,
        proteinRatio: listArr[0].val,
        fatRatio: listArr[1].val,
        category: this.data.editCategory,
        dateTime: dateList[selectIndex].date,
        pId: dietPlan.planDetailList[selectMealIndex].pid,
        dId: dietPlan.planDetailList[selectMealIndex].id,
      }).then((res) => {
        this.queryUserProgramme()
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
      apiRequest.updateUserProgramme({
        totalIntake: oneObj.val,
        calculationMethod: dietPlan.calculationMethod,
        energyDifference: dietPlan.energyDifference,
        energyRatio: dietPlan.planDetailList[0].energyRatio,
        fixedProteinRatioList: fixedProteinRatioList,
        sportsConsume: dietPlan.sportsConsume,
        isMainPlan: 0,
        dateTime: dateList[selectIndex].date,
        id: dietPlan.id,
      }).then((res) => {
        this.queryUserProgramme()
      })
    } else if (editType == 'editPro') { //当前显示单位体重所需蛋白 没用到
      // 修改单位体重所需蛋白
      let oneObj = e.detail.oneObj;
      if (oneObj.val == dietPlan.planDetailList[0].energyRatio) {
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
        date: dateList[selectIndex].date
      }).then((res) => {
        this.queryUserProgramme()
      })
    } else if (editType == 'editThreeCate') {
      // 修改三餐蛋白
      let listArr = e.detail.listArr;
      const categoryRatioList = listArr.map(item => {
        return {
          proteinRatio: item.val,
          category: item.category
        }
      })
      apiRequest.updateUserProgramme({
        totalIntake: dietPlan.totalIntake,
        calculationMethod: dietPlan.calculationMethod,
        energyDifference: dietPlan.energyDifference,
        energyRatio: dietPlan.planDetailList[0].energyRatio,
        fixedProteinRatioList: categoryRatioList,
        sportsConsume: dietPlan.sportsConsume,
        dateTime: dateList[selectIndex].date,
        id: dietPlan.id,
      }).then((res) => {
        this.queryUserProgramme()
      })
    } else if (editType == 'editOneFat') {
      // 修改单餐脂肪
      let oneObj = e.detail.oneObj;
      if (oneObj.val == dietPlan.planDetailList[selectMealIndex].fatRatio) {
        // 修改值和当前相等 不调用接口
        this.editPopup.handleClickOverlay()
        return
      }
      apiRequest.updateUserProgrammeDetail({
        fatRatio: oneObj.val,
        category,
        dateTime: dateList[selectIndex].date,
        pId: dietPlan.planDetailList[selectMealIndex].pid,
        dId: dietPlan.planDetailList[selectMealIndex].id,
      }).then((res) => {
        this.queryUserProgramme()
      })
    }
    this.editPopup.handleClickOverlay()
  },

  // 立即点餐
  tapMeal(e) {
    let {
      dateList,
      selectIndex
    } = this.data;
    let category = e.currentTarget.dataset.category;
    if (Number(category) > 3) {
      // 加餐
      wx.navigateTo({
        url: `/pages/packageOrder/snacks/snacks?date=${dateList[selectIndex].date}&category=${category}`,
      });
    } else if (dateList[selectIndex].category.includes(category)) {
      // 跳转点餐页
      setStorage('planMealDate', {
        date: dateList[selectIndex].date,
        category,
      })
      wx.switchTab({
        url: '/pages/index/index',
      });
    }
  },

  // 打卡
  dietCard(e) {
    let {
      dateList,
      selectIndex
    } = this.data;
    if (!e.currentTarget.dataset.can) {
      return
    }
    wx.navigateTo({
      url: `/pages/packageDiscover/dietCard/dietCard?date=${dateList[selectIndex].date}`,
    });
  },

  // 更换饮食方案
  // change() {
  //   let {
  //     planningType
  //   } = this.data;
  //   if (planningType == '01' || planningType == '02') {
  //     this.setData({
  //       showToPlan: true
  //     })
  //   } else {
  //     wx.navigateTo({
  //       url: '/pages/packageDiscover/planSet/planSet',
  //     });
  //   }
  // },

  // 更换饮食方案
  change() {
    let { subToken, planningType } = this.data;
    if(planningType == '32') {
      if(subToken) {
        wx.navigateTo({
          url: `/pages/packSubAccount/addSubAccount/addSubAccount?tsuSubType=00&&from=update&subToken=${subToken}`,
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

  closePlan() {
    this.setData({
      showToPlan: false
    })
  },

  toPlan(e) {
    let index = e.currentTarget.dataset.index;
    this.closePlan();
    switch (index) {
      case 0:
        wx.navigateTo({
          url: '/pages/packageDiscover/schemeLibrary/schemeLibrary',
        });
        break;
      case 1:
        wx.navigateTo({
          url: '/pages/packageDiscover/planSet/planSet',
        });
        break;
    }
  },

  touchstart(){
    this.setData({
      isScroll: true,
    })
  },

  touchend(){
    setTimeout(()=>{
      this.setData({
        isScroll: false,
      })
    },2000)
  },

  contact(){
    wx.navigateTo({
      url: '/pages/mineBox/contact/contact',
    });
  },

  // ------------------控卡-调整本餐营养数据------------------
  // 控卡点击
  control(e){
    // g 转化 kcal 蛋白质 碳水 *4  脂肪*9
    // let total = this.prePage.data.total;
    let total = e.currentTarget.dataset.item;
    this.setData({
      showControl: true,
      currentData: {
        totalEnergy: Number(total.totalKcal), // 总能量
        totalProtein: total.proteinTotal, // 蛋白质
        totalCarbonwater: total.carbohydrateTotal, // 碳水
        totalFat: total.fatTotal, // 脂肪
        protePer: `${round((total.proteinTotal*4/total.totalKcal)*100,0)}`,
        carbPer: `${round((total.carbohydrateTotal*4/total.totalKcal)*100,0)}`,
        fatPer: `${100 - round((total.proteinTotal*4/total.totalKcal)*100,0) - round((total.carbohydrateTotal*4/total.totalKcal)*100,0)}`,
      },
      total,
    })
  },
  // 营养素范围
  nutrientRange(){
    let info = this.prePage.data.info;
    let sex = info.userProfile.sex;
    // let total = this.prePage.data.total;
    // 能量与三大营养素上限值：
    // 男性：能量300-1000kcal；蛋白质10-60g,脂肪10-40g,碳水化合物30-150g
    // 女性：能量200-800kcal；蛋白质10-40g,脂肪0-30g,碳水化合物20-120g
    let nutrient = {
      minEnergy: sex == 1 ? 300 : 200,
      maxEnergy: sex == 1 ? 1000 : 800,
      minCarbonwater: sex == 1 ? 30 : 20,
      maxCarbonwater: sex == 1 ? 150 : 120,
      minProtein: sex == 1 ? 10 : 10,
      maxProtein: sex == 1 ? 60 : 40,
      minFat: sex == 1 ? 10 : 0,
      maxFat: sex == 1 ? 40 : 30,
    }
    this.setData({
      nutrient,
      // total,
    })
  },
  changeRule(e){
    console.log(e)
    let type = e.currentTarget.dataset.type;
    let value = e.detail.value;
    if(e.currentTarget.dataset.reset){
      value = e.currentTarget.dataset.value;
    }
    console.log(value)
    let currentData = this.data.currentData;
    let nutrient = this.data.nutrient;
    this.setData({
      updateType: type,
    })
    switch (type){
      // 能量
      case '01':
        value = value < nutrient.minEnergy ? nutrient.minEnergy : (value > nutrient.maxEnergy ? nutrient.maxEnergy : value);
        this.setData({
          ['currentData.totalEnergy']: value,
          ['currentData.totalProtein']: round(value * (currentData.protePer/100) / 4,0),//蛋白质
          ['currentData.totalCarbonwater']: round(value * (currentData.carbPer/100) / 4,0),//碳水
          ['currentData.totalFat']: round(value * (currentData.fatPer/100) / 9,0),//脂肪
        })
      break;
      // 蛋白质
      case '02':
        value = value < nutrient.minProtein ? nutrient.minProtein : (value > nutrient.maxProtein ? nutrient.maxProtein : value);
        var total = round(value*4 + currentData.totalCarbonwater*4 + currentData.totalFat*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalProtein']: value,//蛋白质
          ['currentData.protePer']: `${round((value*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((currentData.totalCarbonwater*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((value*4/total)*100,0) - round((currentData.totalCarbonwater*4/total)*100,0)}`,//脂肪比例
        })
      break;
      // 碳水
      case '03':
        value = value < nutrient.minCarbonwater ? nutrient.minCarbonwater : (value > nutrient.maxCarbonwater ? nutrient.maxCarbonwater : value);
        var total =  round(currentData.totalProtein*4 + value*4 + currentData.totalFat*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalCarbonwater']: value,//碳水
          ['currentData.protePer']: `${round((currentData.totalProtein*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((value*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((currentData.totalProtein*4/total)*100,0) - round((value*4/total)*100,0)}`,//脂肪比例
        })
      break;
      // 脂肪
      case '04':
        value = value < nutrient.minFat ? nutrient.minFat : (value > nutrient.maxFat ? nutrient.maxFat : value);
        var total = round(currentData.totalProtein*4 + currentData.totalCarbonwater*4 + value*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalFat']: value,//脂肪
          ['currentData.protePer']: `${round((currentData.totalProtein*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((currentData.totalCarbonwater*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((currentData.totalProtein*4/total)*100,0) - round((currentData.totalCarbonwater*4/total)*100,0)}`,//脂肪比例
        })
      break;
    }
  },
  hidePopup(){
    this.setData({
      showControl: false
    })
  },
  saveData(){
    let {
      tabIndex,
      recomList,
      recomIndex,
      list,
      mealIndex,
    } = this.prePage.data;
    
    let {updateType, currentData, total} = this.data;
    apiRequest.changePlanAccordingMeal({
      dateTime: day(tabIndex == 0 ? recomList[recomIndex].date : list[mealIndex].date).format('YYYYMMDD'),
      category: total.category,
      updateType: updateType == '01' ? '01' : '02',
      totalKcal: currentData.totalEnergy,
      proteinTotal: currentData.totalProtein,
      fatTotal: currentData.totalFat,
      carbohydrateTotal: currentData.totalCarbonwater,
    }).then((res)=>{
      this.hidePopup()
      // 查询方案
      this.queryUserProgramme();
      // this.prePage.initPageIndex();
      // this.prePage.requestRecom();
      // wx.navigateBack({
      //   delta: 1
      // });
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
  onShareAppMessage: function (e) {
    const idx = (Math.random() * 3) | 0;
    const userInfo = wx.getStorageSync('userInfo');
    let headImgUrl = userInfo.headImgUrl || userInfo.avatarUrl;
    let uid = this.data.uid;
    if (e.from == "button" && e.target.dataset.type == 'openbox') {
      saveUseLog('02', this.data.discoverDialogs.id, '02');
      return {
        title: ['在吗？锦鲤朋友最高立减30元！', '再忙，也别忘了先领券再点餐~', '猜猜送你的现金券有多少钱？'][idx],
        imageUrl: 'https://prodstatic.weis1606.cn/api/market/sharebox.png',
        path: `/pages/activity/openBox/index?iuInvitedUid=${uid}&boxtype=share&scene=0717&shareimg=${headImgUrl}&invite=${uid}`,
      }
    }
  }
})