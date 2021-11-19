import Layout from '@/views/layout/index.vue';
// import order from './order';
import goods from './goods';
import store from './store';
import sales from './sales';
import marketing from './marketing';
// import om from './om';
import member from './member';
// import feedback from './feedback';
import pcl from './pcl';
import finance from './finance';
import scm from './scm';
import Kitchen from './Kitchen';
import developer from './developer';
import setting from './setting';
import douyin from './douyin';
import product from './product'
import business from './business'
import meituan from './meituan'
import ele from './ele'
import { MyRouteRecordRaw } from '../types'

const moduleRoutes: MyRouteRecordRaw[] = [
  // {
  //   path: '/order',
  //   name: 'order',
  //   component: Layout,
  //   meta: {
  //     title: '订单管理'
  //   },
  //   children: order
  // },
  {
    path: '/goods',
    name: 'goods',
    component: Layout,
    meta: {
      title: '商品管理(销售库)'
    },
    children: goods
  },
  {
    path: '/store',
    name: 'store',
    component: Layout,
    meta: {
      title: '供餐点管理'
    },
    children: store
  },
  {
    path: '/sales',
    name: 'sales',
    component: Layout,
    meta: {
      title: '销售管理'
    },
    children: sales
  },
  {
    path: '/marketing',
    name: 'marketing',
    component: Layout,
    meta: {
      title: '营销管理'
    },
    children: marketing
  },
  // {
  //   path: '/om',
  //   name: 'om',
  //   component: Layout,
  //   meta: {
  //     title: '运营管理'
  //   },
  //   children: om
  // },
  {
    path: '/pcl',
    name: 'pcl',
    component: Layout,
    meta: {
      title: '内容管理'
    },
    children: pcl
  },
  {
    path: '/member',
    name: 'member',
    component: Layout,
    meta: {
      title: '用户管理'
    },
    children: member
  },
  // {
  //   path: '/feedback',
  //   name: 'feedback',
  //   component: Layout,
  //   meta: {
  //     title: '反馈中心'
  //   },
  //   children: feedback
  // },
  {
    path: '/finance',
    name: 'finance',
    component: Layout,
    meta: {
      title: '财务管理'
    },
    children: finance
  },
  {
    path: '/Kitchen',
    name: 'Kitchen',
    component: Layout,
    meta: {
      title: '中央厨房'
    },
    children: Kitchen
  },
  {
    path: '/scm',
    name: 'scm',
    component: Layout,
    meta: {
      title: '供餐点运营'
    },
    children: scm
  },
  {
    path: '/meituan',
    name: 'meituan',
    component: Layout,
    meta: {
      title: '美团'
    },
    children: meituan
  },
  {
    path: '/ele',
    name: 'ele',
    component: Layout,
    meta: {
      title: '饿了么'
    },
    children: ele
    },
    {
    path: '/douyin',
    name: 'douyin',
    component: Layout,
    meta: {
      title: '抖音'
    },
    children: douyin
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    meta: {
      title: '系统管理'
    },
    children: setting
  },
  {
    path: '/business',
    name: 'business',
    component: Layout,
    meta: {
      title: '看板中心'
    },
    children: business
  },
  // {
  //   path: '/product',
  //   name: 'product',
  //   component: Layout,
  //   meta: {
  //     title: '产品运营分析'
  //   },
  //   children: product
  // },
  // {
  //   path: '/data',
  //   name: 'data',
  //   component: Layout,
  //   meta: {
  //     title: '数据'
  //   },
  //   children: data
  // },
  {
    path: '/developer',
    name: 'developer',
    component: Layout,
    meta: {
      title: '开发管理'
    },
    children: developer
  }
];
export default moduleRoutes;
