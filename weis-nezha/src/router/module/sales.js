
import { defineAsyncComponent } from 'vue'

const company = [
  {
    path: 'fast-foods/company',
    name: 'sales_fast-foods_company',
    component: () => import('/src/views/sales/fast-foods/company/index.vue'), //
    meta: {
      title: '企业管理'
    }
  },
  {
    path: 'fast-foods/company/edit',
    name: 'sales_fast-foods_company_edit',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/company/edit.vue'), //
    meta: {
      title: '企业 - 编辑'
    }
  },
  {
    path: 'fast-foods/company/account-list',
    name: 'sales_fast-foods_company_account-list',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/company/account-list.jsx'), //
    meta: {
      title: '企业 - 账号管理列表'
    }
  },
  {
    path: 'fast-foods/company/detail',
    name: 'sales_fast-foods_company_detail',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/company/detail.vue'), //
    meta: {
      title: '企业 - 详情'
    }
  },
  {
    path: 'fast-foods/company/edit/mealDetail',
    name: 'sales_fast-foods_company_edit_mealDetail',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/company/mealDetail.vue'), //
    meta: {
      title: '企业 - 套餐详情'
    }
  }
  // {
  //   path: 'fast-foods/counselor-help-order',
  //   name: 'sales_fast-foods_counselor-help-order',
  //   component: () => import('/src/views/sales/fast-foods/counselor-help-order/index.jsx'), //
  //   meta: {
  //     title: '饮食顾问代点餐'
  //   }
  // },
  // {
  //   path: 'fast-foods/counselor-help-order/order',
  //   name: 'sales_fast-foods_counselor-help-order_order',
  //   hidden: true,
  //   component: () => import('/src/views/sales/fast-foods/counselor-help-order/order.jsx'), //
  //   meta: {
  //     title: '饮食顾问代点餐 - 点餐'
  //   }
  // },
  // {
  //   path: 'fast-foods/counselor-help-order/edit-order',
  //   name: 'sales_fast-foods_counselor-help-order_edit-order',
  //   hidden: true,
  //   component: () => import('/src/views/sales/fast-foods/counselor-help-order/edit-order.jsx'), //
  //   meta: {
  //     title: '饮食顾问代点餐 - 点餐编辑'
  //   }
  // },
  // {
  //   path: 'fast-foods/counselor-help-order/detail-order',
  //   name: 'sales_fast-foods_counselor-help-order_detail-order',
  //   hidden: true,
  //   component: () => import('/src/views/sales/fast-foods/counselor-help-order/detail-order.jsx'), //
  //   meta: {
  //     title: '饮食顾问代点餐 - 点餐详情'
  //   }
  // }
]

const customerPool = [
  {
    path: 'customer-pool',
    name: 'sales_customer-pool',
    component: () => import('/src/views/sales/customer-pool/bodybuilding/index.vue'), //
    meta: {
      title: '公共客户资源池'
    }
  }
]

const dividendPolicy = [
  {
    path: 'dividend-policy',
    name: 'sales_dividend-policy',
    component: () => import('/src/views/sales/dividend-policy/index.vue'),
    meta: {
      title: '分佣政策'
    }
  },
  {
    path: 'dividend-policy/create',
    name: 'sales_dividend-policy_create',
    hidden: true,
    component: () => import('/src/views/sales/dividend-policy/create.vue'),
    meta: {
      title: '分佣政策 - 编辑'
    }
  },
  {
    path: 'dividend-policy/detail',
    name: 'sales_dividend-policy_detail',
    hidden: true,
    component: () => import('/src/views/sales/dividend-policy/detail.vue'),
    meta: {
      title: '分佣政策 - 详情'
    }
  }
]

const role = [
  {
    path: 'role-management',
    name: 'sales_role-management',
    component: () => import('/src/views/sales/role-management/index.jsx'),
    meta: {
      title: '角色管理'
    }
  },
  {
    path: 'role-management/detail',
    name: 'sales_role-management_detail',
    hidden: true,
    component: () => import('/src/views/sales/role-management/detail.jsx'),
    meta: {
      title: '角色管理 - 详情'
    }
  }
]

const setMealImage = [
  {
    path: 'set-meal-image',
    name: 'sales_set-meal-image',
    component: () => import('/src/views/sales/set-meal-image/index.vue'),
    meta: {
      title: '套餐图片'
    }
  }
]

const department = [
  {
    path: 'department-management',
    name: 'sales_department-management',
    component: () => import('/src/views/sales/department-management/index.jsx'),
    meta: {
      title: '部门管理'
    }
  },
  {
    path: 'department-management/detail',
    name: 'sales_department-management_detail',
    hidden: true,
    component: () => import('/src/views/sales/department-management/detail.jsx'),
    meta: {
      deactivated: true,
      title: '部门管理 - 详情'
    }
  },
  {
    path: 'department-management/detail2',
    name: 'sales_department-management_detail2',
    hidden: true,
    component: () => import('/src/views/sales/department-management/detail2.jsx'),
    meta: {
      deactivated: true,
      title: '部门管理 - 详情'
    }
  }
]

