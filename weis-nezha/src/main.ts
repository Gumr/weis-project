import { createApp, computed, nextTick } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'element-plus/lib/theme-chalk/index.css'
import request, { ResponseData, responseWrap, http, responseConverter,WrapResolve } from '@/utils/request'
import format from '@/utils/format'
import  { cloneDeep }  from '@/utils/common'
import '@/styles/common.less'
import Print from '@/directives/print'
import GlobalComponent from './utils/global-components'
import store from './store'
import router from './router'
import App from './App.vue'

dayjs.locale('zh-cn')
Promise.prototype.thenwrap = function (resolve: WrapResolve, reject?: any) {
  return this.then(res => resolve(...responseConverter(res.data || res)), reject)
}
const app = createApp(App)
app.directive('print', Print)

app.use(store)
app.use(router)
app.use(GlobalComponent)

app.config.globalProperties.$day = dayjs
app.config.globalProperties.$fm = format
app.config.globalProperties.$rw = responseWrap
app.config.globalProperties.$request = request
app.config.globalProperties.$deepClone = cloneDeep
app.config.globalProperties.$nt = (func: () => void) => nextTick(() => {
  try {
    func()
  } catch(e) {
    if (process.env.NODE_ENV === 'development') {
      console.log(e)
    }
  }
})
app.config.globalProperties.$msg = function msg(message: string, type: string) {
  this.$message({ type, message })
}

app.config.globalProperties.$errorNotify = function errorNotify(res: ResponseData) {
  if (res && res.errCode !== 0) {
    this.$message({
      type: 'error',
      message: res.errMsg
    })
  }
}

function pushRoute(path: string, option = {}) {
  // 判断是否为绝对路径
  const currentPath = router.currentRoute.value.path
  const isAbs = typeof path === 'string' && path[0] === '/'
  path = isAbs ? path : `${currentPath}/${path}`

  if (path !== currentPath) {
    router.push({
      ...option,
      path
    })
  }
}

app.config.globalProperties.$pushRoute = pushRoute
app.config.globalProperties.$http = http
app.config.globalProperties.$closeRoute = function closeRoute() {
  const index = store.state.tagViews.findIndex(val => val.path === this.$route.path)
  store.state.tagViews.splice(index, 1)
  this.$router.back()
}
app.provide('pushRoute', pushRoute)
app.provide('vloading', computed({
  get: () => store.state.vloading,
  set(value) {
    store.state.vloading = value
  }
}))
app.use(ElementPlus, { locale })

app.mount('#app')