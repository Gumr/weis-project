import request from '../utils/request';

const CLASS_NAME = 'Order/'

const service = {
  createSevenPayOrder(data) {
    return request({
      method: `${CLASS_NAME}createSevenPayOrder`,
      data
    })
  },
  confirmedOrder(data) {
    return request({
      method: `${CLASS_NAME}confirmedOrder`,
      data
    })
  },
  getOrderLog(data) {
    return request({
      method: `${CLASS_NAME}getOrderLog`,
      data
    })
  },
  querySendCoupons(data) { //再来一单送券
    return request({
      method: `${CLASS_NAME}getSodoCoupon`,
      data
    })
  },
  checkUserOrderedByCategory(data) {
    return request({
      method: `${CLASS_NAME}checkUserOrderedByCategory`,
      data
    })
  },
  queryPlayCard(data) { // 获取玩法卡片
    return request({
      method: `${CLASS_NAME}getOrderPlayCard`,
      data
    })
  },
  queryPlayshareList(data) { //获取玩法分享记录
    return request({
      method: `${CLASS_NAME}getSharePlayPlanList`,
      data
    })
  },
  sharePlay(data) { // 翻牌
    return request({
      method: `${CLASS_NAME}sharePlayDraw`,
      data
    })
  },
  getAppOrderByKey(data) { // app跳转小程序
    return request({
      method: `${CLASS_NAME}getAppOrderByKey`,
      data
    })
  },
  queryOrderEvaluate(data) { // 查询评价
    return request({
      method: `${CLASS_NAME}queryOrderEvaluate`,
      data
    })
  },
  addOrderEvaluate(data) { // 提交评价
    return request({
      method: `${CLASS_NAME}addOrderEvaluate`,
      data
    })
  },
  queryCorpOrderList(data) { // 接口人查询点餐列表
    return request({
      method: `${CLASS_NAME}queryCorpOrderList`,
      data
    })
  },
  queryCorpOrderDetail(data) { // 签收详情
    return request({
      method: `${CLASS_NAME}queryCorpOrderDeatil`,
      data
    })
  },
  SignCorpOrder(data) { // 签收
    return request({
      method: `${CLASS_NAME}SignCorpOrder`,
      data
    })
  },
  queryUserCorpAddressList(data) { // 获取接口人校区列表
    return request({
      method: `${CLASS_NAME}queryUserCorpAddressList`,
      data
    })
  },
  queryGroupForecastDetailList(data) { // 销售预测列表
    return request({
      method: `${CLASS_NAME}queryGroupForecastDetailList`,
      data
    })
  },
  changeGroupForecasDetail(data) { // 变更销售预测
    return request({
      method: `${CLASS_NAME}changeGroupForecasDetail`,
      data
    })
  },
  // 查询取餐码
  asciiOrderId(data) {
    return request({
      method: `${CLASS_NAME}asciiOrderId`,
      data
    })
  },
  // 发票
  queryOrderListForInvoice(data) {
    return request({
      method: `${CLASS_NAME}queryOrderListForInvoice`,
      data
    })
  },
  // 查询开票记录
  queryInvoiceRecordList(data) {
    return request({
      method: `${CLASS_NAME}queryInvoiceRecordList`,
      data
    })
  },
  // 提交发票
  createInvoiceRecord(data) {
    return request({
      method: `${CLASS_NAME}createInvoiceRecord`,
      data
    })
  },
  // 获取企业开票列表
  queryInvoiceCropList(data) {
    return request({
      method: `${CLASS_NAME}queryInvoiceCropList`,
      data
    })
  },
  // 获取企业税号
  queryInvoiceCropDetail(data) {
    return request({
      method: `${CLASS_NAME}queryInvoiceCropDetail`,
      data
    })
  },
  // 重新发送
  sendInvoicePDF(data) {
    return request({
      method: `${CLASS_NAME}sendInvoicePDF`,
      data
    })
  },
  // 多餐优惠
  queryAllMuchFoodConfig(data) {
    return request({
      method: `${CLASS_NAME}queryAllMuchFoodConfig`,
      data
    })
  },
}

export default service;
