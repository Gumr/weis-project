import request from '../utils/api';

const CLASS_NAME = 'Address/'

const Address = {
    // 地址列表
    queryAddressListForThree(data) {
        return request({
            method: `${CLASS_NAME}queryAddressListForThree`,
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
    //加热点列表
    //String - userLng 经度
    //String - userLng 纬度
    heatingPointListForRange(data) {
        return request({
            method: `${CLASS_NAME}heatingPointListForRange`,
            data,
            mode: 'api',
        })
    },
    //查询加热点时间
    // hId:加热点标识(long)
    // category:餐别(String)
    // dataStt:数据状态(String)
    // orderMethod:点餐方式(String)
    // Returns:
    // supplyConf:配置列表(List)
    queryHeatingPointConf(data) {
        return request({
            method: `${CLASS_NAME}queryHeatingPointConf`,
            data,
            mode: 'api',
        })
    },
}

export default Address;