
/**
 * @param {string} envVersion development	开发版, preview	预览版, production 正式版
 */
const envVersion = tt.env.VERSION;
// const envVersion = tt.getEnvInfoSync().microapp.envType;
console.log('环境')
console.log(envVersion)

/**
 * @param {boolean} 判断当前是否是development环境
 */
const isDev = (['development', 'preview'].includes(envVersion)) // 是否是开发版 预览版
// const isDev = (envVersion === 'development') // 是否是开发环境 体验版

/**
 * @param URL 全局请求url集合
 * @param URL.dou  抖音dou的url
 * @param URL.api  饮食api的url
 * @param URL.api1  数搭api1的url
 * @param URL.health  慢病health的url
 */
const URL = isDev
  ? {
    dou: 'https://dou.weis1606.cn',
    api: 'https://api.weis1606.cn',
    api1: 'https://api1.weis1606.cn',
    health: 'https://health.weis1606.cn/api'
  }
  : {
    dou: 'https://proddou.weis1606.cn',
    api: 'https://prodapi.weis1606.cn',
    api1: 'https://prodapi1.weis1606.cn',
    health: 'https://prodhealth.weis1606.cn/api'
  }

let token;
/**
 * @param options 请求的配置
 * @param {string} options.method: 如 'Activity/ifJoinActive' 传递后台的特定url
 * @param {string} options.mode: 'dou', 'api', 'api1', 'health'
 * @param {object} options.data 传递过去的数据
 * 
 * @returns {Promise} 请求响应的数据
 */
function request(options = {}) {
  const url = URL[options.mode || 'dou'];

  token = tt.getStorageSync("token") || ''

  if (isDev) {
    // token = '26661B14E5D80368C0631473A5B3C0F1B4D90CEFD78CEA89'
    // token = 'B1A0AF82E3D6E5591AB4D45DBAA7429B5C40A69AA75E0DE6'
  }

  if (!options.method) {
    console.info('request: 缺少method字段')
  }
  if (!token) {
    console.info('request: 缺少token字段')
  }

  const [, methodName] = options.method.split('/')
  const data = options.data || {};
  data.market = options.market || 88; // 设端口
  data.openid = data.openid ? data.openid : tt.getStorageSync("openId") || ''

  const BASE_OPTS = {
    url: `${url}/api/cn.weis.api.${options.method}`,
    data: {
      appid: 'tte67990c47941bc7e01',
      head: {
        appver: 176
      },
      method: methodName,
      params: [data],
      token: token || '',
    },
    method: 'post',
    header: {
      'content-type': 'application/json'
    },
  }

  return new Promise((resolve, reject) => {
    BASE_OPTS.success = res => {
      if (res.data.errCode != 0) {
        // tt.showToast({
        //   title: res.data.errMsg,
        //   icon: 'fail',
        // });
      }
      resolve(res.data)
      tt.hideLoading();
    };
    BASE_OPTS.fail = res => {
      tt.hideLoading();
      reject()
    };
    tt.request(BASE_OPTS);
  })
}


export default request;

export {
  URL
};