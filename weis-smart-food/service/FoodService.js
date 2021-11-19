import request from '../utils/request';

const CLASS_NAME = 'Food/'

const Food = {
  // 菜单
  querySaleGoodsForThree(data) {
    return request({
      method: `${CLASS_NAME}querySaleGoodsForThree`,
      data
    })
  },
  // 查询日期
  queryGoodsDateList(data) {
    return request({
      method: `${CLASS_NAME}queryGoodsDateList`,
      data
    })
  },
  querySKUById(data) {
    return request({
      method: `${CLASS_NAME}querySKUById`,
      data
    })
  },
  changePlanMenu(data) {
    return request({
      method: `${CLASS_NAME}changePlanMenu`,
      data
    })
  },
  // 查询指定商品及详情
  queryAppointGoods(data) {
    return request({
      method: `${CLASS_NAME}queryAppointGoods`,
      data
    })
  },
  // 套餐
  querySaleSetMeal(data) {
    return request({
      method: `${CLASS_NAME}querySaleSetMeal`,
      data
    })
  },
  // 添加购物车
  addShoppingCart(data) {
    return request({
      method: `${CLASS_NAME}addShoppingCart`,
      data
    })
  },
  // 查询购物车数量
  queryShoppingCartCount(data) {
    return request({
      method: `${CLASS_NAME}queryShoppingCartCount`,
      data
    })
  },
  // 切换加热点
  switchShopCatHpid(data) {
    return request({
      method: `${CLASS_NAME}switchShopCatHpid`,
      data
    })
  },
  // 查询餐具
  queryGroundingWareList(data) {
    return request({
      method: `${CLASS_NAME}queryGroundingWareList`,
      data
    })
  },
  // 结算
  userBillSettlementForShip(data) {
    return request({
      method: `${CLASS_NAME}settlement`,
      data
    })
  },
  // 切换配送
  switchLogisticsWay(data) {
    return request({
      method: `${CLASS_NAME}switchLogisticsWay`,
      data
    })
  },
  // 清除
  cleanGoodsForShip(data) {
    return request({
      method: `${CLASS_NAME}cleanGoodsForShip`,
      data
    })
  },
  // 我的
  queryShipListLimit(data) {
    return request({
      method: `${CLASS_NAME}queryShipListLimit`,
      data
    })
  },
  cratePlanSkuList(data) {
    return request({
      method: `${CLASS_NAME}cratePlanSkuList`,
      data
    })
  },
  querySkuListByPlan(data) {
    return request({
      method: `${CLASS_NAME}querySkuListByPlan`,
      data
    })
  },
  singleCreateSevenOrder(data) {
    return request({
      method: `${CLASS_NAME}singleCreateSevenOrder`,
      data
    })
  },
  getSevenNoPayOrder(data) {
    return request({
      method: `${CLASS_NAME}getSevenNoPayOrder`,
      data
    })
  },
  changeSingleSku(data) {
    return request({
      method: `${CLASS_NAME}changeSingleSku`,
      data
    })
  },
  switchShipOrderAddressForSeven(data) {
    return request({
      method: `${CLASS_NAME}switchShipOrderAddressForSeven`,
      data
    })
  },
  queryOrderListForThree(data) {
    return request({
      method: `${CLASS_NAME}queryOrderListForThree`,
      data
    })
  },
  queryShipOrderDetailForThree(data) {
    return request({
      method: `${CLASS_NAME}queryShipOrderDetailForThree`,
      data
    })
  },
  orderRefundShipOrder(data) {
    return request({
      method: `${CLASS_NAME}orderRefundShipOrder`,
      data
    })
  },
  checkChangeAddress(data) {
    return request({
      method: `${CLASS_NAME}checkChangeAddress`,
      data
    })
  },
  switchShipOrderAddress(data) {
    return request({
      method: `${CLASS_NAME}switchShipOrderAddress`,
      data
    })
  },
  queryUserRefundList(data) {
    return request({
      method: `${CLASS_NAME}queryUserRefundList`,
      data
    })
  },
  mergeShipOrderPay(data) {
    return request({
      method: `${CLASS_NAME}mergeShipOrderPay`,
      data
    })
  },
  queryUserRefundListForThree(data) {
    return request({
      method: `${CLASS_NAME}queryUserRefundListForThree`,
      data
    })
  },
  queryTotalShipOrder(data) {
    return request({
      method: `${CLASS_NAME}queryTotalShipOrder`,
      data
    })
  },
  orderRefund(data) {
    return request({
      method: `${CLASS_NAME}orderRefund`,
      data
    })
  },
  queryRefundDetail(data) {
    return request({
      method: `${CLASS_NAME}queryRefundDetail`,
      data
    })
  },
  queryUserBuyFatPackOrderForThree(data) {
    return request({
      method: `${CLASS_NAME}queryUserBuyFatPackOrderForThree`,
      data
    })
  },
  cancellationRefund(data) {
    return request({
      method: `${CLASS_NAME}cancellationRefund`,
      data
    })
  },
  createChangeOrderPay(data) {
    return request({
      method: `${CLASS_NAME}createChangeOrderPay`,
      data
    })
  },
  userQueryBusiness(data) {
    return request({
      method: `${CLASS_NAME}queryBusiness`,
      data
    })
  },
  //查询分公司信息
  queryComBranchCorpList(data) {
    return request({
      method: `${CLASS_NAME}queryBranchCorpList`,
      data
    })
  },
  querySaveGroupCorpLoginLog(data) {
    return request({
      method: `${CLASS_NAME}saveGroupCorpLoginLog`,
      data
    })
  },
  //查询送达的时间
  queryBusinessSendTime(data) {
    return request({
      method: `${CLASS_NAME}queryBusinessSendTime`,
      data
    })
  },
  userSaveUserCorpAddress(data) {
    return request({
      method: `${CLASS_NAME}saveUserCorpAddress`,
      data
    })
  },
  cleanCartByDateAndCategory(data) {
    return request({
      method: `${CLASS_NAME}cleanCartByDateAndCategory`,
      data
    })
  },
  cleanSkuListEmp(data) {
    return request({
      method: `${CLASS_NAME}cleanSellOutCart`,
      data
    })
  },
  queryDietaryIntake(data) {//type:01喜好;02:过敏(String)
    return request({
      method: `${CLASS_NAME}queryDietaryIntake`,
      data
    })
  },
  queryUserAllergen(data) {
    return request({
      method: `${CLASS_NAME}queryUserAllergen`,
      data
    })
  },
  addUserDietaryIntake(data) {
    return request({
      method: `${CLASS_NAME}addUserDietaryIntake`,
      data
    })
  },
  checkUserCorrespondGroup(data) {
    return request({
      method: `${CLASS_NAME}checkUserCorrespondGroup`,
      data
    })
  },
  clearUserPlanShoppingCart(data) {
    return request({
      method: `${CLASS_NAME}clearUserPlanShoppingCart`,
      data
    })
  },
  // 收藏菜品
  favouriteSku(data) {
    return request({
      method: `${CLASS_NAME}favouriteSku`,
      data
    })
  },
  // 更换智能推荐菜品
  replaceCateringShoppingCartGoods(data) {
    return request({
      method: `${CLASS_NAME}replaceCateringShoppingCartGoods`,
      data
    })
  },
  //查询饮食习惯
  querySaleGoodsDietaryIntake(data) {
    return request({
      method: `${CLASS_NAME}querySaleGoodsDietaryIntake`,
      data
    })
  },
  // 教练点餐 查询套餐类别
  queryCoachComboList(data) {
    return request({
      method: `${CLASS_NAME}queryCoachComboList`,
      data
    })
  },
  // 教练点餐 查询套餐列表
  queryCoachSkuList(data) {
    return request({
      method: `${CLASS_NAME}queryCoachSkuList`,
      data
    })
  },
  // 推荐套餐
  getGenerateSingleMeal(data) {
    return request({
      method: `${CLASS_NAME}getGenerateMealByType`,
      data,
      hideErrMsg: true,
    })
  },
  //获取偏好设置
  getUserPreferencesLog(data) {
    return request({
      method: `${CLASS_NAME}getUserPreferencesLog`,
      data
    })
  },
  //多餐优惠
  queryMuchFoodList(data) {
    return request({
      method: `${CLASS_NAME}queryMuchFoodList`,
      data
    })
  },
  //多餐优惠计算价格
  getMuchFoodTotalPrice(data) {
    return request({
      method: `${CLASS_NAME}getMuchFoodTotalPrice`,
      data
    })
  },
  //套餐推荐-目录列表
  getSetMealType(data) {
    return request({
      method: `${CLASS_NAME}getSetMealType`,
      data
    })
  },
  //套餐推荐-获取套餐
  getSetMealByType(data) {
    return request({
      method: `${CLASS_NAME}getSetMealByType`,
      data,
      hideErrMsg: true,
    })
  },
  // 套餐修改
  editMealPackage(data) {
    return request({
      method: `${CLASS_NAME}editMealPackage`,
      data
    })
  },
  //结算页换单品
  replaceSingleGoods(data) {
    return request({
      method: `${CLASS_NAME}replaceSingleGoods`,
      data,
      hideErrMsg: true,
    })
  },
}

export default Food;
