import {
  defineAsyncComponent
} from 'vue'
const activityList = [{
    path: 'activity-list',
    name: 'marketing_activity-list',
    component: () => import('/src/views/marketing/activity-list/index.vue'), //
    meta: {
      title: '活动列表'
    }
  },
  {
    path: 'activity-list/create',
    name: 'marketing_activity-list_create',
    hidden: true,
    component: () => import('/src/views/marketing/activity-list/create.vue'), //
    meta: {
      title: '活动列表 - 新增'
    }
  },
  {
    path: 'activity-list/detail',
    name: 'marketing_activity-list_detail',
    hidden: true,
    component: () => import('/src/views/marketing/activity-list/detail.vue'), //
    meta: {
      title: '活动列表 - 详情'
    }
  }
]

const rechargeCard = [{
  path: 'recharge-card',
  name: 'marketing_recharge-card',
  meta: {
    title: '充值卡'
  },
  children: [{
      path: 'recharge-card/recharge-list',
      name: 'marketing_recharge-card_recharge-list',
      component: () => import('/src/views/marketing/recharge-card/recharge-list/index.vue'),
      meta: {
        title: '充值卡总列表'
      }
    },
    {
      path: 'recharge-card/recharge-template',
      name: 'marketing_recharge-card_recharge-template',
      component: () => import('/src/views/marketing/recharge-card/recharge-template/index.vue'),
      meta: {
        title: '充值卡模板'
      }
    },
    {
      path: 'recharge-card/recharge-template/edit',
      name: 'marketing_recharge-card_recharge-template_edit',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/recharge-template/edit.vue'),
      meta: {
        title: '充值卡模板 - 编辑'
      }
    },
    {
      path: 'recharge-card/recharge-template/detail',
      name: 'marketing_recharge-card_recharge-template_detail',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/recharge-template/detail.vue'),
      meta: {
        title: '充值卡模板 - 详情'
      }
    },
    {
      path: 'recharge-card/recharge-rule',
      name: 'marketing_recharge-card_recharge-rule',
      component: () => import('/src/views/marketing/recharge-card/recharge-rule/index.vue'),
      meta: {
        title: '充值卡优惠规则'
      }
    },
    {
      path: 'recharge-card/recharge-rule/edit',
      name: 'marketing_recharge-card_recharge-rule_edit',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/recharge-rule/edit.vue'),
      meta: {
        title: '充值卡优惠规则 - 编辑'
      }
    },
    {
      path: 'recharge-card/recharge-rule/detail',
      name: 'marketing_recharge-card_recharge-rule_detail',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/recharge-rule/detail.vue'),
      meta: {
        title: '充值卡优惠规则 - 详情'
      }
    },
    {
      path: 'recharge-card/online-list',
      name: 'marketing_recharge-card_online-list',
      component: () => import('/src/views/marketing/recharge-card/online-list/index.vue'),
      meta: {
        title: '线上买卡订单列表'
      }
    },
    {
      path: 'recharge-card/online-list/detail',
      name: 'marketing_recharge-card_online-list_detail',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/online-list/detail.vue'),
      meta: {
        title: '线上买卡订单列表 - 详情'
      }
    },
    {
      path: 'recharge-card/giving-list',
      name: 'marketing_recharge-card_giving-list',
      component: () => import('/src/views/marketing/recharge-card/giving-list/index.vue'),
      meta: {
        title: '转赠记录'
      }
    },
    {
      path: 'recharge-card/selling-channel',
      name: 'marketing_recharge-card_selling-channel',
      component: () => import('/src/views/marketing/recharge-card/selling-channel/index.vue'),
      meta: {
        title: '卖卡合作渠道列表'
      }
    },
    {
      path: 'recharge-card/underline-list',
      name: 'marketing_recharge-card_underline-list',
      component: () => import('/src/views/marketing/recharge-card/underline-list/index.vue'),
      meta: {
        title: '线下卡批次列表'
      }
    },
    {
      path: 'recharge-card/underline-list/detail',
      name: 'marketing_recharge-card_underline-list_detail',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/underline-list/detail.vue'),
      meta: {
        title: '线下卡批次 - 详情'
      }
    },
    {
      path: 'recharge-card/underline-list/detail/distribution',
      name: 'marketing_recharge-card_underline-list_detail_distribution',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/underline-list/distribution.vue'),
      meta: {
        title: '线下卡批次 - 分配'
      }
    },
    {
      path: 'recharge-card/underline-selling',
      name: 'marketing_recharge-card_underline-selling',
      component: () => import('/src/views/marketing/recharge-card/underline-selling/index.vue'),
      meta: {
        title: '渠道销售列表'
      }
    },
    {
      path: 'recharge-card/underline-selling/distribution',
      name: 'marketing_recharge-card_underline-selling_distribution',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/underline-selling/distribution.vue'),
      meta: {
        title: '渠道销售 - 分配记录'
      }
    },
    {
      path: 'recharge-card/underline-selling/detail',
      name: 'marketing_recharge-card_underline-selling_detail',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/underline-selling/detail.vue'),
      meta: {
        title: '渠道销售 - 分配详情'
      }
    },
    {
      path: 'recharge-card/underline-selling/sellingInfo',
      name: 'marketing_recharge-card_underline-selling_sellingInfo',
      hidden: true,
      component: () => import('/src/views/marketing/recharge-card/underline-selling/sellingInfo.vue'),
      meta: {
        title: '渠道销售 - 销卡明细'
      }
    }
  ]
}]

