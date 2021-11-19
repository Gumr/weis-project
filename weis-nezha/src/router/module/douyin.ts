const routes = [
  {
    path: 'douyin/Package',
    name: 'douyin_Package',
    // hidden: true,
    meta: {
      title: '套餐包管理'
    },
    children: [
      {
      path: '/douyin/Package/catalogue',
      name: 'douyin_Package_catalogue',
      component: () => import('/src/views/douyin/Package/catalogue/index.vue'), //
      meta: {
        title: '类目管理'
      },
      
    },
    {
      path: '/douyin/Package/packageList',
      name: 'douyin_Package_packageList',
      component: () => import('/src/views/douyin/Package/packageList/index.vue'), //
      meta: {
        title: '套餐包管理'
      }
    },
    {
      path: '/douyin/Package/packageList/edit',
      name: 'douyin_Package_packageList_edit',
      hidden:true,
      component: () => import('/src/views/douyin/Package/packageList/edit.vue'), //
      meta: {
        title: '套餐包管理--新建'
      }
    }
  ]
  },
  {
    path: '/douyin/banner',
    name: 'douyin_banner',
    // hidden: true,
    component: () => import('/src/views/douyin/banner/index'),
    meta: {
      title: 'banner管理'
    }
  },
  {
    path: '/douyin/userList',
    name: 'douyin_userList',
    component: () => import('/src/views/douyin/userList/index.vue'),
    meta: {
      title: '用户管理'
    }
  },
  {
    path: '/douyin/orderList',
    name: 'douyin_orderList',
    component: () => import('/src/views/douyin/orderList/index.vue'),
    meta: {
      title: '订单管理'
    }
  },
  {
    path: '/douyin/orderList/detail',
    name: 'douyin_orderList_detail',
    hidden:true,
    component: () => import('/src/views/douyin/orderList/detail.vue'),
    meta: {
      title: '订单管理--详情'
    }
  },
]

export default routes