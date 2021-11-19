// pages/packageOrder/setMealModify/setMealModify.js
import apiRequest from '../../../service/index';
import {
  isLoginClick,
  loginPromise,
} from '../../../utils/common'
import {
  setStorage,
  getStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addSkuSelect: {},
    subInfo: getStorage('subInfo') || {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = JSON.parse(options.params);
    this.setData({
      code: params.code, // 套餐推荐的目录code
      id: params.id,
      orderMethod: params.orderMethod,
      dateTime: params.dateTime,
      category: params.category,
      heatId: params.heatId,
      comboId: params.comboid,
      corpId: params.corpId,
      addressId: params.addressId,
    })
    this.queryComo()
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
      this.setData({
        uid: res.uid
      })
    })
  },
  // 将菜品添加进来
  addSkuObj() {
    let { list, addSkuSelect } = this.data;
    // 字段名改一样的
    addSkuSelect.name = addSkuSelect.skuname;
    addSkuSelect.num = 1;
    // let cidArr = list.recommendList[0].setMealDateils.map(item => item.cid)
    // let idx = cidArr.indexOf(addSkuSelect.cid);
    // // 该菜品已存在，数量+1
    // if(idx != -1) {
    //   list.recommendList[0].setMealDateils[idx].num ++
    // } else {
    // // 该菜品不存在，添加
    //   list.recommendList[0].setMealDateils.push(addSkuSelect) 
    // }
    list.recommendList[0].setMealDateils.push(addSkuSelect) 
    this.setData({
      list
    })
    this.totalEnergy()
    this.totalScore()
  },
  // 套餐
  queryComo: function () {
    var that = this;
    apiRequest.querySaleSetMeal({
      code: that.data.code, // 套餐推荐的目录code
      id: that.data.id,
      cid: that.data.id,
      orderMethod: that.data.orderMethod,
      dateTime: that.data.dateTime,
      category: that.data.category,
      heatPointId: that.data.heatId,
      comboId: that.data.comboid,
      corpId: that.data.id>10000?this.data.corpId:null
    })
      .then(res => {
        // let dialData = this.data.dialData;
        let list = res.obj;
        // let dietaryIntakes = [];
        // let other = [];
        // let flavor = [];; //口味
        // list.recommendList[0].dietaryIntakes.forEach((item, index) => {
        //   if (item.type == '02') {
        //     // 过敏原
        //     dietaryIntakes.push(item)
        //   } else if (item.type == '14') {
        //     // 口味
        //     flavor.push(item)
        //   } else {
        //     // 其他标签
        //     other.push(item)
        //   }
        // })
        // list.recommendList[0].dietaryIntakes = dietaryIntakes;
        // list.recommendList[0].other = other;
        // list.recommendList[0].flavor = flavor;
        // list.recommendList[0].setMealDateils.forEach((item, index) => {
        //   item.packageForm = item.foodDiversities.map(main => main.foodName).join('、');
        // })
        // list.recommendList[0].allQuality = list.recommendList[0].setMealDateils.reduce((all, item) => (all + item.num * item.quality), 0)
        
        that.setData({
          list,
          // imgUrls: list.recommendList[0].slideShowImgUrl,
        })
        this.totalEnergy()
        this.totalScore()
      })
      .catch(error => {

      })
  },
  // 删除菜品
  delete(e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    list.recommendList[0].setMealDateils.splice(index,1)
    this.setData({
      list
    })
    this.totalEnergy()
    this.totalScore()
  },
  // 添加菜品
  addSku: isLoginClick(function() {
    let obj = {
      code: this.data.code, // 套餐推荐的目录code
      id: this.data.id,
      orderMethod: this.data.orderMethod,
      dateTime: this.data.dateTime,
      category: this.data.category,
      heatId: this.data.heatId,
      comboId: this.data.comboid,
      corpId: this.data.id>10000?this.data.corpId:null,
      addressId: this.data.addressId,
    }
    wx.navigateTo({
      url: `/pages/packageOrder/addSku/addSku?params=${JSON.stringify(obj)}`
    })
  }),
  // 总能量
  totalEnergy() {
    const {
      list,
    } = this.data;
    const skuList = list.recommendList[0].setMealDateils;
    let totalEnergy = 0;
    skuList.forEach((item) => {
      totalEnergy = totalEnergy + item.energy
    })
    this.setData({
      totalEnergy
    })
  },
  // 营养健康分
  totalScore() {
    const {
      subInfo,
      category,
      dateTime,
      uid,
      list,
    } = this.data;
    // 获取所有菜品的cid
    const skuList = list.recommendList[0].setMealDateils;
    let cidList = {};
    skuList.forEach((item) => {
      if(cidList[item.cid]) {
        cidList[item.cid] ++
      } else {
        cidList[item.cid] = item.num;
      } 
    })
    this.setData({
      cidList
    })

    apiRequest
      .queryUserNutritionHealthScore({
        infoComposeList: [{
          fromUid: subInfo.tsuSubUid || uid,
          payFlag: false,
          category,
          orderDate: dateTime,
          cidList,
        }]
      })
      .then(res => {
        if (res.errCode === 0) {
          const {nutritionHealthScoreForms: scoreForms} = res.obj;
          this.setData({
            totalScore: scoreForms[0].totalScore || 0
          })
        }
      })
  },
  // 提交保存
  submit() {
    let {list} = this.data;
    if(list.recommendList[0].setMealDateils.length == 0) {
      return;
    }
    const skuList = list.recommendList[0].setMealDateils;
    // let cidArr = [];
    let cidArr = skuList.map(item => item.cid)
    apiRequest.editMealPackage({
      id: this.data.id, //套餐id
      skuArr: cidArr,  // 用户操作后的商品列表，Key = 菜品的cid (String)； Value = 菜品数量
      dateTime: this.data.dateTime, // 点餐日期
      hpid: this.data.heatId,
      category: this.data.category,
      code: this.data.code, // 当前套餐归属的是那个目录 比如 "00" = 新品套餐...
    })
      .then(res => {
        if(res.errCode == 0) {
          if(res.obj.resultFlag) {
            wx.showToast({
              title: '修改成功',
              icon: 'none',
            });
            this.back() 
          } else {
            wx.showToast({
              title: '修改失效',
              icon: 'none',
            });
          }
        }
      })
      .catch(error => {

      })
  },
  // 返回
  back() {
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packageOrder/goodsDetail/goodsDetail'
    );
    const prepage = pages[index];
    prepage.queryComo('replace')
    wx.navigateBack({
      delta: pages.length - (index + 1)
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
  onShareAppMessage: function () {

  }
})