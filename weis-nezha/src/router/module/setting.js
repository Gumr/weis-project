
import { defineAsyncComponent } from 'vue'
const auth = [
  {
    path: 'role-management',
    name: 'setting_role-management',
    component: () => import('/src/views/setting/role-management/index.vue'),
    meta: {
      title: '权限管理'
    }
  },
  {
    path: 'role-management/create',
    name: 'setting_role-management_create',
    hidden: true,
    component: () => import('/src/views/setting/role-management/create.vue'),
    meta: {
      title: '权限管理 - 新建角色'
    }
  },
  {
    path: 'role-management/edit',
    name: 'setting_role-management_edit',
    hidden: true,
    component: () => import('/src/views/setting/role-management/edit.vue'),
    meta: {
      title: '权限管理 - 编辑'
    }
  },
  {
    path: 'role-management/search',
    name: 'setting_role-management_search',
    hidden: true,
    component: () => import('/src/views/setting/role-management/search.vue'),
    meta: {
      title: '权限管理 - 查询'
    }
  },
  {
    path: 'role-management/detail',
    name: 'setting_role-management_detail',
    hidden: true,
    component: () => import('/src/views/setting/role-management/detail.vue'),
    meta: {
      title: '权限管理 - 详情'
    }
  }
]

const userManagement = [
  {
    path: 'user-management',
    name: 'setting_user-management',
    component: () => import('/src/views/setting/user-management/index.vue'),
    meta: {
      title: '账号管理'
    }
  }
]

const routes = [
  ...auth,
  ...userManagement
]

export default routes