const coupon = [{
  path: 'coupon',
  name: 'marketing_coupon',
  meta: {
    title: '优惠券'
  },
  children: [{
      path: 'coupon/coupon-list',
      name: 'marketing_coupon_coupon-list',
      component: () => import('/src/views/marketing/coupon/coupon-list/index.vue'),
      meta: {
        title: '券模板列表'
      }
    },
    {
      path: 'coupon/coupon-list/create',
      name: 'marketing_coupon_coupon-list_create',
      component: () => import('/src/views/marketing/coupon/coupon-list/create.vue'),
      hidden: true,
      meta: {
        title: '券模板列表 - 新增'
      }
    },
    {
      path: 'coupon/coupon-list/edit',
      name: 'marketing_coupon_coupon-list_edit',
      component: () => import('/src/views/marketing/coupon/coupon-list/edit.vue'),
      hidden: true,
      meta: {
        title: '券模板列表 - 编辑'
      }
    },
    {
      path: 'coupon/coupon-list/detail',
      name: 'marketing_coupon_coupon-list_detail',
      component: () => import('/src/views/marketing/coupon/coupon-list/detail.vue'),
      hidden: true,
      meta: {
        title: '券模板列表 - 详情'
      }
    },
    {
      path: 'coupon/coupon-activity',
      name: 'marketing_coupon_coupon-activity',
      component: () => import('/src/views/marketing/coupon/coupon-activity/index.vue'),
      meta: {
        title: '发券活动'
      }
    },
    {
      path: 'coupon/coupon-activity/edit',
      name: 'marketing_coupon_coupon-activity_edit',
      component: () => import('/src/views/marketing/coupon/coupon-activity/edit.vue'),
      hidden: true,
      meta: {
        title: '发券活动 - 编辑'
      }
    },
    {
      path: 'coupon/coupon-activity/detail',
      name: 'marketing_coupon_coupon-activity_detail',
      component: () => import('/src/views/marketing/coupon/coupon-activity/detail.vue'),
      hidden: true,
      meta: {
        title: '发券活动 - 详情'
      }
    },
    {
      path: 'coupon/send-coupon',
      name: 'marketing_coupon_send-coupon',
      component: () => import('/src/views/marketing/coupon/send-coupon/index.vue'),
      meta: {
        title: '手动发券列表'
      }
    },
    {
      path: 'coupon/send-coupon/edit',
      name: 'marketing_coupon_send-coupon_edit',
      component: () => import('/src/views/marketing/coupon/send-coupon/edit.vue'),
      hidden: true,
      meta: {
        title: '手动发券 - 编辑'
      }
    },
    {
      path: 'coupon/send-coupon/detail',
      name: 'marketing_coupon_send-coupon_detail',
      component: () => import('/src/views/marketing/coupon/send-coupon/detail.vue'),
      hidden: true,
      meta: {
        title: '手动发券 - 详情'
      }
    },

    {
      path: 'coupon/link-dispatch-coupon',
      name: 'marketing_coupon_link-dispatch-coupon',
      component: () => import('/src/views/marketing/coupon/link-dispatch-coupon/index.vue'),
      meta: {
        title: '链接/二维码发券'
      }
    },
    {
      path: 'coupon/link-dispatch-coupon/edit',
      name: 'marketing_coupon_link-dispatch-coupon_edit',
      hidden: true,
      component: () => import('/src/views/marketing/coupon/link-dispatch-coupon/edit.vue'),
      meta: {
        title: '链接/二维码发券 - 编辑'
      }
    },
    {
      path: 'coupon/link-dispatch-coupon/detail',
      name: 'marketing_coupon_link-dispatch-coupon_detail',
      hidden: true,
      component: () => import('/src/views/marketing/coupon/link-dispatch-coupon/detail.vue'),
      meta: {
        title: '链接/二维码发券 - 详情'
      }
    },
    {
      path: 'coupon/couponCenter',
      name: 'marketing_coupon_couponCenter',
      component: () => import('/src/views/marketing/coupon/couponCenter/index.vue'),
      meta: {
        title: '领券中心'
      }
    },
    {
      path: 'coupon/couponCenter/add',
      name: 'marketing_coupon_couponCenter_add',
      hidden: true,
      component: () => import('/src/views/marketing/coupon/couponCenter/add.vue'),
      meta: {
        title: '领券中心-新建活动'
      }
    },
    {
      path: 'coupon/couponCenter/detail',
      name: 'marketing_coupon_couponCenter_detail',
      component: () => import('/src/views/marketing/coupon/couponCenter/detail.vue'),
      hidden: true,
      meta: {
        title: '领券中心 - 详情'
      }
    },
    {
      path: 'coupon/couponCenter/edit',
      name: 'marketing_coupon_couponCenter_edit',
      component: () => import('/src/views/marketing/coupon/couponCenter/edit.vue'),
      hidden: true,
      meta: {
        title: '领券中心 - 编辑'
      }
    },
  ]
}]

