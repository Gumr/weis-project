
import moduleRoutes from '@/router/module'
import type { MyRouteRecordRaw } from '@/router/types'

interface MenuVos {
  id: string,
  name: string,
  url: string
  children?: MenuVos[]
}

function filterRoutes(routes: MyRouteRecordRaw[], roles?: MenuVos[]) {
  if (process.env.NODE_ENV === 'development') return routes // 开发环境不做过滤
  if (!roles) return []
  const result = []
  for (let route of routes) {
    route = { ...route }
    const match = roles.find(role => role.url === route.name)
    if (!match) continue
    if (route.children) { // 有匹配项则递归的对children做对比
      route.children = filterRoutes(route.children, match.children)
    }
    result.push(route)
  }
  return result
}

interface RouteControllerType {
  $routes: MyRouteRecordRaw[]
  routes: MyRouteRecordRaw[]
  roles: MenuVos[],
  createRoleRoutes: (roles: MenuVos[]) => void
  getFlattenRoutes: (filterable?: boolean) => MyRouteRecordRaw[]
}

const RouteController: RouteControllerType = {
  $routes: [],
  roles: [],
  createRoleRoutes(roles: MenuVos[]) { // 拿到权限数组 set权限路由
    this.roles = roles
  },
  get routes() {
    if (this.$routes.length <= 0) {
      this.$routes = filterRoutes(moduleRoutes, this.roles)
    }
    return this.$routes
  },
  getFlattenRoutes(filterable = true) { // 把路由里面的children都展平 放到一个新的维数组里
    function flattenChildrenRoutes(childrenRoutes: MyRouteRecordRaw[]): MyRouteRecordRaw[] {
      const res: MyRouteRecordRaw[] = []
      childrenRoutes.forEach((r) => {
        const route = { ...r } // 浅复制

        if (route.children) {
          res.push(...flattenChildrenRoutes(route.children))
          delete route.children
        }

        res.push(route)
      })

      return res
    }

    return this.routes.map((route) => {
      route = { ...route }
      if (route.children) {
        let children = flattenChildrenRoutes(route.children)
        if (filterable) {
          children = children.filter(({ component }) => Boolean(component))
        }
        route.children = children
      }
      return route
    })
  }
}

export default RouteController
