import request from './request'

export function getHeadPointList() {
  return request('ServeMealsOperation/queryAllHeatInfo').thenwrap((err, data) => (err ? Promise.reject(err) : data))
}

export function getTargetUserList() {
  return request('OrderStockHist/getTargetUserList', {}).thenwrap((err, data) => (err ? Promise.reject(err) : data))
}

export function DDLogin(authCode: string) {
  return request('sys.DingTalkUser/login', { authCode })
}

export function queryUserByPhone(phone: string) {
  return request('Customer/queryCustomerByPhone', {
    phone
  })
}

export function  getSetMealTypeOptions() {
  return request('groupmeal.ComboCategory/queryComboCategoryList', { tgccStt: '01' })
    .thenwrap((err, data: {tgccId: string, tgccName: string, tgcStt: string }) => (err ? Promise.reject(err) : data))
}

export function getCorpAddress(corpId: string) { // 根据企业id返回地址列表
  return request('groupmeal.Corp/getCorpAddress', {
    corpId
  }).thenwrap((err, data) => err ? Promise.reject(err) : data)
}