// pages/mineBox/groupAddressList/index.js
import apiRequest from '../../../service/index';
import {
  getStorage,
  removeStorage
} from '../../../utils/storage';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    corpAddress: [],//分公司信息
    selectMeals: false,
    showPopup: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  //  debugger
    this.setData({
      corpId: options.corpId,
      subInfo: getStorage('subInfo'),
      tgerole:options.tgerole,
      tgeintertype:options.tgeintertype,  
      tgctype: options.tgctype //企业类型 00对公 01对私
    })
    this.getMyAddress()
    this.queryUserInfo()

  },
  queryUserInfo() {
    apiRequest.getUserListForSubUser({
    }).then((res)=>{
     this.setData({
      userInfo:res.obj.userResult
     })
    })
  },

  getMyAddress() {
    apiRequest.queryComBranchCorpList({
      corpId: this.data.corpId,
      tgcllType: '01' //00 列表 01搜索
    }).then((res) => {
      this.setData({
        corpAddress: res.obj.corpAddress
      })

    })

  },
  cancelbtn() {
    this.setData({
      showPopup:false
    })

  },
  changeUser() {
    removeStorage('subToken');
    removeStorage('subInfo');
    if (this.data.tgcaEmpId>0) {
      wx.navigateTo({
        url:'/pages/mineBox/groupSelType/groupSelType?tgcaId=' + this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type
      })
    } else {
      wx.navigateTo({
        url: '/pages/mineBox/groupSelectMeal/index?tgcaId=' + this.data.tgcaId + '&corpId=' + this.data.corpId + '&type=' + this.data.type
      })

    }

  },

  toresever(e) { 
   let subToken= getStorage('subToken')

    let tgcaId = e.currentTarget.dataset.tgcaId
    let tgcAreaType = e.currentTarget.dataset.tgcareatype
    let type = e.currentTarget.dataset.type ? e.currentTarget.dataset.type : ''
 
    let tgcaEmpId =  e.currentTarget.dataset.tgcaempid ? e.currentTarget.dataset.tgcaempid : ''
    this.setData({
      tgcaId:tgcaId,
      tgcAreaType:tgcAreaType,
      type:type,
      tgcaEmpId:tgcaEmpId

    })
        
    apiRequest.querySaveGroupCorpLoginLog({

      tgcllGroupCorpId: tgcaId,
      tgcllType: '01' //00 列表 01搜索

    }).then((res) => {
    })


   if (subToken && (this.data.tgerole == '00' && (this.data.tgeintertype == '01' || tgcaEmpId>0))) {//幼教类型子账号需切换成主账号
    this.setData({    
      subToken:subToken,
      showPopup:true,    
    })
    return
   } 
   if (this.data.tgerole == '00' && (this.data.tgeintertype == '01'|| tgcaEmpId>0) && this.data.tgcAreaType == '01') { // 企业接口人 && 校区接口人 ||子账号接口人 && 幼教类型企业
        wx.navigateTo({
          url: '/pages/mineBox/groupSelType/groupSelType?tgcaId=' + tgcaId + '&corpId=' + this.data.corpId + '&type=' + type+'&tgerole='+this.data.tgerole+'&tgcaEmpId='+this.data.tgcaEmpId
        })
    }
   else{
      wx.navigateTo({
        url: '/pages/mineBox/groupSelectMeal/index?tgcaId=' + tgcaId + '&corpId=' + this.data.corpId + '&type=' + type
      })

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