import { isLoginClick, t, loginPromise, round, promisify, transformChartData, judgeSubAccount, showDialog, saveUseLog } from '../../utils/common'
import day from '../../libs/day'
import requests from '../../service/index';
import {
  getStorage
} from '../../utils/storage';
const app = getApp()
// pages/datum/datum.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
    userConfig: {}, // 用户配置
    todayData: {}, // 今天的身体数据
    yesterdayData: {}, // 昨天的身体数据
    nutritionData: {}, // 营养数据
    circleData: [],
    barData: [],
    weight: {}, // 体重数据
    hasSetting: false,
    BPList: [], // 血压列表
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
    step: 0 // 步数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loginPromise.then(async (res) => {
      // 后台配置弹窗显示
      showDialog('03',this)
      this.setData({
        navStatusHeight: getStorage('navStatusHeight'),
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
    loginPromise.then((res) => {
      const loginInfo = getStorage('loginInfo');
      this.setData({
        loginInfo,
        subToken: getStorage('subToken'),
      })
      this.$wxSessionKey = res.wxSessionKey;
      this.getData();
      // 判断子账户是否有效
      judgeSubAccount()
      // 查询最新未读
      app.checkUnread()
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
    }else{
      return {
        imageUrl: "https://prodstatic.weis1606.cn/api/smartFood/share.png",
      }
    }
  },
  recordWeightTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/markWeight/markWeight'
    })
  },
  cardRecordTap() {
    wx.navigateTo({
      url: '/pages/sport/sportList/sportList'
    })
  },
  recordGLUTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/markSugar/markSugar'
    })
  },
  recordBPTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/markPressure/markPressure'
    })
  },
  mealTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/dietCard/dietCard'
    })
  },
  queryOneDayDietCardList() {
    requests.queryOneDayDietCardList({
      tdcCardDate: day().format('YYYYMMDD')
    }).then((res) => {
      if (res.errCode === 0) {
        const cardData = res.obj;
        const categorys = this.data.categorys
          .map(category => {
            category.selected = false;
            return category;
          });
        categorys[0].selected = cardData.breakfastCal > 0;
        categorys[1].selected = cardData.lunchCal > 0;
        categorys[2].selected = cardData.dinnerCal > 0;
        categorys[3].selected = cardData.snackCal > 0;

        this.setData({
          categorys
        })
      }
    })
  },
  getData() {
    Promise.all([
      this.queryUserConfig(),
      requests.delPlanIntakeCache()
    ]).then(([config]) => {

      // 01 数据饮食
      // 02 饮食运动打卡
      // 03 体重
      if ('01' in config || '02' in config) {
        this.queryOneDayDietCardList();
        this.queryDailyNutritionElement();
        this.getEChartOnePage()
          .then(() => {
            if ('01' in config) this.drawCircle();
          });
      }

      if ('02' in config) {
        this.getEChartOneDay();
      }

      if ('03' in config) {
        this.queryHistoryWeight();
      }
      // 04 血糖
      if ('04' in config) {
        this.queryBloodSugarByTime(); // 血糖
      }
      // 05 血压
      if ('05' in config) {
        this.queryBloodPressure();// 血压
      }
      // 06 记步
      if ('06' in config) {
        if (this.werun || this.data.subToken) return;
        this.getRunData();
      }

    })
  },
  stepTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/markStep/markStep'
    })
  },
  getRunData() {
    const getSetting = promisify(wx.getSetting);
    wx.getWeRunData({
      success: (res) => {
        requests.getRunData({
          sessionKey: this.$wxSessionKey,
          encryptedData: res.encryptedData,
          iv: res.iv
        }).then((runRes) => {
          if (runRes.errCode === 0) {
            const { stepInfoList } = runRes.obj;
            this.setData({
              step: stepInfoList[stepInfoList.length - 1].step
            })
          }
        })
      },
      fail: async (error) => {
        console.log(error, 'error')
        this.werun = true;
        const { authSetting } = await getSetting();
        if (authSetting['scope.werun']) {
          wx.showToast({
            title: '请关注微信运动，启用微信运动功能获取步数',
            icon: 'none'
          });
        }
      }
    })
  },
  queryDailyNutritionElement() {
    requests.queryDailyNutritionElement({
      date: day().format('YYYYMMDD')
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
          },
          {
            label: '膳食纤维',
            data: [
              nutritionData.aFiber,
              nutritionData.pFiber
            ]
          },
          {
            label: '盐量',
            data: [
              nutritionData.aSalt,
              nutritionData.pSalt
            ]
          },
          {
            label: '食物多样性',
            data: [
              nutritionData.aFoodDiversity,
              nutritionData.pFoodDiversity
            ]
          }
        ]

        this.setData({
          nutritionData,
          barData
        });

      }
    })
  },
  getEChartOneDay() {
    requests
      .getEChartOneDay({
        dateTime: day().format('YYYYMMDD')
      })
      .then(res => {
        if (res.errCode === 0) {
          const calorie = {
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
            calorie
          })
        }
      });
  },
  getEChartOnePage() {
    return requests.getEChartOnePage({
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.page.map(transformChartData);
        const [todayData, yesterdayData] = list;
        if (yesterdayData) {
          yesterdayData._date = day(yesterdayData.date).format('MM.DD')
          todayData._heatEffect = round(todayData.aIntake * 0.1, 1); // 食物热效应
          todayData._prevWeight = yesterdayData.weight; // 上次体重
          // todayData._weight = Number(todayData.weight) * 2;
          // todayData._weightDiff = todayData._weight - todayData._prevWeight;
          todayData._hasIntake = (todayData.aConsumption + todayData.aDiff) !== 0; // 用aConsumption + aDiff === 0 ？ 判断是否有实际摄入
          todayData._diffPercent = todayData._hasIntake
            ? Math.min(100, round(todayData.aDiff / todayData.pDiff * 100, 0))
            : 0;
        }
        this.setData({
          circleData: [todayData.aIntake, todayData.pIntake],
          todayData,
          yesterdayData
        })
      }
    })
  },
  eatDataTap() {
    wx.navigateTo({
      url: '/pages/packageDatum/dayData/dayData'
    })
  },
  queryHistoryWeight() {
    requests.queryHistoryWeight({
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      if (res.errCode === 0) {
        const list = res.obj.bodyDataVOList.map(i => {
          i.time = String(i.time);
          i.bdValue = Number(i.bdValue);
          i.$weight = i.bdValue;
          i.$date = day(i.time).format('MM.DD')

          return i;
        });

        const today = (list[0] && day().format('YYYYMMDD') === String(list[0].time)) ? list[0] : false
        const latest = today ? list[1] : list[0];

        this.setData({
          hasWeight: Boolean(today || latest),
          weight: {
            today,
            latest,
            diff: (today && latest)
              ? round(today.$weight - latest.$weight, 1)
              : 0
          }
        })
      }
    })
  },
  queryUserConfig() {
    return requests.queryUserConfig()
      .then((res) => {
        const config = {};
        let hasSetting = false;
        if (res.errCode === 0) {
          res.obj.userConfigList.forEach((conf) => {
            if (conf.tucStt === '01') {
              config[conf.tucType] = true;
              hasSetting = true;
            }
          })

          this.setData({
            hasSetting,
            userConfig: config
          })
        }
        return config;
      })
  },
  queryBloodSugarByTime() {
    requests.queryBloodSugarByTime({
      time: day().format('YYYYMMDD')
    }).then((res) => {
      if (res.errCode === 0) {
        const map = {
          1: '凌晨',
          2: '早餐前',
          3: '早餐后',
          4: '午餐前',
          5: '午餐后',
          6: '晚餐前',
          7: '晚餐后',
          8: '睡前',
        }

        const GLUList = res.obj.bodyDataInfoList.sort((a, b) => a.bdKey - b.bdKey);
        this.setData({
          GLUList: GLUList.map((item) => {
            return ({
              label: map[item.bdKey],
              value: item.bdValue
            })
          })
        })
      }
    })
  },
  queryBloodPressure() {
    requests.queryBloodPressure({
      time: day().format('YYYYMMDD')
    }).then((res) => {
      if (res.errCode === 0) {
        let resList = res.obj.bodyDataInfoList.reduce((resList, item) => {
          const matched = item.bdKeyNote.match(/^([^\d]+)[\d:-]+(.+)$/);

          if (matched) {
            const [_, type, label] = matched;
            let resItem = resList.find(i => i.label === label);
            if (!resItem) {
              resItem = ({ label, less: 0, hight: 0 });
              resList.push(resItem);
            }

            switch (type) {
              case '低压值':
                resItem.less = item.bdValue
                break;
              case '高压值':
                resItem.high = item.bdValue
                break;
            }
          }

          return resList;
        }, [])
        resList = resList.length > 0?['清晨空腹', '上午', '下午', '晚上', '睡前空腹'].map(name => resList.find(item => item.label === name)):[];
        this.setData({
          BPList: resList
        })
      }
    })
  },
  drawCircle() {
    const { data } = this;
    const ctx = wx.createCanvasContext('circle', this);
    const percent = Math.ceil(data.todayData.aIntake / data.todayData.pIntake * 100);
    const radius = t(202) / 2;

    const x = radius;
    const y = radius;
    const startArc = 0;
    const endArc = 2;

    const arcRange = endArc - startArc;

    const excircleWidth = t(14);
    const circleR = radius - Math.ceil(Math.ceil(excircleWidth) / 2);
    ctx.clearRect(0, 0, t(202), t(202));
    ctx.beginPath();
    ctx.arc(x, y, circleR, Math.PI * startArc, Math.PI * endArc)
    ctx.strokeStyle = '#DEDEDE';
    ctx.lineWidth = t(6);
    ctx.lineCap = 'round'
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x, y, circleR, Math.PI * (0.5 + startArc), Math.PI * (0.5 + startArc + (arcRange * percent / 100)));
    ctx.strokeStyle = '#FCA649';
    ctx.lineWidth = Math.floor(excircleWidth);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    ctx.draw(true);
  },
  navSettingTap: isLoginClick(function () {
    wx.navigateTo({
      url: '/pages/packageDatum/datumSetting/datumSetting'
    })
  }),
  // 更新登录状态
  updateLogin() {
    let loginInfo = getStorage('loginInfo');
    this.setData({
      loginInfo
    })
  },
  login: isLoginClick(function () {

  }),
})