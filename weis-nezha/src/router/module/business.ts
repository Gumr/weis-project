
import { MyRouteRecordRaw } from '../types'

import { defineAsyncComponent } from 'vue'

const baseReport = [
  {
    path: 'base',
    name: 'order_base',
    meta: {
      title: '原始记录'
    },
    children: [
      {
        path: 'fast-foods/order-list',
        name: 'business_fast-foods_order-list',
        component: () => import('/src/views/sales/fast-foods/order-list/index.vue'), //
        meta: {
          title: '团膳订单'
        },
      },

      {
        path: 'fast-foods/order-list/detail',
        name: 'business_fast-foods_order-list_detail',
        hidden: true,
        component: () => import('/src/views/sales/fast-foods/order-list/detail.vue'), //
        meta: {
          title: '团膳订单 - 详情'
        }
      },
      {
        path: 'fast-foods/order-list/detail',
        name: 'business_fast-foods_order-list_detail',
        hidden: true,
        component: () => import('/src/views/sales/fast-foods/order-list/detail.vue'), //
        meta: {
          title: '团膳订单 - 详情'
        }
      },
      {
        path: 'dish',
        name: 'order_dish',
        meta: {
          title: '饮食单'
        },
        children: [
          {
            path: 'dish/pay-list',
            name: 'order_dish_pay-list',
            component: () => import('/src/views/order/dish/pay-list/index.vue'), //
            meta: {
              title: '支付单'
            }
          },
          {
            path: 'dish/pay-list/detail',
            name: 'order_dish_pay-list_detail',
            hidden: true,
            component: () => import('/src/views/order/dish/pay-list/detail.vue'), //
            meta: {
              title: '支付单 - 详情'
            }
          },
          {
            path: 'dish/ship-list',
            name: 'order_dish_ship-list',
            component: () => import('/src/views/order/dish/ship-list/index.vue'), //
            meta: {
              title: '配送单'
            }
          },
          {
            path: 'dish/ship-list/detail',
            name: 'order_dish_ship-list_detail',
            hidden: true,
            component: () => import('/src/views/order/dish/ship-list/detail.vue'), //
            meta: {
              title: '配送单 - 详情'
            }
          },
          {
            path: 'dish/freight-list',
            name: 'order_dish_freight-list',
            component: () => import('/src/views/order/dish/freight-list/index.vue'), //
            meta: {
              title: '补差单'
            }
          },
          {
            path: 'dish/freight-list/detail',
            name: 'order_dish_freight-list_detail',
            hidden: true,
            component: () => import('/src/views/order/dish/freight-list/detail.vue'), //
            meta: {
              title: '补差单 - 详情'
            }
          },
          {
            path: 'dish/order-list',
            name: 'order_dish_order-list',
            component: () => import('/src/views/order/dish/order-list/index.vue'), //
            meta: {
              title: '餐单'
            }
          },
          {
            path: 'dish/order-list/detail',
            name: 'order_dish_order-list_detail',
            hidden: true,
            component: () => import('/src/views/order/dish/order-list/detail.vue'), //
            meta: {
              title: '餐单 - 详情'
            }
          },

        ]
      },
      {
        path: 'data/sales-performance',
        name: 'data_sales-performance',
        component: () => import('/src/views/data/sales-performance/index.vue'),
        meta: {
          title: '销售业绩订单'
        }
      },
      {
        path: 'sign-order',
        name: 'business_sign-order',
        component: () => import('/src/views/product/sign-order/index.vue'),
        meta: {
          title: '团膳签收单'
        }
      },
      {
        path: 'coupon/receive-coupon-list',
        name: 'business_coupon_receive-coupon-list',
        component: () => import('/src/views/marketing/coupon/receive-coupon-list/index.vue'),
        meta: {
          title: '优惠券记录'
        }
      },
      
      {
        path: 'SignIn',
        name: 'business_list',
        // hidden:true,
        component: () => import('/src/views/data/SignIn/list.vue'),
        meta: {
          title: '签到记录'
        }
      },
      {
        path: 'userDataList',
        name: 'business_userDataList',
        component: () => import('/src/views/data/userDataList/index.vue'),
        meta: {
          title: '日活记录'
        }
      },

      {
        path: 'withdrawalList',
        name: 'business_withdrawalList',
        component: () => import('/src/views/data/withdrawalList/index.vue'),
        meta: {
          title: '提现记录'
        }
      },
      {
        path: 'commissionListBill',
        name: 'business_commissionListBill',
        component: () => import('/src/views/data/commissionListBill/index.vue'),
        meta: {
          title: '提成记录'
        }
      }



    ]
  }]
