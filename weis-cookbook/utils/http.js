/**
 * 小程序配置文件
 */
const CONFIG = {
  // 服务器地址
  // BASE_URL: 'https://api1.weis1606.cn/api', // weis-测试
  // BASE_URL_DIET: 'https://api.weis1606.cn/api', // 饮食测试

  BASE_URL: 'https://prodapi1.weis1606.cn/api',  // weis-正式
  BASE_URL_DIET: 'https://prodapi.weis1606.cn/api', // 饮食正式
  BASE_VER: {
    appver: 170
  }, //代码版本 
  appid: 'wx377c0bd71eab151f',
  // 高德小程序key
  gaodeKey: '1392ff61454ef02c8025af08c04fae76'
}

const loadingEvent = {
  beforeRequest(loadingMsg) {
    if (loadingMsg) {
      wx.showLoading({
        title: `${loadingMsg}`,
        mask: true
      });
    }
  },
  afterRequest(loadingMsg) {
    loadingMsg && wx.hideLoading()
  }
};

/**
 * 封装http请求
 * @author Huangyk
 */
function request({ url, method = 'POST', data = {}, contentType = 'application/json; charset=utf-8', loadingMsg, timeout = 30000 }) {
  // export function request(url, method="POST", data = {}, contentType = "application/json; charset=utf-8", loadingMsg) {
    loadingEvent.beforeRequest(loadingMsg);
  if (Object.prototype.toString.call(data) === '[object Object]') {
    data = filterParams(data);
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: CONFIG.BASE_URL + url,
      data: data,
      method,
      header: {
        'content-type': contentType
      },
      timeout: 15 * 1000,
      success(res) {
        if (res.data.errCode == '1012') {
          login(function (data) {
            resolve(data);
          }, res);
        } else {
          resolve(res.data);
        }
      },
      fail(e) {
        reject({
          info: '网络请求失败'
        });
      },
      complete() {
        loadingEvent.afterRequest(loadingMsg);
      }
    });
  });

  // 登录
  function login(callBack, resdata) {
    const opt = getQuery();
    const type = opt.invite;
    wx.login({
      success: response => {
        wx.request({
          url: BASE_URL + '/api/cn.weis.api.User/quietLogin', //登录
          method: 'post',
          data: {
            params: [{
              code: response.code,
              inviteUid: type || '0',
              aldId: '12345'
            }],
            appid: AppId,
            head: BASE_V,
            method: 'quietLogin'
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            const { isAuthorized, isLogin, isPerProfile, token } = res.obj
            const loginInfo = {
              isAuthorized,
              isLogin,
              isPerProfile
            };
            // wx.setStorageSync('loginInfo', loginInfo);
            wx.setStorage({
              key: 'token',
              data: token,
              success: result => {
                // 登录后重新请求接口
                params['token'] = wx.getStorageSync('token');
                wx.request({
                  url: (options.url || BASE_URL) + url,
                  data: params,
                  method,
                  header: {
                    'content-type': contentType
                  },
                  success(res) {
                    callBack(res.data);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  // 参数过滤
  function filterParams(params) {
    let res = {};
    Object.keys(params).forEach(key => {
      if (params[key] === null || params === undefined) {
        return;
      }
      res[key] = params[key];
    });
    res['appid'] = CONFIG.appid;
    res['head'] = CONFIG.BASE_VER;
    res['token'] = wx.getStorageSync('token');
    return res;
  }
}

// 封装get方法
function get(obj) {
  return request({
    method: 'GET',
    ...obj
  })
  // return request(obj.url, 'GET', obj.data, '', obj.loadMsg)
}

// 封装post方法
function post(obj) {
  return request({
    method: 'POST',
    ...obj
  })
  // return request(obj.url, 'POST', obj.data, '', obj.loadMsg, obj.isDiet)
}

module.exports = {
  CONFIG,
  request,
  post,
  get
}