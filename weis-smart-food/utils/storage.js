import { promisify, loginPromise } from './common'

const storage = {
  loginInfo: {}, // 登录状态信息
  token: undefined, // token信息
  userInfo: {},
  counselorId: '', // 客户经理id
  navStatusHeight: '',
  loginCoupon: [],
  // openboxCloseStatus: null,
  subToken: '',
  subInfo: {},
  openId: '',
  stopDialogSpell: '',
  bubbleDate: '',
  isAndriod: null,
  showCouponIdArr: [],
  orderDateList: [], //点餐日期列表
  planMealDate:{},//方案跳转点餐携带的日期餐别
  toPlanDate: null,//点餐页面点击方案跳转方案页面携带日期
};

// const storage = new Proxy($storage, {
//   set(target, prop, value) {
//     if (prop === 'loginInfo') {
//       loginPromise.update(value);
//     }
//     return Reflect.set(...arguments);
//   }
// });


(function initStorage() {
  Object.keys(storage).forEach(key => {
    storage[key] = wx.getStorageSync(key);
  })
})();

export function getStorage(key) {
  return storage[key]
}

export function removeStorage(key) {
  delete storage[key];
  wx.removeStorage({
    key
  });
}

export function setStorage(key, data) { // 修改异步的setStorage 返回一个promise 接收跟sync一样的传参
  if (!(key in storage)) {
    console.warn(`key: ${key}, 还未定义在storage`);
  }
  const wxSetStorage = promisify(wx.setStorage);

  return wxSetStorage({
    key,
    data
  }).then((res) => {
    storage[key] = data;
    return res;
  })

}
export function setStorageSync(key, data) {
  if (!(key in storage)) {
    console.warn(`key: ${key}, 还未定义在storage`);
  }
  storage[key] = data;
  return wx.setStorageSync(key, data);
}







