import {
  defineAsyncComponent
} from 'vue'
const planGallery = [{
  path: 'plan-gallery',
  name: 'plan-gallery',
  meta: {
    title: '方案库'
  },
  children: [{
      path: 'plan-gallery/plan-list',
      name: 'plan-gallery_plan-list',
      component: () => import('/src/views/pcl/plan-gallery/plan-list/index.vue'), //
      meta: {
        title: '方案列表'
      }
    },
    {
      path: 'plan-gallery/plan-list/edit',
      name: 'plan-gallery_plan-list_edit',
      hidden: true,
      component: () => import('/src/views/pcl/plan-gallery/plan-list/edit.vue'), //
      meta: {
        title: '方案 - 编辑'
      }
    },
    {
      path: 'plan-gallery/plan-list/detail',
      name: 'plan-gallery_plan-list_detal',
      hidden: true,
      component: () => import('/src/views/pcl/plan-gallery/plan-list/detail.vue'), //
      meta: {
        title: '方案 - 详情'
      }
    },
    {
      path: 'plan-gallery/plan-tag-list',
      name: 'plan-gallery_plan-tag-list',
      component: () => import('/src/views/pcl/plan-gallery/plan-tag-list/index.vue'), //
      meta: {
        title: '方案标签列表'
      }
    }
  ]
}]

const dietician = [{
    path: 'dietician-list',
    name: 'dietician-list',
    component: () => import('/src/views/pcl/dietician-list/index.vue'), //
    meta: {
      title: '方案师'
    }
  },
  {
    path: 'dietician-list/create',
    name: 'dietician-list_create',
    hidden: true,
    component: () => import('/src/views/pcl/dietician-list/create.vue'), //
    meta: {
      title: '方案师 - 新增'
    }
  },
  {
    path: 'dietician-list/edit',
    name: 'dietician-list_edit',
    hidden: true,
    component: () => import('/src/views/pcl/dietician-list/edit.vue'), //
    meta: {
      title: '方案师 - 编辑'
    }
  }
]

const master = [{
    path: 'master-list',
    name: 'pcl_master-list',
    component: () => import('/src/views/pcl/master-list/index.vue'), //
    meta: {
      title: '厨师管理'
    }
  },
  {
    path: 'master-list/create',
    name: 'pcl_master-list_create',
    hidden: true,
    component: () => import('/src/views/pcl/master-list/create.vue'), //
    meta: {
      title: '厨师管理 - 新增'
    }
  },
  {
    path: 'master-list/edit',
    name: 'pcl_master-list_edit',
    hidden: true,
    component: () => import('/src/views/pcl/master-list/edit.vue'), //
    meta: {
      title: '厨师管理 - 编辑'
    }
  }
]

const outFoods = [{
  path: 'out-foods',
  name: 'out-foods',
  meta: {
    title: '外食库'
  },
  children: [{
      path: 'out-foods/dietician-list',
      name: 'out-foods_dietician-list',
      component: () => import('/src/views/pcl/out-food/dietician-list/index.vue'), //
      meta: {
        title: '外部食材列表'
      }
    },
    {
      path: 'out-foods/dietician-list/edit',
      name: 'out-foods_dietician-list_edit',
      hidden: true,
      component: () => import('/src/views/pcl/out-food/dietician-list/edit.vue'), //
      meta: {
        title: '外部食材 - 编辑'
      }
    },
    {
      path: 'out-foods/dietician-list/detail',
      name: 'out-foods_dietician-list_detail',
      hidden: true,
      component: () => import('/src/views/pcl/out-food/dietician-list/detail.vue'), //
      meta: {
        title: '外部食材 - 详情'
      }
    },
    {
      path: 'out-foods/foods',
      name: 'out-foods_foods',
      component: () => import('/src/views/pcl/out-food/foods/index.vue'), //
      meta: {
        title: '食材库'
      }
    }
  ]
}]

const article = [{
  path: 'article-list',
  name: 'om_article-list',
  component: () => import('/src/views/om/article-list/index.vue'),
  meta: {
    title: '首页公众号'
  }
}]

