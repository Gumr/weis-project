import { DefineComponent } from '@vue/runtime-core'

type FunctionObject = {
  [prop: string]: (...args: any[]) => any
}

export type QueryItem = {
  component: string // 组件名字
  key: string // 绑定值得key
  label: string // 查询项的文字
  placeholder?: string // 占位符文字
  props?: Record<string, unknown> // 传给组件的props对象
  listeners?: FunctionObject // 监听组件方法的对象集合
} | { slot: string | (() => JSX.Element) }

export interface QueryComponentsProps {
  'v-model': Record<string, unknown>,
  'label-width'?: number
  /** default: false */
  semi?:boolean
  'query-list': QueryItem[]
  'row-gap'?:string
  span?: number
  'button-size'?: string
  action?: boolean
}

export interface BasePageTableProps {
  /** default: true */
  border?:boolean
  /** default: true */
  stripe?:boolean
  data?: any[]
  columns?: any[]
  selection?: any[]
  /** default: 10 */
  'page-size'?: number
  /** default: 1 */
  'current-page'?: number
  /** total: 1 */
  total?: number
  /**
   * default: { layout: 'total, sizes, prev, pager, next, jumper' },
   * pageProps: 传给el-page组件的props
  *  */
  'page-props'?:  import('element-plus/packages/pagination/src/pagination').IPaginationProps
  /** default: true 是否显示el-page */
  visible?: boolean
  onPageChange?: (params: {
    type: string,
    value: number
  }) => any
  onCurrentPageChange?: (page: number) => any
  onSizeChange?: (pageSize: number) => any
}
export interface BaseSelectProps {
  'v-model': number | string | boolean
  'model-value'?: number | string | boolean
  options: Record<string, unknown>[]
  props?: {
    label: string,
    value: string
  }
}
// ElInput.
export type NumberInputProps = {
  'v-model': number | string
  'model-value'?: number | string
  /** default: int */
  mode?: 'int' | 'digit'
  precision?: number
  max?: number
  /** default: true */
  unsigned?: boolean
}

export interface DatePickerProps {
  'v-model': import('dayjs').ConfigType | import('dayjs').ConfigType[]
  'model-value'?: import('dayjs').ConfigType | import('dayjs').ConfigType[]
  // default: 'date'
  type: 'date' | 'daterange'
  // default: YYYYMMDD
  valueFormat?: string
}

export interface ReturnButtonProps {
  // default: false
  back?: boolean
  // default: false
  replace?: boolean
  icon?: string
  type?: string
}