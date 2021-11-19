import request from '../utils/request';

const CLASS_NAME = 'Activity/'

const Activity = {
  // 配置
  announceConf(data) {
    return request({
      method: `${CLASS_NAME}announceConf`,
      data
    })
  },
  // 轮播图
  queryAllActivity(data) {
    return request({
      method: `${CLASS_NAME}queryAllActivity`,
      data
    })
  },
  // 查询效果营列表
  queryUserActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryUserActivityList`,
      data
    })
  },
  // 营长列表
  queryActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryActivityList`,
      data
    })
  },
  queryCampCaseId(data) {
    return request({
      method: `${CLASS_NAME}queryCampCaseId`,
      data
    })
  },
  queryActivityStt(data) {
    return request({
      method: `${CLASS_NAME}queryActivityStt`,
      data
    })
  },
  reserveActivityCamp(data) {
    return request({
      method: `${CLASS_NAME}reserveActivityCamp`,
      data
    })
  },
  queryCurrActivity(data) {
    return request({
      method: `${CLASS_NAME}queryCurrActivity`,
      data
    })
  },
  /**
   * @param data.draftsType：01:视频;02:图文;
   * @param data.limitType：01:只取限制条数;02:不做限制展示所有
   * @param data.healthGoal: userTarget 用户目标
   */
  queryPublicityCopy(data) {
    return request({
      method: `${CLASS_NAME}queryPublicityCopy`,
      data
    })
  },
  /**
   * @param data
   * @param data.targetPath 跳转的小程序路径(String)
   * @param data.targetAppid 目标小程序标识(String)
   */
  getQrCode(data) {
    return request({
      method: `${CLASS_NAME}getQrCode`,
      data
    })
  },
  scanJoinActivityCamp(data) {
    return request({
      method: `${CLASS_NAME}scanJoinActivityCamp`,
      data
    })
  },
  queryUserHistoryActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryUserHistoryActivityList`,
      data
    })
  },
  queryCampanyActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryCampanyActivityList`,
      data
    })
  },
  queryActivityDetail(data) {
    return request({
      method: `${CLASS_NAME}queryActivityDetail`,
      data
    })
  },
  /**
   * 
   * @param {*} data
   * @param data.activityId - 活动id
   * @param data.groupId - 小组id 
   * @param data.currWeight - 当前体重
   */
  recordCampanyActivity(data) {
    return request({
      method: `${CLASS_NAME}recordCampanyActivity`,
      data
    })
  },
  queryUserCurrActivity(data) {
    return request({
      method: `${CLASS_NAME}queryUserCurrActivity`,
      data
    })
  },

  activityLike(data) {
    return request({
      method: `${CLASS_NAME}activityLike`,
      data
    })
  },

  queryActivityTeamMembers(data) {
    return request({
      method: `${CLASS_NAME}queryActivityTeamMembers`,
      data
    })
  },

  ifLiked(data) {
    return request({
      method: `${CLASS_NAME}ifLiked`,
      data
    })
  },

  // 退出减脂营
  quitActivityCamp(data) {
    return request({
      method: `${CLASS_NAME}quitActivityCamp`,
      data
    })
  },

  addActivityCampPlan(data) {
    return request({
      method: `${CLASS_NAME}addActivityCampPlan`,
      data
    })
  },

  queryMyActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryMyActivityList`,
      data
    })
  },

  // 查询拼单信息
  queryMergeTeamDetail(data) {
    return request({
      method: `${CLASS_NAME}queryMergeTeamDetail`,
      data
    })
  },

  // 查询拼单人数
  queryCampUserList(data) {
    return request({
      method: `${CLASS_NAME}queryCampUserList`,
      data
    })
  },

  // 查询首页轮播图
  queryDietBanner(data) {
    return request({
      method: `${CLASS_NAME}queryDietBanner`,
      data
    })
  },

  // 运营页面-商品列表
  queryOperatedActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryOperatedActivityList`,
      data
    })
  },

  /**
   * 
   * @param {*} data
   * @param data.activityId - 主键标识id
   */
  // 运营页面-商品
  queryOperatedActivity(data) {
    return request({
      method: `${CLASS_NAME}queryOperatedActivity`,
      data
    })
  },

  /**
   * 
   * @param {*} data
   * @param data.avInvitedUid： - 分享的用户
   * @param data.avBeInvitedUid - 点击的用户 
   * @param data.avActivityId - 活动标识id
   */
  // 运营页面-分享加记录
  addOperatedActivityInvited(data) {
    return request({
      method: `${CLASS_NAME}addOperatedActivityInvited`,
      data
    })
  },

  /**
   * 
   * @param {*} data
   * @param data.activityId - 活动标识id
   */

  // 运营页面-互助列表
  queryActivityMutual(data) {
    return request({
      method: `${CLASS_NAME}queryActivityMutual`,
      data
    })
  },

  /**
   * 
   * @param {*} data
   * @param data.activityId - 活动标识id
   */
  // 运营页面-排名
  queryActivityRank(data) {
    return request({
      method: `${CLASS_NAME}queryActivityRank`,
      data
    })
  },

  // 运营页面-订单
  queryUserBuyActivity(data) {
    return request({
      method: `${CLASS_NAME}queryUserBuyActivity`,
      data
    })
  },

  queryDiscoverCarousel(data) {
    return request({
      method: `${CLASS_NAME}queryDiscoverCarousel`,
      data
    })
  },

  // 弹窗
  queryDiscoverDialog(data) {
    return request({
      method: `${CLASS_NAME}queryDiscoverDialog`,
      data
    })
  },

  // 弹窗操作日志
  saveUseLog(data){
    return request({
      method: `${CLASS_NAME}saveUseLog`,
      data
    })
  },
  /**
   * 
   * @param {*} data
   * @param data.target - 05:营养课堂
   * @param data.catalogue - 100001营养与膳食，100002营养与疾病，100003营养与生活
   */
  // 查询文章
  queryDiscoverContents(data){
    return request({
      method: `${CLASS_NAME}queryDiscoverContents`,
      data
    })
  },
  // 查询视频
  queryVideos(data){
    return request({
      method: `${CLASS_NAME}queryVideos`,
      data
    })
  },
  // 下发配置
  announceConf(data){
    return request({
      method: `${CLASS_NAME}announceConf`,
      data
    })
  },
}

export default Activity;