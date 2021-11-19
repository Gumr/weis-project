import request from '../utils/request';

const CLASS_NAME = 'Address/'

const Address = {
    // 地址列表
    queryAddressListForThree(data) {
        return request({
            method: `${CLASS_NAME}queryAddressListForThree`,
            data
        })
    },
    //加热点列表
    heatingPointListForRange(data) {
        return request({
            method: `${CLASS_NAME}heatingPointListForRange`,
            data
        })
    },
    //查询加热点时间
    queryHeatingPointConf(data) {
        return request({
            method: `${CLASS_NAME}queryHeatingPointConf`,
            data
        })
    },
    //匹配加热点
    matchHeatingPointForThree(data) {
        return request({
            method: `${CLASS_NAME}matchHeatingPointForThree`,
            data
        })
    },
    //修改收货地址
    updateAddressInfoForThree(data) {
        return request({
            method: `${CLASS_NAME}updateAddressInfoForThree`,
            data
        })
    },
    //新增收货地址
    addAddressForThree(data) {
        return request({
            method: `${CLASS_NAME}addAddressForThree`,
            data
        })
    },
    // 获取骑手位置
    queryRiderPosition(data) {
        return request({
            method: `${CLASS_NAME}queryRiderPosition`,
            data
        })
    },
    detectUserAddress(data) {
        return request({
            method: `${CLASS_NAME}detectUserAddress`,
            data
        })
    }
}

export default Address;