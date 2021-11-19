import {
  setStorage,
  getStorage,
  removeStorage
} from '../utils/storage'
import apiRequest from '../service/index';
import day from '../libs/day';
export let loginResolve;
export const loginPromise = new Promise((resolve) => loginResolve = resolve)
import {
  ignoreProfile
} from '../utils/map'

export let tablewareList = [];


// 请求sku列表
export function getTablewareList() {
  return apiRequest.queryGroundingWareList()
    .then((res) => {
      return (tablewareList = (res.errCode === 0 ?
        res.obj.map((item) => ({
          skuname: item.skuname,
          cid: item.cid,
          price: item.price
        })) : []))
    })
}

/**
 * 传入一个sku数据 判断是否是餐具
 * @param {object} sku
 * 
 * @returns {boolean} 
 */
export function isTableware(sku) {
  const tablewareId = tablewareList.map(({
    cid
  }) => cid);
  return tablewareId.includes(sku.cid);
}
/**
 * 传入一个sku列表 把其中的餐具sku过滤
 * @param {array} skuList 菜品列表
 * 
 * @returns {array}
 */
export function filterTablewareSku(skuList) {
  return skuList.filter((sku) => !isTableware(sku))
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


export function promisify(wxMethod) {
  return function (option = {}) {
    return new Promise((resolve, reject) => {
      option.success = resolve;
      option.fail = reject;
      wxMethod(option)
    })
  }
}

/**
 *  // 根据冷热每日每餐配送自取等状态，生成对应文字
 * @param {string} shipWithCold 00 热食 01 冷链
 * @param {string} deliveryFrequency deliveryFrequency 00 每餐一次  01 每日一次,
 * @param {string} distributionMode distributionMode 0配送 1自取
 */
export function genDispatchTag(shipWithCold, deliveryFrequency, distributionMode) {
  let text = '';

  text += {
    '00': '热食',
    '01': '冷链',
  } [shipWithCold];

  if (deliveryFrequency) {
    text += {
      '00': '每餐',
      '01': '每日',
    } [deliveryFrequency];

    text += {
      0: '达',
      1: '取',
      2: '达',
    } [distributionMode]
  } else {
    text += {
      0: ' 配送',
      1: ' 自取',
      2: '企业专送',
    } [distributionMode];
  }

  return text;
};


export let confObj = {};

// 点餐截止时间配置
export function announceConf() {
  return apiRequest.announceConf({

  }).then((res) => {
    let conf = res.obj;
    conf.orderTimeLimit = `${String(conf.orderTimeLimit).substring(0, 2)}:${String(conf.orderTimeLimit).substring(2, 4)}`
    return confObj = conf
  })
}

// 绑定客户经理 或 绑定用户关联客户经理
export function binding(inviteUid, aldId) {
  return apiRequest.binding({
    inviteUid: inviteUid,
    aldId: aldId
  }).then((res) => {

  })
}

// 查询客户经理 营养师
export function queryQrCodeDetail(inviteUid, aldId) {
  return apiRequest.queryQrCodeDetail({
      codeId: inviteUid || aldId,
      type: inviteUid ? '01' : '02'
    })
    .then(res => {
      return res
    })
    .catch(error => {

    })
}

/**
 * 用来包裹page下需要判断是否登录的方法，处理登录的逻辑让函数统一处理
 * @param {function} bindEvent // 被包裹的方法
 */
export function isLoginClick(bindEvent) {
  return function () {
    // const componet = this.selectComponent('#login-dialog'); // 获取page下 #login-dialog组件 请先注册组件
    const loginInfo = getStorage('loginInfo');
    const isLogin = loginInfo.isAuthorized && loginInfo.isLogin;

    if (!isLogin) { // 是否登录
      // componet.init();
      wx.navigateTo({
        url: '/pages/login/login',
      });
    } else if (!loginInfo.isPerProfile && ignoreProfile.indexOf(this.route) == -1) { // 是否填写身体信息
      wx.navigateTo({
        url: '/pages/mineBox/role/role',
      });
    } else { // 登录态没问题 调用方法
      typeof bindEvent === 'function' && bindEvent.apply(this, arguments)
    }
  }
}

export function isDoubleEleven() {
  const today = day();
  return (today.get('month') + 1 === 11) &&
    (today.get('date') >= 1 && today.get('date') <= 11)
}

export const t = (() => { // 转换方法 rpx -> px
  const radio = wx.getSystemInfoSync().windowWidth / 750
  return rpx => round(rpx * radio, 1)
})()


// 时间段 转为列表 9:00 - 14:00  (interval 分钟)
export function toTimeList(startTime, EndTime, interval) {
  let start = new Date(startTime).getTime();
  let end = new Date(EndTime).getTime();
  let arr = [];
  for (var i = start; i <= end;) {
    arr.push(day(new Date(i)).format('HH:mm'));
    i = i + interval * 60 * 1000;
  }
  return arr;
}
/**
 * 
 * @param {*} startTime 生成时间范围数组的开始时间，可被new Date的参数
 * @param {*} EndTime 生成时间范围数组的结束时间，可被new Date的参数
 * @param {number} interval 按多少分钟进行间隔 默认20分钟 
 * @returns ['HH:mm-HH:mm'] 字符串数组
 */
export function toTimeRangeList(startTime, EndTime, interval = 20) {
  let start = new Date(startTime).getTime();
  let end = new Date(EndTime).getTime();
  let arr = [];

  // for (var i = start; i <= end;) {
  //   // arr.push(day(new Date(i)).format('HH:mm'));
  //   const e = i + interval * 60 * 1000;
  //   arr.push(`${day(i).format('HH:mm')}-${day(Math.min(e, end)).format('HH:mm')}`);
  //   i = e;
  // }
  for (var i = end; i >= start;) {
    const e = i - interval * 60 * 1000;
    arr.unshift(`${day(e).format('HH:mm')}-${day(i).format('HH:mm')}`);
    i = e;
  }
  return arr;
}


export function isIpx() {
  const {
    model
  } = wx.getSystemInfoSync()
  const matches = model.match(/iphone\s*(x\w*|\d+).*$/i);

  if (matches) {
    const version = Number(matches[1]); // matched[1]: 'x' 'xs' '7' '8' '11' '12' Number('x') = NaN 
    return version ? version >= 11 : true;
  }
  return false;
}

export function setNavStatus() {
  let sysinfo = wx.getSystemInfoSync(),
    statusHeight = sysinfo.statusBarHeight,
    isiOS = sysinfo.system.indexOf('iOS') > -1,
    navHeight;
  if (!isiOS) {
    navHeight = 48;
  } else {
    navHeight = 44;
  }
  setStorage('isAndriod', !isiOS)
  setStorage('navStatusHeight', statusHeight + navHeight);
}

export function checkNewVersion() {
  const that = this;
  // 检测新版本
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            },
          });
        });
        updateManager.onUpdateFailed(function () {
          // 新的版本下载失败
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
          });
        });
      }
    });
  } else {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
    });
  }
  /**
   * 初次加载判断网络情况
   * 无网络状态下根据实际情况进行调整
   */
  wx.getNetworkType({
    success(res) {
      const networkType = res.networkType;
      if (networkType == 'none' || networkType == '2g') {
        wx.showToast({
          title: '当前无网络',
          icon: 'error',
          image: '',
          duration: 1500,
          mask: false,
        }); 
      }
    },
  });

  wx.onNetworkStatusChange((res) => {
    if(!res.isConnected || res.networkType == 'none' || res.networkType == '2g'){
      wx.showToast({
        title: '当前无网络',
        icon: 'error',
        image: '',
        duration: 1500,
        mask: false,
      }); 
    }
  }); 
}
/**
 * 
 * @param {string} selector 元素选择器
 * @returns {Promise} 返回一个取得dom的rect promise
 */