const multiDiscount = [{
  path: 'multiDiscount',
  name: 'marketing_multiDiscount',
  component: () => import('/src/views/marketing/multiDiscount/index.vue'),
  meta: {
    title: '多餐优惠'
  }
}]

const redEnvelopes = [{
  path: 'redEnvelopes',
  name: 'marketing_redEnvelopes',
  component: () => import('/src/views/marketing/redEnvelopes/index.vue'),
  meta: {
    title: '维士红包'
  }

}, {
  path: 'redEnvelopes/edit',
  name: 'marketing_redEnvelopes_edit',
  hidden: true,
  component: () => import('/src/views/marketing/redEnvelopes/edit.vue'),
  meta: {
    title: '维士红包--编辑'
  }

}]
const noFold = [{
  path: 'noFold',
  name: 'marketing_noFold',
  component: () => import('/src/views/marketing/noFold/index.vue'),
  meta: {
    title: '无折扣菜品'
  }

}]

const shopFold = [{
  path: 'shopFold',
  name: 'marketing_shopFold',
  component: () => import('/src/views/marketing/shopFold/index.vue'),
  meta: {
    title: '折扣门店'
  }

}]

const corpWeChat = [{
  path: 'corpWeChat',
  name: 'marketing_corpWeChat',
  component: () => import('/src/views/marketing/corpWeChat/index.vue'),
  meta: {
    title: '门店企微管理'
  }

}]

const skuVote = [{
  path: 'skuVote',
  name: 'marketing_skuVote',
  component: () => import('/src/views/marketing/skuVote/index.vue'),
  meta: {
    title: '菜品投票'
  }
}]

const riceCircleListDood = [{
    path: 'riceCircleListDood',
    name: 'marketing_riceCircleListDood',
    component: () => import('/src/views/marketing/riceCircleListDood/index.vue'),
    meta: {
      title: '饭圈新菜'
    }
  },
  {
    path: 'riceCircleListDood/add',
    name: 'marketing_riceCircleListDood_add',
    hidden: true,
    component: () => import('/src/views/marketing/riceCircleListDood/add.vue'),
    meta: {
      title: '饭圈新菜--新建活动'
    }
  }
]


const sales = [{
    path: 'sales',
    name: 'marketing_sales',
    component: () => import('/src/views/marketing/sales/index.vue'),
    meta: {
      title: '限时特惠'
    }
  },
  {
    path: 'sales/edit',
    name: 'marketing_sales_edit',
    hidden: true,
    component: () => import('/src/views/marketing/sales/edit.vue'),
    meta: {
      title: '限时特惠 - 编辑'
    }
  },
  {
    path: 'sales/detail',
    name: 'marketing_sales_detail',
    hidden: true,
    component: () => import('/src/views/marketing/sales/detail.vue'),
    meta: {
      title: '限时特惠 - 详情'
    }
  }
]

