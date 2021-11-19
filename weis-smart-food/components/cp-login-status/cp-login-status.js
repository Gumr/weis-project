// components/cp-login-status/cp-login-status.js
import { isLoginClick} from '../../utils/common'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    updateStyle: {
      type: Boolean,
      value: false
    },
    loginInfo: {
      type: Object,
      value: {
        isAuthorized: true,
        isLogin: true,
        isPerProfile: true
      }
    },
  },

  observers: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    loginClick(){
      this.triggerEvent('loginClick');
    },
  }
})