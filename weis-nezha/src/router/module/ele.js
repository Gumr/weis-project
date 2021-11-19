const routes = [{
  path: 'ele/shops-list',
  name: 'ele_shops-list',
  // hidden: true,
  component: () => import('/src/views/ele/shops-list/index.vue'),
  meta: {
    title: '店铺列表'
  }
}, {
  path: 'ele/goods-list',
  name: 'ele_goods-list',
  // hidden: true,
  component: () => import('/src/views/ele/goods-list/index.vue'),
  meta: {
    title: '菜品列表'
  }
}, {
  path: 'ele/goods-list/edit',
  name: 'ele_goods-list_edit',
  hidden: true,
  component: () => import('/src/views/ele/goods-list/edit.vue'),
  meta: {
    title: '新建菜品'
  }
}, {
  path: 'ele/combo-management',
  name: 'ele_combo-management',
  hidden: true,
  component: () => import('/src/views/ele/combo-management/index.vue'),
  meta: {
    title: '饿了么套餐管理'
  }
}, {
  path: 'ele/order-list',
  name: 'ele/order-list',
  hidden: true,
  component: () => import('/src/views/ele/order-list/index.vue'),
  meta: {
    title: '饿了么订单'
  }
}, {
  path: 'ele/dispatch-auto',
  name: 'ele_dispatch-auto',
  hidden: true,
  component: () => import('/src/views/ele/dispatch-auto/index.vue'),
  meta: {
    title: '半自动化调度控制'
  }
}, ]

export default routes