import {
  defineAsyncComponent
} from 'vue'
const supplyMeal = [{
  path: 'store',
  name: 'store_store',
  meta: {
    title: '供餐点'
  },
  children: [{
      path: 'supply-meal',
      name: 'store_supply-meal',
      component: () => import('/src/views/store/supply-meal/index.vue'), //
      meta: {
        title: '人工供餐点'
      }
    },
    {
      path: 'supply-meal/edit',
      name: 'store_supply-meal_edit',
      hidden: true,
      component: () => import('/src/views/store/supply-meal/edit.vue'), //
      meta: {
        title: '人工供餐点 - 编辑'
      }
    },
    {
      path: 'supply-meal/close',
      name: 'store_supply-meal_close',
      hidden: true,
      component: () => import('/src/views/store/supply-meal/close.vue'), //
      meta: {
        title: '人工供餐点 - 不营业时间'
      }
    },
    {
      path: 'ATM',
      name: 'store_ATM',
      // hidden:true,
      component: () => import('/src/views/store/ATM/index.vue'), //
      meta: {
        title: '全自动化供餐点(ATM)'
      }
    },
    {
      path: 'ATM/edit',
      name: 'store_ATM_edit',
      hidden: true,
      component: () => import('/src/views/store/ATM/edit.vue'), //
      meta: {
        title: 'ATM - 编辑'
      }
    },
    {
      path: 'ATM/close',
      name: 'store_ATM_close',
      hidden: true,
      component: () => import('/src/views/store/ATM/close.vue'), //
      meta: {
        title: 'ATM - 不营业时间'
      }
    },
  ]
}]



const ATMShop = [{
    path: 'ATMShop',
    name: 'store_ATMShop',
    // hidden:true,
    component: () => import('/src/views/store/ATMShop/index.vue'), //
    meta: {
      title: '设备列表'
    },
  },
  {
    path: 'ATMShop/setSku',
    name: 'store_ATMShop_setSku',
    hidden: true,
    component: () => import('/src/views/store/ATMShop/setSku.vue'), //
    meta: {
      title: '设备设置'
    }
  }
]


const selfLiftingPoint = [{
  path: 'selfLiftingPoint',
  name: 'store_selfLiftingPoint',
  component: () => import('/src/views/store/selfLiftingPoint/index.vue'), //
  meta: {
    title: '自提点'
  }
}, {
  path: 'selfLiftingPoint/edit',
  name: 'store_selfLiftingPoint_edit',
  hidden: true,
  component: () => import('/src/views/store/selfLiftingPoint/edit.vue'), //
  meta: {
    title: '自提点 - 编辑'
  }
}, ]



const routes = [
  ...ATMShop,
  ...supplyMeal,
  // ...ATM,

  ...selfLiftingPoint
]

export default routes