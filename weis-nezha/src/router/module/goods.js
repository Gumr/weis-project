
import { defineAsyncComponent } from 'vue'


const putaway = [
  {
    path: 'putaway-list',
    name: 'goods_putaway-list',
    component: () => import('/src/views/goods/putaway-dish/index.vue'), //
    meta: {
      title: '上架菜品'
    }
  },
  {
    path: 'putaway-list/edit',
    name: 'goods_putaway-list_edit',
    hidden: true,
    component: () => import('/src/views/goods/putaway-dish/edit.vue'), //
    meta: {
      title: '上架菜品 - 编辑'
    }
  },
  {
    path: 'putaway-list/detail',
    name: 'goods_putaway-list_detail',
    hidden: true,
    component: () => import('/src/views/goods/putaway-dish/detail.vue'), //
    meta: {
      title: '上架菜品 - 详情'
    }
  },
  {
    path: 'putaway-list/unfinish',
    name: 'goods_putaway-list_unfinish',
    hidden: true,
    component: () => import('/src/views/goods/putaway-dish/unfinish.vue'), // 
    meta: {
      title: '上架菜品 - 关联未完成订单'
    }
  },
  {
    path: 'putaway-list/addUser',
    name: 'goods_putaway-list_addUser',
    hidden: true,
    component: () => import('/src/views/goods/putaway-dish/addUser.vue'), //
    meta: {
      title: '上架菜品 - 灰度人群'
    }
  }
]

const dishTag = [
  {
    path: 'dish-tag',
    name: 'goods_dish-tag',
    component: () => import('/src/views/goods/dish-tag/index.vue'), //
    meta: {
      title: '菜品标签'
    }
  }
]

const ingredientList = [
  {
    path: 'ingredient-list',
    name: 'goods_ingredient-list',
    component: () => import('/src/views/goods/ingredient-list/index.tsx'), //
    meta: {
      title: '食材库'
    }
  }
]

const dishUnit = [
  {
    path: 'dish-unit',
    name: 'goods_dish-unit',
    component: () => import('/src/views/goods/dish-unit/index.vue'), //
    meta: {
      title: '菜品单位'
    }
  }
]

const setMealTypes = [
  {
    path: 'set-meal-types',
    name: 'goods_set-meal-types',
    component: () => import('/src/views/goods/set-meal-types/index'), //
    meta: {
      title: '套餐类型管理'
    }
  }
]

const dishCategory = [
  {
    path: 'dish-category',
    name: 'goods_dish-category',
    component: () => import('/src/views/goods/dish-category/index.vue'), //
    meta: {
      title: '菜品类目'
    }
  }
]

const groupMeal = [
  {
    path: 'fast-foods/meal-list',
    name: 'goods_fast-foods_meal-list',
    component: () => import('/src/views/sales/fast-foods/meal-list/index.vue'), //
    meta: {
      title: '团膳套餐管理'
    }
  },
  {
    path: 'fast-foods/meal-list/edit',
    name: 'goods_fast-foods_meal-list_edit',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/meal-list/edit.vue'), //
    meta: {
      title: '团膳套餐 - 编辑'
    }
  },
  {
    path: 'fast-foods/meal-list/detail',
    name: 'goods_fast-foods_meal-list_detail',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/meal-list/detail.vue'), //
    meta: {
      title: '团膳套餐 - 详情'
    }
  }
]


const dietitianAdministration = [{
  path: 'dietitianAdministration',
  name: 'goods_dietitianAdministration',
  meta: {
    title: '营养师套餐管理'
  },
  children: [
    {
    path: 'fast-foods/groupList',
    name: 'goods_fast-foods_groupList',
    component: () => import('/src/views/sales/fast-foods/groupList/index.vue'), //
    meta: {
      title: '套餐定义'
    }
  },
  {
    path: 'fast-foods/groupList/edit',
    name: 'goods_fast-foods_groupList_edit',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/groupList/edit.vue'), //
    meta: {
      title: '套餐定义 - 编辑'
    }
  },
  {
    path: 'fast-foods/groupList/detail',
    name: 'goods_fast-foods_groupList_detail',
    hidden: true,
    component: () => import('/src/views/sales/fast-foods/groupList/detail.vue'), //
    meta: {
      title: '套餐定义 - 详情'
    }
  },
  {
    path: 'fast-foods/groupReport',
    name: 'goods_fast-foods_groupReport',
    component: () => import('/src/views/sales/fast-foods/groupReport/index.vue'), //
    meta: {
      title: '套餐监控报表'
    }
  },]
}]

const packageTemplate = [
  {
    path: 'package-template',
    name: 'goods_package-template',
    component: () => import('/src/views/goods/package-template/index.vue'), //
    meta: {
      title: '新健身大联盟套餐模板'
    }
  },
  {
    path: 'package-template/edit',
    name: 'goods_package-template_edit',
    component: () => import('/src/views/goods/package-template/edit.vue'), //
    hidden: true,
    meta: {
      title: '新健身大联盟套餐模板 - 编辑'
    }
  },
  {
    path: 'package-template/detail',
    name: 'goods_package-template_detail',
    component: () => import('/src/views/goods/package-template/detail.vue'), //
    hidden: true,
    meta: {
      title: '新健身大联盟套餐模板 - 详情'
    }
  }
]
const setMealImage = [
  {
    path: 'set-meal-image',
    name: 'goods_set-meal-image',
    component: () => import('/src/views/sales/set-meal-image/index.vue'),
    meta: {
      title: '套餐图片管理'
    }
  }
]

const routes = [
  // ...dishList,
  ...putaway,
  // ...dishTag,
  // ...dishUnit,
  // ...dishCategory,
  // ...ingredientList,
 
  ...setMealTypes,
  
  ...groupMeal,
  ...setMealImage,
  ...dietitianAdministration,
  ...packageTemplate
]

export default routes
