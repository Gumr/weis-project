import request from '../utils/request';

const CLASS_NAME = 'BodyData/'

const service = {
  // 血糖
  queryBloodSugarByTime(data) {
    return request({
      method: `${CLASS_NAME}queryBloodSugarByTime`,
      mode: 'health',
      data
    })
  },
  // 血压
  queryBloodPressure(data) {
    return request({
      method: `${CLASS_NAME}queryBloodPressure`,
      mode: 'health',
      data
    })
  },
  // 血压
  addBodyDataInfo(data) {
    return request({
      method: `${CLASS_NAME}addBodyDataInfo`,
      mode: 'health',
      data
    })
  },
  deleteBodyDataInfo(data) {
    return request({
      method: `${CLASS_NAME}deleteBodyDataInfo`,
      mode: 'health',
      data
    })
  },
  queryWeightByTime(data) {
    return request({
      method: `${CLASS_NAME}queryWeightByTime`,
      mode: 'health',
      data
    })
  },
  queryHistoryWeight(data) {
    return request({
      method: `${CLASS_NAME}queryHistoryWeight`,
      mode: 'health',
      data
    })
  },
  queryHistoryBloodSugar(data) {
    return request({
      method: `${CLASS_NAME}queryHistoryBloodSugar`,
      mode: 'health',
      data
    })
  },
  queryHistoryBloodPressure(data) {
    return request({
      method: `${CLASS_NAME}queryHistoryBloodPressure`,
      mode: 'health',
      data
    })
  },
}

export default service;