import {
  defineAsyncComponent
} from 'vue'
const centralKitchen = [{
  path: 'central-kitchen',
  name: 'scm_central-kitchen',
  meta: {
    title: '中央厨房'
  },
  children: [{
      path: 'predict-order',
      name: 'scm_predict-order',
      component: () => import('/src/views/scm/predict-order/index.tsx'), //
      meta: {
        title: '企业预估与实际用餐分析'
      }
    },
    {
      path: 'central-kitchen/production-list',
      name: 'scm_central-kitchen_production-list',
      component: () => import('/src/views/scm/central-kitchen/production-list/index.vue'), //
      meta: {
        title: '生产列表'
      }
    },
    {
      path: 'central-kitchen/stock-product-list',
      name: 'scm_central-kitchen_stock-product-list',
      component: () => import('/src/views/scm/central-kitchen/stock-product-list/index.vue'), //
      meta: {
        title: '备货生产单'
      }
    },
    {
      path: 'central-kitchen/outbound-list',
      name: 'scm_central-kitchen_outbound-list',
      component: () => import('/src/views/scm/central-kitchen/outbound-list/index.vue'), //
      meta: {
        title: '出库单列表'
      }
    },
    {
      path: 'central-kitchen/shop-label',
      name: 'scm_central-kitchen_shop-label',
      component: () => import('/src/views/scm/central-kitchen/shop-label/index.vue'), //
      meta: {
        title: '打印商品标签'
      }
    },
    // {
    //   path: 'central-kitchen/sweep-code',
    //   name: 'scm_central-kitchen_sweep-code',
    //   component: () => import('/src/views/scm/central-kitchen/sweep-code/index.vue'), //
    //   meta: {
    //     title: '扫码出库'
    //   }
    // },
    {
      path: 'central-kitchen/sku-supply',
      name: 'scm_central-kitchen_sku-supply',
      component: () => import('/src/views/scm/central-kitchen/sku-supply/index.vue'), //
      meta: {
        title: '下架菜品需供应量'
      }
    },
    {
      path: 'central-kitchen/dish-statistics',
      name: 'scm_central-kitchen_dish-statistics',
      component: () => import('/src/views/scm/central-kitchen/dish-statistics/index.vue'), //
      meta: {
        title: '菜品销售统计'
      }
    },
    {
      path: 'central-kitchen/dish-statistics/detail',
      name: 'scm_central-kitchen_dish-statistics_detail',
      hidden: true,
      component: () => import('/src/views/scm/central-kitchen/dish-statistics/detail.vue'), //
      meta: {
        title: '菜品销售统计 - 详情'
      }
    }
  ]
}]

const storeStock = [{
  path: 'store-stock',
  name: 'scm_store-stock',
  meta: {
    title: '门店备货',

  },
  children: [{
      path: 'store-stock/food-enter',
      name: 'scm_store-stock_food-enter',
      component: () => import('/src/views/scm/store-stock/food-enter/index.vue'), //
      meta: {
        title: '备货录入 (T+2)'
      }
    },
    {
      path: 'store-stock/food-enter/foodEnter',
      name: 'scm_store-stock_food-enter_foodEnter',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter/foodEnter.vue'), //
      meta: {
        title: '备货录入 - 录入'
      }
    },
    {
      path: 'store-stock/food-enter/ATM/ATMFood',
      name: 'scm_store-stock_food-enter_ATM_ATMFood',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter/ATM/ATMFood.vue'), //
      meta: {
        title: 'ATM备货'
      }
    },
    {
      path: 'store-stock/food-enter/ATM/ATMEnterStock',
      name: 'scm_store-stock_food-enter_ATM_ATMEnterStock',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter/ATM/ATMEnterStock.vue'), //
      meta: {
        title: 'ATM备货 - 录入',

      }
    },
    {
      path: 'store-stock/food-enter/detail',
      name: 'scm_store-stock_food-enter_detail',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter/detail.vue'), //
      meta: {
        title: '备货录入 - 详情'
      }
    },

    {
      path: 'store-stock/food-enter-stock',
      name: 'scm_store-stock_food-enter-stock',
      component: () => import('/src/views/scm/store-stock/food-enter-stock/index.vue'), //
      meta: {
        title: '紧急备货录入 (T+1)'
      }
    },
    {
      path: 'store-stock/food-enter-stock/foodEnterStock',
      name: 'scm_store-stock__food-enter-stock_foodEnterStock',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter-stock/foodEnterStock.vue'), //
      meta: {
        title: '紧急备货录入 (T+1)-录入'
      }
    },
    {
      path: 'store-stock/food-enter-stock/detail',
      name: 'scm_store-stock_food-enter-stock_detail',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter-stock/detail.vue'), //
      meta: {
        title: '紧急备货录入 (T+1) - 详情'
      }
    },

    {
      path: 'store-stock/food-enter-stock/edit',
      name: 'scm_store-stock_food-enter-stock_edit',
      hidden: true,
      component: () => import('/src/views/scm/store-stock/food-enter-stock/edit.vue'), //
      meta: {
        title: '紧急备货录入 (T+1) - 编辑'
      }
    }
  ]
}]

