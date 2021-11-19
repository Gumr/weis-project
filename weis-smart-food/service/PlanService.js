import request from '../utils/request';

const CLASS_NAME = 'Plan/'

const Plan = {
  // 查询用户目标
  queryUserTarget(data) {
    return request({
      method: `${CLASS_NAME}queryUserTarget`,
      data
    })
  },
  // 查询玩法
  /**
   * 
   * @param {
   *   planType: 1 白领 4 学生
   * } data 
   */
  getPlayList(data) {
    return request({
      method: `${CLASS_NAME}getPlayList`,
      data
    })
  },

  getPlay(data) {
    return request({
      method: `${CLASS_NAME}getPlay`,
      data
    })
  },
  /**
   * 
   * @param {
   *   category?: "undefined"
   *   date: string
   *   planCode: string
   *   planName: string
   *   pop: 0 是否需要提示
   * } data 
   */
  checkPlayWay(data) {
    return request({
      method: `${CLASS_NAME}checkPlayWay`,
      data
    })
  },
  getEatWayList(data) {
    return request({
      method: `${CLASS_NAME}getEatWayList`,
      data
    })
  },
  // 增加用户目标
  addUserTarget(data) {
    return request({
      method: `${CLASS_NAME}addUserTarget`,
      data
    })
  },
  // 修改用户目标
  updateUserTarget(data) {
    return request({
      method: `${CLASS_NAME}updateUserTarget`,
      data
    })
  },
  queryUserPlanCacheThree(data) {
    return request({
      method: `${CLASS_NAME}queryUserPlanCacheThree`,
      data
    })
  },
  // 更新当天临时数据
  updateUserProgrammeDetailThree(data) {
    return request({
      method: `${CLASS_NAME}updateUserProgrammeDetailThree`,
      data
    })
  },
  queryDailyNutritionElement(data) {
    return request({
      method: `${CLASS_NAME}queryDailyNutritionElement`,
      data
    })
  },
  // 查询方案
  queryUserProgramme(data) {
    return request({
      method: `${CLASS_NAME}queryUserProgramme`,
      data
    })
  },
  // 查询基础代谢
  queryUserBasalMetabolism(data) {
    return request({
      method: `${CLASS_NAME}queryUserBasalMetabolism`,
      data,
    })
  },
  // 增加
  addUserProgramme(data) {
    return request({
      method: `${CLASS_NAME}addUserProgramme`,
      data,
    })
  },
  existActivityPlan(data) {
    return request({
      method: `${CLASS_NAME}existActivityPlan`,
      data,
    })
  },
  updateUserPlanDetailRatio(data) {
    return request({
      method: `${CLASS_NAME}updateUserPlanDetailRatio`,
      data,
    })
  },
  updateUserProgrammeDetail(data) {
    return request({
      method: `${CLASS_NAME}updateUserProgrammeDetail`,
      data,
    })
  },
  updateUserProgramme(data) {
    return request({
      method: `${CLASS_NAME}updateUserProgramme`,
      data,
    })
  },
  addUserProgrammeDetail(data) {
    return request({
      method: `${CLASS_NAME}addUserProgrammeDetail`,
      data,
    })
  },
  checkIsCustomizePlan(data) {
    return request({
      method: `${CLASS_NAME}checkIsCustomizePlan`,
      data,
    })
  },
  checkPlanTimeSlot(data) {
    return request({
      method: `${CLASS_NAME}checkPlanTimeSlot`,
      data,
    })
  },
  applicationDietPlan(data) {
    return request({
      method: `${CLASS_NAME}applicationDietPlan`,
      data,
    })
  },
  // 查询方案
  queryCounselorToUserPlan(data) {
    return request({
      method: `${CLASS_NAME}queryCounselorToUserPlan`,
      data
    });
  },
  queryRecommendListByType(data) {
    return request({
      method: `${CLASS_NAME}queryRecommendListByType`,
      data
    });
  },
  queryDietPlanList(data) {
    return request({
      method: `${CLASS_NAME}queryDietPlanList`,
      data
    });
  },
  queryRecommendCaseById(data) {
    return request({
      method: `${CLASS_NAME}queryRecommendCaseById`,
      data
    });
  },
  completeAiPlan(data) {
    return request({
      method: `${CLASS_NAME}completeAiPlan`,
      data
    });
  },
  queryNavigationReport(data) {
    return request({
      method: `${CLASS_NAME}queryNavigationReport`,
      data
    });
  },
  queryProgrammeList(data) {
    return request({
      method: `${CLASS_NAME}queryProgrammeList`,
      data
    });
  },
  delHistoryPlan(data) {
    return request({
      method: `${CLASS_NAME}delHistoryPlan`,
      data
    });
  },
  queryUserPlanTotalByType(data) {
    return request({
      method: `${CLASS_NAME}queryUserPlanTotalByType`,
      data
    });
  },
  queryMaxSubtractWeight(data) {
    return request({
      method: `${CLASS_NAME}queryMaxSubtractWeight`,
      data
    });
  },
  createNavigation(data) {
    return request({
      method: `${CLASS_NAME}createNavigation`,
      data
    });
  },
  queryNavigationInfo(data) {
    return request({
      method: `${CLASS_NAME}queryNavigationInfo`,
      data
    });
  },
  checkAiDatelist(data) {
    return request({
      method: `${CLASS_NAME}checkAiDatelist`,
      data
    });
  },
  // 我的活动
  queryCampActivityList(data) {
    return request({
      method: `${CLASS_NAME}queryCampActivityList`,
      data
    });
  },
  addRecommendPlan(data) {
    return request({
      method: `${CLASS_NAME}addRecommendPlan`,
      data
    });
  },
  applicationNetRedPlan(data) {
    return request({
      method: `${CLASS_NAME}applicationNetRedPlan`,
      data
    });
  },
  checkPlanOrderDatelist(data) {
    return request({
      method: `${CLASS_NAME}checkPlanOrderDatelist`,
      data
    });
  },
  getWeekPlayData(data) {
    return request({
      method: `${CLASS_NAME}getWeekPlayData`,
      data
    });
  },
  changeSodaPlan(data) {
    return request({
      method: `${CLASS_NAME}changeSodaPlan`,
      data
    });
  },
  queryPlanUsageSituation(data) {
    return request({
      method: `${CLASS_NAME}queryPlanUsageSituation`,
      data
    });
  },
  createH5Plan(data) {
    return request({
      method: `${CLASS_NAME}createH5Plan`,
      data
    });
  },
  // 获取Bmi
  queryUserBmi(data) {
    return request({
      method: `${CLASS_NAME}queryUserBmi`,
      data
    });
  },
  // 查询最标准
  queryStandardDay(data) {
    return request({
      method: `${CLASS_NAME}queryStandardDay`,
      data
    });
  },
  addNavigationPlan(data) {
    return request({
      method: `${CLASS_NAME}addNavigationPlan`,
      data
    });
  },
  // 修改当餐能量
  changePlanAccordingMeal(data) {
    return request({
      method: `${CLASS_NAME}changePlanAccordingMeal`,
      data
    });
  },
  // 生成方案
  createCustomizeInitPlan(data) {
    return request({
      method: `${CLASS_NAME}createCustomizeInitPlan`,
      data
    });
  },
  // 获取方案
  queryCustomizeInitPlan(data) {
    return request({
      method: `${CLASS_NAME}queryCustomizeInitPlan`,
      data
    });
  },
  // 应用方案
  useCustomizeInitPlan(data) {
    return request({
      method: `${CLASS_NAME}useCustomizeInitPlan`,
      data
    });
  },
  // 修改方案数据
  updateCustomizeInitPlan(data) {
    return request({
      method: `${CLASS_NAME}updateCustomizeInitPlan`,
      data
    });
  },
  // 当餐摄入热量-修改
  updateCustomizeDetailRatio(data) {
    return request({
      method: `${CLASS_NAME}updateCustomizeDetailRatio`,
      data
    });
  },
  // 当餐摄入热量-确定
  updateCustomizeDetail(data) {
    return request({
      method: `${CLASS_NAME}updateCustomizeDetail`,
      data
    });
  },
  // 加餐-添加
  addCustomizeDetail(data) {
    return request({
      method: `${CLASS_NAME}addCustomizeDetail`,
      data
    });
  },
  // 加餐-删除
  delCustomizeDetail(data) {
    return request({
      method: `${CLASS_NAME}delCustomizeDetail`,
      data
    });
  },
  // 查询是否有自定义方案
  checkCustomizeInitPlan(data) {
    return request({
      method: `${CLASS_NAME}checkCustomizeInitPlan`,
      data
    });
  },
}

export default Plan;