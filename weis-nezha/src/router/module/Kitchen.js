import {
  defineAsyncComponent
} from 'vue'

const foodAdministration = [{
  path: 'foodAdministration',
  name: 'Kitchen_foodAdministration',
  meta: {
    title: '菜品库管理'
  },
  children: [

    {
      path: 'dish-list',
      name: 'Kitchen_dish-list',
      component: () => import('/src/views/goods/dish-list/index.vue'), //
      meta: {
        title: '菜品信息维护'
      }
    },
    {
      path: 'dish-list/edit',
      name: 'Kitchen_dish-list_edit',
      hidden: true,
      component: () => import('/src/views/goods/dish-list/edit.vue'), //
      meta: {
        title: '菜品信息维护 - 编辑'
      }
    },
    {
      path: 'dish-list/detail',
      name: 'Kitchen_dish-list_detail',
      hidden: true,
      component: () => import('/src/views/goods/dish-list/detail.vue'), //
      meta: {
        title: '菜品信息维护 - 详情'
      }
    },
    {
      path: 'foodAdministration/foodList',
      name: 'Kitchen_foodAdministration_foodList',
      component: () => import('/src/views/scm/foodAdministration/foodList/index.vue'), //
      meta: {
        title: '菜品库列表'
      }
    },
    {
      path: 'foodAdministration/foodList/dietitianEdit',
      name: 'Kitchen_foodAdministration_foodList_dietitianEdit',
      hidden: true,
      component: () => import('/src/views/scm/foodAdministration/foodList/dietitianEdit.vue'), //
      meta: {
        title: '营养师审核'
      }
    },
    {
      path: 'foodAdministration/foodList/dietitianDetail',
      name: 'Kitchen_foodAdministration_foodList_dietitianDetail',
      hidden: true,
      component: () => import('/src/views/scm/foodAdministration/foodList/dietitianDetail.vue'), //
      meta: {
        title: '营养师审核--详情'
      }
    },
    {
      path: 'foodAdministration/foodList/operateEdit',
      name: 'Kitchen_foodAdministration_foodList_operateEdit',
      hidden: true,
      component: () => import('/src/views/scm/foodAdministration/foodList/operateEdit.vue'), //
      meta: {
        title: '运营审核'
      }
    },
    {
      path: 'foodAdministration/foodList/operateDetail',
      name: 'Kitchen_foodAdministration_foodList_operateDetail',
      hidden: true,
      component: () => import('/src/views/scm/foodAdministration/foodList/operateDetail.vue'), //
      meta: {
        title: '详情'
      }
    },
    {
      path: 'dish-unit',
      name: 'Kitchen_dish-unit',
      component: () => import('/src/views/goods/dish-unit/index.vue'), //
      meta: {
        title: '菜品单位'
      }
    },
    {
      path: 'dish-category',
      name: 'Kitchen_dish-category',
      component: () => import('/src/views/goods/dish-category/index.vue'), //
      meta: {
        title: '菜品类目'
      }
    },
    {
      path: 'dish-tag',
      name: 'Kitchen_dish-tag',
      component: () => import('/src/views/goods/dish-tag/index.vue'), //
      meta: {
        title: '菜品标签'
      }
    },
    {
      path: 'ingredient-list',
      name: 'Kitchen_ingredient-list',
      component: () => import('/src/views/goods/ingredient-list/index.tsx'), //
      meta: {
        title: '食材库'
      }
    }

  ]
}]
const centralKitchen = [{
  path: 'central-kitchen',
  name: 'kitchen_central-kitchen',
  meta: {
    title: '生产管理'
  },
  children: [{
      path: 'central-kitchen/stock-product-list',
      name: 'kitchen_central-kitchen_stock-product-list',
      component: () => import('/src/views/scm/central-kitchen/stock-product-list/index.vue'), //
      meta: {
        title: '备货生产单'
      }
    },

    {
      path: 'central-kitchen/production-list',
      name: 'kitchen_central-kitchen_production-list',
      component: () => import('/src/views/scm/central-kitchen/production-list/index.vue'), //
      meta: {
        title: '生产单'
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
      path: 'predict-order',
      name: 'kitchen_predict-order',
      component: () => import('/src/views/scm/predict-order/index.tsx'), //
      meta: {
        title: '企业预估与实际用餐分析'
      }
    },
    {
      path: 'central-kitchen/sku-supply',
      name: 'kitchen_central-kitchen_sku-supply',
      component: () => import('/src/views/scm/central-kitchen/sku-supply/index.vue'), //
      meta: {
        title: '下架菜品需供应量'
      }
    },


  ]
}]

const LineList = [{
  path: 'central-outbound',
  name: 'kitchen_central-outbound',
  meta: {
    title: '物流管理'
  },
  children: [{
      path: 'central-kitchen/outbound-list',
      name: 'kitchen_central-kitchen_outbound-list',
      component: () => import('/src/views/scm/central-kitchen/outbound-list/index.vue'), //
      meta: {
        title: '出库单'
      }
    },
    {
      path: 'central-kitchen/shop-label',
      name: 'kitchen_central-kitchen_shop-label',
      component: () => import('/src/views/scm/central-kitchen/shop-label/index.vue'), //
      meta: {
        title: '标签打印'
      }
    }

  ]
}]

const Meallist = [{
    path: 'central-kitchen/dish-statistics',
    name: 'kitchen_central-kitchen_dish-statistics',
    component: () => import('/src/views/scm/central-kitchen/dish-statistics/index.vue'), //
    meta: {
      title: '菜品销售统计'
    }
  },

  {
    path: 'central-kitchen/dish-statistics/detail',
    name: 'kitchen_central-kitchen_dish-statistics_detail',
    hidden: true,
    component: () => import('/src/views/scm/central-kitchen/dish-statistics/detail.vue'), //
    meta: {
      title: '菜品销售统计 - 详情'
    }
  },




]


const allComments = [{
  path: 'all-comments',
  name: 'kitchen_all-comments',
  component: () => import('/src/views/product/all-comments/index.vue'), //
  meta: {
    title: '用户评价'
  }
}]


const foodSafety = [{
  path: 'foodSafety',
  name: 'kitchen_foodSafety',
  meta: {
    title: '食品安全'
  },
  children: [{
      path: 'foodSafety/rawMaterialInspection',
      name: 'foodSafety_rawMaterialInspection',
      component: () => import('/src/views/scm/foodSafety/rawMaterialInspection/index.vue'), //
      meta: {
        title: '原材料检测'
      }
    },
    {
      path: 'foodSafety/microbialDetection',
      name: 'foodSafety_microbialDetection',
      component: () => import('/src/views/scm/foodSafety/microbialDetection/index.vue'), //
      meta: {
        title: '微生物检测'
      }
    },
    {
      path: 'foodSafety/productionEnvironment',
      name: 'foodSafety_productionEnvironment',
      component: () => import('/src/views/scm/foodSafety/productionEnvironment/index.vue'), //
      meta: {
        title: '生产环境监控'
      }
    },
  ]
}]



const routes = [
  ...foodAdministration,
  ...centralKitchen,
  ...LineList,
  ...foodSafety,
  // ...stock,
  ...Meallist,
  ...allComments,

]

export default routes