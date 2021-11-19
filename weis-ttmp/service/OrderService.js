import request from '../utils/api';

const CLASS_NAME = 'Order/'

const Order = {
  // 根据类型获取套餐包集合
  listQueryCombinationPackageGroupByType(data) {
    return request({
      method: `${CLASS_NAME}listQueryCombinationPackageGroupByType`,
      data
    })
  },
  // 根据id查询套餐包详情
  queryCombinationPackageDetailById(data) {
    return request({
      method: `${CLASS_NAME}queryCombinationPackageDetailById`,
      data
    })
  },
  // 提交订单
  submitCombinationPackageOrder(data) {
    return request({
      method: `${CLASS_NAME}submitCombinationPackageOrder`,
      data
    })
  },
  // 查看订单
  listQueryCombinationPackageOrder(data) {
    return request({
      method: `${CLASS_NAME}listQueryCombinationPackageOrder`,
      data
    })
  },
  // 重新购买
  repayCombinationPackageOrder(data) {
    return request({
      method: `${CLASS_NAME}repayCombinationPackageOrder`,
      data
    })
  },
  // 查询具体的TikTok订单详情
  queryTikTokOrder(data) {
    return request({
      method: `${CLASS_NAME}queryTikTokOrder`,
      data
    })
  },
  // 订单退款
  refundTikTokOrderByTradeNo(data) {
    return request({
      method: `${CLASS_NAME}refundTikTokOrderByTradeNo`,
      data
    })
  },

}

export default Order;
