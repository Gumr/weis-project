import request from '../utils/request';

const CLASS_NAME = 'InviteMela/'

const InviteMela = {
  // 创建红包订单
  makeInviteMelaOrder(data) {
    return request({
      method: `${CLASS_NAME}makeInviteMelaOrder`,
      data,
    })
  },
  // 重新支付红包订单
  rePayInviteMelaOrder(data) {
    return request({
      method: `${CLASS_NAME}rePayInviteMelaOrder`,
      data,
    })
  },
  // 查询请客吃饭红包信息
  queryInviteOrderAndUserInfo(data) {
    return request({
      method: `${CLASS_NAME}queryInviteOrderAndUserInfo`,
      data,
    })
  },
  // 领取红包
  receivedInviteMelaAmount(data) {
    return request({
      method: `${CLASS_NAME}receivedInviteMelaAmount`,
      data,
    })
  },
  // 查询名单
  queryListOfRecipients(data) {
    return request({
      method: `${CLASS_NAME}queryListOfRecipients`,
      data,
    })
  },
  // 查询请客记录
  queryInviteMelaOrderList(data) {
    return request({
      method: `${CLASS_NAME}queryInviteMelaOrderList`,
      data,
    })
  },
  // 查询记录详情
  queryInviteMelaOrderDetail(data) {
    return request({
      method: `${CLASS_NAME}queryInviteMelaOrderDetail`,
      data,
    })
  },
}

export default InviteMela;