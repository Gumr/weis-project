import request from '../utils/request';

const CLASS_NAME = 'Marketing/'

const Marketing = {
  // 排行榜
  queryUsersRankList(data) {
    return request({
      method: `${CLASS_NAME}queryUsersRankList`,
      data
    })
  },
  queryUserScore(data) {
    return request({
      method: `${CLASS_NAME}queryUserScore`,
      data
    })
  },
  /**
   * 
   * @param data.avInvitedUid 邀请人 
   * @param data.avActivityType 活动类型 写死 01 
   * @param data.avActivityId 活动id
   */
  addActivityInvited(data) {
    return request({
      method: `${CLASS_NAME}addActivityInvited`,
      data
    })
  },
  queryUserActivityTimeList(data) {
    return request({
      method: `${CLASS_NAME}queryUserActivityTimeList`,
      data
    })
  },
  queryEndReport(data) {
    return request({
      method: `${CLASS_NAME}queryEndReport`,
      data
    })
  },
  getGroupRankList(data) {
    return request({
      method: `${CLASS_NAME}getGroupRankList`,
      data
    })
  },
  getGroupNewRankList(data) {
    return request({
      method: `${CLASS_NAME}getGroupNewRankList`,
      data
    })
  },
  /**
   * 
   * @param {*} data 
   * @param data.scoreType //01 摄入 02 活跃度 03 运动 04 体重
   * @param data.range // 01 个人 02 团队
   * @param data.tclwrClwId //企业id
   */
  queryUserGroupCorpScore(data) {
    return request({
      method: `${CLASS_NAME}queryUserGroupCorpScore`,
      data
    })
  },

  queryUserGroupCorpScoreDetail(data) {
    return request({
      method: `${CLASS_NAME}queryUserGroupCorpScoreDetail`,
      data
    })
  },


  // 线上减脂应
  queryUsersOnLineRankList(data) {
    return request({
      method: `${CLASS_NAME}queryUsersOnLineRankList`,
      data
    })
  },
  queryMyRiceBallRecord(data) {
    return request({
      method: `${CLASS_NAME}queryMyRiceBallRecord`,
      data
    })
  },
  createRiceBall(data) {
    return request({
      method: `${CLASS_NAME}createRiceBall`,
      data
    })
  },
  queryMyRiceBallDetail(data) {
    return request({
      method: `${CLASS_NAME}queryMyRiceBallDetail`,
      data
    })
  },
  queryRiceBallAllUserList(data) {
    return request({
      method: `${CLASS_NAME}queryRiceBallAllUserList`,
      data
    })
  },
  changeMyRiceBall(data) {
    return request({
      method: `${CLASS_NAME}changeMyRiceBall`,
      data
    })
  },
  checkUserInRiceBall(data) {
    return request({
      method: `${CLASS_NAME}checkUserInRiceBall`,
      data
    })
  },
  queryMyRiceBallRanks(data) {
    return request({
      method: `${CLASS_NAME}queryMyRiceBallRanks`,
      data
    })
  },
  queryMyRiceBallRankDetail(data) {
    return request({
      method: `${CLASS_NAME}queryMyRiceBallRankDetail`,
      data
    })
  },
  finishRiceBall(data) {
    return request({
      method: `${CLASS_NAME}finishRiceBall`,
      data
    })
  },
  //查询减肥营规则
  queryActivityRuleBean(data) {
    return request({
      method: `${CLASS_NAME}queryActivityRuleBean`,
      data
    })
  },
  /**
   * 
   * @param {*} data 
   * @param data.fromUid // 查询的用户uid
   * @param data.dateList // 查询的时间(开始时间，结束时间)
   */
  //获取用户的营养报告(时间段)
  queryUserBusinessReports(data) {
    return request({
      method: `${CLASS_NAME}queryUserBusinessReports`,
      data
    })
  },
  cancelRiceBall(data) {
    return request({
      method: `${CLASS_NAME}cancelRiceBall`,
      data
    })

  },
  queryRiceBallList(data) {
    return request({
      method: `${CLASS_NAME}queryRiceRallList`,
      data
    })

  },
  /**
   * 
   * @param {*} data 
   * @param data.uid // 用户uid
   */
  // 获取用户的优惠券及加油包列表
  queryUserVipCouponMessage(data) {
    return request({
      method: `${CLASS_NAME}queryUserVipCouponMessage`,
      data
    })
  },
  // 获取用户的会员订单列表
  queryPurchaseVipRecordList(data) {
    return request({
      method: `${CLASS_NAME}queryPurchaseVipRecordList`,
      data
    })
  },
  /**
   * 
   * @param {*} data
   * @param data.payType // 支付类型 01  首次开通会员  02 续费会员  03 购买加油包
   * @param data.payWay // 支付方式
   * @param data.payChannel // 支付渠道
   * @param data.totalAmount // 总金额
   * @param data.actualAmount // 实际付款
   */
  // 会员支付
  payVip(data) {
    return request({
      method: `${CLASS_NAME}payVip`,
      data
    })
  },
  // 会员重新支付
  rePayVip(data) {
    return request({
      method: `${CLASS_NAME}rePayVip`,
      data
    })
  },
  // 签到
  userDoSign(data) {
    return request({
      method: `${CLASS_NAME}userDoSign`,
      data
    })
  },
  // 查询签到情况
  userSignDetail(data) {
    return request({
      method: `${CLASS_NAME}userSignDetail`,
      data
    })
  },
  // 查询会员得分
  queryUserNutritionHealthScore(data) {
    return request({
      method: `${CLASS_NAME}queryUserNutritionHealthScore`,
      data
    })
  },
  // 查询更换套餐提醒
  intelligenceChangeGoods(data) {
    return request({
      method: `${CLASS_NAME}intelligenceChangeGoods`,
      data
    })
  },
  // 公共页面的饭圈列表，最新的十条
  queryDynamicByType(data) {
    return request({
      method: `${CLASS_NAME}queryDynamicByType`,
      data
    })
  },
  // 添加一条饭圈动态
  addDynamic(data) {
    return request({
      method: `${CLASS_NAME}addDynamic`,
      data
    })
  },
  // 删除饭圈动态
  delDynamic(data) {
    return request({
      method: `${CLASS_NAME}delDynamic`,
      data
    })
  },
  // 查询评论列表
  queryCommentListById(data) {
    return request({
      method: `${CLASS_NAME}queryCommentListById`,
      data
    })
  },
  // 发表评论
  addComment(data) {
    return request({
      method: `${CLASS_NAME}addComment`,
      data
    })
  },
  // 删除评论
  delComment(data) {
    return request({
      method: `${CLASS_NAME}delComment`,
      data
    })
  },
  // 点赞 (含取消) 动态 or 评论
  clickLikeButton(data) {
    return request({
      method: `${CLASS_NAME}clickLikeButton`,
      data
    })
  },
  // 关联餐单时候需要得到的 & 健康分列表
  healthScoreList(data) {
    return request({
      method: `${CLASS_NAME}healthScoreList`,
      data
    })
  },
  // 饭圈新菜列表
  newFoodSkuList(data) {
    return request({
      method: `${CLASS_NAME}newFoodSkuList`,
      data
    })
  },
  // 订阅菜品提醒
  subscribe2DishReminders(data) {
    return request({
      method: `${CLASS_NAME}subscribe2DishReminders`,
      data
    })
  },
  // 查询我饭圈的所有未读消息
  queryUnReadMsg(data) {
    return request({
      method: `${CLASS_NAME}queryUnReadMsg`,
      data
    })
  },
  // 设置我所有未读的消息为已读
  setDoReadMsg(data) {
    return request({
      method: `${CLASS_NAME}setDoReadMsg`,
      data
    })
  },
  // 回收-查询近三天已签收/取餐状态的餐单的餐盒
  recyclingBox(data) {
    return request({
      method: `${CLASS_NAME}recyclingBox`,
      data
    })
  },
  // 回收-确认回收某一餐单的餐盒
  confirmRecycling(data) {
    return request({
      method: `${CLASS_NAME}confirmRecycling`,
      data
    })
  },
  // 回收-获取回收奖励 - 红包
  recyclingRedBag(data) {
    return request({
      method: `${CLASS_NAME}recyclingRedBag`,
      data
    })
  },
  // 双11红包 - 是否能领取查询
  doubleElevenRedBag(data) {
    return request({
      method: `${CLASS_NAME}doubleElevenRedBag`,
      data
    })
  },
  // 双11红包 - 领取红包
  getDoubleElevenRedBag(data) {
    return request({
      method: `${CLASS_NAME}getDoubleElevenRedBag`,
      data
    })
  },
  // 查询菜品投票未读信息
  redPointToVoteSku(data) {
    return request({
      method: `${CLASS_NAME}redPointToVoteSku`,
      data
    })
  },
  // 获取投票活动列表 - 可不需要登录
  queryVoteActivity(data) {
    return request({
      method: `${CLASS_NAME}queryVoteActivity`,
      data
    })
  },
  // 给指定活动场次的指定菜品投票
  voteForFavoriteGood(data) {
    return request({
      method: `${CLASS_NAME}voteForFavoriteGood`,
      data
    })
  },
}

export default Marketing;