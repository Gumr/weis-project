const routes = [{
  path: 'meituan/shops-list',
  name: 'meituan_shops-list',
  // hidden: true,
  component: () => import('/src/views/meituan/shops-list/index.vue'),
  meta: {
    title: '店铺列表'
  }
}, {
  path: 'meituan/goods-list',
  name: 'meituan_goods-list',
  // hidden: true,
  component: () => import('/src/views/meituan/goods-list/index.vue'),
  meta: {
    title: '菜品列表'
  }
}, {
  path: 'meituan/goods-list/edit',
  name: 'meituan_goods-list_edit',
  hidden: true,
  component: () => import('/src/views/meituan/goods-list/edit.vue'),
  meta: {
    title: '新建菜品'
  }
}, {
  path: 'meituan/combo-management',
  name: 'meituan_combo-management',
  // hidden: true,
  component: () => import('/src/views/meituan/combo-management/index.vue'),
  meta: {
    title: '美团套餐管理'
  }
},  {
  path: 'meituan/dispatch-auto',
  name: 'meituan_dispatch-auto',
  // hidden: true,
  component: () => import('/src/views/meituan/dispatch-auto/index.vue'),
  meta: {
    title: '半自动化调度控制'
  }
},]

export default routes