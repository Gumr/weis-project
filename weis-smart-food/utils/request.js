import {
  setStorage,
  getStorage,
  setStorageSync
} from './storage';


/**
 * @param {string} envVersion develop	开发版, trial	体验版, release	正式版
 */
const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;

const domain = {
  'develop': {
    // 开发版
    api: 'https://api.weis1606.cn',
    api1: 'https://api1.weis1606.cn',
    health: 'https://health.weis1606.cn/api'
  },
  'trial': {
    // 预发布版
    api: 'https://pre-api.weis1606.cn',
    api1: 'https://pre-api1.weis1606.cn',
    health: 'https://pre-health.weis1606.cn/api'
  },
  'release': {
    // 正式版
    api: 'https://prodapi.weis1606.cn',
    api1: 'https://prodapi1.weis1606.cn',
    health: 'https://prodhealth.weis1606.cn/api'
  },
}

/**
 * @param URL 全局请求url集合
 * @param URL.api  饮食api的url
 * @param URL.api1  数搭api1的url
 * @param URL.health  慢病health的url
 */
const URL = domain[envVersion];

let token, subToken;
/**
 * @param options 请求的配置
 * @param {string} options.method: 如 'Activity/ifJoinActive' 传递后台的特定url
 * @param {string} options.mode: 'api', 'api1', 'health'
 * @param {object} options.data 传递过去的数据
 * 
 * @returns {Promise} 请求响应的数据
 */
function request(options = {}) {
  const url = URL[options.mode || 'api'];

  token = getStorage("token") || ''

  if (envVersion === 'develop') {
    // token = 'AD2A7E667564B3E6E0C08DABC096420F8FF466E5C704A5A5'
  }
  // 查询每个子账户信息 通过params携带subToken
  subToken = (options.data && options.data.subToken) || getStorage("subToken") || '';
  if (!options.method) {
    console.info('request: 缺少method字段')
  }
  if (!token) {
    console.info('request: 缺少token字段')
  }

  const [, methodName] = options.method.split('/')
  const data = options.data || {};
  data.market = options.market || 40; // 设端口
  data.openid = data.openid ? data.openid : getStorage("openId") || ''
  delete data.subToken;

  const BASE_OPTS = {
    url: `${url}/api/cn.weis.api.${options.method}`,
    data: {
      appid: 'wxb41830cd88835f5c',
      head: {
        appver: 179
      },
      method: methodName,
      params: [data],
      token: token || '',
      subToken
    },
    method: 'post',
    header: {
      'content-type': 'application/json'
    },
  }

  return new Promise((resolve, reject) => {
    BASE_OPTS.success = res => {
      if (res.data.errCode != 0 && !options.hideErrMsg) {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none',
        });
      }
      resolve(res.data)
    };
    BASE_OPTS.fail = res => {
      wx.hideLoading();
      reject(res)
    };
    wx.request(BASE_OPTS);
  })
}

export function login(params) {
  return request({
    method: 'User/quietLogin',
    data: params
  }).then((res) => {
    const loginInfo = {
      isAuthorized: res.obj.isAuthorized,
      isLogin: res.obj.isLogin,
      isPerProfile: res.obj.isPerProfile
    }
    setStorageSync('token', res.obj.token);
    setStorageSync('openId', res.obj.openId);
    return setStorage('loginInfo', loginInfo)
      .then(() => {
        return res.obj
      });
  })
}

export default request;

export {
  URL
};