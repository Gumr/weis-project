import { MyRouteRecordRaw } from '@/router/types'
import { isPlainObject } from './validator'
type ParamsType = Record<string|number, any>

export const extend = Object.assign

export function validArray(ary: any): ary is any[] {
  return Array.isArray(ary) && ary.length > 0
}

export function isVisibleMenu(menu: MyRouteRecordRaw): boolean {
  return !menu.hidden && Boolean(menu.meta && menu.meta.title)
}

export function filerParams<T extends ParamsType>(params: T): ParamsType {
  const res: ParamsType = {}
  Object.keys(params)
    .forEach(key => {
      if (params[key] || params[key] === 0) {
        res[key] = params[key]
      }
    })

  return res
}

export function cloneDeep<T extends any>(value: T, map = new WeakMap<any, any>()): T {
  if (Array.isArray(value)) {
    const res: any[] = []
    map.set(value, res)

    value.forEach((item, i) => {
      const cache = map.get(item)
      res[i] = cache || cloneDeep(item, map)
    })

    return res as T
  }

  if (isPlainObject(value)) {
    const res: Record<string, any> = {}
    map.set(value, res)
    for (const key of Object.keys(value)) {
      const item = value[key]
      const cache = map.get(item)
      res[key] = cache || cloneDeep(item, map)
    }

    return res as T
  }

  return value
}

export function round (number: string|number, precision: number): number {
  precision = precision == null ? 0 : (precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292))
  if (precision) {
    // Shift with exponential notation to avoid floating-point issues.
    // See [MDN](https://mdn.io/round#Examples) for more details.
    let pair = `${number}e`.split('e')
    const value = Math.round(Number(`${pair[0]}e${+pair[1] + precision}`))

    pair = `${value}e`.split('e')
    return +`${pair[0]}e${+pair[1] - precision}`
  }
  return Math.round(number as number)
}

export function validateObject(obj: Record<string, unknown>, keys = getKeys(obj)): boolean {
  return keys.every(key => Boolean(obj[key]))
}

export function getKeys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj)
}

export function objectForeach<T extends Record<string, unknown>>(obj: T, func: (value: T[keyof T], key: keyof T) => void): void {
  getKeys(obj)
    .forEach(key => func(obj[key], key))
}

export function portFilter(item: {value: string}): boolean {
  return item.value === '40'
}

