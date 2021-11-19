import request from '../utils/request';

const CLASS_NAME = 'DataPunch/'

const service = {
  // 菜单
  getEChartOnePage(data) {
    return request({
      method: `${CLASS_NAME}getEChartOnePage`,
      data
    })
  },
  queryOneDayDietCardList(data) {
    return request({
      method: `${CLASS_NAME}queryOneDayDietCardList`,
      data
    })
  },
  addRecord(data) {
    return request({
      method: `${CLASS_NAME}addRecord`,
      data
    })
  },
  getEChartOneDay(data) {
    return request({
      method: `${CLASS_NAME}getEChartOneDay`,
      data
    })
  },
  queryOneMonthCardDates(data) {
    return request({
      method: `${CLASS_NAME}queryOneMonthCardDates`,
      data
    })
  },
  queryUserAppointTimePlat(data) {
    return request({
      method: `${CLASS_NAME}queryUserAppointTimePlat`,
      data
    })
  },
  addDietCardInfo(data) {
    return request({
      method: `${CLASS_NAME}addDietCardInfo`,
      data
    })
  },
  queryCommonlyUsedFoodList(data) {
    return request({
      method: `${CLASS_NAME}queryCommonlyUsedFoodList`,
      data
    })
  },
  queryFoodList(data) {
    return request({
      method: `${CLASS_NAME}queryFoodList`,
      data
    })
  },
  queryDietUserUploadList(data) {
    return request({
      method: `${CLASS_NAME}queryDietUserUploadList`,
      data
    })
  },
  queryDietLibList(data) {
    return request({
      method: `${CLASS_NAME}queryDietLibList`,
      data
    })
  },
  deleteDietLibInfo(data) {
    return request({
      method: `${CLASS_NAME}deleteDietLibInfo`,
      data
    })
  },
  deleteDietUserUploadInfo(data) {
    return request({
      method: `${CLASS_NAME}deleteDietUserUploadInfo`,
      data
    })
  },
  updateOneDietCardInfo(data) {
    return request({
      method: `${CLASS_NAME}updateOneDietCardInfo`,
      data
    })
  },
  addDietLibInfo(data) {
    return request({
      method: `${CLASS_NAME}addDietLibInfo`,
      data
    })
  },
  updateOneDietUserUploadInfo(data) {
    return request({
      method: `${CLASS_NAME}updateOneDietUserUploadInfo`,
      data
    })
  },
  addDietUserUploadInfo(data) {
    return request({
      method: `${CLASS_NAME}addDietUserUploadInfo`,
      data
    })
  },
  queryOneCategoryDietCardList(data) {
    return request({
      method: `${CLASS_NAME}queryOneCategoryDietCardList`,
      data
    })
  },
  deleteOneDietCardInfo(data) {
    return request({
      method: `${CLASS_NAME}deleteOneDietCardInfo`,
      data
    })
  },
  getOneDietUserUploadInfo(data) {
    return request({
      method: `${CLASS_NAME}getOneDietUserUploadInfo`,
      data
    })
  },
}

export default service;