const recommend = [{
    path: 'recommend-list',
    name: 'om_recommend-list',
    component: () => import('/src/views/om/recommend-list/index.vue'),
    meta: {
      title: '每日一点'
    }
  },
  {
    path: 'recommend-list/create',
    name: 'om_recommend-list_create',
    hidden: true,
    component: () => import('/src/views/om/recommend-list/create.vue'),
    meta: {
      title: '每日一点 - 新增'
    }
  },
  {
    path: 'recommend-list/edit',
    name: 'om_recommend-list_edit',
    hidden: true,
    component: () => import('/src/views/om/recommend-list/edit.vue'),
    meta: {
      title: '每日一点 - 编辑'
    }
  },
  {
    path: 'recommend-list/detail',
    name: 'om_recommend-list_detal',
    hidden: true,
    component: () => import('/src/views/om/recommend-list/detail.vue'),
    meta: {
      title: '每日一点 - 详情'
    }
  }
]
// const discover = [{
//   path: 'discover',
//   name: 'om_discover',
//   meta: {
//     title: '发现管理'
//   },
//   children: [{
//       path: 'discover/discover-label',
//       name: 'discover_discover-label',
//       component: () => import('/src/views/om/discover/discover-label/index.vue'),
//       meta: {
//         title: ' 标签后台'
//       }
//     },

//     {
//       path: 'article',
//       name: 'om_article',
//       meta: {
//         title: '内容管理'
//       },
//       children: [
//         //   {
//         //   path: 'discover/catalogue',
//         //   name: 'om_discover_catalogue',
//         //   component: () => import('/src/views/om/discover/catalogue/index.vue'),
//         //   meta: {
//         //     title: '目录管理'
//         //   }
//         // },
//         {
//           path: 'discover/discover-content',
//           name: 'om_discover_discover-content',
//           component: () => import('/src/views/om/discover/discover-content/index.jsx'),
//           meta: {
//             title: '精彩内容'
//           }
//         },
//         {
//           path: 'discover/video',
//           name: 'discover_video',
//           component: () => import('/src/views/om/discover/video/index.vue'),
//           meta: {
//             title: '视频管理'
//           }
//         },

//       ]
//     },


//   ]
// }]

const content = [{
  path: 'article',
  name: 'om_article',
  meta: {
    title: '发现管理'
  },
  children: [
    //   {
    //   path: 'discover/catalogue',
    //   name: 'om_discover_catalogue',
    //   component: () => import('/src/views/om/discover/catalogue/index.vue'),
    //   meta: {
    //     title: '目录管理'
    //   }
    // },
    {
      path: 'discover/discover-content',
      name: 'om_discover_discover-content',
      component: () => import('/src/views/om/discover/discover-content/index.jsx'),
      meta: {
        title: '精彩内容'
      }
    },
    {
      path: 'discover/video',
      name: 'discover_video',
      component: () => import('/src/views/om/discover/video/index.vue'),
      meta: {
        title: '视频管理'
      }
    },

  ]
}]
const articleMgr = [{
  path: 'article-mgr',
  name: 'pcl_article-mgr',
  component: () => import('/src/views/pcl/article-mgr/index.jsx'),
  meta: {
    title: '文章管理'
  }
}, ]

const homeBanner = [{
  path: 'home-banner',
  name: 'pcl_home-banner',
  component: () => import('/src/views/pcl/home-banner/index'),
  meta: {
    title: 'Banner管理'
  }
}, ]


const dialogList = [{
  path: 'dialog-list',
  name: 'pcl_dialog-list',
  component: () => import('/src/views/pcl/dialog-list/index'),
  meta: {
    title: '弹窗管理'
  }
}]


const riceCircle = [{
  path: 'riceCircleList',
  name: 'pcl_riceCircleList',
  component: () => import('/src/views/pcl/riceCircleList/index.vue'),
  meta: {
    title: '饭圈管理'
  }
}, {
  path: 'riceCircleList/user',
  name: 'pcl_riceCircleList_user',
  hidden: true,
  component: () => import('/src/views/pcl/riceCircleList/user.vue'),
  meta: {
    title: '饭圈管理--发帖人群'
  }

}]

const routes = [

  ...dietician,
  ...planGallery,
  ...master,
  ...dialogList,
  ...homeBanner,
  ...riceCircle,
  // ...discover,
  ...content,
  ...articleMgr,
  ...outFoods,
  // ...article,


  // ...recommend,

]

export default routes