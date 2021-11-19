// components/cp-config-dialog/cp-config-dialog.js
import {
  saveUseLog
} from '../../utils/common'
import {
  getStorage,
  setStorage,
  removeStorage
} from '../../utils/storage'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    discoverDialogs: {
      type: [String, Object],
      value: ''
    },
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
    closeConfig(type) {
      console.log(type)
      let pages = getCurrentPages();
      let currentPage = pages[pages.length-1];
      let noTipSelect = this.data.noTipSelect;
      if(!type || type != 'jump'){
        saveUseLog('02', this.data.discoverDialogs.id, '03',noTipSelect || false);
      }
      currentPage.setData({
        discoverDialogs: '',
      })
    },
  
    configShowTap(e) {
      const {
        url,
        type,
        appid
      } = e.currentTarget.dataset;
      if(type == '01' || type == '02' || type == '04'){
        saveUseLog('02', this.data.discoverDialogs.id, '02');
        this.closeConfig('jump');
      }
      switch (type) {
        // 内部小程序
        case '01':
          wx.navigateTo({
            url,
            fail() {
              wx.switchTab({
                url
              })
            }
          })
          break;
        //跳转H5 
        case '02':
          wx.navigateTo({
            url: `/pages/webview/webview?url=${url}`,
          });
          break;
        //第三方小程序 
        case '04':
          wx.navigateToMiniProgram({
            appId: appid,
            path: url,
          })
          break;  
      }
    },
  
    // 召唤锦鲤提示-改变（已过）
    noTipChange() {
      this.setData({
        noTipSelect: !this.data.noTipSelect
      })
    },
  }
})