export function getRect(selector) {
  return new Promise(resolve => {
    this.createSelectorQuery()
      .select(selector)
      .boundingClientRect(resolve)
      .exec();
  });
}
/**
 * 根据当前时间计算餐别
 * 
 * @returns { string } 01 早餐 02 午餐 03 晚餐
 */
export function decideCategory() {
  const now = day();

  const startToday = now.startOf('day');
  const breakfastTime = startToday.set('hour', 9).set('minute', 30)
  const lunchTime = startToday.set('hour', 17).set('minute', 0)
  const dinnerTime = startToday.set('hour', 23).set('minute', 59)
  if (now <= breakfastTime) {
    return '01'
  }
  if (now <= lunchTime) {
    return '02'
  }
  if (now <= dinnerTime) {
    return '03'
  }
}
// 微信支付
export function wxPay(data) {
  return apiRequest.payment(data).then(res => {
    // 订单微信支付成功后 通知后端
    if (data.orderNumber && res.errMsg === 'requestPayment:ok') {
      apiRequest.queryOrderPayStt({
        orderNumber: data.orderNumber,
      })
    }
    return res.errMsg === 'requestPayment:ok' ?
      Promise.resolve(res) :
      Promise.reject(res);
  })
}

//两个时间相差天数
export function datedifference(sDate1, sDate2) { //sDate1和sDate2是2006-12-18格式 
  var dateSpan,
    tempDate,
    iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  dateSpan = Math.abs(dateSpan);
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays
}

