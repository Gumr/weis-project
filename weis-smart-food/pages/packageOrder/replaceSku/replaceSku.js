// pages/packageOrder/replaceSku/replaceSku.js
let app =  getApp();
import day from '../../../libs/day'
import apiRequest from '../../../service/index';
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../../utils/storage'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    px2rpx: app.globalData.px2rpx,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const mobileInfo = wx.getSystemInfoSync();
    const navStatusHeight = getStorage('navStatusHeight');
    let scrollHeight = (mobileInfo.windowHeight - navStatusHeight) * this.data.px2rpx;
    this.setData({
      scrollHeight,
      date: options.date,
      category: options.category,
    })
    const pages = getCurrentPages();
    const prePage = pages.find(page => page.route === 'pages/packageOrder/moreMealDetail/moreMealDetail');
    const {selectIndex, cateIndex, dataObj} = prePage.data;
    this.orderTimes = prePage.data.dataInfo.tmfcDayNum * prePage.data.dataInfo.tmfcMealNum;
    this.skuList = dataObj.skuList[selectIndex].list[cateIndex].list.getCategoryList;
    this.querySaleGoodsForThree();
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

  querySaleGoodsForThree(){
    apiRequest.querySaleGoodsForThree({
      dateTime: day(this.data.date).format('YYYYMMDD'),
      category: this.data.category,
      orderMethod: '01',
      hpid: 100000,
      addressId: 0,
      version: "01",
      refreshStt: false,
      shopType: '10',
    })
    .then(res => {
      let resultList = res.obj && res.obj.resultList || [];
      let skuList = this.skuList;
      skuList.forEach((item)=>{
        sku: for(var i = 0; i < resultList.length; i++){
          for(var j = 0; j < resultList[i].detailList.length; j++){
            if(item.cid === resultList[i].detailList[j].cid){
              resultList[i].detailList[j].num += item.num;
              break sku
            }
          }
        }
      });
      this.setData({
        resultList,
      })
      this.countPrice();
    })
    .catch(error => {

    })
  },

  tapAdd(e){
    this.setData({
      resultList: e.detail.value
    })
    this.countPrice();
  },

  // 计算总价格
  countPrice(){
    let resultList = this.data.resultList;
    let allSku = [];
    let cateringShoppingCart = [];
    resultList.forEach((item1,index1)=>{
      item1.detailList.forEach((item2)=>{
        if(item2.num > 0){
          allSku.push(item2)
        }
      })
    })
    const totalNum = allSku.reduce((num, item) => {
      num += item.num
      return num;
    }, 0);
    this.setData({
      allSku,
      totalNum,
    })
    if(allSku.length > 0){
      allSku.forEach((item)=>{
        let obj = {
          cid: item.cid,
          num: item.num,
          date: this.data.date,
          category: this.data.category,
        }
        cateringShoppingCart.push(obj)
      })
      apiRequest.getMuchFoodTotalPrice({
        cateringShoppingCart,
        orderTimes: this.orderTimes
      }).then((res)=>{
        this.setData({
          countPrice: res.obj.countPrice,
          totalAmount: res.obj.totalAmount,
        })
      })
    }else{
      this.setData({
        countPrice: 0,
        totalAmount: 0,
      })
    }
  },

  confirmChangeFn(){
    let {allSku,totalNum, countPrice, totalAmount} = this.data;
    // 确认更换
    const pages = getCurrentPages();
    const prePage = pages.find(page => page.route === 'pages/packageOrder/moreMealDetail/moreMealDetail');
    prePage.changeSku(allSku, totalNum, countPrice, totalAmount)
    wx.navigateBack({
      delta: 1
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