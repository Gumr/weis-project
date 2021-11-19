// pages/packageOrder/switchHpid/switchHpid.js
const location = require('../../../libs/location');
const app = getApp();
import day from '../../../libs/day'
import apiRequest from '../../../service/index';
import {
  sortStatus
} from '../../../utils/map'
import {
  debounce,
} from '../../../utils/throttle';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sortStatus,
    navHeight: wx.getSystemInfoSync().system.indexOf('iOS') > -1 ? 44 : 48, //状态栏高度,
    typeList: [{
      name: '地址'
    }, {
      name: '店面'
    },{
      name: '自动售卖机'
    }],
    typeIndex: 0,
    cityList: ['深圳','广州', '东莞'],
    city: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const that = this;
    const eventChannel = this.getOpenerEventChannel();
    if(eventChannel.on){
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      eventChannel.on('acceptDataFromOpenerPage', function(data) {
        that.setData({
          typeIndex: data.index
        })
      })
    }
    this.setData({
      statusHeight: wx.getStorageSync('navStatusHeight'), //状态栏高度,
    })
    // 获取当前位置
    await this.location();
    this.queryHpidList(this.data.currenTPlace.location.lat, this.data.currenTPlace.location.lng,this.data.currenTPlace);
    if(this.data.typeIndex == 2 && !this.data.allMachine){
      this.queryMachineList()
    }
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
    this.addressList()
  },

  add(){
    wx.navigateTo({
      url: '/pages/packageOrder/addAddress/addAddress',
      success: (result) => {
        
      },
      fail: () => {},
      complete: () => {}
    });
      
  },

  selectCity(e){
    let selectCt = e.currentTarget.dataset.city;
    let city = this.data.city;
    if(selectCt == city){
      this.setData({
        showCity: false
      })
      return
    }
    if(this.data.searchKeyword){
      this.setData({
        searchKeyword: '',
        searchAddressList: [],
      })
    }
    this.setData({
      showCity: false,
      city: selectCt
    })
    this.filterHpid();
    this.filterMachine();
  },

  filterHpid(){
    let allHpid = this.data.allHpid;
    let city = this.data.city;
    let filterHpidList = allHpid.filter((item)=>{
      return item.city.indexOf(city) >= 0
    })
    this.setData({
      hpidList: filterHpidList
    })
  },

  filterMachine(){
    let allMachine = this.data.allMachine || [];
    let city = this.data.city;
    let filterMachineList = allMachine.filter((item)=>{
      return item.city.indexOf(city) >= 0
    })
    this.setData({
      machineList: filterMachineList
    })
  },

  showCity(){
    this.setData({
      showCity: !this.data.showCity
    })
  },

  location() {
    let that = this;
    wx.showLoading({
      title: '定位中...',
      mask: true,
    }); 
    return new Promise((resolve) => {
      location.getCity(function (res) {
        let index = that.request ? Math.floor(Math.random()*5) : 0;
        that.request = true;
        let address = res.result.pois[index] || {
          address: res.result.address,
          title: res.result.address,
          location: res.result.location
        };
        address.address = address.ad_info && address.ad_info.province ? `${address.ad_info.province+address.ad_info.city+address.ad_info.district+address.address}` : address.address;
        // console.log(address)
        that.setData({
          currenTPlace: address,
          city: address.ad_info ? (address.ad_info.city.indexOf('广州') >= 0 ? '广州' : address.ad_info.city.indexOf('东莞') >= 0 ? '东莞' : '深圳') : '深圳'
        })
        resolve()
      }, 'address');
      setTimeout(()=>{
        wx.hideLoading();
      },800)
    })
  },

  queryHpidList(lat, lon, address) {
    console.log(address)
    let that = this;
    let city = this.data.city;
    apiRequest.heatingPointListForRange({
        userLat: lat,
        userLng: lon,
        showAll: true,
        showScope: true,
        key: 'cutAddress',
        userAddr: `${address.address}`
      })
      .then(res => {
        let hpidList = res.obj.dtos;
        hpidList.forEach((item,index)=>{
          item.stime = item.stime.substring(0, 2) + ':' + item.stime.substring(2, 4)
          item.etime = item.etime.substring(0, 2) + ':' + item.etime.substring(2, 4)
          if(!item.hotFlag && (item.selfTaking == 0 || item.selfTaking == 1)){
            // 定位地址匹配加热点 改为热配
            item.hotFlag = true;
          }
        })
        let filterHpidList = hpidList.filter((item)=>{
          return item.city.indexOf(city) >= 0
        })
        this.setData({
          hpidList: filterHpidList,
          allHpid: hpidList,
        })
      })
      .catch(error => {

      })
  },

  addressList() {
    apiRequest.queryAddressListForThree({
        sortNum: '',
        dataStt: '',
        businessType: '00',
      })
      .then((res) => {
        let addressList = res.obj.addressInfos || [];
        this.setData({
          addressList,
        });
      })
      .catch((error) => {});
  },

  // 查询贩卖机列表
  queryMachineList(latitude, longitude, addressInfo){
    let that = this;
    let city = this.data.city;
    let lat = latitude || this.data.currenTPlace.location.lat;
    let lng = longitude || this.data.currenTPlace.location.lng;
    let address = addressInfo || this.data.currenTPlace;
    apiRequest.heatingPointListForRange({
        userLat: lat,
        userLng: lng,
        showAll: true,
        showScope: true,
        key: 'switchMachine',
        userAddr: `${address.address}`,
        shopType: 20,//机器
      })
      .then(res => {
        let hpidList = res.obj.dtos || [];
        hpidList.forEach((item,index)=>{
          item.stime = item.stime.substring(0, 2) + ':' + item.stime.substring(2, 4)
          item.etime = item.etime.substring(0, 2) + ':' + item.etime.substring(2, 4)
        })
        let filterMachineList = hpidList.filter((item)=>{
          return item.city.indexOf(city) >= 0
        })
        this.setData({
          machineList: filterMachineList,
          allMachine: hpidList,
        })
      })
      .catch(error => {

      })
  },

  cutType(e) {
    let index = e.currentTarget.dataset.index;
    if (index == this.data.typeIndex) {
      return
    }
    this.setData({
      typeIndex: index,
      searchKeyword: '',
      searchAddressList: []
    })
    if(!this.data.allMachine && index == 2){
      this.queryMachineList()
    }
  },

  inputchange: debounce(400, function (e) {
    // console.log(e)
    let that = this;
    that.setData({
      searchKeyword: e.detail.value,
    })
    if (this.data.searchKeyword) {
      location.getsuggest(function (res) {
        let searchAddressList = res.data.slice(0, 10).sort((a, b) => a._distance - b._distance);
        that.setData({
          searchAddressList,
        })
      }, e.detail.value, that.data.city, {
        lat: app.globalData.lat,
        lng: app.globalData.lon,
      })
    } else {
      that.setData({
        searchAddressList: []
      })
    }
  }),

  phone(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: String(phone),
    });
  },

  // 加热点地址弹窗-导航（已过）
  goMap(e) {
    wx.openLocation({
      latitude: Number(e.currentTarget.dataset.lat),
      longitude: Number(e.currentTarget.dataset.lon),
      scale: 18,
      name: e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
    });
  },

  // 选择当前定位地址
  sureAdd(){
    let currenTPlace = this.data.currenTPlace;
    // 切换城定位地址
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('switchLocation', {data: currenTPlace});
    wx.navigateBack({
      delta: 1
    }); 
  },

  sureAddress(e){
    let {searchAddressList, typeIndex} = this.data;
    let index = e.currentTarget.dataset.index;
    if(typeIndex == 2){
      // 贩卖机
      let selectSearchAddress = searchAddressList[index];
      let searchKeyword = selectSearchAddress.title;
      this.setData({
        searchAddressList: [],
        selectSearchAddress,
        searchKeyword,
      })
      this.queryMachineList(selectSearchAddress.location.lat, selectSearchAddress.location.lng, selectSearchAddress)
    }else if(typeIndex == 1){
      // 门店
      let selectSearchAddress = searchAddressList[index];
      let searchKeyword = selectSearchAddress.title;
      this.setData({
        searchAddressList: [],
        selectSearchAddress,
        searchKeyword,
      })
      this.queryHpidList(selectSearchAddress.location.lat, selectSearchAddress.location.lng, selectSearchAddress)
    }else{
      // 切换城定位地址
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.emit('switchLocation', {data: searchAddressList[index]});
      wx.navigateBack({
        delta: 1
      }); 
    }
  },

  // 选择收货地址
  select(e){
    let addressList = this.data.addressList;
    let index = e.currentTarget.dataset.index;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('switchAdd', {data: addressList[index]});
    wx.navigateBack({
      delta: 1
    }); 
  },

  // 选择加热点
  selectHpid(e){
    let {shopType ,index} = e.currentTarget.dataset;
    let {hpidList, machineList} = this.data;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('switchhpid', {data: !shopType || shopType == 10 ? hpidList[index] : machineList[index]});
    wx.navigateBack({
      delta: 1
    }); 
  },

  goImg(e){
    let {machineList} = this.data;
    let {index} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/packageOrder/storeImg/storeImg',
      success: (result) => {
        // 通过eventChannel向被打开页面传送数据
        result.eventChannel.emit('acceptDataFromOpenerPage', {
          machineInfo: machineList[index],
        });
      },
      fail: () => {},
      complete: () => {}
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