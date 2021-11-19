// e:\project\weis-ttmp\weis-ttmp-nlm\weis-ttmp\pages\login\login\login.js
import apiRequest from '../../service/index';
Page({
  data: {
    imgPrefix: 'https://prodstatic.weis1606.cn/api/ttmpFood/login/',
    xy: false,
  },
  onLoad: function (options) {
    apiRequest.getCode().then(({code}) => {
      this.setData({
        code
      })
    });
  },
  // 协议选中
  xySelect() {
    let { xy } = this.data;
    this.setData({
      xy: !xy
    })
  },
  // 协议内容
  xy() {
    tt.navigateTo({
      url: '/pages/packOne/agreement/agreement',
    }); 
  },
  // 登录点击
  loginTap() {
    if(!this.data.xy) {
      tt.showToast({
        title: '请先同意协议',
        icon: 'none'
      });
    }
  },
  // 获取手机号
  getphonenumber(e) {
    let { errMsg, encryptedData, iv } = e.detail;
    if(errMsg != 'getPhoneNumber:ok') {
      return
    }
    apiRequest.phoneLogin({
      code: this.data.code,
      encryptedData,
      iv
    }).then(async (res) => {
      if(res.errCode == 0) {
        // tt.setStorageSync('phoneNumber', res.obj.phoneNumber);
        // 返回上个页面 && 调用onLoad
        // let pages = getCurrentPages();
        // let prevPage = pages[pages.length - 2];
        // prevPage.onLoad()
        if (res.obj && res.obj.isLogin == true) {
          let loginInfo = {
            isAuthorized: res.obj.isAuthorized,
            isLogin: res.obj.isLogin
          }
          tt.setStorageSync('loginInfo', loginInfo);
          tt.setStorageSync('openId', res.obj.openId);
          tt.setStorageSync('token', res.obj.token);
          console.log('getphonenumber')
          console.log(loginInfo)
          tt.navigateBack({
            delta: 1
          });
        }
      }
    })
  }
})