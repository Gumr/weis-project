export function getSaleDate(t = 0): Date {
  const now = new Date()
  const day = 86400000
  const saleDate = now.valueOf() + t * day
  // 大于18点以后 + 1天
  return now.getHours() >= 18
    ? new Date(saleDate + day)
    : new Date(saleDate)
}

type StringObject = Record<string, any>
type Union<T extends readonly string[]> = T[number]
type StockItem<S extends StringObject, T extends readonly string[]> = {
  tfsCid: any
  tfsVersion: any
} & {
  [P in Exclude<keyof S, Union<T>>]: S[P]
}

export function genStockList<S extends StringObject, T extends readonly string[]>(stockList: S[], keys: T): StockItem<S,T>[] {
  return stockList.map(item => {
    const ret: StringObject = {
      tfsCid: item.tfsCid,
      tfsVersion: item.tfsVersion
    }
    for (const key of keys) {
      const value = item[key]
      ret[key] = value >= 0 ? value : ''
    }
    return ret as StockItem<S,T>
  })
}