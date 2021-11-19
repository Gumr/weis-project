
const develop = [
  {
    path: 'developer/delelop',
    name: 'developer_delelop',
    component: () => import('/src/views/developer/develop/index.vue'),
    meta: {
      title: '开发者'
    }
  }
]

const wjob = [
  {
    path: 'developer/wjob',
    name: 'developer_wjob',
    component: () => import('/src/views/developer/wjob/index.vue'),
    meta: {
      title: '任务调度管理'
    }
  }
]

const systemConfig = [
  {
    path: 'developer/system-config',
    name: 'developer_system-config',
    component: () => import('/src/views/developer/system-config/index.vue'),
    meta: {
      title: '系统配置'
    }
  }
]

const systemAPIConfig = [
  {
    path: 'developer/system-config/serviceAPI',
    name: 'developer_system-config_serviceAPI',
    component: () => import('/src/views/developer/system-config/serviceAPI.vue'),
    meta: {
      title: '服务调用'
    }
  }
]

const algorithmTest = [
  {
    path: 'developer/system-config/algorithmTest',
    name: 'developer_system-config_algorithmTest',
    hidden:true,   
    component: () => import('/src/views/developer/system-config/algorithmTest.vue'),
    meta: {
      title: '算法测试'
    }
  }
]


const routes = [
  ...develop,
  ...wjob,
  ...systemConfig,
  ...systemAPIConfig,
  ...algorithmTest
]

export default routes
