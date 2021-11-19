import {
  defineAsyncComponent
} from 'vue'
const memberManagement = [{
    path: 'member-management/member-channel',
    name: 'member_member-management_member-channel',
    component: () => import('/src/views/member/member-management/member-channel/index.vue'),
    meta: {
      title: '注册来源管理'
    }
  },

  {
    path: 'member-management/member-list',
    name: 'member_member-management_member-list',
    component: () => import('/src/views/member/member-management/member-list/index.vue'),
    meta: {
      title: '用户列表'
    }
  },
  {
    path: 'member-management/member-list/detail',
    name: 'member_member-management_member-list_detail',
    hidden: true,
    component: () => import('/src/views/member/member-management/member-list/detail.vue'),
    meta: {
      title: '用户列表 - 详情'
    }
  },

]

const vipManagement = [
  // {
  // path: 'member/vip-management',
  // name: 'member_vip-management',
  // meta: {
  //   title: '会员管理'
  // },
  // children: [
    {
      path: 'vip-management/member-list',
      name: 'member_vip-management_member-list',
      component: () => import('/src/views/member/vip-management/member-list/index.vue'),
      meta: {
        title: '会员列表'
      }
    },
    // {
    //   path: 'vip-management/close-beta-member',
    //   name: 'member_vip-management_close-beta-member',
    //   component: () => import('/src/views/member/vip-management/close-beta-member/index.vue'),
    //   meta: {
    //     title: '内测会员'
    //   }
    // },
    {
      path: 'vip-management/insider-member',
      name: 'member_vip-management_insider-member',
      component: () => import('/src/views/member/vip-management/insider-member/index.vue'),
      meta: {
        title: '内部员工'
      }
    }
  // ]
// }
]

const routes = [
  ...memberManagement,
  ...vipManagement
]

export default routes