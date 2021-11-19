// pages/mineBox/allergen/allergen.js
const app = getApp();
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectErgy: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.subToken){
      this.setData({
        subToken: options.subToken,
      })
    }
    this.queryDietaryIntake();
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



  queryDietaryIntake: function () {
    var that = this;
    apiRequest.queryDietaryIntake({
        type: '02',
        subToken: that.data.subToken,
      })
      .then(res => {
        that.setData({
          allergy: res.obj.dietaryIntakes || [],
          flavor: res.obj.flavor || []
        })
        that.labelErgy();
      })
      .catch(error => {

      })
  },


  // 标注用户过敏原
  labelErgy: function () {
    var that = this;
    apiRequest.queryUserAllergen({
        type: '02',
        subToken: that.data.subToken,
      })
      .then(res => {
        if (res.obj.eatingHabits && res.obj.eatingHabits.length > 0) {
          let eatingHabits = res.obj.eatingHabits;
          let allergy = that.data.allergy;
          let flavor = that.data.flavor;
          allergy.forEach((item, index) => {
            eatingHabits.forEach((item1, index1) => {
              if (item.id == item1.iid) {
                item.checked = true
              }
            })
          });
          flavor.forEach((item, index) => {
            eatingHabits.forEach((item1, index1) => {
              if (item.id == item1.iid) {
                item.checked = true
              }
            })
          })
          that.setData({
            allergy,
            flavor
          }, () => {
            this.countErgy()
          })
        }
      })
      .catch(error => {

      })
  },


  // 选择过敏原
  selectErgy: function (e) {
    let allergy = this.data.allergy;
    allergy[e.currentTarget.dataset.index].checked = !allergy[e.currentTarget.dataset.index].checked;
    this.setData({
      allergy
    }, () => {
      // 统计选中过敏原
      this.countErgy()
    })
  },


  // 统计选中过敏原
  countErgy: function () {
    let allergy = this.data.allergy;
    let flavor = this.data.flavor;
    let selectErgy = [];
    allergy.forEach(function (item, index) {
      if (item.checked) {
        let shortObj = {};
        shortObj.iid = item.id;
        shortObj.type = item.type;
        selectErgy.push(shortObj)
      }
    })
    flavor.forEach(function (item, index) {
      if (item.checked) {
        let shortObj = {};
        shortObj.iid = item.id;
        shortObj.type = item.type;
        selectErgy.push(shortObj)
      }
    })
    this.setData({
      selectErgy: selectErgy
    })

  },

  // 选择口味
  selectFlavor(e) {
    let flavor = this.data.flavor;
    flavor[e.currentTarget.dataset.index].checked = !flavor[e.currentTarget.dataset.index].checked;
    this.setData({
      flavor
    }, () => {
      // 统计选中口味
      this.countErgy()
    })
  },


  complete: function (e) {
    let finallyArr = this.data.selectErgy
    apiRequest.addUserDietaryIntake({
        iidList: finallyArr,
        subToken: this.data.subToken,
      })
      .then(res => {
        wx.showToast({
          title: '口味&过敏原设置成功',
          icon: 'none',
          image: '',
          duration: 1500,
          mask: false,
          success: (result) => {
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              });
            }, 1000)
          },
          fail: () => {},
          complete: () => {}
        });
      })
      .catch(error => {

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
  onShareAppMessage: function (options) {
    return {

    }
  }
})