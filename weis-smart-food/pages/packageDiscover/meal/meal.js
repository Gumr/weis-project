// pages/datas/meal/meal.js
import apiRequest from '../../../service/index'

const unitOpts = [
  {
    label: '克',
    value: '1'
  },
  {
    label: '勺',
    value: '2'
  },
  {
    label: '筷子',
    value: '3'
  }
];

function getUnitLabel(unit) {
  return {
    0: '克',
    1: '克',
    2: '勺',
    3: '筷子'
  }[unit];
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showAddPopup: false,
    showExtendPopup: false,
    currentFood: {},
    currentFoodUnit: {
      label: '克',
      value: '1'
    },
    scale: {
      precision: 1,
      max: 999
    },
    category: {
      '01': '早餐',
      '02': '午餐',
      '03': '晚餐',
      '04': '加餐'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { type, date } = options;
    this.setData({
      type,
      date
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.circle1 = this.selectComponent('#circle1');
    this.circle2 = this.selectComponent('#circle2');
    this.circle3 = this.selectComponent('#circle3');

    this.scaleComp = this.selectComponent('#scale');
    this.scale2Comp = this.selectComponent('#scale2');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.init();
  },

  init: function() {
    apiRequest
      .queryOneCategoryDietCardList({
        tdcCardDate: this.data.date,
            tdcCategory: this.data.type
      })
      .then(res => {
        if (res.obj) {
          let dietCardList = res.obj.dietCardList;
          dietCardList = dietCardList.map(item => {
            item.unitLabel = getUnitLabel(item.tdcFoodUnits);
            item.unitTotalLabel =
              item.tdcType === '04'
                ? `${item.tdcFoodNum + item.unitLabel}`
                : `${item.tdcTotalWeight}g`;
            return item;
          });

          let pieData = [{ // 处理生成饼图用的数据
            key: 'fatRatio',
            color: '#FE5E0F'
          }, {
            key: 'carbohydrateRatio',
            color: '#EEEEEE',
          }, {
            key: 'proteinRatio',
            color: '#41C48C'
          }].map((it) => {
            it.value = res.obj[it.key]
            return it
          }).filter((it) => Boolean(it.value))

          setTimeout(() => {
            this.setData({
              foodData: {
                ...res.obj,
                dietCardList,
                pieData
              }
            });
          }, 200);
        }
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
  unitTap(evt) {
    const { unit } = evt.currentTarget.dataset;
    const currentFoodUnit = unitOpts.find(({ value }) => value === unit);
    this.setData({
      currentFoodUnit,
      scale: this.getUnitScale(unit),
      'currentFood.tdcFoodUnits': currentFoodUnit.value
    });
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

          this.init();
          this.setData(
            {
              showExtendPopup: false
            }
          );
        }
        this.foodPercentChaing = false;
      })
      .catch(() => {
        this.foodPercentChaing = false;
      });
  },
  orderFoodTap: function() {
    const type = this.data.type;
    wx.navigateTo({
      url: `/pages/packageDiscover/foodList/foodList?type=${type}&date=${this.data.date};`
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  // 删除当前编辑的食物
  deleteCurrentFoodTap() {
    this.deleteOneFoodCard({
      tdcId: this.data.currentFood.tdcId
    }).then(res => {
      if (res.obj && res.obj.result === 1) {
        wx.showToast({
          icon: 'none',
          title: '删除成功'
        });
        this.init();
        this.setData(
          {
            showAddPopup: false
          }
        );
      }
    });
  },
  foodCardTap(evt) {
    var that = this;
    const { index } = evt.currentTarget.dataset;

    const food = this.data.foodData.dietCardList[index];
    const currentFoodUnit = unitOpts.find(
      item => item.value == food.tdcFoodUnits
    );

    const Popup = food.tdcType === '01' ? 'showExtendPopup' : 'showAddPopup';

    this.setData(
      {
        [Popup]: true,
        currentFoodUnit,
        scale: this.getUnitScale(food.tdcFoodUnits),
        currentFood: {
          tdcEdibleRatio: 100,
          ...food,
          $tdcTotalWeight: food.tdcTotalWeight
        }
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
  // 删除选餐的食物
  deleteOrderFoodTap(e) {
    const { index } = e.currentTarget.dataset;
    const foodList = this.data.foodData.dietCardList;

    this.deleteOneFoodCard({
      tdcId: foodList[index].tdcId
    }).then(res => {
      if (res.obj && res.obj.result === 1) {
        wx.showToast({
          icon: 'none',
          title: '删除成功'
        });
        this.init();
        // foodList.splice(index, 1);

        this.setData({
          'foodData.dietCardList': foodList
        });
      }
    });
  },
  foodPercentChange(evt) {
    this.setData({
      'currentFood.tdcEdibleRatio': evt.detail.value
    });
  },
  changeFoodCardTap() {
    if (this.foodCardChanging) return;
    const food = this.data.currentFood;
    this.foodCardChanging = true;
    const params =
      food.tdcType === '04'
        ? {
            tdcFoodNum: food.tdcFoodNum,
            tdcFoodUnits: food.tdcFoodUnits,
            tdcType: food.tdcType
          }
        : {
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

          this.init();
          this.setData(
            {
              showAddPopup: false
            }
          );
        }
        this.foodCardChanging = false;
      })
      .catch(() => {
        this.foodCardChanging = false;
      });
  },
  foodCountChange(evt) {
    const key =
      this.data.currentFood.tdcType === '04'
        ? 'currentFood.tdcFoodNum'
        : 'currentFood.tdcTotalWeight';

    this.setData({
      [key]: evt.detail.value
    });
  },
  hideExtendPopup() {
    this.setData(
      {
        showExtendPopup: false
      }
    );
  },
  hideAddPopup() {
    this.setData(
      {
        showAddPopup: false
      }
    );
  },
  deleteOneFoodCard(params) {
    return apiRequest.deleteOneDietCardInfo(
      params
    );
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
  }
});
