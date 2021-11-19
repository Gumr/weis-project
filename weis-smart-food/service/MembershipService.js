import request from '../utils/request';

const CLASS_NAME = 'Membership/'

const Membership = {
  getBuyCardForGoods(data) {
    return request({
        method: `${CLASS_NAME}getBuyCardForGoods`,
        data
    })
  },
  // 自定义充值
  customRecharge(data) {
    return request({
        method: `${CLASS_NAME}customRecharge`,
        data
    })
  },
  // 我的-获取充值卡列表
  queryUserCardTicket(data) {
    return request({
        method: `${CLASS_NAME}queryUserCardTicket`,
        data
    })
  },
  getWeisAgreement (data) {
    return request({
        method: `${CLASS_NAME}getWeisAgreement`,
        data
    })
  },
  // 我的-余额-用户账户充值
  rechargeCardTicket(data) {
    return request({
        method: `${CLASS_NAME}rechargeCardTicket`,
        data
    })
  },
  // 我的-余额-激活购买订单
  activatePurchaseRrder(data) {
    return request({
        method: `${CLASS_NAME}activatePurchaseRrder`,
        data
    })
  },
  // 我的-余额-获取优惠列表
  queryCardTicketTemplate(data) {
    return request({
        method: `${CLASS_NAME}queryCardTicketTemplate`,
        data
    })
  },
  // 我的-余额-充值折扣
  rechargeDiscount(data) {
    return request({
        method: `${CLASS_NAME}rechargeDiscount`,
        data
    })
  },
  // 我的-余额-查询余额明细
  detailsBalance(data) {
    return request({
        method: `${CLASS_NAME}detailsBalance`,
        data
    })
  },
  // 激活实体卡
  exchangeCardTicket(data) {
    return request({
        method: `${CLASS_NAME}exchangeCardTicket`,
        data
    })
  },
  // 查询帮充值显示
  queryReplaceRechargeLog(data) {
    return request({
        method: `${CLASS_NAME}queryReplaceRechargeLog`,
        data
    })
  },
  // 帮充值记录
  queryUserReplacePayLog(data) {
    return request({
        method: `${CLASS_NAME}queryUserReplacePayLog`,
        data
    })
  },
  // 检查用户有没有没查看的
  checkUserUnconfirmedRecord(data) {
    return request({
        method: `${CLASS_NAME}checkUserUnconfirmedRecord`,
        data
    })
  },
  // 翻转用户查看状态
  reversalUnconfirmedRecord(data) {
    return request({
        method: `${CLASS_NAME}reversalUnconfirmedRecord`,
        data
    })
  },
  /**
   * 
   * @param {*} data
   * @param data.activityId - 活动标识id
   * @param data.openid - openid
   */
  // 运营页面-立即购买
  payOperatedActivity(data) {
    return request({
        method: `${CLASS_NAME}payOperatedActivity`,
        data
    })
  },
  // 获取优惠券 code
  queryActivityCoupon(data) {
    return request({
        method: `${CLASS_NAME}queryActivityCoupon`,
        data
    })
  },
  // 领取优惠券 activityCode couponRecordId
  getActivityCoupon(data) {
    return request({
        method: `${CLASS_NAME}getActivityCoupon`,
        data
    })
  },
  // 领取中心
  queryActivityCouponForCentre(data) {
    return request({
        method: `${CLASS_NAME}queryActivityCouponForCentre`,
        data
    })
  },
  // 提醒我
  setCouponReminderNotice(data) {
    return request({
        method: `${CLASS_NAME}setCouponReminderNotice`,
        data
    })
  },
}

export default Membership;