function transformChartTargetData(targetData) {
  class ChartItem {
    constructor() {
      this.bodyfat = 0;
      this.fat = 0;
      this.leavefatWeight = 0;
      this.bust = 0;
      this.waistline = 0;
      this.bicep = 0;
      this.thigh = 0;
    }
  }

  function statusToChartKey(status) {
    const map = {
      k1: 'sex', // 性别
      k2: 'birthday', // 出生
      k3: 'height', // 身高
      k4: 'weight', // 体重
      k5: 'bodyfat', // 体脂率
      k6: 'motion', // 久坐
      k7: 'fat', // 脂肪
      k8: 'leavefatWeight', // 肌肉量
      k9: 'bust', // 胸围
      k10: 'waistline', // 腰围
      k11: 'bicep', // 臀围
      k12: 'thigh', // 腿围
      k13: 'mood', // 心情
      k14: 'label' // 内容
    };

    return map[status];
  }

  const res = new ChartItem();
  Object.keys(targetData).forEach(status => {
    const key = statusToChartKey(status);
    res[key] = targetData[status];
  });
  return res;
}
export function transformChartData(data) {
  if (!data) return {};

  return {
    date: data.date,
    ...data.calorie,
    ...data.profile,
    ...transformChartTargetData(data.target)
  };
}

export function buyAndActiveCard(id, params = {}) {
  function activationCardTicket(orderId) {
    return apiRequest.activatePurchaseRrder({
      oid: orderId,
      ...params
    })
  }

  function rechargeCardTicket() {
    return apiRequest.rechargeCardTicket({
      buyCardList: [{
        cid: id,
        count: 1
      }],
      openid: getApp().globalData.openId,
    }).then((res) => {
      return res.errCode === 0 ? res.obj : Promise.reject(res)
    })
  }

  return rechargeCardTicket()
    .then(async (res) => {
      await wxPay(res)
      return activationCardTicket(res.orderId)
    })
}

export function getUrlParam(name, url) {
  // url 小程序页面路径
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
  var r = url.split('?')[1] && url.split('?')[1].match(reg) || null; // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
}


// 判断当前子账户是否有效 requestSub 为true 请求子账户接口
export function judgeSubAccount(requestSub) {
  let subInfo = getStorage("subInfo") || {};
  if (!subInfo.tsuSubUid && !requestSub) {
    return Promise.resolve(true)
  } else {
    return apiRequest.getUserListForSubUser({

    }).then((res) => {
      // corpSubUserInfos 企业子账号 
      // userSubUserInfos 私人子账号 
      // subUserInfoList 子账号总和
      // 所有子账户id list
      let subUserInfoIdList = res.obj.subUserInfoList.map((v) => {
        return v.tsuSubUid
      });
      if (subInfo.tsuSubUid && subUserInfoIdList.indexOf(subInfo.tsuSubUid) == -1) {
        removeStorage('subToken');
        removeStorage('subInfo');
        wx.showModal({
          title: '提示',
          content: '子账户已失效，已切换为主账户',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.reLaunch({
                url: '/pages/openScreen/openScreen',
              });
            }
          },
        });
        return false //无效
      } else {
        return Promise.resolve(res)
      }
    })
  }
}

// 查询子账户信息
export function querySubUserInfo(tsuSubUid) {
  return apiRequest.querySubUserInfo({
      subUid: tsuSubUid
    })
    .then((res) => {
      return res
    })
}

export function isDef(val) {
  return val !== null && val !== undefined
}
// 请求步数配置
export function getStepConfig() {
  return apiRequest.queryUserConfig()
    .then((res) => {
      return res.errCode === 0 && res.obj.userConfigList.find(i => i.tucType === '06')
    })
}
// 刷新步数数据
export async function refreshStepData(config) {
  if (!config) { // 没传config 请求一下config
    config = (await getStepConfig()) || {}
  }
  if (config.tucStt === '01') { // 状态为 01证明开启了记步
    const loginRes = await loginPromise
    return new Promise((resolve, reject) => {
      wx.getWeRunData({ // 调用微信请求记步api
        success: (res) => {
          resolve(apiRequest.getRunData({ // 把接口resolve出去
            sessionKey: loginRes.wxSessionKey,
            encryptedData: res.encryptedData,
            iv: res.iv
          }))
        },
        fail: reject
      })
    })
  }
}

// 请求用户数据
export function queryUserInfo() {
  var that = this;
  let subToken = getStorage("subToken") || '';
  return new Promise((resolve, reject) => {
    apiRequest.queryUserInfo({
        mainUid: subToken ? false : true
      })
      .then(res => {
        resolve(res)
      })
      .catch(error => {

      })
  })

}

