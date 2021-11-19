import { MyRouteRecordRaw } from '../types'
import { defineAsyncComponent } from 'vue'
const registerChannel = [
  {
    path: 'register-channel',
    name: 'product_register-channel',
    component: () => import('/src/views/data/register-channel/index.vue'),
    meta: {
      title: '用户注册渠道'
    }
  }
]
const memberList = [
  {
    path: 'memberList',
    name: 'product_memberList',

    component: () => import('/src/views/product/memberList/index.vue'),
    meta: {
      title: '会员数据'
    }
  }
]

const omData = [
  {
    path: 'data/om-data',
    name: 'product_om-data',
    component: () => import('/src/views/data/om-data/index.vue'),
    meta: {
      title: '运营数据'
    }
  }
]

const dailyFlow = [
  {
    path: 'daily-flow',
    name: 'product_daily-flow',
    component: () => import('/src/views/data/daily-flow/index.jsx'),
    meta: {
      title: '流量日数据'
    }
  }
]

const feedbackList = [
  {
    path: 'feedback-list',
    name: 'product_feedback-list',
    component: () => import('/src/views/feedback/feedback-list/index.vue'), //
    meta: {
      title: '菜品反馈'
    }
  },
  {
    path: 'feedback-list/detail',
    name: 'product_feedback-list_detail',
    hidden: true,
    component: () => import('/src/views/feedback/feedback-list/detail.vue'), //
    meta: {
      title: '菜品反馈 - 详情'
    }
  }
]

const orderComments = [
  {
    path: 'order-comments',
    name: 'product_order-comments',
    component: () => import('/src/views/product/order-comments/index.tsx'), //
    meta: {
      title: '餐单评价'
    }
  }
]

const suggestList = [
  {
    path: 'suggest-list',
    name: 'product_suggest-list',
    component: () => import('/src/views/feedback/suggest-list/index.vue'), //
    meta: {
      title: '用户建议'
    }
  },
  {
    path: 'suggest-list/detail',
    name: 'product_suggest-list_detail',
    hidden: true,
    component: () => import('/src/views/feedback/suggest-list/detail.vue'), //
    meta: {
      title: '用户建议 - 详情'
    }
  }
]

const campAnalysis = [
  {
    path: 'camp-analysis',
    name: 'product_camp-analysis',
    component: () => import('/src/views/product/camp-analysis/index.tsx'), //
    meta: {
      title: '减脂营数据分析'
    }
  },
  {
    path: 'camp-analysis/orderList',
    hidden:true,
    name: 'product_camp-analysis_orderList',
    component: () => import('/src/views/product/camp-analysis/orderList.vue'), //
    meta: {
      title: '减脂营数据分析明细'
    }
  }
]




const userRemainAnalysis = [
  {
    path: 'user-remain-analysis',
    name: 'product_user-remain-analysis',
    component: () => import('/src/views/product/user-remain-analysis/index.tsx'), //
    meta: {
      title: '用户用餐复购分析'
    }
  },

]

const dialogData = [
  {
    path: 'dialog-data',
    name: 'product_dialog-data',
    component: () => import('/src/views/product/dialog-data/index.tsx'), //
    meta: {
      title: '弹窗数据'
    }
  }
]



const userMealDataList = [
  {
    path: 'user-meal-data-list',
    name: 'product_user-meal-data-list',
    component: () => import('/src/views/product/user-meal-data-list/index.tsx'), //
    meta: {
      title: '用户每餐数据分析'
    }
  }
]

const allComments = [
  {
    path: 'all-comments',
    name: 'product_all-comments',
    component: () => import('/src/views/product/all-comments/index.vue'), //
    meta: {
      title: '全部评价'
    }
  }
]
const Split = [
  {
    path: 'Split',
    name: 'product_ Split',
    // hidden:'true',
    component: () => import('/src/views/product/predict-company-order/Split.vue'), //
    meta: {
      title: '企业订单明细(拆单)'
    }
  }
]

const toCMealOrderList = [
  {
    path: 'toC-mealOrderList',
    name: 'product_toC-MealOrderList',
    component: () => import('/src/views/product/toC-MealOrderList/index.vue'), //
    meta: {
      title: '360`2C餐单分析'
    }
  }
]

const childrenForecast = [
  {
    path: 'children-forecast',
    name: 'product_children-forecast',
    component: () => import('/src/views/product/children-forecast/index.vue'), //
    meta: {
      title: '幼托运营管理'
    }
  },
  {
    path: '/product/children-forecast/foodEnter',
    name: 'product_children-forecast_foodEnter',
    hidden: true,
    component: () => import('/src/views/scm/store-stock/food-enter/foodEnter.vue'), //
    meta: {
      title: '幼托预测数据 - 备货录入'
    }
  },
  {
    path: 'predict/children-order',
    name: 'product_children-order',
    hidden: true,
    component: () => import('/src/views/product/children-forecast/childrenOrder.vue'), //
    meta: {
      title: '幼托T+1'
    }
  }


]

// const predictCompanyOrder = [
//   {
//     path: 'predict-company-order',
//     name: 'product_predict-company-order',
//     component: () => import('/src/views/product/predict-company-order/index.tsx'), //
//     meta: {
//       title: '企业预估与实际用餐分析'
//     }
//   }
// ]

// const childrenOrder = [
//   {
//     path: 'predict/children-order',
//     name: 'product_children-order',

//     component: () => import('/src/views/product/children-order/index.vue'), //
//     meta: {
//       title: '幼托T+1'
//     }
//   }
// ]

const dauList = [
  {
    path: 'dau-list',
    name: 'product_dau-list',
    component: () => import('/src/views/product/dau-list/index.tsx'), //
    meta: {
      title: '日活统计（销售业务部）'
    }
  }
]



const routes = [
  // ...registerChannel,
  ...memberList,
  // ...omData,
  // ...dailyFlow,
  // ...campAnalysis,
  // ...mealGroup,
  // ...userRemainAnalysis,
  // ...dialogData,
  // ...feedbackList,
  // ...suggestList,
  // ...allComments,
  // ...orderComments,
  // ...predictCompanyOrder,
  // ...childrenForecast,
  // ...childrenOrder,
  // ...toCMealOrderList,
  // ...Split,
  // ...userMealDataList,
  ...dauList,

  // ...commissionList,
  // ...arpuList

]

export default routes as MyRouteRecordRaw[]
