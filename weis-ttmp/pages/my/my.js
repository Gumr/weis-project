// c:\Users\admin\Desktop\ttapp\pages\my\my.js
import apiRequest from '../../service/index';
import { isLoginClick } from '../../utils/common'
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/my/',
    myList: [
      {id: 0, icon: 'address.png', title: '收货地址', url: '/pages/packOne/addressList/addressList?from=my'},
      {id: 1, icon: 'call.png', title: '联系客服', url: '' },
      {id: 2, icon: 'we.png', title: '关于我们', url: '/pages/packOne/about/about' },
    ]
  },
  onLoad: function (options) {
    
  },
  onShow: function (options) {
    // 判断登录
    const loginInfo = tt.getStorageSync('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin;
    this.setData({
      isLogin
    })
    this.queryUserInfo()
  },
  // 查询用户信息
  queryUserInfo() {
    apiRequest.queryUserInfo({
      mainUid: true
    }).then((res) => {
      this.setData({
        userInfo: res.obj
      })
    });
  },
  // 个人信息
  personal: isLoginClick(function() {
    tt.navigateTo({
      url: `/pages/packOne/personal/personal`
    });
  }),
  // 我的列表
  myList: isLoginClick(function(e) {
    let { id, url } = e.currentTarget.dataset;
    // 联系客服无需跳转
    if(id == 1) {
      return
    }
    tt.navigateTo({
      url
    });
  }),
})