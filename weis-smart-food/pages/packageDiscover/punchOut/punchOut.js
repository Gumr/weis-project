
import apiRequest from '../../../service/index';
import { URL } from '../../../utils/request';


const Food = () => ({
  name: '',
  brand: '',
  foodImage: [],
  amount: '',
  unit: '2',
  sugarLevel: 1,
  oilLevel: 1
});

function normalizeFood(food) {
  return {
    id: food.id,
    stt: food.stt,
    rejectNote: food.rejectNote,
    name: food.name || '',
    brand: food.brand || '',
    foodImage: food.foodImage || [],
    amount: food.amount || '',
    unit: food.unit || '2',
    sugarLevel: food.sugarLevel || 1,
    oilLevel: food.oilLevel || 1
  };
}

function getUnitAmountMax(unit) {
  return {
    '1': 999,
    '2': 20,
    '3': 50
  }[unit];
}

// pages/datas/punchOut/punchOut.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isCompleted: false,
    showUnitPopup: false,
    food: Food(),
    currentUnit: {
      label: '勺',
      value: '2'
    },
    unitList: [
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
    ],
    oilSteps: [
      {
        label: '无油',
        color: '#41C48C',
        value: 1
      },
      {
        label: '少油',
        color: '#9ABE79',
        value: 2
      },
      {
        label: '正常油',
        color: '#FFB83F',
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
    ],
    sweetnessSteps: [
      {
        label: '无糖',
        color: '#41C48C',
        value: 1
      },
      {
        label: '少少糖',
        color: '#85BF85',
        value: 2
      },
      {
        label: '少糖',
        color: '#D9BB55',
        value: 3
      },
      {
        label: '正常',
        color: '#FFA644',
        value: 4
      },
      {
        label: '偏甜',
        color: '#FF854E',
        value: 5
      },
      {
        label: '甜到齁',
        color: '#FF5959',
        value: 6
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { status, index } = options;

    this.pageStatus = status;
    const pages = getCurrentPages();

    const foodListPages = pages.find(
      page => page.route === 'pages/packageDiscover/foodList/foodList'
    );
    this.foodListPage = foodListPages;

    if (status === 'fail') {
      if (foodListPages) {
        this.setData({
          food: normalizeFood(foodListPages.__data__.uploadFoodList[index]),
          isCompleted: true
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.pageStatus === 'submited') {
      this.setData({
        food: Food()
      });
    }
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
  submitFoodTap() {
    if (!this.data.isCompleted) {
      return;
    }

    const reuqestMethod =
      this.pageStatus === 'fail' ? this.updateFood : this.submitFood;
    reuqestMethod().then(res => {
      if (res.errCode === 0) {
        if (res.obj.tduuId !== 0) {
          this.pageStatus = 'submited';
          wx.navigateTo({
            url: '/pages/packageDiscover/submitComplete/submitComplete'
          });
        }
      }
    });
  },
  updateFood() {
    return apiRequest.updateOneDietUserUploadInfo(
      this.data.food
    );
  },
  submitFood() {
    return apiRequest.addDietUserUploadInfo({
      ...this.data.food,
          remarks: this.foodListPage.__data__.currentTdcType
    });
  },
  unitTap() {
    this.setData({
      showUnitPopup: true
    });
  },
  handleInput(evt) {
    let value = evt.detail.value;
    let { key } = evt.currentTarget.dataset;

    if (key === 'amount') {
      const max = getUnitAmountMax(this.data.currentUnit.value);
      value = value > max ? max : value;
    }

    key = `food.${key}`;

    this.setData({
      [key]: value
    });

    this.validateSubmitComplted();
  },
  validateSubmitComplted() {
    const { food } = this.data;

    const flag = Object.keys(food).every(key => {
      const value = food[key];

      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

    this.setData({
      isCompleted: flag
    });
  },
  selectUnitTap(evt) {
    const item = this.data.unitList[evt.currentTarget.dataset.index];

    const { food } = this.data;
    const max = getUnitAmountMax(item.value);
    const amount = food.amount > max ? max : food.amount;

    this.setData({
      currentUnit: item,
      'food.unit': item.value,
      'food.amount': amount,
      showUnitPopup: false
    });
  },
  cancelUnitTap() {
    this.setData({
      showUnitPopup: false
    });
  },
  handleOilCHange(evt) {
    this.setData({
      'food.oilLevel': Number(evt.detail.value)
    });
    this.validateSubmitComplted();
  },
  handleSweetnessChange(evt) {
    this.setData({
      'food.sugarLevel': Number(evt.detail.value)
    });
    this.validateSubmitComplted();
  },
  deleteUploadImageTap(evt) {
    const { index } = evt.currentTarget.dataset;
    const { foodImage } = this.data.food;
    foodImage.splice(index, 1);
    this.setData({
      'food.foodImage': foodImage
    });
  },
  uploadImageTap() {
    const { food } = this.data;
    const { foodImage } = this.data.food;
    if (foodImage.length >= 3) {
      wx.showToast({
        icon: 'none',
        title: '最多只可上传三张图片！'
      });
      return;
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      fail: () => {
        console.log(food, 'food');

        this.setData({
          food
        });

        setTimeout(() => {
          this.setData(
            {
              food
            },
            () => {
              setTimeout(this.validateSubmitComplted, 100);
            }
          );
        }, 600);
      },
      success: res => {
        if (res.tempFilePaths) {
          apiRequest
            .uploadFile(`${URL.api}/upload/image`, res.tempFilePaths[0], {
              flag: 'diet'
            })
            .then(response => {
              response = JSON.parse(response.data);

              if (response.errCode === 0) {
                food.foodImage.push({
                  image: response.obj.imageUrl
                });

                this.setData(
                  {
                    food
                  },
                  () => {
                    setTimeout(this.validateSubmitComplted, 100);
                  }
                );
              }
            });
        }
      }
    });
  }
});
