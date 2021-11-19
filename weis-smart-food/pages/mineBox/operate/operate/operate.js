// pages/mineBox/operate/operate/operate.js
import apiRequest from '../../../../service/index';
import { getStorage } from '../../../../utils/storage';
import {
  isLoginClick,
  loginPromise,
} from '../../../../utils/common'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 底部选项
    tabBar: [
      {text: '商品', icon: 'https://prodstatic.weis1606.cn/api/smartFood/operate_goods.png', iconSelect: 'https://prodstatic.weis1606.cn/api/smartFood/operate_goods_select.png', value: 0},
      {text: '订单', icon: 'https://prodstatic.weis1606.cn/api/smartFood/operate_order.png', iconSelect: 'https://prodstatic.weis1606.cn/api/smartFood/operate_order_select.png', value: 1},
    ],
    tabBarValue: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
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
    this.tarBarLogic()

    // 登录
    let {options} = this.data;
    loginPromise.then((res) => {
      let loginInfo = getStorage('loginInfo');
      let uid = res.uid;
      this.setData({
        isLogin: loginInfo.isLogin && loginInfo.isAuthorized && loginInfo.isPerProfile ? true : false,
        uid,
      })
      if (loginInfo.isLogin && loginInfo.isAuthorized && loginInfo.isPerProfile) {
        if (options.boxtype == 'share' && options.invitedUid != uid) {
          this.addOperatedActivityInvited()
          return;
        }
        if(options.boxtype == 'checkOrder') {
          this.setData({
            tabBarValue: 1
          })
        }
      }
    })
  },
  // 运营页面-分享加记录
  addOperatedActivityInvited() {
    const { options, uid} = this.data;
    apiRequest.addOperatedActivityInvited({
      avInvitedUid: options.invitedUid, // 分享的用户
      avBeInvitedUid: uid, // 点击的用户
      avActivityId: options.id // 活动标识id
    }).then(res => {
      
    }).catch(error => { })
  },
  // 底部-选项
  tabBar(e) {
    const {value} = e.currentTarget.dataset;
    this.setData({
      tabBarValue: value
    }, () => {
      this.tarBarLogic()
    })
  },
  // tabBar页面改变的对应操作
  tarBarLogic() {
    let { tabBarValue, options } = this.data;
    if(tabBarValue == 0) {
      // 商品页面-调用初始化数据
      this.goodsPage = this.selectComponent('#goods');
      this.goodsPage.init(options)
      // 禁用顶部分享按钮
      wx.hideShareMenu()
    }else {
      // 允许顶部分享按钮
      wx.showShareMenu()
    }
  },
  // 商品页面-调用立即购买
  pay() {
    let goodsPage = this.selectComponent('#goods');
    goodsPage.pay()
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
  onShareAppMessage: function (e) {
    if(!this.data.isLogin) {
      return;
    }
    if( this.data.tabBarValue == 0) {
      const info = e.target?e.target.dataset.sharemodel:this.goodsPage.data.shareModel;
      return {
        title: info.title,
        imageUrl: info.imageUrl,
        path: info.path,
      }
    }
  }
})