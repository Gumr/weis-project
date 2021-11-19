import request from '../utils/request';

const CLASS_NAME = 'Coupon/'

const Coupon = {
  // 我的-卡券列表
  queryCouponList(data) {
    return request({
      method: `${CLASS_NAME}queryCouponList`,
      data,
    })
  },
  /**
   * 
   * @param data.stt （不传则默认所有状态的）红包状态 00:未使用,01:使用中,02:已使用,03:已失效
   */
  // 我的-红包列表
  queryRedPacketByUser(data) {
    return request({
      method: `${CLASS_NAME}queryRedPacketByUser`,
      data,
    })
  },
}

export default Coupon;