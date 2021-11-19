import format from './utils/format'
import { ResponseData, RequestMethod, responseWrap, http } from './utils/request'
import dayjs from 'dayjs'
import { cloneDeep } from './utils/common'
import { RouteLocationRaw } from 'vue-router'
import store from './store/index'
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $store: typeof store;
    $request: RequestMethod;
    $rw: typeof responseWrap;
    $http: typeof http;
    $day: typeof dayjs;
    $deepClone: typeof cloneDeep;
    $fm: typeof format;
    $msg: (message: string, type: string) => void;
    $errorNotify: (err: ResponseData) => void;
    $pushRoute: (path: string, option?: RouteLocationRaw) => void;
  }
}
