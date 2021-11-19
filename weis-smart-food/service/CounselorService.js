import request from '../utils/request';

const CLASS_NAME = 'Counselor/'

const Counselor = {
  // 我的-查询订餐用户是否有顾问
  checkHaveCounselor(data) {
    return request({
      method: `${CLASS_NAME}checkHaveCounselor`,
      data
    })
  },
  // 我的-获取当前用户顾问
  queryCurrUserCounselor(data) {
    return request({
      method: `${CLASS_NAME}queryCurrUserCounselor`,
      data
    })
  },
  // 获取历史客户经理
  queryHistoryCounselor(data) {
    return request({
      method: `${CLASS_NAME}queryHistoryCounselor`,
      data
    });

  },
  /*查询顾问列表*/
  getCounselorList(data) {
    return request({
      method: `${CLASS_NAME}getCounselorList`,
      data
    });
  },
  // 更换客户经理
  replaceCounselor(data) {
    return request({
      method: `${CLASS_NAME}replaceCounselor`,
      data
    });
  },

  // 查询详情
  getCounselorApplicationInfo(data) {
    return request({
      method: `${CLASS_NAME}getCounselorApplicationInfo`,
      data
    });
  },
  // 绑定
  bindCounselor(data) {
    return request({
      method: `${CLASS_NAME}bindCounselor`,
      data
    });
  },
  // 解绑
  unbindCounselor(data) {
    return request({
      method: `${CLASS_NAME}unbindCounselor`,
      data
    });
  },
  queryCompWechatQrcode(data) {
    return request({
      method: `${CLASS_NAME}queryCompWechatQrcode`,
      data
    });
  },
  deleteHistoryCounselor(data) {
    return request({
      method: `${CLASS_NAME}deleteHistoryCounselor`,
      data
    });
  },
  queryQrCodeDetail(data) {
    return request({
      method: `${CLASS_NAME}queryQrCodeDetail`,
      data
    });
  },
  queryUserOnLineIncome(data) {
    return request({
      method: `${CLASS_NAME}queryUserOnLineIncome`,
      data
    });

  },
  queryUserOnLineIncomeList(data) {
    return request({
      method: `${CLASS_NAME}queryUserOnLineIncomeList`,
      data
    });
  },
  // 查询销售人员信息
  queryEmployeeInfo(data) {
    return request({
      method: `${CLASS_NAME}queryEmployeeInfo`,
      data
    });
  },
  // 根据月份查询总业绩
  querySaleProfit(data) {
    return request({
      method: `${CLASS_NAME}querySaleProfit`,
      data
    });
  },
  // 查询每天的总收益列表
  querySaleProfitList(data) {
    return request({
      method: `${CLASS_NAME}querySaleProfitList`,
      data
    });
  },
  // 查询每天收益详情
  querySaleProfitDetail(data) {
    return request({
      method: `${CLASS_NAME}querySaleProfitDetail`,
      data
    });
  },
  /**
   * 
   * @param data.pageSize 长度 
   * @param data.pageNO 页数
   */
  // 分页查询教练信息
  queryCoachInfo(data) {
    return request({
      method: `${CLASS_NAME}queryCoachInfo`,
      data
    });
  },
  /**
   * 
   * @param data.tcaId 教练主键id
   */
  // 查询教练详情
  queryCoachDetail(data) {
    return request({
      method: `${CLASS_NAME}queryCoachDetail`,
      data
    });
  },
  /**
   * 
   * @param data.tcaId 教练主键id
   * @param data.uid 评论人id
   * @param data.star 星级
   * @param data.comment 评论
   * @param data.imageUrl 多张图片用逗号","分隔
   */
  // 添加评论
  addComment(data) {
    return request({
      method: `${CLASS_NAME}addComment`,
      data
    });
  },
  /**
   * 
   * @param data.id 评论主键id
   * @param data.uid 用户uid
   */
  // 删除评论
  deleteComment(data) {
    return request({
      method: `${CLASS_NAME}deleteComment`,
      data
    });
  },
  // 对接云账户，提现⾄⽤户微信零钱
  yunZhangHuToWxPay(data) {
    return request({
      method: `${CLASS_NAME}yunZhangHuToWxPay`,
      data
    });
  },
  // 查询提现列表
  queryYzhToWxPayList(data) {
    return request({
      method: `${CLASS_NAME}queryYzhToWxPayList`,
      data
    });
  },
  // 查询可提成金额
  queryEffectivePay(data) {
    return request({
      method: `${CLASS_NAME}queryEffectivePay`,
      data
    });
  },
  // 获取云账户提现协议
  getYzhAgreement(data) {
    return request({
      method: `${CLASS_NAME}getYzhAgreement`,
      data
    });
  },
  // 专家在线
  queryShowRoleInfo(data) {
    return request({
      method: `${CLASS_NAME}queryShowRoleInfo`,
      data
    });
  },
   // 维士星故事
   queryUserStory(data) {
    return request({
      method: `${CLASS_NAME}queryUserStory`,
      data
    });
  },
   // 营养课堂
   queryNutrition(data) {
    return request({
      method: `${CLASS_NAME}queryNutrition`,
      data
    });
  },
}

export default Counselor;