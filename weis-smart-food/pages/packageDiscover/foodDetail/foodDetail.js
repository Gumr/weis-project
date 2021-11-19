import day from '../../../libs/day';
import apiRequest from '../../../service/index';


const oilList = [
  {
    label: '无油',
    value: 1
  },
  {
    label: '少油',
    value: 2
  },
  {
    label: '正常油',
    value: 3
  },
  {
    label: '偏油',
    color: '#FF864D',
    value: 4
  },
  {
    label: '重油',
    color: '#FF6256',
    value: 5
  }
];

const sugarList = [
  {
    label: '无糖',
    value: 1
  },
  {
    label: '少少糖',
    value: 2
  },
  {
    label: '少糖',
    value: 3
  },
  {
    label: '正常',
    value: 4
  },
  {
    label: '偏甜',
    value: 5
  },
  {
    label: '甜到齁',
    value: 6
  }
];

function relishMapper(data, key) {
  const value = data[key];
  switch (key) {
    case 'oilLevel':
      const oil = oilList.find(item => item.value === value);
      return oil && oil.label;
    case 'sugarLevel':
      const sugar = sugarList.find(item => item.value === value);
      return sugar && sugar.label;
  }
}

function getUnitLabel(unit) {
  return {
    0: '克',
    1: '克',
    2: '勺',
    3: '筷子'
  }[unit];
}
// pages/datas/foodDetail/foodDetail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: '0',
    useNums: 0,
    switch: [{ name: '千卡' }, { name: '千焦' }],
    food: {},
    switchIndex: 0,
    circle: [
      {
        name: '碳水化合物',
        value: 0,
        weight: 0,
        weightKey: 'carbohydrate',
        key: 'carbohydrateRatio',
        color: '#21C4C0',
        layerColor: '#E9E9E9'
      },
      {
        name: '蛋白质',
        value: 0,
        weight: 0,
        weightKey: 'protein',
        key: 'proteinRatio',
        color: '#FFB93F',
        layerColor: '#E9E9E9'
      },
      {
        name: '脂肪',
        value: 0,
        weight: 0,
        weightKey: 'fat',
        key: 'fatRatio',
        color: '#FF5959',
        layerColor: '#E9E9E9'
      }
    ],
    relishList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { num, unit, id, status, cid, category } = options;
    this.foodNum = num;
    this.foodUnit = unit;
    this.cid = cid;
    this.category = category;

    this.getFoodDetail(id);
    this.setData({
      status
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  switch: function(e) {
    if (this.data.switchIndex == e.currentTarget.dataset.index) {
      return;
    }
    this.setData({
      switchIndex: e.currentTarget.dataset.index
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
  getFoodDetail(id) {
    apiRequest
      .getOneDietUserUploadInfo({
        tduuId: id
      })
      .then(res => {
        if (res.errCode === 0) {
          res = res.obj;
          const useNums = res.useNum;
          const food = {
            ...res.dietUserUploadInfo,
            unitLabel: getUnitLabel(res.dietUserUploadInfo.unit)
          };
          let { circle } = this.data;
          circle = circle.map(item => {
            item.value = res[item.key];
            item.weight = food[item.weightKey];
            return item;
          });
          const relishList = ['sugarLevel', 'oilLevel']
            .map(key => relishMapper(food, key))
            .filter(Boolean);

          this.setData({
            useNums,
            food,
            circle,
            relishList
          });
        }
      });
  },
  btnTap() {
    if (this.data.status === '0') {
      this.addFoodCard();
    } else if (this.data.status === '1') {
      this.updateFoodCard();
    }
  },
  normalizeCurrentFood(foodData) {
    // tdcCardDate:打卡日期(String)例如20191125
    // tdcCategory:餐别类型.01早餐、02中餐、03晚餐，04加餐(String)
    // tdcType:打卡类型.00 未知， 01 送餐、02 食物库、03自定义(int)
    // tdcOid:送餐订单编号(String)
    // tdcFid:食物ID(long)
    // tdcFoodName:食物名(String)
    // tdcTotalKcal:卡路里(Decimal)
    // tdcTotalWeight:食物重量(Decimal)
    // tdcProteinTotal:蛋白质总量(Decimal)
    // tdcFatTotal:脂肪总量(Decimal)
    // tdcCarbohydrateTotal:碳水化合物总量(Decimal)
    // let result = {};
    // let kcal = 0;

    let result = {
      tdcFid: foodData.id,
      tdcImage: foodData.thumbImageUrl,
      tdcFoodName: foodData.name,
      tdcTotalKcal: foodData.calory,
      tdcProteinTotal: foodData.protein,
      tdcFatTotal: foodData.fat,
      tdcCarbohydrateTotal: foodData.carbohydrate
    };

    result.tdcTotalWeight = foodData.weight;
    result.foodNum = this.foodNum;
    result.foodUnits = this.foodUnit;

    result.tdcType = '04';
    result.tdcCategory = this.category;
    result.tdcCardDate = day().format('YYYYMMDD');

    return result;
  },
  updateFoodCard() {
    apiRequest
      .updateOneDietCardInfo({
        tdcFoodNum: this.foodNum,
        tdcFoodUnits: this.foodUnit,
        tdcType: '04',
        tdcId: this.cid
      })
      .then(res => {
        if (res.errCode === 0) {
          wx.navigateBack();
        }
      });
  },
  addFoodCard() {
    const food = this.normalizeCurrentFood(this.data.food);

    apiRequest
      .addDietCardInfo(
        food
      )
      .then(res => {
        if (res.errCode === 0) {
          const pages = getCurrentPages();
          const foodListPage = pages.find(
            page => page.route === 'pages/datas/foodList/foodList'
          );
          foodListPage.addSelectFood(food);
          wx.navigateBack();
        }
      });
  }
});
