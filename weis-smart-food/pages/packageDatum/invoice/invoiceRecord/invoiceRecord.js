// pages/packageDatum/invoice/invoiceRecord/invoiceRecord.js
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
    pageSize: 15,
    pageNo: 0,
    more: true,
    status: {
      '00': '待开票',
      '10': '开票中',
      '20': '已开票',
      '99': '开票失败'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    if(this.data.invoiceArr && this.data.invoiceArr.length >= 0){
      this.setData({
        pageNo: 0,
        invoiceArr: null,
      })
    }
    if(!this.data.more){
      this.setData({
        more: true,
      })
    }
    this.queryInvoiceRecordList();
  },

  queryInvoiceRecordList(){
    
    let {
      pageSize,
      more,
    } = this.data;
    if (more == false) {
      return
    }
    this.data.pageNo++
    apiRequest.queryInvoiceRecordList({
      pageSize: pageSize,
      pageNo: this.data.pageNo,
    }).then((res)=>{
      if (res.obj.pageCount == 0 || res.obj.pageCount == this.data.pageNo) {
        this.setData({
          more: false
        })
      }
      let invoiceArr = this.data.invoiceArr || [];
      let invoiceRecordList = res.obj && res.obj.invoiceRecordList || [];
      invoiceRecordList.forEach((item,index)=>{
        const dateStr = day(item.createTime).format('YYYYMM');
        const idx = invoiceArr.map(im => im.dateStr).indexOf(dateStr);
        item.createDate = day(item.createTime).format('YYYY年MM月DD日 HH:mm');
        item.recordDetails.forEach((im)=>{
          im.date = day(im.tirdOrderDate).format('YYYY年MM月DD日')
          im.categoryText = {
            '01': '早餐',
            '02': '午餐',
            '03': '晚餐',
          }[im.tirdOrderCategory]
        })
        if(idx == -1){
          const obj = {
            dateStr,
            date: day(item.createTime).format('YYYY年MM月'),
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

  detail(e){
    let invoiceArr = this.data.invoiceArr;
    let {index1,index2} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/packageDatum/invoice/invoiceDetail/invoiceDetail',
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          invoice: invoiceArr[index1].list[index2]
        });
      },
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
      this.queryInvoiceRecordList()
    },300)
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})