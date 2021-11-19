import request from '../utils/request';

const CLASS_NAME = 'ForecastOrder/'

const ForecastOrder = {
    // 查询下周 周一至周日预测单
    queryForecastOrder(data) {
        return request({
            method: `${CLASS_NAME}queryForecastOrder`,
            data
        })
    },
    // 查询 当前时间第二天 下单数和预测单数
    queryBuyOrder(data) {
        return request({
            method: `${CLASS_NAME}queryBuyOrder`,
            data
        })
    },
    // 菜品售卖时间报告
    querySkuByPastDue(data) {
        return request({
            method: `${CLASS_NAME}querySkuByPastDue`,
            data
        })
    },
}

export default ForecastOrder;