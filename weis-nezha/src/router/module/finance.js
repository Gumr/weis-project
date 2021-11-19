import {
  defineAsyncComponent
} from 'vue'
const memberManagement = [
  // {
  // path: 'finance/member-management',
  // name: 'finance_member-management',
  // meta: {
  //   title: '用户管理'
  // },
  // children: [
  {
    path: 'member-management/member-recharge',
    name: 'finance_member-management_member-recharge',
    component: () => import('/src/views/finance/member-management/member-recharge/index.vue'),
    meta: {
      title: '用户余额管理'
    }
  },
  {
    path: 'member-management/member-recharge/record',
    name: 'finance_member-management_member-recharge_record',
    component: () => import('/src/views/finance/member-management/member-recharge/batch-record.vue'),
    hidden: true,
    meta: {
      title: '用户余额管理 - 批量充值记录'
    }
  },
  {
    path: 'member-management/member-recharge/record-detail',
    name: 'finance_member-management_member-recharge_record-detail',
    component: () => import('/src/views/finance/member-management/member-recharge/batch-record-detail.vue'),
    hidden: true,
    meta: {
      title: '用户余额管理 - 批量充值记录 - 详情'
    }
  },
  {
    path: 'member-management/member-list',
    name: 'finance_member-management_member-list',
    component: () => import('/src/views/finance/member-management/member-list/index.vue'),
    meta: {
      title: '用户列表 - 财务'
    }
  },
  {
    path: 'member-management/member-list/detail',
    name: 'finance_member-management_member-list/detail',
    hidden: true,
    component: () => import('/src/views/finance/member-management/member-list/detail.vue'),
    meta: {
      title: '用户列表 - 财务 - 详情'
    }
  },

  // ]
  // }
]

const recharge = [{
  path: 'finance/recharge',
  name: 'finance_recharge',
  component: () => import('/src/views/finance/recharge/index.vue'),
  meta: {
    title: '充值流水列表'
  }
}]

const userCount = [{
    path: 'member-management/member-discount',
    name: 'finance_member-management_member-discount',
    component: () => import('/src/views/member/member-management/member-discount/index.vue'),
    meta: {
      title: '用户折扣'
    }
  },
  {
    path: 'member-management/member-discount/detail',
    name: 'finance_member-management_member-discount_detail',
    hidden: true,
    component: () => import('/src/views/member/member-management/member-discount/detail.vue'),
    meta: {
      title: '用户折扣 - 编辑用户'
    }
  }
]
const remainStat = [{
    path: 'month-user-remain-stat',
    name: 'finance_month-user-remain-stat',
    component: () => import('/src/views/product/user-remain-analysis/month'), //
    meta: {
      title: '月用户复购统计（财）'
    }
  }

]

const specialRefund = [{
  path: 'finance/special-refund',
  name: 'finance/special-refund',
  meta: {
    title: '特殊退款处理'
  },
  children: [{
      path: 'special-refund/refund-list',
      name: 'finance_special-refund_refund-list',
      component: () => import('/src/views/finance/special-refund/refund-list/index.vue'),
      meta: {
        title: '退款操作列表'
      }
    },
    {
      path: 'special-refund/refund-list/detail',
      name: 'finance_special-refund_refund-list_detail',
      hidden: true,
      component: () => import('/src/views/finance/special-refund/refund-list/detail.vue'),
      meta: {
        title: '退款操作 - 详情'
      }
    },
    {
      path: 'special-refund/refund-record',
      name: 'finance_special-refund_refund-record',
      component: () => import('/src/views/finance/special-refund/refund-record/index.vue'),
      meta: {
        title: '退款记录'
      }
    }
  ]
}]
const arpuList = [{
    path: 'arpu-list',
    name: 'finance_arpu-list',
    component: () => import('/src/views/finance/arpu-list/index.tsx'), //
    meta: {
      title: '消费客户黏度ARPU'
    }
  },
  {
    path: 'month-arpu-list',
    name: 'finance_month-arpu-list',
    component: () => import('/src/views/finance/arpu-list/month.tsx'), //
    meta: {
      title: '每月订单ARPU'
    }
  }
]
const userReser =[
  {
    path: 'dish/refund-list',
    name: 'finance_dish_refund-list',
    component: () => import('/src/views/order/dish/refund-list/index.vue'), //
    meta: {
      title: '用户退款'
    }
  },
  {
    path: 'dish/refund-list/review',
    name: 'finance_dish_refund-list_review',
    hidden: true,
    component: () => import('/src/views/order/dish/refund-list/CancelOrderReview.vue'),
    meta: {
      title: '用户退款 - 订单审核'
    }
  },
  {
    path: 'dish/refund-list/detail',
    name: 'finance_dish_refund-list_detail',
    hidden: true,
    component: () => import('/src/views/order/dish/refund-list/CancelOrderDetail.vue'),
    meta: {
      title: '用户退款 - 订单详情'
    }
  },
  {
    path: 'dish/refund-list/after-sales',
    name: 'finance_dish_refund-list_after-sales',
    hidden: true,
    component: () => import('/src/views/order/dish/refund-list/AfterSalesOrderDetail.vue'),
    meta: {
      title: '用户退款 - 订单详情'
    }
  }
]

const memberReser =[
  {
    path: 'dish/refund-member',
    name: 'finance_refund-member',
    component: () => import('/src/views/finance/special-refund/refund-member/index.vue'), //
    meta: {
      title: '会员退款'
    }
  },
]

const routes = [
  ...userCount,
  ...memberManagement,
  ...userReser,
  ...memberReser,
  ...recharge,
  
  
  // ...remainStat,




  // ...specialRefund,

  // ...arpuList
]

export default routes