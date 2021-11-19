import apiRequest from '../service/index';
export let loginResolve;
export const loginPromise = new Promise((resolve) => loginResolve = resolve)


/**
 * 用来包裹page下需要判断是否登录的方法，处理登录的逻辑让函数统一处理
 * @param {function} bindEvent // 被包裹的方法
 */
// 授权
function userAuth(code, res) {
  apiRequest.userAuth({
    code,
    rawData: res.rawData,
    signature: res.signature,
    encryptedData: res.encryptedData,
    iv: res.iv
  }).then(async (res) => {
    if(res.errCode == 0) {
      if (res.obj && res.obj.isAuthorized == true) {
        let loginInfo = {
          isAuthorized: res.obj.isAuthorized,
          isLogin: res.obj.isLogin
        }
        tt.setStorageSync('loginInfo', loginInfo);
        tt.setStorageSync('openId', res.obj.openId);
        tt.setStorageSync('token', res.obj.token);
        console.log('userAuth')
        console.log(loginInfo)
        tt.navigateTo({
          url: '/pages/login/login',
        });
      }
    }
  })  
}
 export function isLoginClick(bindEvent) {
  return function () {
    const loginInfo = tt.getStorageSync('loginInfo');
    if(!loginInfo.isAuthorized) { // 未授权,走授权获取信息
      apiRequest.getCode().then(({code}) => {
        tt.getUserInfo({
          withCredentials:true,
          success(res) {
            tt.setStorageSync('userInfo', res.userInfo);
            userAuth(code, res) // 授权
          },
          fail(res) {
            console.log(`getUserInfo 调用失败`);
            tt.showModal({
              title: '提示',
              content: '需要获取您的用户信息，请确认授权，否则部分功能将无法使用',
              showCancel: false,
              confirmColor: '#3CC51F',
              success: function (tip) {
                if (tip.confirm) {
                  tt.openSetting({
                    complete: res => {
                      if (res.authSetting['scope.userInfo']) {
                        tt.getUserInfo({
                          withCredentials:true,
                          success(res) {
                            tt.setStorageSync('userInfo', res.userInfo);
                            userAuth(code, res) // 授权
                          },
                          fail(res) {
                            console.log(`getUserInfo 调用失败`);
                          }
                        });
                      }
                    }
                  })
                }
              }
            })
          }
        });
      })
    } else if (!loginInfo.isLogin) { // 未登录，走手机号登录
      tt.navigateTo({
        url: '/pages/login/login',
      });
    } else { // 登录态没问题 调用方法
      typeof bindEvent === 'function' && bindEvent.apply(this, arguments)
    }
  }
}
/**
 * lodash.round 方法
 * @param {number} number 要四舍五入的数字
 * @param {number} precision 保留几位
 */
 export function round(number, precision = 2) {
  const func = Math.round;
  precision =
    precision == null ?
    0 :
    precision >= 0 ?
    Math.min(precision, 292) :
    Math.max(precision, -292);
  if (precision) {
    let pair = `${number}e`.split('e');
    const value = func(`${pair[0]}e${+pair[1] + precision}`);

    pair = `${value}e`.split('e');
    return +`${pair[0]}e${+pair[1] - precision}`;
  }
  return func(number);
}

export const t = (() => { // 转换方法 rpx -> px
  const radio = tt.getSystemInfoSync().windowWidth / 750
  return rpx => round(rpx * radio, 1)
})()