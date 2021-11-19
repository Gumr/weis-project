
import router from '@/router'
import dayjs from 'dayjs'

export type Column = {
  [prop: string]: any
  label: string
}

type ExcelOptions = {
  excel?: ExcelOptions[]
  header?: string[]
  filename?: string
  data: any[]
  columns: Column[]
  excelType:string
}

function rowConverter(data: any[], index: number, columns: Column[]): string[] {
  return columns.map((col) => {
    switch (col.type) {
      case 'index':
        return String(index + 1)
      default:
        return col.formatter ? col.formatter(data, index) : data[col.prop]
    }
  })
}

function dataConverter(data: any[], cols: Column[]) {
  return data.map((row, index) => rowConverter(row, index, cols))
}

function genHeader(cols: Column[]): string[] {
  return cols.map(({ label }) => label)
}

function filterColumns(cols: Column[]): Column[] {
 
  return cols.filter(col => col.label && col.label !== '操作')
}

export default function exportExcel(options: ExcelOptions) {

  if (options.excel) {
    options.excel.forEach(exc => exc.columns = filterColumns(exc.columns))
    const maxlength = Math.max(...options.excel.map(({ columns }) => columns.length))

    options.data = options.excel.reduce((result, { data, columns }) => {
      const header = genHeader(columns)

      if (maxlength > columns.length) {
        header.push(...new Array(maxlength - columns.length).fill(null))
      }

      result.push(header)
      result.push(...dataConverter(data, columns))

      return result
    }, [] as any[])
  } 
  else if (options.sheetArr && options.type !="excelType") { 
    
    options.sheetArr.forEach((item) => {
      const columns = filterColumns(item.columns)
      item.header = genHeader(columns)
      item.data = dataConverter(item.data, columns)
    })
  } 
  else {
    const columns = filterColumns(options.columns)
    options.header = genHeader(columns)
    options.data = dataConverter(options.data, columns)
  }
  if (!options.filename) options.filename = `${router.currentRoute.value.meta.title}-导出(${dayjs().format('YYYY-MM-DD')})`
  import('@/utils/export').then((excel) => {
    excel.export_json_to_excel(options)
  })
}
