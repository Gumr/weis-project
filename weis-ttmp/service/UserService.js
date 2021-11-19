import request from '../utils/api';

const CLASS_NAME = 'User/'

const User = {
  // 我的-查询用户信息
  queryUserInfo(data) {
    return request({
      method: `${CLASS_NAME}querySelfUserInfoForSub`,
      data,
      mode: 'api'
    })
  },
  // 我的-修改用户信息
  updateUserProfile(data) {
    return request({
      method: `${CLASS_NAME}updateUserProfile`,
      data,
      mode: 'api'
    })
  },
  // 我的-修改用户昵称和头像
  updateUserUnameAndHeadImgUrl(data) {
    return request({
      method: `${CLASS_NAME}updateUserUnameAndHeadImgUrl`,
      data,
      mode: 'api'
    })
  },
}

export default User;