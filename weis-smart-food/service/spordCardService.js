import request from '../utils/request';

const CLASS_NAME = 'SportCard/'

const SportCard = {
    // 查询运动打卡
    querySportCardFood(data) {
        return request({
            method: `${CLASS_NAME}querySportCard`,
            data,
            mode: 'api1'
        })
    },
    // 复制
    userAddSportCard(data) {
        return request({
            method: `${CLASS_NAME}userAddSportCard`,
            data,
            mode: 'api1'
        })
    },
    // 删除运动记录
  deleteSportCardFood(data) {
    return request({
      method: `${CLASS_NAME}deleteSportCard`,
      data,
      mode: 'api1'
    })
  },
}

export default SportCard;