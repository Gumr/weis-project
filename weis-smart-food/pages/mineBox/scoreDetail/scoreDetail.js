// pages/mineBox/scoreDetail/scoreDetail.js
import day from '../../../libs/day'
import { isTableware } from '../../../utils/common'
import { scoreType } from '../../../utils/map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scoreType,
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('data', (todayTotalMap) => {
      console.log(todayTotalMap)
      let list = [];
      for (let key in todayTotalMap) {
        let obj = {
          date: day(key).format('MM月DD日'),
          dateTime: day(key),
          detail: todayTotalMap[key]
        }
        obj.val = todayTotalMap[key].reduce((acc, cur)=>acc + Number(cur.scoreValue), 0)
        list.push(obj)
       }
       list = list.sort((a, b) => b.dateTime - a.dateTime);
       this.setData({
         list
       })
    })
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

  open(e){
    let list = this.data.list;
    let index = e.currentTarget.dataset.index;
    list.forEach((item,idx)=>{
      if(idx == index){
        list[index].openBox = !list[index].openBox;
      }else{
        item.openBox = false;
      }
    })
    this.setData({
      list
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
  onShareAppMessage: function () {

  }
})