const servingMeals = [{
  path: 'serving-meals',
  name: 'scm_serving-meals',
  meta: {
    title: '人工供餐点运营'
  },
  children: [{
      path: 'stock/stock-check',
      name: 'scm_stock_stock-check',
      component: () => import('/src/views/scm/stock/stock-check/index.vue'), //
      meta: {
        title: '门店盘点'
      }
    },
    {
      path: 'stock/stock-check/detail',
      name: 'scm_stock_stock-check_detail',
      hidden: true,
      component: () => import('/src/views/scm/stock/stock-check/detail.vue'), //
      meta: {
        title: '门店盘点 - 详情'
      }

    },

    {
      path: 'serving-meals/distribution-list',
      name: 'scm_serving-meals_distribution-list',
      component: () => import('/src/views/scm/serving-meals/distribution-list/index.vue'), //
      meta: {
        title: '配送单列表'
      }
    },
    {
      path: 'serving-meals/distribution-list/detail',
      name: 'scm_serving-meals_distribution-list_detail',
      hidden: true,
      component: () => import('/src/views/scm/serving-meals/distribution-list/detail.vue'), //
      meta: {
        title: '配送单列表 - 详情'
      }
    },
    {
      path: 'serving-meals/distribution-list/corpDetail',
      name: 'scm_serving-meals_distribution-list_corpDetail',
      hidden: true,
      component: () => import('/src/views/scm/serving-meals/distribution-list/corpDetail.vue'), //
      meta: {
        title: '企业专送单 - 详情'
      }
    },
    {
      path: 'serving-meals/secondary-heating',
      name: 'scm_serving-meals_secondary-heating',
      component: () => import('/src/views/scm/serving-meals/secondary-heating/index.vue'), //
      meta: {
        title: '复热单列表'
      }
    },
    // {
    //   path: 'serving-meals/cold-package',
    //   name: 'scm_serving-meals_cold-package',
    //   component: () => import('/src/views/scm/serving-meals/cold-package/index.vue'), //
    //   meta: {
    //     title: '冷链包裹单'
    //   }
    // },
    {
      path: 'serving-meals/scan-code',
      name: 'scm_serving-meals_scan-code',
      component: () => import('/src/views/scm/serving-meals/scan-code/index.vue'), //
      meta: {
        title: '二维码取餐'
      }
    },
    {
      path: 'serving-meals/exception',
      name: 'scm_serving-meals_exception',
      component: () => import('/src/views/scm/serving-meals/exception/index.vue'), //
      meta: {
        title: '异常列表'
      }
    },
    {
      path: 'serving-meals/exception/detail',
      name: 'scm_serving-meals_exception_detail',
      hidden: true,
      component: () => import('/src/views/scm/serving-meals/exception/detail.vue'), //
      meta: {
        title: '异常列表 - 详情'
      }
    },
    {
      path: 'serving-meals/exception/edit',
      name: 'scm_serving-meals_exception_edit',
      hidden: true,
      component: () => import('/src/views/scm/serving-meals/exception/edit.vue'), //
      meta: {
        title: '异常列表 - 编辑'
      }
    },
    {
      path: 'serving-meals/exception/orderDetail',
      name: 'scm_serving-meals_exception_orderDetail',
      hidden: true,
      component: () => import('/src/views/scm/serving-meals/exception/orderDetail.vue'), //
      meta: {
        title: '异常列表 - 订单详情'
      }
    },

    {
      path: 'stock/stock-list',
      name: 'scm_stock_stock-list',
      component: () => import('/src/views/scm/stock/stock-list/index.vue'), //
      meta: {
        title: '门店库存管理'
      }
    },
    {
      path: 'stock/stock-list/stock-deploy',
      name: 'scm_stock_stock-list_stock-deploy',
      hidden: true,
      component: () => import('/src/views/scm/stock/stock-list/stock-deploy.vue'), //
      meta: {
        title: '门店库存管理 - 库存调配'
      }
    },
    {
      path: 'stock/orderListData',
      name: 'scm_orderListData',
     
      component: () => import('/src/views/scm/orderListData/index.vue'), //
      meta: {
        title: '配送数据分析'
      }
    },
  ]
}]
const ATMMeals = [{
  path: 'ATM-meals',
  name: 'scm_ATM-meals',
  meta: {
    title: '全自动化供餐点运营'
  },
  children: [{
      path: 'ATMOrder',
      name: 'scm_ATMOrder',
      component: () => import('/src/views/scm/stock/stock-list/ATMOrder.vue'), //
      meta: {
        title: 'ATM订单列表'
      }
    },
    {
      path: 'ATMOrder/detail',
      name: 'scm_ATMOrder_detail',
      hidden: true,
      component: () => import('/src/views/scm/stock/stock-list/detail.vue'), //
      meta: {
        title: 'ATM订单列表详情'
      }
    },
    {
      path: 'ATMStock',
      name: 'scm_ATMStock',
      component: () => import('/src/views/scm/stock/stock-list/ATMStock.vue'), //
      meta: {
        title: '库存监控管理'
      }
    }
  ]
}]


const allComments = [{
  path: 'all-comments',
  name: 'scm_all-comments',
  component: () => import('/src/views/product/all-comments/index.vue'), //
  meta: {
    title: '全部评价'
  }
}]
const outside = [{
  path: 'outside',
  name: 'scm_outside',
  hidden:true,
  component: () => import('/src/views/scm/outside/index.vue'), //
  meta: {
    title: '端外订单统计'
  }
}]

const routes = [
  // ...centralKitchen,
  ...storeStock,
  ...servingMeals,
  ...ATMMeals,
  // ...stock,

  ...outside,
  ...allComments
]

export default routes