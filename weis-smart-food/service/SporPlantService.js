import request from '../utils/request';

const CLASS_NAME = 'SportPlan/'

const Sport = {
  // 获取运动方案详情
  querySchemeDetail(data) {
    return request({
      method: `${CLASS_NAME}querySportPlanByUidAndTime`,
      data,
      mode: 'api1'
    })
  },

  // 查询动作库
  queryAllMotionRules(data) {
    return request({
      method: `${CLASS_NAME}queryAllMotionRules`,
      data,
      mode: 'api1'
    })
  },

  // 搜索动作库
  queryNewMotionRules(data) {
    return request({
      method: `${CLASS_NAME}queryNewMotionRules`,
      data,
      mode: 'api1'
    })
  },
  // 搜索运动记录
  querySportCard(data) {
    return request({
      method: `${CLASS_NAME}querySportCard`,
      data,
      mode: 'api1'
    })
  },

  // 删除运动记录
  deleteSportCard(data) {
    return request({
      method: `${CLASS_NAME}deleteSportCard`,
      data,
      mode: 'api1'
    })
  },
  // 自定义运动打卡
  userAddCustomSportCard(data) {
    return request({
      method: `SportCard/userAddCustomSportCard`,
      data,
      mode: 'api1'
    })
  },
  // 查询计划运动
  querySportPlanByUidAndTime(data) {
    return request({
      method: `${CLASS_NAME}querySportPlanByUidAndTime`,
      data,
      mode: 'api1'
    })
  },
  // 计算卡路里
  countConsume(data) {
    return request({
      method: `${CLASS_NAME}countConsume`,
      data,
      mode: 'api1'
    })
  },
  // 帮助学员计划打卡、帮助学员运动打卡、自己打卡 、一键打卡
  addSportcard(data) {
    return request({
      method: `${CLASS_NAME}coachAddSportCard`,
      data,
      mode: 'api1'
    })
  },
  // 获取打卡完成数据
  getPunchedData(data) {
    return request({
      method: `${CLASS_NAME}coachOrUserGetSportCard`,
      data,
      mode: 'api1'
    })
  }
}
export default Sport;