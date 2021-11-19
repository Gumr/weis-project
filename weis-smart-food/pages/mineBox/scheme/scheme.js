// pages/mineBox/scheme/scheme.js
const app = getApp();
import { getStorage } from '../../../utils/storage'
import apiRequest from '../../../service/index';
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
    customRadius: ['0%', '100%'],
    longdate: '',
    sex: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const navStatusHeight = getStorage('navStatusHeight');
    const userInfo = getStorage('userInfo');
    // 获取数据的参数
    this.setData({
      navStatusHeight,
      longdate: day(Date.now()).format('YYYYMMDD'),
      sex: options.sex || userInfo.sex,
      from: options.from || 'question', // 来自question（完善信息）/ aiFat（AI智能减脂）/ toolInfo（拉新工具包）
      tarWeight: options.tarWeight || 0,
      days: options.days || 0,
      reset: options.reset || 0,
      age: options.age,
      activityName: options.activityName,
      delta: options.delta || '',
      subToken: options.subToken || '',
      apiParams: options.apiParams ? JSON.parse(options.apiParams) : {},
    }, () => {
      this.queryData()
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

  },
   // 获取数据
   queryData() {
    wx.showLoading({
      title: ' ',
      mask: true,
    });
    let {from, longdate, sex, tarWeight, days, reset, subToken, apiParams } = this.data;
    let params = null
    if(from == 'question') {
      params = {
        date: longdate,
        sex,
        subToken: subToken || '',
      }
    } else if(from == 'toolInfo') {
      params = apiParams
    } else if(from == 'aiFat') {
      params = {
        targetWeight: tarWeight,
        days,
        reset
      }
    } else {
      params = {}
    }
    apiRequest[from == 'aiFat' ? 'createNavigation' : 'createH5Plan'](
      params
    )
    .then(res => { 
      if(res.errCode === 0) {
        wx.hideLoading()
        let {dietPlan, skuList} = res.obj;
        // 每日消耗-数据
        dietPlan.basalMetabolism = Math.round(dietPlan.basalMetabolism)
        dietPlan.dailyConsume = Math.round(dietPlan.dailyConsume)
        dietPlan.totalThermalEffect = Math.round(dietPlan.totalThermalEffect)
        dietPlan.total = dietPlan.basalMetabolism + dietPlan.dailyConsume + dietPlan.totalThermalEffect
        // 饼状图
        dietPlan.pieData = [
          {
            color: "#18C5C1", // 绿
            key: "totalThermalEffect",
            value: dietPlan.totalThermalEffect
          },
          {
            color: "#FA6400", // 红
            key: "dailyConsume",
            value: dietPlan.dailyConsume
          },
          {
            color: "#FACA00", // 黄
            key: "basalMetabolism",
            value: dietPlan.basalMetabolism
          },
          ]

        // 每日应摄入-数据
        let {resultCarbohydrateRatio, resultCarbohydrateWeight, resultProteinRatio, resultProteinWeight, resultFatRatio, resultFatWeight, days, loseWeight, resultDiversity, resultFiber,resultSalt} = res.obj;
        let intake = {
          resultCarbohydrateRatio,
          resultCarbohydrateWeight,

          resultProteinRatio,
          resultProteinWeight,

          resultFatRatio,
          resultFatWeight,

          resultDiversity,
          resultFiber,
          resultSalt,
          
          total: Math.round(dietPlan.totalIntake),
          days,
          loseWeight,
          // 饼状图
          pieData: [
            // 绿色放前面-默认高亮
          {
            color: "#18C5C1", // 绿
            key: "resultFatWeight",
            value: resultFatWeight
          },
          {
            color: "#FA6400", // 红
            key: "resultProteinWeight",
            value: resultProteinWeight
          },
          {
            color: "#D8D8D8", // 灰
            key: "resultCarbohydrateWeight",
            value: resultCarbohydrateWeight
          }]
        }

        // 早/午/晚餐总能量-数据
        skuList[longdate].forEach(item => {
          // 换菜品
          item.comboIndex = 0
          // 信息
          item.planDetail.carbohydrateRatio = Math.round(item.planDetail.carbohydrateRatio)
          item.planDetail.carbohydrateTotal = Math.round(item.planDetail.carbohydrateTotal)


          item.planDetail.proteinRatio = Math.round(item.planDetail.proteinRatio)
          item.planDetail.proteinTotal = Math.round(item.planDetail.proteinTotal)

          item.planDetail.fatRatio = Math.round(item.planDetail.fatRatio)
          item.planDetail.fatTotal = Math.round(item.planDetail.fatTotal)
          
          // 饼状图
          item.planDetail.pieData = [
            // 绿色放前面-默认高亮
            {
              color: "#18C5C1", // 绿
              key: "fatTotal",
              value: item.planDetail.fatTotal
            },
            {
              color: "#FA6400", // 红
              key: "proteinTotal",
              value: item.planDetail.proteinTotal
            },
            {
              color: "#D8D8D8", // 灰
              key: "carbohydrateTotal",
              value: item.planDetail.carbohydrateTotal
            }]
        })
        this.setData({
          infoObj: res.obj,
          // 每日消耗-数据
          dietPlan: dietPlan,
          // 每日应摄入-数据
          intake: intake,
          // 早/午/晚餐总能量-数据
          skuList: skuList
        })
      }
    })
  },
  // 查看详情
  checkDetail() {
    const { age, activityName, intake } = this.data;
    let obj = {
      age,
      activityName,
      intake: {
        total: intake.total,
        resultCarbohydrateWeight: intake.resultCarbohydrateWeight,
        resultProteinWeight: intake.resultProteinWeight,
        resultFatWeight: intake.resultFatWeight
      }
    }
    this.setData({
      residentDietData: obj,
      residentDietShow: true
    })
  },
  // // 当吃法为《中国居民健康饮食》时，点击简介，跳转到介绍详情页
  // description() {
  //   if(this.data.dietPlan.planningType == '23') {
  //     const { age, activityName, intake } = this.data;
  //     let obj = {
  //       age,
  //       activityName,
  //       intake: {
  //         total: intake.total,
  //         resultCarbohydrateWeight: intake.resultCarbohydrateWeight,
  //         resultProteinWeight: intake.resultProteinWeight,
  //         resultFatWeight: intake.resultFatWeight
  //       }
  //     }
  //     wx.navigateTo({
  //       url: `/pages/mineBox/residentDiet/residentDiet?param=${JSON.stringify(obj)}`
  //     });
  //   }
  // },
  // 换菜
  changeSku(e) {
    const {skuList, longdate} = this.data;
    const {index} = e.currentTarget.dataset;
    const oldIndex = skuList[longdate][index].comboIndex; 
    this.setData({
      ['skuList.'+longdate+'['+index+'].comboIndex']: oldIndex === 0 ? 1 : 0
    })
  },
  // 知道啦-回到首页
  okAction() {
    wx.switchTab({
      url: '/pages/index/index',
    });
    // wx.navigateBack({
    //   delta: this.data.delta || 2,
    // });
  },
  // 重设目标-去AI智能减脂设置信息
  setTargetAction() {
    wx.navigateTo({
      url: '/pages/mineBox/aiFatSetInfo/aiFatSetInfo?reset=01'
    });
  },
  // 开始减肥-去点餐
  startFatAction() {
    const { intake } = this.data;
    // 跳转地址
    let planState = {
      caseId: '1234665' || res.obj.id,
      startDate: day().add(day().get('hour') >= 18? 2 : 1, 'day').format('YYYYMMDD'),
      // endDate,
      type: 'celebrityPlan',
      days: intake.days < 5 ? intake.days : 5
    };

    wx.navigateTo({
      url: `/pages/packageDiscover/aiMeal/orderDelivery/orderDelivery?fromPage=aiFat`,
      success: ({
        eventChannel
      }) => {
        eventChannel.emit('ai-state', planState);
      },
    });
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