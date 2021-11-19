// components/cp-login-coupon/cp-login-coupon.js
import {
	setStorage,
  getStorage,
  removeStorage
} from '../../utils/storage'
import apiRequest from '../../service/index';
import day from '../../libs/day'
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  pageLifetimes:{
    show(){
      this.init()
    },
  },

  ready(){
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(){
      let loginInfo = getStorage('loginInfo');
      const coupon = getStorage('loginCoupon')
      this.setData({
        loginInfo,
        coupon,
      })
      removeStorage('loginCoupon');
      if(coupon && coupon.length > 0){
        this.triggerEvent('coupon', true);
      }
    },
    toQuestion() {
      wx.navigateTo({
        url: '/pages/mineBox/question/question',
      });
      this.close()
    },
    close(){
      this.setData({
        coupon: []
      })
      this.triggerEvent('coupon', false);
    },
  }
})
