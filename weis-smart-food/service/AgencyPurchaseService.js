import request from '../utils/request';

const CLASS_NAME = 'AgencyPurchase/'

const AgencyPurchase = {
  // 我的-查询代点餐数据
  queryReplaceRelation(data) {
    return request({
      method: `${CLASS_NAME}queryReplaceRelation`,
      data
    })
  },
  // 翻转代点餐数据
  overturnReplaceRelation(data) {
    return request({
      method: `${CLASS_NAME}overturnReplaceRelation`,
      data
    });
  },
  // 查询指定详情
  queryReplaceRelationDetail(data) {
    return request({
      method: `${CLASS_NAME}queryReplaceRelationDetail`,
      data
    });
  }
}

export default AgencyPurchase;