const { toString } = Object.prototype;

export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object'
}
export function isPlainObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function isNum(num: any): num is number {
  // eslint-disable-next-line
  return !isNaN(+num);
}

export function isFunc(func: any): func is (...args: any[]) => any {
  return typeof func === 'function';
}

// 验证整数，包括0
export function isInt(num: number): boolean {
  return /^\+?[0-9][0-9]*$/.test(num)
}

interface decimalParams {
  num: number,
  digitNum: number
}
// 验证小数
export function isDecimal(params: decimalParams): boolean {
  const reg = new RegExp(`^[0-9]+(.[0-9]{1,${params.digitNum}})?$`)
  return reg.test(params.num)
}