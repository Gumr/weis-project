// pages/datas/dayData/dayData.js
import { t, round } from '../../../utils/common';
import requests from '../../../service/index';
import day from '../../../libs/day';
import Draw from '../../../utils/Draw'
import ShareImage from '../../../utils/ShareImage'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: wx.getStorageSync('navStatusHeight'),
    circleSize: t(102),
    code: 'https://prodstatic.weis1606.cn/api/channelQRcode/day_data_share_qr.png',
    categorys: [
      {
        label: '早餐',
        selected: false
      },
      {
        label: '午餐',
        selected: false
      },
      {
        label: '晚餐',
        selected: false
      },
      {
        label: '加餐',
        selected: false
      }
    ],
    showUnions: false,
    categoryDataUnions: [],
    planCategoryDatas: null, // 计划每餐数据
    categoryDatas: null, // 计划实际每餐数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refreshData();

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

  check() {
    wx.navigateTo({
      url: '/pages/packageDiscover/dietCard/dietCard?date=' + day(this.data.date).format('YYYYMMDD'),
    });
  },
  unionsTap() {
    if (this.data.categoryDataUnions.length <= 0) {
      wx.showToast({
        title: '没有数据',
        icon: 'none'
      })
      return;
    }
    this.setData({
      showUnions: !this.data.showUnions
    })
  },
  refreshData() {
    this.queryDailyNutritionElement();
    this.queryUserProgramme();
    this.getNoSchemeConsumeDetail();
    this.queryOneDayDietCardList();
  },
  share(e) {
    let { status } = e.currentTarget.dataset;

    switch (status) {
      case 'intake':
        // wx.uma.trackEvent('intake')
        this.setData({
          showIntake: true
        })
        break;
      case 'energy':
        // wx.uma.trackEvent('energy')
        this.setData({
          showEnergy: true
        })
        break;
      case 'consume':
        // wx.uma.trackEvent('consume')
        this.setData({
          showConsume: true
        })
        break;
    }
  },
  queryUserProgramme() {
    requests.queryUserProgramme({
      dateTime: day(this.data.date).format('YYYYMMDD'),
      isMainPlan: '0',
      planStt: '01',
      needGoods: true
    }).then((res) => {
      if (res.errCode === 0) {

        const categoryDatas = res.obj.planDetailList.reduce((datas, card) => {
          const data = datas[card.category];
          data.carbohydrateTotal = (data.carbohydrateTotal || 0) + card.carbohydrateTotal// 碳水
          data.fatTotal = (data.fatTotal || 0) + card.fatTotal// 脂肪
          data.proteinTotal = (data.proteinTotal || 0) + card.proteinTotal// 蛋白质
          data.totalKcal = (data.totalKcal || 0) + card.totalKcal// 卡路里

          data.dietaryFiber = (data.dietaryFiber || 0) + card.dietaryFiber// 膳食纤维
          data.salt = (data.totalKcal || 0) + card.salt// 盐量
          data.diversity = (data.diversity || 0) + card.diversity// 食物多样性
          return datas;
        }, {
          '01': {},
          '02': {},
          '03': {},
          '04': {}
        })
        this.setData({
          planCategoryDatas: categoryDatas
        })

        this.calcCagegoryData();
      }
    })
  },
  queryOneDayDietCardList() {
    requests.queryOneDayDietCardList({
      tdcCardDate: day(this.data.date).format('YYYYMMDD')
    }).then((res) => {
      if (res.errCode === 0) {
        const cardData = res.obj;
        // 处理 吃了哪几餐
        const categorys = this.data.categorys
          .map(category => {
            category.selected = false;
            return category;
          });
        categorys[0].selected = cardData.breakfastCal > 0;
        categorys[1].selected = cardData.lunchCal > 0;
        categorys[2].selected = cardData.dinnerCal > 0;
        categorys[3].selected = cardData.snackCal > 0;
        // 处理把每餐每个打卡食物数据统计起来
        const dietCardList = cardData.dietCardList
          .filter(item => item.tdcCategory !== '04')
          .sort((a, b) => a.tdcCategory - b.tdcCategory)// 把加餐数据过滤

        const categoryDatas = dietCardList.reduce((datas, card) => {
          const data = datas[card.tdcCategory] || (datas[card.tdcCategory] = {});
          data.tdcCarbohydrateTotal = (data.tdcCarbohydrateTotal || 0) + card.tdcCarbohydrateTotal// 碳水
          data.tdcFatTotal = (data.tdcFatTotal || 0) + card.tdcFatTotal// 脂肪
          data.tdcProteinTotal = (data.tdcProteinTotal || 0) + card.tdcProteinTotal// 蛋白质
          data.tdcTotalKcal = (data.tdcTotalKcal || 0) + card.tdcTotalKcal// 卡路里

          data.fiber = (data.fiber || 0) + card.fiber // 膳食纤维
          data.salt = (data.salt || 0) + card.salt // 盐量
          data.diversity = cardData.foodDiversityList
          .filter(item => item.category == card.tdcCategory)[0].foodDiversity // 食物多样性
          return datas;
        }, {})

        this.setData({
          categorys,
          categoryDatas
        })

        this.calcCagegoryData();
      }
    })
  },
  calcCagegoryData() {
    const { planCategoryDatas, categoryDatas } = this.data;
    // planCategoryDatas: { 
    // carbohydrateTotal
    // fatTotal
    // proteinTotal
    // totalKcal
    // }

    // categoryDatas: { 
    // tdcCarbohydrateTotal
    // tdcFatTotal
    // tdcProteinTotal
    // tdcTotalKcal
    // }

    if (!planCategoryDatas || !categoryDatas) return;
    // sort 倒序
    const categorys = Object.keys(categoryDatas).sort((a, b) => b - a);

    const categoryDataUnions = categorys.map(category => {
      const label = {
        '01': '早餐',
        '02': '午餐',
        '03': '晚餐',
        '04': '加餐',
      }[category];
      const planData = planCategoryDatas[category];
      const data = categoryDatas[category];
      return ({
        label,
        circleData: [data.tdcTotalKcal, planData.totalKcal],
        barData: [
          {
            label: '碳水',
            data: [data.tdcCarbohydrateTotal, planData.carbohydrateTotal]
          },
          {
            label: '蛋白质',
            data: [data.tdcProteinTotal, planData.proteinTotal]
          },
          {
            label: '脂肪',
            data: [data.tdcFatTotal, planData.fatTotal]
          },
          {
            label: '膳食纤维',
            data: [data.fiber, planData.dietaryFiber]
          },
          {
            label: '盐量',
            data: [data.salt, planData.salt]
          },
          {
            label: '食物多样性',
            data: [data.diversity, planData.diversity]
          },
        ]
      })
    })

    this.setData({
      categoryDataUnions,
      showUnions: false
    })

  },
  save(e) {
    let { status } = e.currentTarget.dataset;
    switch (status) {
      case 'intake':
        this.setData({
          status: 'intake',
          showIntake: false
        })
        wx.uma.trackEvent('saveIntake')
        this.shareTap('intake')
        break;
      case 'energy':
        this.setData({
          status: 'energy',
          showEnergy: false
        })
        wx.uma.trackEvent('saveEnergy')
        this.shareTap('energy')
        break;
      case 'consume':
        this.setData({
          status: 'consume',
          showConsume: false
        })
        wx.uma.trackEvent('saveConsume')
        this.shareTap('consume')
        break;
    }
  },

  hide() {
    this.setData({
      showIntake: false,
      showEnergy: false,
      showConsume: false
    })
  },

  current(e) {
    this.setData({
      dateMonth: e.detail.data.dateMonth
    })
  },

  mydata(e) {
    let date = e.detail.data.split('/');
    this.setData({
      year: date[0],
      month: date[1],
      day: date[2]
    })
    if (e.detail.type == "click") {
      wx.showLoading({
        title: '',
        mask: true,
      });
      this.setData({
        date: e.detail.data
      }, () => {
        this.refreshData();
        setTimeout(() => {
          wx.hideLoading();
        }, 200)
      })
    }
  },

  queryDailyNutritionElement() {
    let date = day(this.data.date).format('YYYYMMDD') || day().format('YYYYMMDD');
    requests.queryDailyNutritionElement({
      date: date
    }).then((res) => {
      if (res.errCode === 0) {
        const nutritionData = res.obj;
        // 返回得rate要除于10做展示
        nutritionData.pProteinRate = Math.round(nutritionData.pProteinRate / 10);
        nutritionData.pCorbonRate = Math.round(nutritionData.pCorbonRate / 10);
        nutritionData.pFatRate = nutritionData.pProteinRate + nutritionData.pCorbonRate === 0
          ? 0
          : 10 - (nutritionData.pProteinRate + nutritionData.pCorbonRate);
        nutritionData.aProteinRate = Math.round(nutritionData.aProteinRate / 10);
        nutritionData.aCorbonRate = Math.round(nutritionData.aCorbonRate / 10);
        nutritionData.aFatRate = nutritionData.aProteinRate + nutritionData.aCorbonRate === 0
          ? 0
          : 10 - (nutritionData.aProteinRate + nutritionData.aCorbonRate);

        const barData = [
          {
            label: '碳水',
            data: [
              nutritionData.aCarbonWeight,
              nutritionData.pCarbon
            ]
          },
          {
            label: '蛋白质',
            data: [
              nutritionData.aProtein,
              nutritionData.pProtein
            ]
          },
          {
            label: '脂肪',
            data: [
              nutritionData.aFatWeight,
              nutritionData.pFat
            ]
          },{
            label: '膳食纤维',
            data: [
              nutritionData.aFiber,
              nutritionData.pFiber
            ]
          },{
            label: '盐量',
            data: [
              nutritionData.aSalt,
              nutritionData.pSalt
            ]
          },{
            label: '食物多样性',
            data: [
              nutritionData.aFoodDiversity,
              nutritionData.pFoodDiversity
            ]
          },
        ]

        this.setData({
          nutritionData,
          barData
        });
      }
    })
  },

  getNoSchemeConsumeDetail() {
    let date = day(this.data.date).format('YYYYMMDD') || day().format('YYYYMMDD');
    requests
      .getEChartOneDay({
        dateTime: date
      })
      .then(res => {
        if (res.errCode === 0) {
          let calorie = {
            aIntake: 0,
            aDiff: 0,
            pDiff: 0,
            pIntake: 0,
            ...res.obj.calorie,
          };
          calorie._heatEffect = round(calorie.aIntake * 0.1, 1); // 食物热效应
          calorie.percent = Math.min(
            round(calorie.aDiff / calorie.pDiff * 100, 0),
            100
          );
          calorie.intakePercent = Math.min(
            round(calorie.aIntake / calorie.pIntake * 100, 0),
            100
          );
          calorie.intakeDif = Math.abs(parseInt(calorie.aIntake - calorie.pIntake));
          this.setData({
            circleData: [calorie.aIntake, calorie.pIntake],
            calorie
          })
        }
      });
  },

  // 绘制
  async shareTap(status) {
    if (this.sharing) return;
    wx.showLoading({
      title: '绘制中'
    })
    this.sharing = true;
    let imageUrl
    if (status == 'intake') {
      imageUrl = (await this.drawShareImage1()).tempFilePath;
    } else if (status == 'consume') {
      imageUrl = (await this.drawShareImage2()).tempFilePath;
    } else {
      imageUrl = (await this.drawShareImage3()).tempFilePath;
    }
    this.sharing = false;
    wx.hideLoading()
    const sharer = new ShareImage(imageUrl)
    sharer.save().then(sharer.preview.bind(sharer), sharer.preview.bind(sharer))
  },

  async drawShareImage1(chartImage) {
    let { data } = this;
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('sign', this))
    const draw = new Draw(ctx)

    draw.drawView({
      left: t(0),
      top: t(0),
      width: t(690),
      height: t(991)
    }, {
      borderRadius: t(10),
      backgroundColor: '#FE5E0F'
    })

    draw.drawView({
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(791)
    }, {
      borderRadius: t(10),
      backgroundColor: '#ffffff'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_1.png', {
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(358),
    })

    let name = '饮食摄入';
    let value = `${data.calorie.aIntake}kcal`;
    let textWidth = draw.textWidth(name, t(24))
    let valWidth = draw.textWidth(value, t(28))

    draw.drawView({
      left: t(60),
      top: t(484),
      width: t(10) + textWidth + valWidth,
      height: t(12)
    }, {
      backgroundColor: '#FFD441'
    })

    draw.drawText(name, {
      left: t(60),
      top: t(472),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#333',
      fontWeight: 'bold',
    })

    draw.drawText(value, {
      left: t(60) + textWidth + t(10),
      top: t(468),
      width: Math.ceil(valWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
      fontWeight: 'bold',
    })

    name = data.calorie.aIntake - data.calorie.pIntake > 0 ? `比计划摄入多了` : `比计划摄入少了`;
    value = `${data.calorie.intakeDif}kcal`;
    textWidth = draw.textWidth(name, t(24))
    valWidth = draw.textWidth(value, t(28))

    draw.drawText(name, {
      left: t(60),
      top: t(540),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#333',
    })

    draw.drawText(value, {
      left: t(60) + textWidth + t(10),
      top: t(536),
      width: Math.ceil(valWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
      fontWeight: 'bold',
    })

    name = `营养素比例`;
    value = `${data.nutritionData.aProteinRate}：${data.nutritionData.aCorbonRate}：${data.nutritionData.aFatRate}`;
    textWidth = draw.textWidth(name, t(24))
    valWidth = draw.textWidth(value, t(28))

    draw.drawView({
      left: t(60),
      top: t(620),
      width: t(10) + textWidth + valWidth,
      height: t(12)
    }, {
      backgroundColor: '#FFD441'
    })

    draw.drawText(name, {
      left: t(60),
      top: t(608),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#333',
    })

    draw.drawText(value, {
      left: t(60) + textWidth + t(10),
      top: t(604),
      width: Math.ceil(valWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
      fontWeight: 'bold',
    })

    draw.drawView({
      left: t(60),
      top: t(692),
      width: t(570),
      height: t(99)
    }, {
      backgroundColor: '#FBFBFB'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_symbol.png', {
      left: t(90),
      top: t(722),
      width: t(22),
      height: t(16),
    })

    name = `不要再喝啤酒了~`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(142),
      top: t(737),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_time_bj.png', {
      left: t(30),
      top: t(869),
      width: t(74),
      height: t(74),
    })

    name = `${data.year}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(881),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `${data.month}/${data.day}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(911),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `维 士 健 身 饮 食`;
    textWidth = draw.textWidth(name, t(32))

    draw.drawText(name, {
      left: t(134),
      top: t(869),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(32)),
    }, {
      fontSize: t(32),
      lineHeight: Math.ceil(t(32)),
      color: '#FFF',
      fontWeight: 'bold'
    })

    name = `识别二维码一起来分享`;
    textWidth = draw.textWidth(name, t(22))

    draw.drawText(name, {
      left: t(134),
      top: t(921),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#FFF',
    })

    await draw.drawImage(data.code, {
      left: t(550),
      top: t(851),
      width: t(110),
      height: t(110),
    })



    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 690,
            height: 991,
            id: 'sign'
          }, this).then(resolve)
        }, 600)
      })
    })

  },

  // 消耗

  async drawShareImage2(chartImage) {
    let { data } = this;
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('sign', this))
    const draw = new Draw(ctx)

    draw.drawView({
      left: t(0),
      top: t(0),
      width: t(690),
      height: t(1087)
    }, {
      borderRadius: t(10),
      backgroundColor: '#FE5E0F'
    })

    draw.drawView({
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(887)
    }, {
      borderRadius: t(10),
      backgroundColor: '#ffffff'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_2.png', {
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(358),
    })

    let name = '消耗了';
    let value = `${data.calorie.aConsumption}kcal`;
    let textWidth = draw.textWidth(name, t(24))
    let valWidth = draw.textWidth(value, t(28))

    draw.drawView({
      left: t(60),
      top: t(484),
      width: t(10) + textWidth + valWidth,
      height: t(12)
    }, {
      backgroundColor: '#FFD441'
    })

    draw.drawText(name, {
      left: t(60),
      top: t(472),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#333',
      fontWeight: 'bold',
    })

    draw.drawText(value, {
      left: t(60) + textWidth + t(10),
      top: t(468),
      width: Math.ceil(valWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
      fontWeight: 'bold',
    })

    name = `运动消耗`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(60),
      top: t(540),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    name = `${data.calorie.aSport}kcal`;
    textWidth = draw.textWidth(name, t(28))

    draw.drawText(name, {
      left: t(60),
      top: t(584),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
    })

    name = `日常消耗`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(375),
      top: t(540),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    name = `${data.calorie.uDaily}kcal`;
    textWidth = draw.textWidth(name, t(28))

    draw.drawText(name, {
      left: t(375),
      top: t(584),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
    })

    name = `基础代谢`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(60),
      top: t(652),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    name = `${data.calorie.uBasic}kcal`;
    textWidth = draw.textWidth(name, t(28))

    draw.drawText(name, {
      left: t(60),
      top: t(700),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
    })

    name = `食物热效应`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(375),
      top: t(652),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    name = `${data.calorie._heatEffect}kcal`;
    textWidth = draw.textWidth(name, t(28))

    draw.drawText(name, {
      left: t(375),
      top: t(700),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
    })

    draw.drawView({
      left: t(60),
      top: t(788),
      width: t(570),
      height: t(99)
    }, {
      backgroundColor: '#FBFBFB'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_symbol.png', {
      left: t(90),
      top: t(818),
      width: t(22),
      height: t(16),
    })

    name = `心动是不能燃脂的~`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(142),
      top: t(833),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_time_bj.png', {
      left: t(30),
      top: t(968),
      width: t(74),
      height: t(74),
    })

    name = `${data.year}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(980),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `${data.month}/${data.day}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(1010),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `维 士 健 身 饮 食`;
    textWidth = draw.textWidth(name, t(32))

    draw.drawText(name, {
      left: t(134),
      top: t(965),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(32)),
    }, {
      fontSize: t(32),
      lineHeight: Math.ceil(t(32)),
      color: '#FFF',
      fontWeight: 'bold'
    })

    name = `识别二维码一起来分享`;
    textWidth = draw.textWidth(name, t(22))

    draw.drawText(name, {
      left: t(134),
      top: t(1017),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#FFF',
    })

    await draw.drawImage(data.code, {
      left: t(550),
      top: t(947),
      width: t(110),
      height: t(110),
    })



    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 690,
            height: 1087,
            id: 'sign'
          }, this).then(resolve)
        }, 600)
      })
    })

  },

  // 能量
  async drawShareImage3(chartImage) {
    let { data } = this;
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('sign', this))
    const draw = new Draw(ctx)

    draw.drawView({
      left: t(0),
      top: t(0),
      width: t(690),
      height: t(855)
    }, {
      borderRadius: t(10),
      backgroundColor: '#FE5E0F'
    })

    draw.drawView({
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(655)
    }, {
      borderRadius: t(10),
      backgroundColor: '#ffffff'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_3.png', {
      left: t(30),
      top: t(30),
      width: t(630),
      height: t(358),
    })

    let name = '凭自己努力得到';
    let value = `${data.calorie.aDiff}kcal能量差`;
    let textWidth = draw.textWidth(name, t(24))
    let valWidth = draw.textWidth(value, t(28))

    draw.drawView({
      left: t(60),
      top: t(484),
      width: t(10) + textWidth + valWidth,
      height: t(12)
    }, {
      backgroundColor: '#FFD441'
    })

    draw.drawText(name, {
      left: t(60),
      top: t(472),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#333',
      fontWeight: 'bold',
    })

    draw.drawText(value, {
      left: t(60) + textWidth + t(10),
      top: t(468),
      width: Math.ceil(valWidth),
      height: Math.ceil(t(28)),
    }, {
      fontSize: t(28),
      lineHeight: Math.ceil(t(28)),
      color: '#333',
      fontWeight: 'bold',
    })


    draw.drawView({
      left: t(60),
      top: t(556),
      width: t(570),
      height: t(99)
    }, {
      backgroundColor: '#FBFBFB'
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_ai_symbol.png', {
      left: t(90),
      top: t(586),
      width: t(22),
      height: t(16),
    })

    name = `话多的人总是要胖的～~`;
    textWidth = draw.textWidth(name, t(24))

    draw.drawText(name, {
      left: t(142),
      top: t(601),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(24)),
    }, {
      fontSize: t(24),
      lineHeight: Math.ceil(t(24)),
      color: '#A9A9A9',
    })

    await draw.drawImage('https://prodstatic.weis1606.cn/api/mini/data_share_time_bj.png', {
      left: t(30),
      top: t(736),
      width: t(74),
      height: t(74),
    })

    name = `${data.year}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(748),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `${data.month}/${data.day}`;
    textWidth = draw.textWidth(name, t(20))

    draw.drawText(name, {
      left: t(30) + (t(74) - textWidth) / 2,
      top: t(778),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(20)),
    }, {
      fontSize: t(20),
      lineHeight: Math.ceil(t(20)),
      color: '#FFF',
    })

    name = `维 士 健 身 饮 食`;
    textWidth = draw.textWidth(name, t(32))

    draw.drawText(name, {
      left: t(134),
      top: t(733),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(32)),
    }, {
      fontSize: t(32),
      lineHeight: Math.ceil(t(32)),
      color: '#FFF',
      fontWeight: 'bold'
    })

    name = `识别二维码一起来分享`;
    textWidth = draw.textWidth(name, t(22))

    draw.drawText(name, {
      left: t(134),
      top: t(785),
      width: Math.ceil(textWidth),
      height: Math.ceil(t(22)),
    }, {
      fontSize: t(22),
      lineHeight: Math.ceil(t(22)),
      color: '#FFF',
    })

    await draw.drawImage(data.code, {
      left: t(550),
      top: t(715),
      width: t(110),
      height: t(110),
    })



    return new Promise((resolve) => {
      draw.draw(false, () => {
        setTimeout(() => {
          draw.canvasToTempFilePath({
            width: 690,
            height: 855,
            id: 'sign'
          }, this).then(resolve)
        }, 600)
      })
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
  // onShareAppMessage: function () {
  //   return null
  // }
})