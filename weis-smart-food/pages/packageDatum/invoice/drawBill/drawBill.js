// pages/packageDatum/invoice/drawBill/drawBill.js
import {
  getStorage,
  setStorage
} from '../../../../utils/storage'
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
import { t, round } from '../../../../utils/common';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navStatusHeight: getStorage('navStatusHeight'),
    pageSize: 10,
    pageNo: 0,
    more: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryOrderListForInvoice();
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

  queryOrderListForInvoice(){
    let {
      pageSize,
      more,
    } = this.data;
    if (more == false) {
      return
    }
    this.data.pageNo++
    apiRequest.queryOrderListForInvoice({
      pageSize: pageSize,
      pageNo: this.data.pageNo,
    }).then((res)=>{
      if (res.obj.responseBeanDataPage.pageCount == 0 || res.obj.responseBeanDataPage.pageCount == this.data.pageNo) {
        this.setData({
          more: false
        })
      }
      let invoiceArr = this.data.invoiceArr || [];
      let record = res.obj && res.obj.responseBeanDataPage.record || [];
      record.forEach((item,index)=>{
        const dateStr = day(item.orderDate).format('YYYYMM');
        const idx = invoiceArr.map(im => im.dateStr).indexOf(dateStr);
        record[index].orderStr = day(item.orderDate).format('YYYY年MM月DD日');
        if(idx == -1){
          const obj = {
            dateStr,
            date: day(item.orderDate).format('YYYY年MM月'),
            list: [item],
          };
          invoiceArr.push(obj);
        }else{
          invoiceArr[idx].list.push(item)
        }
      })
      this.setData({
        invoiceArr,
      })
    })
  },

  select(e){
    console.log(e)
    let selectArr = this.data.selectArr || [];
    let invoiceArr = this.data.invoiceArr;
    let {dateIndex,index} = e.currentTarget.dataset;
    if(invoiceArr[dateIndex].list[index].invoiced || invoiceArr[dateIndex].list[index].invoicedAmount == 0){
      return
    }
    if(selectArr.length == 50){
      wx.showToast({
        title: '限每次开票50单',
        icon: 'error',
      });
      return
    }
    invoiceArr[dateIndex].list[index].selected = !invoiceArr[dateIndex].list[index].selected;
    // 计算选中餐单
    if(invoiceArr[dateIndex].list[index].selected){
      selectArr.push(invoiceArr[dateIndex].list[index])
    }else{
      const idx = selectArr.map(im => im.orderId).indexOf(invoiceArr[dateIndex].list[index].orderId);
      selectArr.splice(idx,1);
    }
    const totalPrice = selectArr.reduce((price, item) => price + item.invoicedAmount, 0)
    this.setData({
      invoiceArr,
      selectArr,
      totalPrice: round(totalPrice,2)
    })
  },

  goInvoice(){
    let {totalPrice} = this.data;
    if(!totalPrice || totalPrice < 50){
      return
    }
    wx.navigateTo({
      url: '/pages/packageDatum/invoice/invoicing/invoicing',
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          selectOrder: this.data.selectArr
        });
      },
    });  
  },

  tip(){
    this.setData({
      showDialog: !this.data.showDialog,
    })
  },

  record(){
    wx.navigateTo({
      url: '/pages/packageDatum/invoice/invoiceRecord/invoiceRecord',
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
    setTimeout(()=>{
      this.queryOrderListForInvoice()
    },300)
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})