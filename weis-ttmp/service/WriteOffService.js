import request from '../utils/api';

const CLASS_NAME = 'WriteOff/'

const WriteOff = {
  // 抖音套餐核销排餐
  createTiktokWriteOffList(data) {
    return request({
      method: `${CLASS_NAME}createTiktokWriteOffList`,
      data
    })
  },
  // 核销
  writeOff(data) {
    return request({
      method: `${CLASS_NAME}writeOff`,
      data
    })
  },
  // 获取用户的单次核销餐单
  queryUserWriteOffList(data) {
    return request({
      method: `${CLASS_NAME}queryUserWriteOffList`,
      data
    })
  },
  // 获取核销详情
  queryUserWriteOffDetail(data) {
    return request({
      method: `${CLASS_NAME}queryUserWriteOffDetail`,
      data
    })
  },

}

export default WriteOff;
