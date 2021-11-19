import request from '../utils/api';

const CLASS_NAME = 'DouyinUser/'

const DouyinUser = {
  // 是否授权登录
  quietLogin(data) {
    return request({
      method: `${CLASS_NAME}quietLogin`,
      data
    })
  },
  // 授权
  userAuth(data) {
    return request({
      method: `${CLASS_NAME}userAuth`,
      data
    })
  },
  // 从抖音接口获取手机号
  phoneLogin(data) {
    return request({
      method: `${CLASS_NAME}phoneLogin`,
      data
    })
  },
}

export default DouyinUser;
