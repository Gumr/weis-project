import day from '../../../libs/day';
import { round } from '../../../utils/common';
import apiRequest from '../../../service/index'

const PAGE_TITLE_MAP = {
  '01': '添加早餐',
  '02': '添加午餐',
  '03': '添加晚餐',
  '04': '添加加餐'
};

const unitOpts = [
  {
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

const app = getApp();
// pages/datas/foodList/foodList.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    unitOpts,
    unitIntoView: 'a1',
    scale: {
      precision: 1,
      max: 999
    },
    searchTop: 0,
    seraching: true,
    currentTdcType: '01', // 判断当前food-list 是早中晚餐
    pageTitle: '',
    searchKeyword: '',
    showAddPopup: false,
    foodListLoading: false,
    selectedFoodKcalTotal: 0,
    currentFoodUnit: {
      label: '克',
      value: '1'
    },
    foodList: [],
    searchFoodList: [], // 搜索食物列表
    normalFoodList: [], // 常见食物
    customFoodList: [], // 自定义食物
    uploadFoodList: [], // 上传食物
    currentFood: {
      tdcTotalWeight: 100
    },
    selectedFoodTotal: 0, // 添加的食物数组
    isFullScreen: app.globalData.isIpx,
    activeTab: '02',
    tabList: [
      {
        name: '常见',
        value: '02'
      },
      {
        name: '自定义',
        value: '03'
      },
      {
        name: '外食打卡',
        value: '04'
      }
    ],
    scaleStyle: {
      bginner: '#ffffff',
      bgoutside: '#ffffff',
      line: '#e9e9e9',
      font: '#ffffff',
      lineSelect: '#21C4C0'
    },
    searchListLoading: false,
    searchPage: {
      pageNo: 1,
      pageSize: 10
    },
    currentPage: {
      pageNo: 1,
      pageSize: 10
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { type, tab, id, date } = options;

    const pageTitle = PAGE_TITLE_MAP[type] || '';
    const activeTab = tab || '02';

    this.cardDate = date || day().format('YYYYMMDD');

    this.setData({
      activeTab,
      pageTitle,
      searchTop: app.globalData.navStatusHeight,
      currentTdcType: options.type
    });

    // if (id && tab === '04') {
    //   this.readyCallback = () => {
    //     this.getUploadFoodList().then(res => {
    //       if (res.errCode === 0) {
    //         this.addFoodById(res, Number(id));
    //       }
    //     });
    //   };
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.scaleComp = this.selectComponent('#scale');

    // if (this.readyCallback) {
    //   this.readyCallback();
    //   this.readyCallback = undefined;
    // }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCommonFoodList();
    this.getCustomFoodList();
    this.getUploadFoodList();

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
  onReachBottom: function () {
    if (this.data.searching) {
      this.searchReachBottom();
    } else if (this.data.activeTab === '02') {
      this.normalReachBottom();
    }
  },
  searchReachBottom() {
    this.setData({
      'searchPage.pageNo': this.data.searchPage.pageNo + 1,
      searchListLoading: true
    });

    const cancelLoading = () => {
      this.setData({
        searchListLoading: false
      });
    };

    this.getSearchFoodList(true)
      .then(res => {
        const total = res.obj.foodList.totalRecordCount;

        this.setData({
          searchListLoading: this.data.searchFoodList.length < total
        });
      })
      .catch(cancelLoading);
  },
  normalReachBottom() {
    this.setData({
      'currentPage.pageNo': this.data.currentPage.pageNo + 1
    });

    this.setData({
      foodListLoading: true
    });

    const cancelLoading = () => {
      this.setData({
        foodListLoading: false
      });
    };

    this.getNormalFoodList(true)
      .then(res => {
        const total = res.obj.foodList.totalRecordCount;

        this.setData({
          foodListLoading: this.data.normalFoodList.length < total
        });
      })
      .catch(cancelLoading);
  },
  addFoodById(res, id) {
    let list = [];
    let matchItem;

    switch (this.data.activeTab) {
      case '03':
        list = res.obj.dietLibList;
        matchItem = list.find(item => item.tdlId === id);
        break;
      case '04':
        list = res.obj.dietUserUploadList;
        matchItem = list.find(item => item.tduuId === id);
        break;
    }

    if (matchItem) {
      this.addFoodCard(this.normalizeCurrentFood(matchItem));
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  quickAddFoodCardTap(evt) {
    const { index } = evt.currentTarget.dataset;
    let foodData = {};
    switch (this.data.activeTab) {
      case '03':
        foodData = this.normalizeCurrentFood(this.data.customFoodList[index]);
        break;
      case '04':
        foodData = this.normalizeCurrentFood(this.data.uploadFoodList[index]);
        break;
    }
    this.addFoodCard(foodData);
  },
  addFoodCardTap() {
    const foodData = this.data.currentFood;

    const realWeight = this.completeFoodWeight(
      foodData.tdcType === '04' ? foodData.foodNum : foodData.tdcTotalWeight,
      foodData.foodUnits
    );
    // const unitKcal =
    //   foodData.tdcType === '04' ? foodData.foodNum : foodData.tdcTotalWeight;
    const tdcTotalKcal = Math.ceil(realWeight * foodData.$ratio);

    this.addFoodCard({ ...foodData, tdcTotalKcal })
      .then(() => {
        this.setData({
          showAddPopup: false
        });
      })
      .catch(() => { });
  },
  completeFoodWeight(count, unit) {
    unit = unit || 1;
    const mul = {
      0: 1,
      1: 1,
      2: 15,
      3: 10
    }[unit];

    return count * mul;
  },
  addSelectFood(food) {
    const selectedFoodKcalTotal = round(
      this.data.selectedFoodKcalTotal + (+food.tdcTotalKcal || 0),
      2
    );

    this.setData({
      selectedFoodTotal: this.data.selectedFoodTotal + 1,
      selectedFoodKcalTotal
    });
  },
  // 添加食物到饮食打卡记录上
  addFoodCard(food) {
    let lastPages = getCurrentPages()[getCurrentPages().length - 2];
    return apiRequest.addDietCardInfo(food).then(res => {
      if (res.errCode === 0) {
        this.addSelectFood(food);
      }
      // 积分
      if(res.obj.describe){
        lastPages.setData({
          totastMsg: `${res.obj.describe} 积分${res.obj.opscore}`
        })
      }else{
        lastPages.setData({
          totastMsg: lastPages.data.totastMsg ? lastPages.data.totastMsg : ''
        })
      }
      return res.errCode === 0 ? Promise.resolve() : Promise.reject();
    });
  },
  confirmFoodCardTap() {
    wx.navigateBack();
  },
  switchTab(e) {
    const { type } = e.currentTarget.dataset;

    this.setData({
      activeTab: type
    });

    if (type === '04') {
      this.getUploadFoodList();
    }
  },
  addCustomFoodTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/customFood/customFood'
    });
  },
  uploadCustomFoodTap() {
    wx.navigateTo({
      url: '/pages/packageDiscover/punchOut/punchOut'
    });
  },
  getCommonFoodList() {
    this.setData({
      foodListLoading: true
    });

    apiRequest
      .queryCommonlyUsedFoodList({
        
      })
      .then(res => {
        if (res.obj && res.obj.foodDetailsList) {
          this.setData({
            normalFoodList: res.obj.foodDetailsList
          });
        }
        this.setData({
          foodListLoading: false
        });
      })
      .catch(() => {
        this.setData({
          foodListLoading: false
        });
      });
  },
  getNormalFoodList(merge) {
    return apiRequest
      .queryFoodList(this.data.currentPage)
      .then(res => {
        const data =
          (res.obj && res.obj.foodList && res.obj.foodList.record) || [];

        if (data.length) {
          const normalFoodList = merge
            ? this.data.normalFoodList.concat(data)
            : data;

          this.setData({
            normalFoodList
          });
        }

        return data.length > 0 ? res : Promise.reject();
      });
  },
  getUploadFoodList() {
    return apiRequest.queryDietUserUploadList().then(res => {
      if (res.errCode === 0) {
        const uploadFoodList = res.obj.dietUserUploadList.map(item => {
          item.unitLabel = {
            0: 'g',
            1: 'g',
            2: '勺',
            3: '筷子'
          }[item.unit];
          item.foodImage = item.foodImageList;
          item.disabled = ['00', '11'].includes(item.stt);

          return item;
        });

        this.setData({
          uploadFoodList: uploadFoodList
        });
      }
      return res;
    });
  },
  getCustomFoodList() {
    return apiRequest.queryDietLibList({ 

     }).then(res => {
      if (res.errCode === 0) {
        this.setData({
          customFoodList: res.obj.dietLibList
        });
      }
      return res;
    });
  },
  goDetailPage(evt) {
    const { currentFood } = this.data;

    const url = {
      '03': `/pages/datas/customFoodDetail/customFoodDetail?id=${evt.currentTarget.dataset.id}`,
      '04': `/pages/packageDiscover/foodDetail/foodDetail?id=${evt.currentTarget.dataset.id}&status=0&num=${currentFood.foodNum}&unit=${currentFood.foodUnits}&category=${this.data.currentTdcType}`
    }[this.data.activeTab];

    wx.navigateTo({ url });
  },
  normalizeCurrentFood(foodData = {}, tab) {
    tab = tab || this.data.activeTab;
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
    let result = {};
    let kcal = 0;

    if (this.data.searching) {
      result = {
        tdcFid: foodData.id,
        tdcImage: foodData.thumbImageUrl,
        tdcFoodName: foodData.name,
        tdcTotalKcal: foodData.calory,
        tdcProteinTotal: foodData.protein,
        tdcFatTotal: foodData.fat,
        tdcCarbohydrateTotal: foodData.carbohydrate
      };
      result.tdcTotalWeight = foodData.weight;
      kcal = foodData.calory;
    } else {
      switch (tab) {
        case '02':
          result = {
            tdcFid: foodData.id,
            tdcImage: foodData.thumbImageUrl,
            tdcFoodName: foodData.name,
            tdcTotalKcal: foodData.calory,
            tdcProteinTotal: foodData.protein,
            tdcFatTotal: foodData.fat,
            tdcCarbohydrateTotal: foodData.carbohydrate
          };
          result.tdcTotalWeight = foodData.weight;
          kcal = foodData.calory;
          break;
        case '03':
          result = {
            tdcFid: foodData.tdlId,
            tdcImage: foodData.tduuFoodImage,
            tdcFoodName: foodData.tdlFoodName,
            tdcTotalKcal: foodData.unitType === 1 ? Math.ceil(foodData.tdlTotalKcal * 0.2389) : foodData.tdlTotalKcal,
            tdcProteinTotal: foodData.tdlProteinTotal,
            tdcFatTotal: foodData.tdlFatTotal,
            tdcCarbohydrateTotal: foodData.tdlCarbohydrateTotal
          };
          result.tdcTotalWeight = foodData.tdlTotalWeight;
          kcal = foodData.tdlTotalKcal;
          break;
        case '04':
          result = {
            $uid: foodData.id,
            tdcFid: foodData.fid,
            tdcImage: foodData.foodImageList[0].image,
            tdcFoodName: foodData.name,
            tdcTotalKcal: foodData.kcal,
            tdcProteinTotal: foodData.protein,
            tdcFatTotal: foodData.fat,
            tdcCarbohydrateTotal: foodData.carbohydrate
          };
          result.tdcTotalWeight = foodData.eneray;
          result.foodNum = foodData.amount;
          result.foodUnits = foodData.unit;
          kcal = foodData.kcal;
          break;
      }
    }

    result.tdcType = tab;
    result.$tdcTotalWeight = result.tdcTotalWeight;
    result.$realWeight = this.completeFoodWeight(
      result.tdcType === '04' ? result.foodNum : result.tdcTotalWeight,
      result.foodUnits
    );
    result.$ratio = kcal / result.$realWeight;
    result.tdcCategory = this.data.currentTdcType;
    result.tdcCardDate = this.cardDate;

    return result;
  },
  deleteCurrentFoodTap() {
    let request;
    if (this.data.activeTab === '03') {
      request = this.deleteCustomFood(this.data.currentFood.tdcFid);
    } else if (this.data.activeTab === '04') {
      request = this.deleteUploadFood(this.data.currentFood.$uid);
    }

    if (request) {
      request.then(res => {
        if (res.obj && res.obj.delResult === 1) {
          wx.showToast({
            icon: 'none',
            title: '删除成功'
          });
          this.setData({
            showAddPopup: false
          });
        }
      });
    }
  },
  deleteCustomFood(id) {
    return apiRequest
      .deleteDietLibInfo({ 
        tdlId: id 
      })
      .then(res => {
        if (res.obj && res.obj.delResult === 1) {
          const list = this.data.customFoodList;
          list.splice(this.currentFoodIndex, 1);
          this.setData({
            customFoodList: list
          });
        }
        return res;
      });
  },
  // 删除自定义食物
  deleteCustomFoodTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const list = this.data.customFoodList;
    const food = list[index];

    this.deleteCustomFood(food.tdlId);
  },
  deleteUploadFood(id) {
    return apiRequest
      .deleteDietUserUploadInfo({ 
        tduuId: id
       })
      .then(res => {
        if (res.obj && res.obj.delResult === 1) {
          const list = this.data.uploadFoodList;
          list.splice(this.currentFoodIndex, 1);
          this.setData({
            uploadFoodList: list
          });
        }
        return res;
      });
  },
  // 删除上传食物
  deleteUploadFoodTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const list = this.data.uploadFoodList;
    const food = list[index];

    this.deleteUploadFood(food.id);
  },
  addFoodTap(e) {
    const { index } = e.currentTarget.dataset;
    this.currentFoodIndex = index;
    let currentFood;
    if (this.data.searching) {
      currentFood = this.normalizeCurrentFood(this.data.searchFoodList[index]);
    } else {
      switch (this.data.activeTab) {
        case '02':
          currentFood = this.normalizeCurrentFood(
            this.data.normalFoodList[index]
          );
          break;
        case '03':
          currentFood = this.normalizeCurrentFood(
            this.data.customFoodList[index]
          );
          break;
        case '04':
          const uploadFood = this.data.uploadFoodList[index];

          if (uploadFood.stt !== '12') {
            return (
              uploadFood.stt === '11' &&
              wx.navigateTo({
                url: `/pages/datas/punchOut/punchOut?status=fail&index=${index}`
              })
            );
          }
          currentFood = this.normalizeCurrentFood(uploadFood);
          break;
      }
    }
    const unit =
      this.data.activeTab === '04' ? this.data.uploadFoodList[index].unit : '1';
    const currentFoodUnit = unitOpts.find(item => item.value == unit);
    const scale = this.getUnitScale(unit);

    this.setData(
      {
        currentFoodUnit,
        scale,
        currentFood,
        showAddPopup: true
      },
      () => {
        setTimeout(() => {
          this.scaleComp.toView();
        }, 300);
      }
    );
  },
  // foodUnitTap(evt) {
  //   const { unit } = evt.currentTarget.dataset;
  //   const currentFoodUnit = unitOpts.find(item => item.value === unit);

  //   this.setData({
  //     currentFoodUnit,
  //     unitIntoView: `unit-${unit}`
  //   });
  // },
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
  foodCountChange(evt) {
    const key =
      this.data.currentFood.tdcType === '04'
        ? 'currentFood.foodNum'
        : 'currentFood.tdcTotalWeight';

    this.setData({
      [key]: evt.detail.value
    });
  },
  unitTap(evt) {
    const { unit } = evt.currentTarget.dataset;
    const currentFoodUnit = unitOpts.find(item => item.value === unit);

    this.setData({
      currentFoodUnit,
      scale: this.getUnitScale(unit),
      'currentFood.foodUnits': unit
    });
  },
  hideAddPopup() {
    this.setData({
      showAddPopup: false
    });
  },
  // handleSearchChange(evt) {
  //   this.setData({
  //     searchKeyword: evt.detail
  //   });
  // },
  getSearchFoodList(merge) {
    return apiRequest
      .queryFoodList({
        foodName: this.data.searchKeyword,
            ...this.data.searchPage
      })
      .then(res => {
        const data =
          (res.obj && res.obj.foodList && res.obj.foodList.record) || [];

        if (data.length) {
          const searchFoodList = merge
            ? this.data.searchFoodList.concat(data)
            : data;

          this.setData({
            searchFoodList
          });
        }
        return data.length > 0 ? res : Promise.reject();
      });
  },
  handleFoodSearch(evt) {
    if (evt.detail) {
      this.setData({
        searching: true,
        searchKeyword: evt.detail,
        'searchPage.pageNo': 1
      });

      this.getSearchFoodList();
    }
  },
  handleCancelFoodSearch() {
    this.setData({
      searching: false,
      searchKeyword: ''
    });
  }
});
