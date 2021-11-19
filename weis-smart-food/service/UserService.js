import request from '../utils/request';
import { once } from '../utils/common';
const gio = require("../libs/gio-minp/index.js").default;
const CLASS_NAME = 'User/'

let reported = false;

const User = {
  // 授权
  userAuth(data) {
    return request({
      method: `${CLASS_NAME}userAuth`,
      data
    })
  },
  //手机号授权
  getWxPhoneNum(data) {
    return request({
      method: `${CLASS_NAME}getWxPhoneNum`,
      data
    })
  },
  // 用户来源
  checkUserSource() {
    return request({
      method: `${CLASS_NAME}checkUserSource`
    })
  },
  // 完善用户信息
  perfectProfile(data) {
    return request({
      method: `${CLASS_NAME}perfectProfile`,
      data
    })
  },
  // 我的-查询用户信息
  queryUserInfo(data) {
    return request({
      method: `${CLASS_NAME}querySelfUserInfoForSub`,
      data
    }).then((res) => {
      if (!reported && res.errCode === 0) {
        reported = true;
        gio('setVisitor', res.obj.userInfo)
      }
      return res;
    })
  },
  delPlanIntakeCache(data) {
    return request({
      method: `${CLASS_NAME}delPlanIntakeCache`,
      data
    })
  },
  changeUserConfig(data) {
    return request({
      method: `${CLASS_NAME}changeUserConfig`,
      data
    })
  },
  queryUserConfig(data) {
    return request({
      method: `${CLASS_NAME}queryUserConfig`,
      data
    })
  },
  getRunData(data) {
    return request({
      mode: 'health',
      method: `${CLASS_NAME}getRunData`,
      data
    })
  },
  // 我的-个人信息-修改用户个人信息
  updateUserProfile(data) {
    return request({
      method: `${CLASS_NAME}updateUserProfile`,
      data
    })
  },
  // 修改用户昵称和头像
  updateUserUnameAndHeadImgUrl(data) {
    return request({
      method: `${CLASS_NAME}updateUserUnameAndHeadImgUrl`,
      data
    })
  },
  //查询活动
  queryuserbox(data) {
    return request({
      method: `${CLASS_NAME}getUserEvent`,
      data
    })
  },
  //保存活动
  saveuserbox(data) {
    return request({
      method: `${CLASS_NAME}saveUserEvent`,
      data
    })
  },
  //召唤锦鲤
  saveuserShareFirends(data) {
    return request({
      method: `${CLASS_NAME}summonBrocadeCarp`,
      data
    })
  },
  //锦鲤列表
  queryBoxCoup(data) {
    return request({
      method: `${CLASS_NAME}queryBoxCouponList`,
      data
    })
  },
  // 业绩-获取数据
  queryMyRevenuesByQrcode(data) {
    return request({
      method: `${CLASS_NAME}queryMyRevenuesByQrcode`,
      data,
    })
  },
  updateUserProfile(data) {
    return request({
      method: `${CLASS_NAME}updateUserProfile`,
      data
    })
  },
  // 点餐/充值-详情
  queryQrcodeMyRevenues(data) {
    return request({
      method: `${CLASS_NAME}queryQrcodeMyRevenues`,
      data,
    })
  },
  addUserSuggest(data) {
    return request({
      method: `${CLASS_NAME}addUserSuggest`,
      data
    })
  },
  queryDiscoverLabelList(data) {
    return request({
      method: `${CLASS_NAME}queryDiscoverLabelList`,
      data
    })
  },
  getUserStepList(data) {
    return request({
      method: `${CLASS_NAME}getUserStepList`,
      mode: 'health',
      data
    })
  },
  getuserSharePlayQrCode(data) {
    return request({
      method: `${CLASS_NAME}createPlaCardQrCode`,
      data
    })

  },
  // 获取渠道码列表
  queryQrcodeByUid(data) {
    return request({
      method: `${CLASS_NAME}queryQrcodeByUid`,
      data
    })
  },
  queryChannelQrCodeByUid(data) {
    return request({
      method: `${CLASS_NAME}queryChannelQrCodeByUid`,
      data
    })
  },
  // 生成新渠道码
  editPartnerQrcode(data) {
    return request({
      method: `${CLASS_NAME}editPartnerQrcode`,
      data
    })
  },
  // 渠道客户
  queryUserListByQrcodeId(data) {
    return request({
      method: `${CLASS_NAME}queryUserListByQrcodeId`,
      data
    })
  },
  //查询分公司信息
  bindEmployee(data) {
    return request({
      method: `${CLASS_NAME}bindEmployee`,
      data
    })
  },
  ValidateEmployee(data) {
    return request({
      method: `${CLASS_NAME}ValidateEmployee`,
      data
    })
  },

  binding(data) {
    return request({
      method: `${CLASS_NAME}binding`,
      data
    })
  },
  // 帮充值查询用户
  queryUserInfoByPhone(data) {
    return request({
      method: `${CLASS_NAME}queryUserInfoByPhone`,
      data
    })
  },
  perfectProfileForSubUser(data) {
    return request({
      method: `${CLASS_NAME}perfectProfileForSubUser`,
      data
    })
  },
  getUserListForSubUser(data) {
    return request({
      method: `${CLASS_NAME}getUserListForSubUser`,
      data
    })
  },
  getUserListForSubUserForCorp(data) {
    return request({
      method: `${CLASS_NAME}getUserListForSubUserForCorp`,
      data
    })
  },
  // 查询用户名下分享的账号
  getUserShareListForSubUser(data) {
    return request({
      method: `${CLASS_NAME}getUserShareListForSubUser`,
      data
    })
  },
  // 我的-子账户信息
  querySubUserInfo(data) {
    return request({
      method: `${CLASS_NAME}querySubUserInfo`,
      data
    })
  },
  // 同意绑定
  bindShareForSubUser(data) {
    return request({
      method: `${CLASS_NAME}bindShareForSubUser`,
      data
    })
  },
  // 删除子账号
  deleteSubUser(data) {
    return request({
      method: `${CLASS_NAME}deleteSubUser`,
      data
    })
  },
  // 邀请新人
  listNewInviteUser(data) {
    return request({
      method: `${CLASS_NAME}listNewInviteUser`,
      data
    })
  },
  // 查询是否弹出更换套餐
  userNutritionHealthSeting(data) {
    return request({
      method: `${CLASS_NAME}userNutritionHealthSeting`,
      data
    })
  },
  // 查询饭圈动态发布权限
  queryFanCircleDynamicPublishRoot(data) {
    return request({
      method: `${CLASS_NAME}queryFanCircleDynamicPublishRoot`,
      data
    })
  },
  // 工具包白名单
  toolkitRoot(data) {
    return request({
      method: `${CLASS_NAME}toolkitRoot`,
      data
    })
  },
}

export default User;
