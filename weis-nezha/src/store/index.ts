// import Vue from 'vue';
import Vuex from 'vuex'
import { RouteRecordRaw } from 'vue-router'
// import RouteModule, { HeadRoute } from '@/router/module';
import request from '@/utils/request'
import RouteController from '@/utils/route-controller'
import router from '@/router'
import { DDLogin } from '@/utils/data-getter'
import { ElMessage } from 'element-plus'
import * as types from './types'

const store = new Vuex.Store({
  state: {
    online:true,
    printMode: false,
    fullscreen: false,
    headerMenus: [],
    passwordStatus: false,
    userData: null,
    activeHeaderMenu: 'diet', // 当前页头菜单激活项
    activeSidebar: '', // 当前侧边栏菜单激活项,
    keepRoutes: [],
    systemConfig: [] as string[],
    vloading: false, // 全局loading
    bloading: false,
    tagViews: [
      {
        fullPath: '/welcome',
        path: '/welcome',
        name: 'welcome',
        query: {},
        meta: {
          title: '首页',
          affix: true
        }
      }
    ] // 导航菜单
  },
  mutations: {
    [types.SET_FULLSCREEN](state, fullscreen) {
      state.fullscreen = fullscreen
    },
    [types.SET_ACTIVE_HEADER_MENU](state, menu) {
      state.activeHeaderMenu = menu
    },
    [types.SET_ACTIVE_SIDEBAR](state, sidebar) {
      state.activeSidebar = sidebar
    },
    [types.SET_USER_DATA](state, data) {
      state.userData = data
    },
    [types.SET_PASSWORD_STATUS](state, status) {
      state.passwordStatus = status
    },
    [types.SET_ONLINE](state, online) {
      state.online = online
    },
    // [types.SET_AUTH](state, auth) {
    //   state.auth = auth;
    // },
    [types.SET_HEADER_MENUS](state, menus) {
      state.headerMenus = menus
    },
    [types.SET_PRINT_MODE](state, mode) {
      state.printMode = mode
    },
    [types.SET_KEEP_ROUTES](state, routes) {
      state.keepRoutes = routes
    },
    [types.SET_SYSTEM_CONFIG](state, config) {
      state.systemConfig = config
    }
    // [types.SET_USER_QUERIED](state, menus) {
    //   state.headerMenus = menus;
    // },
  },
  actions: {
    getUserData({ commit }) {
      return request('sys.User/queryMe', {})
        .then(({ data }: { data: any }) => {
          if (data.errCode !== 0) {
            sessionStorage.removeItem('token')
            router.replace({
              path: '/login'
            })
            return
          }

          const userData = data.obj
          commit(types.SET_USER_DATA, userData)

          RouteController.createRoleRoutes(userData.menuVos)
          const routes = RouteController.getFlattenRoutes()

          routes.forEach((route) => {
            router.addRoute(route as RouteRecordRaw)
          })
        })
    }
  },
  getters: {

    systemConfig(state) {
      return state.systemConfig
    },
    keepRoutes(state) {
      return state.keepRoutes
    },
    printMode(state) {
      return state.printMode
    },
    online(state) {
      
      return state.online
    },
    fullscreen(state) {
      return state.fullscreen
    },
    headerMenus(state) {
      return state.headerMenus
    },
    userData(state) {
      return state.userData
    },
    activeHeaderMenu(state) {
      return state.activeHeaderMenu
    },
    tagViews(state) {
      return state.tagViews
    },
    activeSidebar(state) {
      return state.activeSidebar
    },
    passwordStatus(state) {
      return state.passwordStatus
    }
    // auth(state) {
    //   return state.auth;
    // }
  },
  modules: {
  }
})

router.beforeEach(({ path, query }, from, next) => {
  const token = sessionStorage.getItem('token')
  function getAndNext(p?: string) {
    // 跳入两个无权限页面 且 store没有userdata 先试着请求他的userdata拿到权限 避免跳404闪屏再跳页面的情况
    store.dispatch('getUserData')
      .then(() => p ? next({ path: p }) : next(window.location.hash.slice(1)))
  }

  function nextLogin() {
    path !== '/login' ? next({ path: '/login' }) : next()
  }

  if (query.code && path === '/login') {
    DDLogin(query.code as string)
      .thenwrap((err, res) => {
        if (err) {
          ElMessage.error(err.errMsg)
          nextLogin()
        } else {
          sessionStorage.setItem('token', res.token)
          getAndNext('/welcome')
        }
      })
  } else if (!token) {
    nextLogin()
  } else {
    if (!store.getters.userData) {
      getAndNext()
    } else {
      next()
    }
  }
})

export default store
