// pages/datas/diet/diet.js
import day from '../../../libs/day';
import apiRequest from '../../../service/index'
import {
  round
} from "../../../utils/common"
const app = getApp();

// function createCampValidator() {
//   const getRange = apiRequest.queryActivityList()
//     .then((res) => {
//       if ((res.obj && res.obj.ifJoin) === '02'
//         && res.obj.activityList.length > 0) {
//         const item = res.obj.activityList[0];
//         return [item.startTime, item.endTime];
//       }

//       return [];
//     })

//   return function validator(date) {
//     return getRange.then(range => {
//       if (range.length <= 0) return false;
//       const [s, e] = range;
//       date = +day(date).format('YYYYMMDDHHmmss')
//       return s <= date && date <= e;
//     })
//   }
// }

const unitOpts = [{
  label: '克',
  value: '1'
},
{
  label: '勺',
  value: '2',
  show: '04'
},
{
  label: '筷子',
  value: '3',
  show: '04'
}
];

function zeroFill(value) {
  return value < 10 ? `0${value}` : value;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx,
    smallSize: {
      title: 20,
      value: 40,
      unit: 18,
      label: 20,
    },
    lineWidth: {
      dark: 6, // 内圆宽度
      light: 10 // 外圆宽度
    },
    calendarTop: 0,
    unitOpts,
    isFullScreen: app.globalData.isIpx,
    scale: {
      precision: 1,
      max: 999
    },
    navTitle: day().format('YYYY/MM/DD'),
    showExtendPopup: false,
    showCalender: false,
    showSchemeBar: false,
    showAddPopup: false,
    hasScheme: false,
    currentFood: {},
    currentFoodUnit: {
      label: '克',
      value: '1'
    },
    calendarConfig: {
      theme: 'default',
      showMonthControl: false,
      selectColor: '#21C4C0',
      selectBackColor: 'rgba(33,196,192,0.15)',
      defaultDay: true,
      showLunar: false,
      highlightToday: true,
      onlyShowCurrentMonth: true,
      disableLaterDay: true,
      disableMode: {
        // 禁用某一天之前/之后的所有日期
        type: 'after', // [‘before’, 'after']
        // date: '2020-12-17' // 无该属性或该属性值为假，则默认为当天
      },
      // markToday: '今'
    },
    foodOrderCollection: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    },
    // tapTitleWidth: 100,
    myData: {},
    noSchemeMyData: {
      recommend: 0,
      calorie: 0,
      differenceValue: 0
    },
    // calenderValue: '',
    meal: [{
      img: '/images/scheme_breakfast.png',
      name: '早餐',
      type: '01'
    },
    {
      img: '/images/scheme_lunch.png',
      name: '午餐',
      type: '02'
    },
    {
      img: '/images/scheme_dinner.png',
      name: '晚餐',
      type: '03'
    },
    {
      img: '/images/scheme_snack.png',
      name: '加餐',
      type: '04'
    },
    {
      img: '/images/scheme_motion.png',
      name: '运动',
      type: '05'
    }
    ],
    disabledDate: (timestamp) => {
      return timestamp > new Date(day().format('YYYY/MM/DD')).getTime();
    },
    dateIconColor: {
      iconColor: 'rgba(216, 216, 216, 1)',
      bgColor: 'rgba(247, 247, 247, 1)',
      border: 'none',
      font: 'rgba(51, 51, 51, 1)'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      date
    } = options;
    date = day(date);

    this.selectDateStr = date.format('YYYY/MM/DD');

    this.setData({
      navTitle: this.selectDateStr,
      calendarTop: wx.getStorageSync('navStatusHeight'),
      'calendarConfig.defaultDay': date.format('YYYY-MM-DD')
    });

    this.selectDateHandler(true);

    // this.pointToast = {
    //   validator: createCampValidator(),
    //   sport: false, // 是否添加了运动打卡
    //   toast(title) {
    //     wx.showToast({
    //       title,
    //       icon: 'none'
    //     })
    //   },
    //   async log(date, list) {
    //     if (this.sport) {
    //       this.toast('运动打卡 积分+1');
    //       this.sport = false;
    //     }

    //     if (list.length === 1) {
    //       const valid = await this.validator(date);
    //       if (valid) {
    //         this.toast('运动打卡 积分+1');
    //       }
    //     }
    //   },
    //   async del(date, list) {
    //     if (list.length <= 0) {
    //       const valid = await this.validator(date);
    //       if (valid) {
    //         this.toast('删除运动打卡 积分-1');
    //       }
    //     }
    //   },
    //   async sport(date) {
    //     const valid = await this.validator(date);
    //     if (valid) this.sport = true;
    //   }
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.readied = true;
    this.scaleComp = this.selectComponent('#scale');
    this.scale2Comp = this.selectComponent('#scale2');
  },

  afterCalendarRender() {
    if (!this.load) {
      this.load = true;
      const date = day(this.selectDateStr);
      this.calendar.jump(date.year(), date.month() + 1, date.date());
      this.getMonthCardDate(date.format('YYYYMM'));
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderFoodList();
    this.getConsumeDetail();
    this.querySportCard();

    if (this.readied) {
      this.getMonthCardDate(day(this.selectDateStr).format('YYYYMM'));
    }

    if (this.data.totastMsg) {
      let that = this;
      wx.showToast({
        title: this.data.totastMsg,
        icon: 'none',
        success: function () {
          that.setData({
            totastMsg: ''
          })
        }
      });
    }

    this.setData({
      showAddPopup: false
    });
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  selectMonthChange({
    detail
  }) {
    const {
      next
    } = detail;
    const now = day();

    const nextDateStr = `${next.year}${zeroFill(next.month)}`;

    if (next.year < now.year()) {
      this.getMonthCardDate(nextDateStr);
    } else if (now.year() === next.year && now.month() <= next.month) {
      this.getMonthCardDate(nextDateStr);
    }
  },
  getMonthCardDate(date) {
    apiRequest
      .queryOneMonthCardDates({
        month: date
      })
      .then(res => {
        if (res.errCode === 0) {
          let {
            dates
          } = res.obj;
          dates = dates.map(str => ({
            year: Number(str.slice(0, 4)),
            month: Number(str.slice(4, 6)),
            day: Number(str.slice(6))
          }));

          this.calendar.clearTodoLabels();
          this.calendar.setTodoLabels({
            pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
            dotColor: '#FFB93F', // 待办点标记颜色
            circle: false, // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
            showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字），在 circle 为 true 及当日历配置 showLunar 为 true 时，此配置失效
            days: dates
          });
        }
      });
  },
  getConsumeDetail() {
    const date = this.selectDateStr ?
      day(this.selectDateStr).format('YYYYMMDD') :
      day().format('YYYYMMDD');
    apiRequest
      .queryUserAppointTimePlat({
        dateTime: date,
        planStt: '01'
      })
      .then(res => {
        const hasScheme = Boolean(res.obj);
        const myData = hasScheme ? res.obj : {};
        myData.energyPercent = round((myData.kcalSupply / myData.totalKcal) * 100, 0);
        myData.totalProteinPercent = round((myData.proteinSupply / myData.proteinTotal) * 100, 0)
        myData.totalCarbonwaterPercent = round((myData.carbohydrateSupply / myData.carbohydrateTotal) * 100, 0)
        myData.totalFatKcalPercent = round((myData.fatSupply / myData.fatTotal) * 100, 0)

        this.setData({
          myData,
          hasScheme
        });
        if (!hasScheme) {
          this.getNoSchemeConsumeDetail(date);
        }
      })
      .catch(() => { });
  },
  getNoSchemeConsumeDetail(date) {

    apiRequest
      .getEChartOneDay({
        dateTime: date
      })
      .then(res => {
        if (res.errCode === 0) {
          let data = res.obj.calorie;

          data = {
            differenceValue: data.aIntake - data.pIntake,
            calorie: data.aIntake,
            recommend: data.pIntake
          };

          this.setData({
            noSchemeMyData: data
          });
        }
      });
  },

  // 复制
  copyCard(e) {
    const date = this.selectDateStr ?
      day(this.selectDateStr).format('YYYYMMDD') :
      day().format('YYYYMMDD');
    let record = e.currentTarget.dataset.item
    record.tmrParamType = record.tmrParamType + "";

    record.copyFlag = 1;
    apiRequest.userAddSportCard({
      time: date,
      state: 1,
      data: [record]
    })
      .then(res => {
        if (res.errCode == 0) {
          this.querySportCard()
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
  },

  //删除
  delete(e) {
    let id = e.currentTarget.dataset.id;
    apiRequest.deleteSportCardFood({
      id: id
    })
      .then(res => {
        if (res.obj.result > 0) {
          this.querySportCard()
            .then(() => {

            })
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          });
        }
      })
  },

  querySportCard() {
    const date = this.selectDateStr ?
      day(this.selectDateStr).format('YYYYMMDD') :
      day().format('YYYYMMDD');
    return apiRequest.querySportCardFood({
      time: date
    }).then((res) => {
      if (res.errCode == 0) {
        let userData = res.obj.sportCardList;
        this.data.actKal = 0;
        let count = 0;
        if (userData) {
          for (let index = 0; index < userData.length; index++) {
            if (userData[index].calorie) {
              count += parseFloat(userData[index].calorie);
              this.data.actKal = count.toFixed(2);
            }
          }
        } else {
          this.data.actKal = 0;
        }
        let nextKal = 0
        if (!this.data.plankal || this.data.plankal <= 0) {
          nextKal = 0
        } else if (parseFloat(this.data.plankal) < parseFloat(this.data.actKal)) {
          nextKal = 0
        } else {
          nextKal = (parseFloat(this.data.plankal) - parseFloat(this.data.actKal)).toFixed(2)
        }
        res.obj.sportCardList.map(item => {
          item.tmrParamType = item.tmrParamType.split(",");
        });
        this.setData({
          dataList: res.obj.sportCardList,
          actKal: this.data.actKal,
          nextKal: nextKal
        })
      } else {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
        });
      }
    })
  },

  getOrderFoodList() {
    const date = this.selectDateStr ?
      day(this.selectDateStr).format('YYYYMMDD') :
      day().format('YYYYMMDD');

    return apiRequest
      .queryOneDayDietCardList({
        tdcCardDate: date
      })
      .then(res => {
        // '01': '早餐列表',
        // '02': '午餐列表',
        // '03': '晚餐列表',
        // '04': '加餐列表'
        const breakfast = [];
        const lunch = [];
        const dinner = [];
        const snack = [];

        const data = (res.obj && res.obj.dietCardList) || [];

        data.forEach(item => {
          if (item.tdcType === '04') {
            item.unitLabel = {
              0: 'g',
              1: 'g',
              2: '勺',
              3: '筷子'
            }[item.tdcFoodUnits];
          }

          item.unitTotalLabel =
            item.tdcType === '04' ?
              `${item.tdcFoodNum + item.unitLabel}` :
              `${item.tdcTotalWeight}g`;
          switch (item.tdcCategory) {
            case '01':
              breakfast.push(item);
              break;
            case '02':
              lunch.push(item);
              break;
            case '03':
              dinner.push(item);
              break;
            case '04':
              snack.push(item);
              break;
          }
        });
        this.setData({
          foodOrderCollection: {
            breakfast,
            lunch,
            dinner,
            snack
          },
          real: res.obj
        });

        // 判断7700弹窗 今天有打卡弹一次
        if (data.length > 0 && date == day().format('YYYYMMDD')) {
          this.showClock();
        }

        return data;
      });
  },

  showClock() {
    const showClockDate = wx.getStorageSync('showClockDate');
    const showClock = showClockDate ? day(showClockDate).startOf('day') < day().startOf('day') : true;
    if (showClock) {
      this.setData({
        showClock
      })
      wx.setStorageSync('showClockDate', day().format('YYYY-MM-DD'))
    }
  },

  clock() {
    this.setData({
      showClock: false
    })
    wx.navigateTo({
      url: '/pages/solution/sevenZero/signIn/signIn',
    });
  },

  foodCountChange(evt) {
    const key =
      this.data.currentFood.tdcType === '04' ?
        'currentFood.tdcFoodNum' :
        'currentFood.tdcTotalWeight';

    this.setData({
      [key]: evt.detail.value
    });
  },
  hideExtendPopup() {
    this.setData({
      showExtendPopup: false
    });
  },
  getUnitScale(unit) {
    const scaleMap = {
      1: {
        // 克
        precision: 1,
        max: 999
      },
      2: {
        // 勺子
        precision: 0.5,
        max: 20
      },
      3: {
        // 筷子
        precision: 1,
        max: 50
      }
    };

    return scaleMap[unit];
  },
  changeFoodPercentTap() {
    if (this.foodPercentChaing) return;
    const food = this.data.currentFood;
    this.foodPercentChaing = true;
    apiRequest
      .updateOneDietCardInfo({
        tdcId: food.tdcId,
        tdcType: '01',
        tdcEdibleRatio: food.tdcEdibleRatio
      })
      .then(res => {
        if (res.errCode === 0) {
          wx.showToast({
            icon: 'none',
            title: '修改成功'
          });

          this.getOrderFoodList();
          this.getConsumeDetail();
          this.setData({
            showExtendPopup: false
          });
        }
        this.foodPercentChaing = false;
      })
      .catch(() => {
        this.foodPercentChaing = false;
      });
  },
  foodPercentChange(evt) {
    this.setData({
      'currentFood.tdcEdibleRatio': evt.detail.value
    });
  },
  hideAddPopup() {
    this.setData({
      showAddPopup: false
    });
  },
  goFoodDetailPage(food) {
    let obj = {
      id: food.tdcFid,
      orderMethod: '01',
      category: food.tdcCategory,
      type: 'detail'
    }
    wx.navigateTo({
      url: `/pages/packageOrder/goodsDetail/goodsDetail?param=${JSON.stringify(obj)}`,
    });
  },
  goGoodsDetail() {
    this.goFoodDetailPage(this.data.currentFood);
  },
  goDetailPage() {
    const {
      currentFood
    } = this.data;

    wx.navigateTo({
      url: `/pages/packageDiscover/foodDetail/foodDetail?id=${currentFood.tdcFid}&status=1&num=${currentFood.tdcFoodNum}&unit=${currentFood.tdcFoodUnits}&cid=${currentFood.tdcId}`
    });
  },
  unitTap(evt) {
    const {
      unit
    } = evt.currentTarget.dataset;
    const currentFoodUnit = unitOpts.find(item => item.value === unit);

    this.setData({
      currentFoodUnit,
      scale: this.getUnitScale(unit),
      'currentFood.tdcFoodUnits': unit
    });
  },
  changeFoodCardTap() {
    if (this.foodCardChanging) return;
    const food = this.data.currentFood;
    this.foodCardChanging = true;

    const params =
      food.tdcType === '04' ? {
        tdcFoodNum: food.tdcFoodNum,
        tdcFoodUnits: food.tdcFoodUnits,
        tdcType: food.tdcType
      } : {
          tdcTotalWeight: food.tdcTotalWeight
        };

    apiRequest
      .updateOneDietCardInfo({
        tdcId: food.tdcId,
        ...params
      })
      .then(res => {
        if (res.errCode === 0) {
          wx.showToast({
            icon: 'none',
            title: '修改成功'
          });

          this.getOrderFoodList();
          this.getConsumeDetail();
          this.setData({
            showAddPopup: false
          });
        }
        this.foodCardChanging = false;
      })
      .catch(() => {
        this.foodCardChanging = false;
      });
  },
  foodCardTap(e) {
    const {
      index,
      type
    } = e.currentTarget.dataset;
    const food = this.data.foodOrderCollection[type][index];

    const Popup = food.tdcType === '01' ? 'showExtendPopup' : 'showAddPopup';
    const currentFoodUnit = unitOpts.find(
      item => item.value == food.tdcFoodUnits
    );

    this.setData({
      currentFoodUnit,
      scale: this.getUnitScale(food.tdcFoodUnits),
      currentFood: {
        tdcEdibleRatio: 100,
        ...food,
        $tdcTotalWeight: food.tdcTotalWeight
      },
      [Popup]: true
    },
      () => {
        setTimeout(() => {
          if (food.tdcType === '01') {
            this.scale2Comp.toView();
          } else {
            this.scaleComp.toView();
          }
        }, 100);
      }
    );
  },
  // 删除当前编辑的食物
  deleteCurrentFoodTap() {
    const date = this.selectDateStr ? day(this.selectDateStr).format('YYYYMMDD') : day().format('YYYYMMDD');
    this.deleteOneFoodCard({
      tdcId: this.data.currentFood.tdcId,
      tdcCardDate: date
    }).then(res => {
      if (res.obj && res.obj.result === 1) {
        wx.showToast({
          icon: 'none',
          title: res.obj.describe ? `${res.obj.describe} 积分${res.obj.opscore}` : '删除成功'
        });
        this.getConsumeDetail();
        this.getOrderFoodList().then(list => {
          if (list.length <= 0) {
            this.getMonthCardDate(day(this.selectDateStr).format('YYYYMM'));
          }
        });
        this.setData({
          showAddPopup: false
        });
      }
    });
  },
  // 删除选餐的食物
  deleteOrderFoodTap(e) {
    const {
      index,
      type
    } = e.currentTarget.dataset;
    const foodList = this.data.foodOrderCollection[type];
    const date = this.selectDateStr ? day(this.selectDateStr).format('YYYYMMDD') : day().format('YYYYMMDD');

    this.deleteOneFoodCard({
      tdcId: foodList[index].tdcId,
      tdcCardDate: date,
    }).then(res => {
      if (res.obj && res.obj.result === 1) {
        wx.showToast({
          icon: 'none',
          title: res.obj.describe ? `${res.obj.describe} 积分${res.obj.opscore}` : '删除成功'
        });
        this.getOrderFoodList().then(list => {
          if (list.length <= 0) {
            this.getMonthCardDate(day(this.selectDateStr).format('YYYYMM'));
          }
        });
        // foodList.splice(index, 1x);
        this.getConsumeDetail();
        this.setData({
          [`foodOrderCollection.${type}`]: foodList
        });
      }
    });
  },
  deleteOneFoodCard(params) {
    return apiRequest.deleteOneDietCardInfo(params);
  },
  toggleShowSchemeBar() {
    this.setData({
      showSchemeBar: !this.data.showSchemeBar
    });
  },
  closeCalendar() {
    this.setData({
      showCalender: false
    });
  },

  backToday() {
    this.selectDate({})
    this.calendar.jump()
  },

  selectDate({ detail }) {
    const selectDateStr = detail ? `${detail.year}/${zeroFill(detail.month)}/${zeroFill(detail.day)}` : day().format('YYYY/MM/DD');
    // date的detail有时是字符串 有时是一个对象 需要处理
    // const currentSelectDateStr =
    //   typeof evt.detail === 'string'
    //     ? evt.detail
    //     : evt.detail && evt.detail.select;

    this.selectDateStr = selectDateStr;

    this.selectDateHandler();
    this.querySportCard();

    this.closeCalendar();
  },
  selectDateHandler(flag) {
    // 判断选中时间是否为今天 设置title
    const navTitle = this.selectDateStr.split('-').join('/');

    // const tapTitleWidth = navTitle === '今天' ? 100 : 220;

    if (!flag) {
      this.getConsumeDetail();
      this.getOrderFoodList();
    }

    this.setData({
      navTitle
    });
  },

  showCalendar() {
    this.setData({
      showCalender: true
    });
  },

  headTap(e) {
    const current = day(e.detail);
    if (Date.now() < current) {
      return;
    }

    if (current.month() !== day(this.selectDateStr).month()) {
      this.getMonthCardDate(current.format('YYYYMM'));
    }

    this.selectDateStr = current.format('YYYY/MM/DD');

    this.calendar.jump(current.year(), current.month() + 1, current.date());
    this.setData({
      'calendarConfig.defaultDay': current.format('YYYY-MM-DD')
    });

    this.selectDateHandler();
    this.querySportCard();
  },

  orderFoodTap(evt) {
    const {
      type
    } = evt.currentTarget.dataset;
    const date = this.selectDateStr.split('/').join('');

    if (type == '05') {
      wx.navigateTo({
        url: `/pages/sport/sportList/sportList?selectVal=${date}`,
      });

      return
    }
    wx.navigateTo({
      url: `/pages/packageDiscover/foodList/foodList?type=${type}&date=${date}`
    });
  },
  meal(evt) {
    const {
      type
    } = evt.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/packageDiscover/meal/meal?type=${type}&date=${this.selectDateStr
        .split('/')
        .join('')}`
    });
  }
});