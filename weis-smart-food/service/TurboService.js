import request from '../utils/request';

const CLASS_NAME = 'Turbo/'

const Turbo = {
    // 下单
    makeOrder(data) {
        return request({
            method: `${CLASS_NAME}makeOrder`,
            data
        })
    },
    rePayOrder(data) {
        return request({
            method: `${CLASS_NAME}rePayOrder`,
            data
        })
    },
    // 微信支付订单成功后 后端更新支付状态
    queryOrderPayStt(data) {
        return request({
            method: `${CLASS_NAME}queryOrderPayStt`,
            data
        })
    },
}

export default Turbo;