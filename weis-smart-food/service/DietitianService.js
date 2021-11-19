import request from '../utils/request';

const CLASS_NAME = 'Dietitian/'

const Dietitian = {
    // 查询我的营养师
    queryDietitian(data) {
        return request({
            mode: 'health',
            method: `${CLASS_NAME}queryDietitian`,
            data
        })
    },
    queryHistoryDietitian(data) {
        return request({
            mode: 'health',
            method: `${CLASS_NAME}queryHistoryDietitian`,
            data
        })
    },
}

export default Dietitian;