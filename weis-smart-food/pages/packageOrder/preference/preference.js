// pages/packageOrder/preference/preference.js
import apiRequest from '../../../service/index';
import {preference, } from '../../../utils/map'
import {
  round,
} from '../../../utils/common'
import day from '../../../libs/day'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    preference,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const pages = getCurrentPages()
    this.prePage = pages[pages.length - 2]
    // // 营养素范围
    // this.nutrientRange()
    this.getUserPreferencesLog()
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

  // 控卡点击
  control(){
    // g 转化 kcal 蛋白质 碳水 *4  脂肪*9
    let total = this.prePage.data.total;
    this.setData({
      showControl: true,
      currentData: {
        totalEnergy: Number(total.totalEnergy),
        totalProtein: total.totalProtein,
        totalCarbonwater: total.totalCarbonwater,
        totalFat: total.totalFat,
        protePer: `${round((total.totalProtein*4/total.totalEnergy)*100,0)}`,
        carbPer: `${round((total.totalCarbonwater*4/total.totalEnergy)*100,0)}`,
        fatPer: `${100 - round((total.totalProtein*4/total.totalEnergy)*100,0) - round((total.totalCarbonwater*4/total.totalEnergy)*100,0)}`,
      },
    })
  },

  // 营养素范围
  nutrientRange(){
    let info = this.prePage.data.info;
    let sex = info.userProfile.sex;
    let total = this.prePage.data.total;
    // 能量与三大营养素上限值：
    // 男性：能量300-1000kcal；蛋白质10-60g,脂肪10-40g,碳水化合物30-150g
    // 女性：能量200-800kcal；蛋白质10-40g,脂肪0-30g,碳水化合物20-120g
    let nutrient = {
      minEnergy: sex == 1 ? 300 : 200,
      maxEnergy: sex == 1 ? 1000 : 800,
      minCarbonwater: sex == 1 ? 30 : 20,
      maxCarbonwater: sex == 1 ? 150 : 120,
      minProtein: sex == 1 ? 10 : 10,
      maxProtein: sex == 1 ? 60 : 40,
      minFat: sex == 1 ? 10 : 0,
      maxFat: sex == 1 ? 40 : 30,
    }
    this.setData({
      nutrient,
      total,
    })
  },

  changeRule(e){
    console.log(e)
    let type = e.currentTarget.dataset.type;
    let value = e.detail.value;
    if(e.currentTarget.dataset.reset){
      value = e.currentTarget.dataset.value;
    }
    console.log(value)
    let currentData = this.data.currentData;
    let nutrient = this.data.nutrient;
    this.setData({
      updateType: type,
    })
    switch (type){
      // 能量
      case '01':
        value = value < nutrient.minEnergy ? nutrient.minEnergy : (value > nutrient.maxEnergy ? nutrient.maxEnergy : value);
        this.setData({
          ['currentData.totalEnergy']: value,
          ['currentData.totalProtein']: round(value * (currentData.protePer/100) / 4,0),//蛋白质
          ['currentData.totalCarbonwater']: round(value * (currentData.carbPer/100) / 4,0),//碳水
          ['currentData.totalFat']: round(value * (currentData.fatPer/100) / 9,0),//脂肪
        })
      break;
      // 蛋白质
      case '02':
        value = value < nutrient.minProtein ? nutrient.minProtein : (value > nutrient.maxProtein ? nutrient.maxProtein : value);
        var total = round(value*4 + currentData.totalCarbonwater*4 + currentData.totalFat*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalProtein']: value,//蛋白质
          ['currentData.protePer']: `${round((value*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((currentData.totalCarbonwater*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((value*4/total)*100,0) - round((currentData.totalCarbonwater*4/total)*100,0)}`,//脂肪比例
        })
      break;
      // 碳水
      case '03':
        value = value < nutrient.minCarbonwater ? nutrient.minCarbonwater : (value > nutrient.maxCarbonwater ? nutrient.maxCarbonwater : value);
        var total =  round(currentData.totalProtein*4 + value*4 + currentData.totalFat*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalCarbonwater']: value,//碳水
          ['currentData.protePer']: `${round((currentData.totalProtein*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((value*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((currentData.totalProtein*4/total)*100,0) - round((value*4/total)*100,0)}`,//脂肪比例
        })
      break;
      // 脂肪
      case '04':
        value = value < nutrient.minFat ? nutrient.minFat : (value > nutrient.maxFat ? nutrient.maxFat : value);
        var total = round(currentData.totalProtein*4 + currentData.totalCarbonwater*4 + value*9,0);
        this.setData({
          ['currentData.totalEnergy']: total,
          ['currentData.totalFat']: value,//脂肪
          ['currentData.protePer']: `${round((currentData.totalProtein*4/total)*100,0)}`,//蛋白质比例
          ['currentData.carbPer']: `${round((currentData.totalCarbonwater*4/total)*100,0)}`,//碳水比例
          ['currentData.fatPer']: `${100 - round((currentData.totalProtein*4/total)*100,0) - round((currentData.totalCarbonwater*4/total)*100,0)}`,//脂肪比例
        })
      break;
    }
  },

  hidePopup(){
    this.setData({
      showControl: false
    })
  },

  saveData(){
    let {
      list,
      mealIndex,
    } = this.prePage.data;
    let {updateType, currentData} = this.data;
    apiRequest.changePlanAccordingMeal({
      dateTime: day(list[mealIndex].date).format('YYYYMMDD'),
      category: list[mealIndex].categoryType,
      updateType: updateType == '01' ? '01' : '02',
      totalKcal: currentData.totalEnergy,
      proteinTotal: currentData.totalProtein,
      fatTotal: currentData.totalFat,
      carbohydrateTotal: currentData.totalCarbonwater,
    }).then((res)=>{
      this.hidePopup()
      this.prePage.initPageIndex();
      this.prePage.requestRecom();
      wx.navigateBack({
        delta: 1
      });
    })
  },


  getUserPreferencesLog(){
    let {preference} = this.data;
    let {
      recomList,
      recomIndex,
    } = this.prePage.data;
    apiRequest.getUserPreferencesLog({
      dateTime: day(recomList[recomIndex].date).format('YYYYMMDD'),
      category: recomList[recomIndex].categoryType,
    }).then((res)=>{
      let currLabelSuperBeans = res.obj && res.obj.currLabelSuperBeans || [];
      let userLabelSuperBeans = res.obj && res.obj.userLabelSuperBeans || [];//用户已选择
      currLabelSuperBeans.forEach((item,index)=>{
        currLabelSuperBeans[index].dietaryIntakes.unshift({id: '', name: '不限', checked: true,});
        item.label = preference[item.labelSuperType]
      })
      if(userLabelSuperBeans.length > 0){
        userLabelSuperBeans.forEach((item1,index1)=>{
          item1.dietaryIntakes.forEach((item2,index2)=>{
            // 种类下标(价位 主食 荤菜 素菜)
            let kindIndex = currLabelSuperBeans.findIndex( item => item.labelSuperType == item1.labelSuperType);
            // 选中属性下标（米饭 面条）
            let index = currLabelSuperBeans[kindIndex].dietaryIntakes.findIndex( item => item.id === item2.id);
            if(index >= 0){
              currLabelSuperBeans[kindIndex].dietaryIntakes[index].checked = true;
              if(currLabelSuperBeans[kindIndex].dietaryIntakes[0].checked){
                currLabelSuperBeans[kindIndex].dietaryIntakes[0].checked = false;
              }
            }
          })
        })
      }
      this.setData({
        currLabelSuperBeans
      })
    })
  },

  select(e){
    let {currLabelSuperBeans, } = this.data;
    let {index1, index2} = e.currentTarget.dataset;
    if(currLabelSuperBeans[index1].labelSuperType == '00'){
      // 单选
      currLabelSuperBeans[index1].dietaryIntakes.forEach((item,index)=>{
        if(index == index2){
          item.checked = !item.checked;
        }else{
          item.checked = false;
        }
      })
    }else{
      // 多选
      currLabelSuperBeans[index1].dietaryIntakes.forEach((item,index)=>{
        if(index == index2){
          item.checked = !item.checked;
        }else{
          // 用户选择不限条件
          if(index2  == 0){
            item.checked = false;
          }else{
            // 用户选择其他条件
            currLabelSuperBeans[index1].dietaryIntakes[0].checked = false;
          }
        }
      })
    }
    this.setData({
      currLabelSuperBeans
    })
  },

  // 生成智能套餐
  save(){
    let currLabelSuperBeans = this.data.currLabelSuperBeans;
    let skuFilters = [];
    currLabelSuperBeans.forEach((item1,index1)=>{
      item1.dietaryIntakes.forEach((item2,index2)=>{
        let index = skuFilters.findIndex( item => item.labelSuperType == item1.labelSuperType);
        if(index >= 0 && item2.checked && item2.id !== ''){
          skuFilters[index].dietaryIntakes.push({
            id: item2.id
          })
        }else if(index == -1){
          let obj = {
            dietaryIntakes: [],
            labelSuperType: item1.labelSuperType
          }
          if(item2.checked && item2.id !== ''){
            obj.dietaryIntakes.push({
              id: item2.id
            })
          }
          skuFilters.push(obj)
        }
      })
    })
    this.prePage.initPageIndex();
    this.prePage.getSetMealType();
    this.prePage.requestRecom(skuFilters);
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