const crowdfund = [{
  path: 'crowdfund',
  name: 'om_crowdfund',
  meta: {
    title: '众筹活动'
  },
  children: [{
      path: 'crowdfund/crowdfund-list',
      name: 'om_crowdfund_crowdfund-list',
      component: () => import('/src/views/om/crowdfund/crowdfund-list/index.vue'),
      meta: {
        title: '活动列表'
      }
    },
    {
      path: 'crowdfund/crowdfund-list/edit',
      name: 'om_crowdfund_crowdfund-list_edit',
      hidden: true,
      component: () => import('/src/views/om/crowdfund/crowdfund-list/edit.vue'),
      meta: {
        title: '众筹活动 - 编辑'
      }
    },
    {
      path: 'crowdfund/crowdfund-list/detail',
      name: 'om_crowdfund_crowdfund-list_detail',
      hidden: true,
      component: () => import('/src/views/om/crowdfund/crowdfund-list/detail.vue'),
      meta: {
        title: '众筹活动 - 详情'
      }
    },
    {
      path: 'crowdfund/dish-list',
      name: 'om_crowdfund_dish-list',
      component: () => import('/src/views/om/crowdfund/dish-list/index.vue'),
      meta: {
        title: '菜品列表'
      }
    },
    {
      path: 'crowdfund/dish-list/edit',
      name: 'om_crowdfund_dish-list_edit',
      hidden: true,
      component: () => import('/src/views/om/crowdfund/dish-list/edit.vue'),
      meta: {
        title: '菜品列表 - 操作'
      }
    },
    {
      path: 'crowdfund/billboard-list',
      name: 'om_crowdfund_billboard-list',
      component: () => import('/src/views/om/crowdfund/billboard-list/index.vue'),
      meta: {
        title: '榜单列表'
      }
    },
    {
      path: 'crowdfund/billboard-list/detail',
      name: 'om_crowdfund_billboard-list_detail',
      hidden: true,
      component: () => import('/src/views/om/crowdfund/billboard-list/detail.vue'),
      meta: {
        title: '榜单列表 - 详情'
      }
    },
    {
      path: 'crowdfund/resdish-list',
      name: 'om_crowdfund_resdish-list',
      component: () => import('/src/views/om/crowdfund/resdish-list/index.vue'),
      meta: {
        title: '菜品复活列表'
      }
    }
  ]
}]
const tricolorBox = [{
    path: 'tricolor-box',
    name: 'om_tricolor-box',
    component: () => import('/src/views/om/tricolor-box/index.vue'),
    meta: {
      title: '三色盒'
    }
  },
  {
    path: 'tricolor-box/detail',
    name: 'om_tricolor-box_detail',
    hidden: true,
    component: () => import('/src/views/om/tricolor-box/detail.vue'),
    meta: {
      title: '三色盒 - 详情'
    }
  }
]
const loseWeight = [{
    path: 'lose-weight',
    name: 'om_lose-weight',
    component: () => import('/src/views/om/lose-weight/index.vue'),
    meta: {
      title: '线上减脂营'
    }
  },
  {
    path: 'lose-weight/detail',
    name: 'om_lose-weight_detail',
    hidden: true,
    component: () => import('/src/views/om/lose-weight/detail.vue'),
    meta: {
      title: '线上减脂营 - 详情'
    }
  },
  {
    path: 'lose-weight/ordered',
    name: 'om_lose-weight_ordered',
    hidden: true,
    component: () => import('/src/views/om/lose-weight/ordered.vue'),
    meta: {
      title: '线上减脂营 - 预约详情'
    }
  },
  {
    path: 'lose-weight/detail/detailed',
    name: 'om_lose-weight_detail_detailed',
    hidden: true,
    component: () => import('/src/views/om/lose-weight/detailed.vue'),
    meta: {
      title: '线上减脂营 - 明细'
    }
  }
]
const enterpriseCamp = [{
    path: 'enterprise-camp',
    name: 'om_enterprise-camp',
    component: () => import('/src/views/om/enterprise-camp/index.jsx'),
    meta: {
      title: '企业减脂营'
    }
  },
  {
    path: 'enterprise-camp/detail',
    name: 'om_enterprise-camp_detail',
    hidden: true,
    component: () => import('/src/views/om/enterprise-camp/detail.jsx'),
    meta: {
      title: '企业减脂营 - 小组详情'
    }
  },
  {
    path: 'enterprise-camp/member-detail',
    name: 'om_enterprise-camp_member-detail',
    hidden: true,
    component: () => import('/src/views/om/enterprise-camp/member-detail.jsx'),
    meta: {
      title: '企业减脂营 - 组员详情'
    }
  },
  {
    path: 'enterprise-camp/rank-detail',
    name: 'om_enterprise-camp_rank-detail',
    hidden: true,
    component: () => import('/src/views/om/enterprise-camp/rank-detail.jsx'),
    meta: {
      title: '企业减脂营 - 排行榜'
    }
  }
]

// const camperList = [
//   {
//     path: 'camper-list',
//     name: 'marketing_camper-list',
//     component: () => import('/src/views/marketing/camper-list/index.tsx'),
//     meta: {
//       title: '营长列表'
//     }
//   }
// ]

const routes = [
  // ...activityList,
  ...rechargeCard,
  ...coupon,
  ...multiDiscount,
  ...noFold,
  ...shopFold,
  ...corpWeChat,
  ...riceCircleListDood,
  ...skuVote,
  ...redEnvelopes,
  // ...sales,
  ...loseWeight,
  ...enterpriseCamp,
  // ...camperList,
  ...crowdfund,
  ...tricolorBox
]

export default routes