import HandleResponse from './basic'
import {get, post} from '../utils/http'

export default class LoginService extends HandleResponse {
  /**
   * 根据征集期获取榜单列表
   * @param {Number} pageNo 页数
   * @param {Number} pageSize 长度
   */
  queryIncomeList(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Balance/queryIncomeList',
      data: {
        method: 'queryIncomeList',
        params: [params]
      }
    })
  }

  /**
   * 查询我的总收入
   * @returns {Number} balanceHistory 历史总收入
   * @returns {Number} balanceCurrent 当前总收入
   */
  queryIncomeTotal(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Balance/queryIncomeTotal',
      data: {
        method: 'queryIncomeTotal',
        params: [params]
      }
    })
  }

  /**
   * 提现
   * @param {Number} amount 提现金额（单位：元）
   * @returns {Number} partnerTradeNo 商户订单号
   */
  withdrawDeposit(params = {}) {
    return post({
      url: '/cn.weis.api.recipes.Balance/withdrawDeposit',
      data: {
        method: 'withdrawDeposit',
        params: [params]
      }
    })
  }
}