const CountReport = [
  {
    path: 'dish',
    name: 'report_dish',
    meta: {
      title: '统计报表'
    },
    children: [
      {
        path: 'package-list',
        name: 'order_package-list',
        meta: {
          title: '套餐订单'
        },
        children: [
          {
            path: 'package-list_package-five',
            name: 'order_package-list_package-five',
            component: () => import('/src/views/order/package-list/package-five/index.vue'),
            meta: {
              title: '五日套餐'
            }
          },
          {
            path: 'package-list_package-five/distribution',
            name: 'order_package-list_package-five_distribution',
            hidden: true,
            component: () => import('/src/views/order/package-list/package-five/distribution.vue'),
            meta: {
              title: '五日套餐 - 配送单'
            }
          },
          {
            path: 'package-list_package-five/distribution/detail',
            name: 'order_package-list_package-five_distribution_detail',
            hidden: true,
            component: () => import('/src/views/order/package-list/package-five/detail.vue'),
            meta: {
              title: '五日套餐 - 配送单详情'
            }
          },
          {
            path: 'package-list_package-ten',
            name: 'order_package-list_package-ten',
            component: () => import('/src/views/order/package-list/package-ten/index.vue'),
            meta: {
              title: '十日套餐'
            }
          },
          {
            path: 'package-list_package-ten/distribution',
            name: 'order_package-list_package-ten_distribution',
            hidden: true,
            component: () => import('/src/views/order/package-list/package-ten/distribution.vue'),
            meta: {
              title: '十日套餐 - 配送单'
            }
          },
          {
            path: 'package-list_package-ten/distribution/detail',
            name: 'order_package-list_package-ten_distribution_detail',
            hidden: true,
            component: () => import('/src/views/order/package-list/package-ten/detail.vue'),
            meta: {
              title: '十日套餐 - 配送单详情'
            }
          },
          {
            path: 'package-list_new-bodybuiding',
            name: 'order_package-list_new-bodybuiding',
            component: () => import('/src/views/order/package-list/new-bodybuiding/index.vue'),
            meta: {
              title: '新健身大联盟'
            }
          },
          {
            path: 'package-list_new-bodybuiding/detail',
            name: 'order_package-list_new-bodybuiding_detail',
            hidden: true,
            component: () => import('/src/views/order/package-list/new-bodybuiding/detail.vue'),
            meta: {
              title: '新健身大联盟 - 订单详情'
            }
          }
        ],

      },
      {
        path: 'predict-company-order',
        name: 'business_predict-company-order',
        component: () => import('/src/views/product/predict-company-order/index.tsx'), //
        meta: {
          title: '企业预估跟实际订单差异分析'
        }
      },
      {
        path: 'redCoupList',
        name: 'business_redCoupList',
        // hidden:true,
        component: () => import('/src/views/data/redCoupList/index.vue'),
        meta: {
          title: '维士红包数据'
        }
      },
      {
        path: 'memberList',
        name: 'business_memberList',

        component: () => import('/src/views/product/memberList/index.vue'),
        meta: {
          title: '会员数据'
        }
      },
      {
        path: 'coupon-data',
        name: 'business_coupon-data',
        component: () => import('/src/views/data/coupon-data/index.vue'),
        meta: {
          title: '优惠券数据'
        }
      },
      
      {
        path: 'SignIn',
        name: 'business_SignIn',
        // hidden:true,
        component: () => import('/src/views/data/SignIn/index.vue'),
        meta: {
          title: '签到数据'
        }
      },
      {
        path: 'mealGroup',
        name: 'business_mealGroup',
        component: () => import('/src/views/product/mealGroup/index.vue'),
        meta: {
          title: '饭团数据分析'
        }
      },
      {
        path: 'counpCenterReport',
        name: 'business_counpCenterReport',
        component: () => import('/src/views/data/counpCenterReport/index.vue'),
        meta: {
          title: '领券中心报表'
        }
      },
      {
        path: 'central-kitchen/dish-statistics',
        name: 'business_central-kitchen_dish-statistics',
        component: () => import('/src/views/scm/central-kitchen/dish-statistics/index.vue'), //
        meta: {
          title: '菜品销量分析'
        }
      },
      {
        path: 'central-kitchen/dish-statistics/detail',
        name: 'business_central-kitchen_dish-statistics_detail',
        hidden: true,
        component: () => import('/src/views/scm/central-kitchen/dish-statistics/detail.vue'), //
        meta: {
          title: '菜品销量分析 - 详情'
        }
      }, 
       {
        path: 'data/store-data',
        name: 'data_store-data',
        component: () => import('/src/views/data/store-data/index.vue'),
        meta: {
          title: '门店数据'
        }
      },
      
      {
        path: 'commission-list',
        name: 'business_commission-list',
        component: () => import('/src/views/product/commission-list/index.tsx'), //
        meta: {
          title: '提成统计'
        }
      },
      {
        path: 'register-channel',
        name: 'business_register-channel',
        component: () => import('/src/views/data/register-channel/index.vue'),
        meta: {
          title: '用户注册渠道分析'
        }
      },
      {
        path: 'data/om-data',
        name: 'business_om-data',
        component: () => import('/src/views/data/om-data/index.vue'),
        meta: {
          title: '注册-转化-复购分析'
        }
      },
      {
        path: 'data/conversionList',
        name: 'business_conversionList',
        component: () => import('/src/views/data/conversionList/index.vue'),
        meta: {
          title: '下单转化率分析'
        }
      },

      
      {
        path: 'daily-flow',
        name: 'business_daily-flow',
        component: () => import('/src/views/data/daily-flow/index.jsx'),
        meta: {
          title: '流量日数据分析'
        }
      },
      {
        path: 'toC-mealOrderList',
        name: 'business_toC-MealOrderList',
        component: () => import('/src/views/product/toC-MealOrderList/index.vue'), //
        meta: {
          title: '360°2C餐单分析'
        }
      },
      {
        path: 'customerUnitPrice',
        name: 'business_customerUnitPrice',
        hidden:true,
        component: () => import('/src/views/product/customerUnitPrice/index.vue'), //
        meta: {
          title: '360°客单价分析'
        }
      },

      
      {
        path: 'Split',
        name: 'business_ Split',
        // hidden:'true',
        component: () => import('/src/views/product/predict-company-order/Split.vue'), //
        meta: {
          title: '企业订单明细(拆单)'
        }
      },
      {
        path: 'camp-analysis',
        name: 'business_camp-analysis',
        component: () => import('/src/views/product/camp-analysis/index.tsx'), //
        meta: {
          title: '减脂营数据分析'
        }
      },
      {
        path: 'camp-analysis/orderList',
        hidden: true,
        name: 'business_camp-analysis_orderList',
        component: () => import('/src/views/product/camp-analysis/orderList.vue'), //
        meta: {
          title: '减脂营数据分析明细'
        }
      },
      {
        path: 'user-remain-analysis',
        name: 'business_user-remain-analysis',
        component: () => import('/src/views/product/user-remain-analysis/index.tsx'), //
        meta: {
          title: '用户用餐复购分析'
        }
      },
      {
        path: 'dialog-data',
        name: 'business_dialog-data',
        component: () => import('/src/views/product/dialog-data/index.tsx'), //
        meta: {
          title: '弹窗数据分析'
        }
      },
      {
        path: 'user-meal-data-list',
        name: 'business_user-meal-data-list',
        component: () => import('/src/views/product/user-meal-data-list/index.tsx'), //
        meta: {
          title: '用户每餐数据分析'
        }
      },
      {
        path: 'month-user-remain-stat',
        name: 'business_month-user-remain-stat',
        component: () => import('/src/views/product/user-remain-analysis/month'), //
        meta: {
          title: '月用户复购统计（财）'
        }
      },
      {
        path: 'arpu-list',
        name: 'business_arpu-list',
        component: () => import('/src/views/finance/arpu-list/index.tsx'), //
        meta: {
          title: '消费客户黏度ARPU'
        }
      },
      {
        path: 'month-arpu-list',
        name: 'business_month-arpu-list',
        component: () => import('/src/views/finance/arpu-list/month.tsx'), //
        meta: {
          title: '每月订单ARPU'
        }
      },
      {
        path: 'dau-list',
        name: 'business_dau-list',
        component: () => import('/src/views/product/dau-list/index.tsx'), //
        meta: {
          title: '销售人员日活统计'
        }
      },
      {
        path: 'effectAnalysis',
        name: 'business_effectAnalysis',
        component: () => import('/src/views/data/effectAnalysis/index.vue'), //
        meta: {
          title: '外部客户经理效果分析'
        }

      }

    ]
  }]

const routes = [
  ...baseReport,
  ...CountReport,
]

export default routes as MyRouteRecordRaw[]