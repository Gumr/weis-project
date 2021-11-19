// pages/packageDatum/invoice/invoicing/invoicing.js
import { t, round } from '../../../../utils/common';
import apiRequest from '../../../../service/index';
import day from '../../../../libs/day';
import {
  debounce,
} from '../../../../utils/throttle';
const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
const emailReg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: [{
      name: '企业单位'
    },{
      name: '个人/非企业'
    }],
    selectIndex: 0,//企业单位 个人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const eventChannel = this.getOpenerEventChannel();
    if(eventChannel.on){
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('acceptDataFromOpenerPage', function(data) {
        const selectOrder = data.selectOrder;
        const totalPrice = selectOrder.reduce((price, item) => price + item.invoicedAmount, 0)
        that.setData({
          selectOrder,
          totalPrice: round(totalPrice,2)
        })
      })
    }
    let invoiceStorage = wx.getStorageSync('invoiceInfo') || {};
    this.setData({
      selectIndex: invoiceStorage.selectIndex || 0,
      rise: invoiceStorage.rise || '',
      dutyNo: invoiceStorage.dutyNo || '',
      mark: invoiceStorage.mark || '',
      name: invoiceStorage.name || '',
      phone: invoiceStorage.phone || '',
      email: invoiceStorage.email || '',
      code: invoiceStorage.code || ''
    })
    this.checkFormat()
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

  // 切换类型 个人 企业
  switchType(e){
    let selectIndex = this.data.selectIndex;
    let index = e.currentTarget.dataset.index;
    if(index == selectIndex){
      return
    }
    this.setData({
      selectIndex: index
    })
    this.checkFormat()
  },

  // 一键导入微信开票信息
  toWechat(){
    const that = this;
    wx.chooseInvoiceTitle({
      success: (res) => {
        console.log(res)
        if(res.errMsg == 'chooseInvoiceTitle:ok'){
          that.setData({
            selectIndex: res.type,
            rise: res.title,
            dutyNo: res.type == 0 ? res.taxNumber : '',
          })
          wx.showToast({
            title: '导入成功',
            icon: 'success',
          });
          that.checkFormat() 
        }
      },
      fail: (res) => {
        console.log(res)
        wx.showToast({
          title: '导入失败',
          icon: 'error',
        }); 
      },
      complete: () => {}
    });
  },

  // 发票抬头
  getInput: debounce(400, function (e) {
    this.setData({
      rise: e.detail.value,
      code: '',
    })
    this.checkFormat()
    if(this.data.selectIndex == 0){
      this.queryInvoiceCropList()
    }
  }),

  // 企业税号
  getDutyNo(e){
    this.setData({
      dutyNo: e.detail.value
    })
    this.checkFormat()
  },

  // 备注信息
  getMark(e){
    this.setData({
      mark: e.detail.value
    })
  },

  // 收件人姓名
  getName(e){
    this.setData({
      name: e.detail.value
    })
    this.checkFormat()
  },

  // 手机号
  getPhone(e){
    this.setData({
      phone: e.detail.value
    })
    this.checkFormat()
  },

  // 邮箱
  getEmail(e){
    this.setData({
      email: e.detail.value
    })
    this.checkFormat()
  },

  checkFormat(){
    let {selectIndex, rise, dutyNo, name, phone, email} = this.data;
    this.setData({
      checkSucc: selectIndex == 0 ? Boolean(rise && dutyNo && name && phoneReg.test(phone) && emailReg.test(email)) : Boolean(rise && name && phoneReg.test(phone) && emailReg.test(email))
    })
  },

  upload(){
    let {checkSucc, name, phone, email} = this.data;
    if(!checkSucc){
      if(!name){
        wx.showToast({
          title: '收件人信息未完善',
          icon: 'none',
        });  
      }else if(!phoneReg.test(phone)){
        wx.showToast({
          title: '手机号码格式不正确',
          icon: 'none',
        });  
      }else if(!emailReg.test(email)){
        wx.showToast({
          title: '电子邮箱格式不正确',
          icon: 'none',
        });  
      }
      return
    }
    this.setData({
      showSure: true
    })
  },

  closeTap(){
    this.setData({
      showSure: false
    })
  },

  submit(){
    let {selectIndex, rise, dutyNo, mark, name, phone, email, totalPrice, checkSucc, selectOrder, code} = this.data;
    let orderIds = selectOrder.map(im => im.orderId);
    apiRequest.createInvoiceRecord({
      tirType: '00',//发票类型
      tirRiseType: selectIndex == 0 ? '00' : '01', //00企业 01个人
      tirRise: rise, //抬头
      tirDutyNo: dutyNo, //税号
      tirContent: '餐饮费', //发票内容
      tirAmount: totalPrice,//发票金额
      tirRemark: mark, //备注信息
      tirUname: name, //姓名
      tirPhone: phone, //发票接收手机号
      tirEmail: email, //发票接收邮箱地址
      orderIds,
      code: code || undefined,
    }).then((res)=>{
      if(res.errCode == 0){
        this.setData({
          showSure: false,
        })
        this.reLoad();
        wx.redirectTo({
          url: '/pages/packageDatum/invoice/invoiceSucc/invoiceSucc',
        });
        // 缓存到本地
        const invoiceInfo = {
          selectIndex,
          rise,
          dutyNo: selectIndex == 0 ? dutyNo : '',
          mark,
          name,
          phone,
          email,
          code: code || '',
        }
        wx.setStorageSync('invoiceInfo', invoiceInfo);
      }
    })
  },

  // 开发票页面reload 重新加载数据
  reLoad(){
    //设置上一个页面中的数据
    const pages = getCurrentPages()
    const index = pages.findIndex(
      page => page.route === 'pages/packageDatum/invoice/drawBill/drawBill'
    );
    const prepage = pages[index];
    prepage.setData({
      pageNo: 0,
      invoiceArr: [],
      selectArr: [],
      totalPrice: 0,
    });
    if(!prepage.data.more){
      prepage.setData({
        more: true,
      })
    }
    prepage.queryOrderListForInvoice();
  },

  // 获取企业开票列表
  queryInvoiceCropList(){
    apiRequest.queryInvoiceCropList({
      keyWord: this.data.rise
    }).then((res)=>{
      this.setData({
        cropList: res.obj && res.obj.datas || [],
      })
    })
  },

  // 查询税号
  selectCrop(e){
    let code = e.currentTarget.dataset.code;
    apiRequest.queryInvoiceCropDetail({
      code,
    }).then((res)=>{
      this.setData({
        rise: res.obj.datas.name,
        dutyNo: res.obj.datas.taxNo,
        cropList: [],
        code,
      })
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
  // onShareAppMessage: function () {

  // }
})