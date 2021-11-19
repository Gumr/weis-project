// import Vue from 'vue';
// import VueRouter from 'vue-router';
import * as VueRouter from 'vue-router'
// eslint-disable-next-line
import VueStore from '@/store';
// import Layout from '/src/views/layout/index.vue'
const Layout = () => import('/src/views/layout/index.vue')

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/** webpackChunkName login */ '/src/views/login/PageLogin.vue')
  },
  {
    path: '/',
    name: 'home',
    redirect: '/welcome',
    component: Layout,
    children: [
      {
        path: '/welcome',
        name: 'welcome',
        meta: {
          title: '首页',
          icon: 'el-icon-house'
        },
        component: () => import(/** webpackChunkName welcome */ '/src/views/welcome/PageWelcome.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: Layout,
    redirect: '/welcome'
  }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

export default router
