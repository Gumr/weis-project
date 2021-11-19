import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios'
import store from '@/store'
import dayjs from 'dayjs'
import { extend } from './common'

type NormalObject = Record<string | number, any>

export type WrapResolve<T = any> = (err: ResponseData | void, data: any) => T;
export interface ResponseData {
  errCode: number;
  errMsg: string;
  obj: any;
}
export interface RequestMethod extends AxiosInstance {
  (path: string, params: NormalObject, cover?: boolean): AxiosPromise<any>;
  token: string;
}

let axiosInstance = axios.create({
  baseURL: '/api'
})

// axiosInstance.interceptors.request.use(
//   config => {
//     if (config.reqBaseUrl === '/weisapi') {
//       config.baseURL = process.env.NODE_ENV === 'development' ? '/weisapi' : 'https://otherterrace.weis1606.cn/api'
//       config.headers.post["Content-Type"] = "application/json"
//       config.headers.post["X-Requested-With"] = "XMLHttpRequest"
//     }
//     return config
//   }
// )

export function responseConverter(data: ResponseData): [ResponseData | void, any] {
  let err
  let response = {}

  if (data.errCode !== 0) {
    err = data
  } else {
    response = data.obj || response
  }

  return [err, response]
}

function responseWrap(func: WrapResolve) {
  return (res: AxiosResponse) => {
    const [err, data] = responseConverter(res.data)
    return func(err, data)
  }
}

const request = ((path: string, params: NormalObject, cover = false, baseUrl = '/api') => {
  const paths = path.split('/')
  const method = paths[paths.length - 1]
  const opts: AxiosRequestConfig = {
    url: cover
      ? path
      : (path[0] === '/' ? path : `/cn.nezha.api.${path}`),
    method: 'POST',
    data: {
      token: sessionStorage.getItem('token'),
      method,
      params: []
    },
    reqBaseUrl: baseUrl
  }

  if (params) {
    for (const key in params) {
      if (params[key] instanceof Date) {
        params[key] = dayjs(params[key]).format('YYYY-MM-DD')
      }
    }
    opts.data.params = [params]
  }

  return axiosInstance(opts)
}) as RequestMethod

extend(request, axiosInstance)
function http(path: string, params: NormalObject, cover?: boolean): Promise<ResponseData> {
  const response = request(path, params, cover || false)
    .then((res) => res.data)
    .finally(() => {
      store.state.vloading = false
      store.state.bloading = false
    })
  return response
}

http.download = function download(url: string, params: NormalObject) {
  const paths = url.split('/')
  const method = paths[paths.length - 1]
  const opts: AxiosRequestConfig = {
    url,
    method: 'POST',
    data: {
      method,
      params: params ? [params] : []
    }
  }
  opts.responseType = 'blob'
  return axios(opts)
}

function requestFactor(predefine: string, loading = false) {
  return {
    http(path: string, params: NormalObject, cover?: boolean) {
      if (loading) {
        store.state.vloading = true
        store.state.bloading = true
      }

      return http(`${predefine}/${path}`, params, cover || false)
    },
    request(path: string, params: NormalObject, cover?: boolean) {
      return request(`${predefine}/${path}`, params, cover || false)
    }
  }
}
export default request
export { responseWrap, http, requestFactor }
