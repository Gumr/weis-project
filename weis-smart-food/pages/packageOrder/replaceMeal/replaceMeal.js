// pages/packageOrder/replaceMeal/replaceMeal.js
import day from '../../../libs/day';
import apiRequest from '../../../service/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNo: -1,
    more: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      date: options.date,
      category: options.category
    })
    const pages = getCurrentPages();
    const prePage = pages.find(page => page.route === 'pages/packageOrder/moreMealDetail/moreMealDetail');
    this.orderTimes = prePage.data.dataInfo.tmfcDayNum * prePage.data.dataInfo.tmfcMealNum;
    this.getGenerateSingleMeal();
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

  getGenerateSingleMeal(){
    let {date, category, more} = this.data;
    if(!more){
      return
    }
    this.data.pageNo++
    apiRequest.getGenerateSingleMeal({
      dateTime: day(date).format('YYYYMMDD'),
      category,
      hpid: 100000,
      addressId: 0,
      shopType: '10',
      pageNum: this.data.pageNo,
      pageSize: 10,
      locationType: '01',
      orderTimes: this.orderTimes
    }).then((res)=>{
      let dietSetMeals = res.obj.dietSetMeals;
      let recomMealList = this.data.recomMealList || [];
      const list = dietSetMeals.reduce((arr, item) => {
        arr = arr.concat(item.dietSetMeals)
        return arr;
      }, []);
      recomMealList = recomMealList.concat(list);
      if(list.length == 0){
        this.setData({
          more: false,
        })
      }
      this.setData({
        recomMealList,
      })
    })
  },

  add(e){
    let {type, index} = e.currentTarget.dataset;
    let recomMealList = this.data.recomMealList;
    let skuArr = recomMealList[index].setMealDateils;
    let allSku = this.data.allSku || [];
    if(type == 'add'){
      recomMealList[index].num ++;
      skuArr.forEach((item,index)=>{
        let skuIndex = allSku.findIndex( im => im.id == item.id);
        if(skuIndex >= 0){
          allSku[skuIndex].num += item.num
        }else{
          allSku.push({...item})
        }
      })
    }else{
      recomMealList[index].num --;
      skuArr.forEach((item,index)=>{
        let skuIndex = allSku.findIndex( im => im.id == item.id);
        allSku[skuIndex].num -= item.num;
        if(allSku[skuIndex].num == 0){
          allSku.splice(skuIndex,1); 
        }
      })
    }
    const totalNum = allSku.reduce((num, item) => {
      num += item.num
      return num;
    }, 0);
    this.setData({
      allSku,
      recomMealList,
      totalNum,
    })
    if(allSku.length == 0){
      this.setData({
        countPrice: 0,
        totalAmount: 0,
      })
      return
    }
    this.getMuchFoodTotalPrice();
  },

  // 计算价格
  getMuchFoodTotalPrice(){
    let allSku = this.data.allSku || [];
    let cateringShoppingCart = [];
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
    this.getGenerateSingleMeal();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})