const coachList = [
  {
    path: 'coach-list',
    name: 'sales_coach-list',
    component: () => import('/src/views/sales/coach-list/index.vue'),
    meta: {
      title: '教练管理'
    }
  }
]
const expertList = [
  {
    path: 'expert-list',
    name: 'sales_expert-list',
    component: () => import('/src/views/sales/expert-list/index.vue'),
    meta: {
      title: '专家管理'
    }
  }
]

const personnel = [
  {
    path: 'personnel-management',
    name: 'sales_personnel-management',
    component: () => import('/src/views/sales/personnel-management/index.tsx'),
    meta: {
      title: '人员管理'
    }
  },
  {
    path: 'personnel-management/role-detail',
    name: 'sales_personnel-management_role-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/role-detail'),
    meta: {
      title: '人员管理 - 人员详情'
    }
  },
  {
    path: 'personnel-management/supervisor-detail',
    name: 'sales_personnel-management_supervisor-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/supervisor-detail.vue'),
    meta: {
      title: '人员管理 - 主管详情'
    }
  },
  {
    path: 'personnel-management/supervisor-assign',
    name: 'sales_personnel-management_supervisor-assign',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/supervisor-assign.vue'),
    meta: {
      title: '人员管理 - 客户转移'
    }
  },
  {
    path: 'personnel-management/consultant-detail',
    name: 'sales_personnel-management_consultant-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/consultant-detail.vue'),
    meta: {
      title: '人员管理 - 客户经理详情'
    }
  },
  {
    path: 'personnel-management/temp-consultant-detail',
    name: 'sales_personnel-management_temp-consultant-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/temp-consultant-detail.vue'),
    meta: {
      title: '人员管理 - 客户经理详情'
    }
  },
  {
    path: 'personnel-management/channel-supervisor-detail',
    name: 'sales_personnel-management_channel-supervisor-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/channel-supervisor-detail.vue'),
    meta: {
      title: '人员管理 - 渠道主管详情'
    }
  },
  {
    path: 'personnel-management/channel-detail',
    name: 'sales_personnel-management_channel-detail',
    hidden: true,
    component: () => import('/src/views/sales/personnel-management/channel-detail.vue'),
    meta: {
      title: '人员管理 - 渠道详情'
    }
  }
]

const whiteList = [
  {
    path: 'white-list',
    name: 'sales_white-list',
    component: () => import('/src/views/store/white-list/index.vue'), //
    meta: {
      title: '健身房白名单'
    }
  }
]

import H5Index from '/src/views/sales/H5/index.vue'

const whiteList2B = [
  {
    path: 'white-list-2b',
    name: 'sales_white-list-2b',
    component: () => import('/src/views/sales/white-list/index'), //
    meta: {
      title: '2B白名单'
    }
  },
  {
    path: 'white-list-2b/detail',
    name: 'sales_white-list-2b_detail',
    hidden: true,
    component: () => import('/src/views/sales/white-list/detail'), //
    meta: {
      title: '2B白名单-用户列表'
    }
  }
]
const childrenForecast = [
  {
    path: 'children-forecast',
    name: 'sales_children-forecast',
    component: () => import('/src/views/product/children-forecast/index.vue'), //
    meta: {
      title: '幼托运营管理'
    }
  },
  {
    path: '/product/children-forecast/foodEnter',
    name: 'sales_children-forecast_foodEnter',
    hidden: true,
    component: () => import('/src/views/scm/store-stock/food-enter/foodEnter.vue'), //
    meta: {
      title: '幼托预测数据 - 备货录入'
    }
  },
  {
    path: 'predict/children-order',
    name: 'sales_children-order',
    hidden: true,
    component: () => import('/src/views/product/children-forecast/childrenOrder.vue'), //
    meta: {
      title: '幼托T+1'
    }
  }


]

const thirdPartyApp = [
  {
    path: 'third-party-app',
    name: 'sales_third-party-app',
    component: () => import('/src/views/sales/third-party-app/index'), //
    meta: {
      title: '第三方应用'
    }
  }
]

const H5 = [
  {
    path: 'H5',
    name: 'sales_H5',
    component: H5Index,
    meta: {
      title: '方案商(H5)管理'
    }
  },
  {
    path: 'H5/edit',
    name: 'sales_H5_edit',
    hidden: true,
    component: () => import('/src/views/sales/H5/edit.vue'),
    meta: {
      title: '方案商(H5)管理 - 编辑'
    }
  }
]

const routes = [
  // ...bodybuilding,
  // ...thePublic,
  // ...medical,
  // ...fastFoods,
  ...role,
  ...department,
  ...personnel,
  // ...setMealImage,
  ...company,
  ...whiteList2B,

  ...thirdPartyApp,
  ...H5,
  // ...coachList,
  ...expertList,
  ...childrenForecast,

  // ...dividendPolicy,
  ...customerPool,
  // ...domain,
  // ...whiteList,

]

export default routes
