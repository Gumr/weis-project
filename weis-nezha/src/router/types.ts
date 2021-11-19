import  { RouteRecordRaw } from 'vue-router'

export type MyRouteRecordRaw = Omit<RouteRecordRaw, 'children'> & { hidden?: boolean, children?: MyRouteRecordRaw[] }