// 查询弹窗
export function queryDiscoverDialog() {
  return new Promise((resolve, reject) => {
    apiRequest.queryDiscoverDialog({

      })
      .then(res => {
        resolve(res)
      })
      .catch(error => {

      })
  })
}

// 展示弹窗
export function showDialog(location, _this, hpId) {
  // location 01：发现页 02：点餐页 03：数据页 04：方案页,
  //  crowd 01 全量用户 不判断加热点 02 筛选用户 指定加热点弹出
  // 全量用户 弹窗不区分加热点弹出-/-筛选用户 后台配置加热点可弹出
  const app = getApp();
  const loginInfo = getStorage('loginInfo') || {};
  const isLogin = loginInfo.isAuthorized && loginInfo.isLogin && loginInfo.isPerProfile;
  let discoverDialogs = null;
  if (hpId) {
    discoverDialogs = app.globalData.discoverDialogs.length > 0 && app.globalData.discoverDialogs.filter(item => item.location.split(',').indexOf(location) >= 0 && (item.crowd == '01' || (item.crowd == '02' && item.userScreenBean.heatingPoint && item.userScreenBean.heatingPoint.indexOf(hpId) >= 0)))[0] || {};
  } else {
    discoverDialogs = app.globalData.discoverDialogs.length > 0 && app.globalData.discoverDialogs.filter(item => item.location.split(',').indexOf(location) >= 0)[0] || {};
  }
  if (hpId && discoverDialogs.id && discoverDialogs.crowd == '02' && (!discoverDialogs.userScreenBean.heatingPoint || discoverDialogs.userScreenBean.heatingPoint.indexOf(hpId) == -1)) {
    // 首页传加热点 crowd 02 筛选用户 并且有弹窗 判断该弹窗是否在该加热点弹出 或者后端没返回加热点heatingPoint字段不弹
    discoverDialogs = {};
  }
  if (discoverDialogs.id && isLogin) {
    let dialogIdArr = app.globalData.discoverDialogs.map((v) => {
      return v.id
    });
    _this.setData({
      discoverDialogs,
    })
    dialogIdArr.indexOf(discoverDialogs.id) >= 0 && app.globalData.discoverDialogs.splice(dialogIdArr.indexOf(discoverDialogs.id), 1);
    saveUseLog('02', discoverDialogs.id, '01');
  } else {
    _this.setData({
      discoverDialogs: '',
    })
  }

  // let dialogList = wx.getStorageSync('dialogList') || [];
  // let dialogId = dialogList.map((v) => {
  //   return v.id
  // });
  // if (discoverDialogs.id && dialogId.indexOf(discoverDialogs.id) == -1) {
  //   // 开合有礼 || 自定义弹窗
  //   if((discoverDialogs.type == '01' && !Boolean(getStorage('openboxCloseStatus'))) || discoverDialogs.type == '10'){
  //     _this.setData({
  //       discoverDialogs,
  //     })
  //     if (discoverDialogs.frequency == '02') {
  //       // 一天弹一次
  //       discoverDialogs.showDate = day().format('YYYY/MM/DD')
  //     }
  //     dialogList.push(discoverDialogs);
  //     wx.setStorageSync('dialogList', dialogList);
  //     saveUseLog('02',discoverDialogs.id,'01');
  //   }
  // } else if (discoverDialogs.id && dialogId.indexOf(discoverDialogs.id) >= 0 && discoverDialogs.frequency == '02' && dialogList[dialogId.indexOf(discoverDialogs.id)].showDate !== day().format('YYYY/MM/DD')) {
  //   // 开合有礼 || 自定义弹窗
  //   if((discoverDialogs.type == '01' && !Boolean(getStorage('openboxCloseStatus'))) || discoverDialogs.type == '10'){
  //     _this.setData({
  //       discoverDialogs,
  //     })
  //     dialogList[dialogId.indexOf(discoverDialogs.id)].showDate = day().format('YYYY/MM/DD');
  //     wx.setStorageSync('dialogList', dialogList);
  //     saveUseLog('02',discoverDialogs.id,'01');
  //   }
  // }
}

// 保存操作日志
export function saveUseLog(business, did, type, neverStt, location) {
  apiRequest.saveUseLog({
    business,
    did,
    type,
    neverStt,
    location
  })
}

// 按钮音效
export function addClickAudio() {
  wx.vibrateShort({
    type: 'heavy',
    success: (result) => {

    },
  });
  const innerAudioContext = wx.createInnerAudioContext();
  wx.setInnerAudioOption({ // ios在静音状态下能够正常播放音效
    obeyMuteSwitch: false, // 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
    success: function (e) {},
    fail: function (e) {}
  })
  innerAudioContext.src = 'https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/cartAudio.mp3'; // 音频资源的地址
  innerAudioContext.play()
}