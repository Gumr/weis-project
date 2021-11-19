import apiRequest from '../../../service/index'

function handleLimitValue(val) {
  if (/^0+$/.test(val)) {
    val = '';
  }
  return val;
}

function handleDigitValue(val) {
  if (!val) return '';
  const match = val.match(/^[0-9]+\.?[0-9]?/);

  return match[0];
}
// pages/datas/customFood/customFood.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    infoCompleted: false,
    activeEnergy: '1',
    energyUnit: '千卡',
    recommendFoods: [],
    customFoodInfo: {
      tdlFoodName: '', //食物名(String)
      tdlTotalWeight: '', //食物重量(String)
      tdlTotalKcal: '', //食物能量(Decimal)kcal
      tdlProteinTotal: '', //蛋白质总量(Decimal)g
      tdlFatTotal: '', //脂肪总量(Decimal)g
      tdlCarbohydrateTotal: '', //碳水化合物总量(Decimal)g
      unitType: 0, //食物能量单位
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pageStatus: options.type
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  handleInputChange(evt) {
    const itemKey = evt.currentTarget.dataset.key;
    let {
      type,
      limit
    } = evt.currentTarget.dataset;
    limit = Boolean(limit);
    let {
      value
    } = evt.detail;

    if (limit) value = handleLimitValue(value);
    if (type === 'digit') value = handleDigitValue(value);

    const key = `customFoodInfo.${itemKey}`;

    if (itemKey === 'tdlFoodName') {
      if (value.length > 0) {
        this.updateRecommendTag(value);
      } else {
        this.setData({
          recommendFoods: []
        });
      }
    }

    this.setData({
      [key]: value
    });

    this.validateInfoCompleted();
  },
  updateRecommendTag(foodName) {
    apiRequest
      .queryFoodList({
        pageNo: 1,
        pageSize: 3,
        foodName
      })
      .then(res => {
        if (res && res.errCode === 0) {
          const recommendFoods =
            (res.obj.foodList && res.obj.foodList.record) || [];
          this.setData({
            recommendFoods
          });
        }
      });
  },
  validateInfoCompleted() {
    const info = this.data.customFoodInfo;

    const infoCompleted = [
      'tdlFoodName',
      'tdlTotalWeight',
      'tdlTotalKcal'
    ].every(key => {
      return info[key].length > 0;
    });

    if (infoCompleted !== this.data.infoCompleted) {
      this.setData({
        infoCompleted
      });
    }
  },
  recommendTagTap(evt) {
    const {
      index
    } = evt.currentTarget.dataset;
    const currentFood = this.data.recommendFoods[index];

    const pages = getCurrentPages();
    const uploadPage = pages[pages.length - 2];

    if (uploadPage) {
      uploadPage
        .addFoodCard(uploadPage.normalizeCurrentFood(currentFood, '02'))
        .then(() => {
          wx.navigateBack();
        })
        .catch(() => {});
    }
  },
  addCustomInfo() {
    return apiRequest.addDietLibInfo(
      this.data.customFoodInfo
    );
  },
  handleConfirmTap() {
    if (this.data.infoCompleted) {
      this.addCustomInfo().then(res => {
        if (res.obj && res.obj.tdcId !== 0) {
          const tdlId = res.obj.tdlId;

          let foodListPage = getCurrentPages();
          foodListPage = foodListPage[foodListPage.length - 2];

          const food = foodListPage.normalizeCurrentFood({
            ...this.data.customFoodInfo,
            tdlId
          });
          foodListPage.addFoodCard(food);

          wx.navigateBack();

          wx.showToast({
            icon: 'success',
            title: '添加完成'
          });
        }
      });
    } else {
      wx.showToast({
        icon: 'none',
        title: '请输入完整的基本信息'
      });
    }
  },
  changeActiveEnergy(evt) {
    const {
      value
    } = evt.currentTarget.dataset;
    let customFoodInfo = this.data.customFoodInfo;

    const unit = {
      1: '千卡',
      2: '千焦'
    } [value];
    customFoodInfo.unitType = value == 1 ? 0 : 1;

    this.setData({
      activeEnergy: value,
      energyUnit: unit,
      customFoodInfo
    });
  }
});