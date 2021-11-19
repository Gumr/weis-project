import { saveAs } from 'file-saver'
import XLSX from '@/utils/xlsx'

function datenum(v, date1904) {
  if (date1904) v += 1462
  const epoch = Date.parse(v)
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}
// eslint-disable-next-line
function sheet_from_array_of_arrays(data, opts) {
  const ws = {}
  const range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  }
  for (let R = 0; R != data.length; ++R) {
    for (let C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R
      if (range.s.c > C) range.s.c = C
      if (range.e.r < R) range.e.r = R
      if (range.e.c < C) range.e.c = C
      const cell = {
        v: data[R][C]
      }
      if (cell.v == null) continue
      const cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R
      })

      if (typeof cell.v === 'number') cell.t = 'n'
      else if (typeof cell.v === 'boolean') cell.t = 'b'
      else if (cell.v instanceof Date) {
        cell.t = 'n'
        cell.z = XLSX.SSF._table[14]
        cell.v = datenum(cell.v)
      } else cell.t = 's'

      ws[cell_ref] = cell
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range)
  return ws
}

function Workbook() {
  // if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = []
  this.Sheets = {}
}

function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

export function export_json_to_excel({
  multiHeader = [],
  header,
  data,
  filename,
  sheetName,
  sheetArr,
  merges = [],
  autoWidth = true,
  bookType = 'xlsx'
} = {}) {
  /* original data */
  filename = filename || 'excel-list'
  data = [...data]

  if (header) data.unshift(header)

  for (let i = multiHeader.length - 1; i > -1; i -= 1) {
    data.unshift(multiHeader[i])
  }
  const ws_name = sheetName || 'sheet'
  const ws_sheet = sheetArr || []
  const wb = new Workbook()
  const ws = sheet_from_array_of_arrays(data)

  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = []
    merges.forEach((item) => {
      ws['!merges'].push(XLSX.utils.decode_range(item))
    })
  }

  if (autoWidth) {
    /* 设置worksheet每列的最大宽度 */
    const colWidth = data.map(row => row.map((val) => {
      /* 先判断是否为null/undefined */
      if (val == null) {
        return {
          wch: 10
        }
      } if (val.toString().charCodeAt(0) > 255) {
        /* 再判断是否为中文 */
        return {
          wch: val.toString().length * 2
        }
      }
      return {
        wch: val.toString().length
      }
    }))
    /* 以第一行为初始值 */
    const result = colWidth[0]
    for (let l = 1; l < colWidth.length; l += 1) {
      for (let j = 0; j < colWidth[l].length; j += 1) {
        try {
          if (result[j].wch < colWidth[l][j].wch) {
            result[j].wch = colWidth[l][j].wch
          }
        } catch {
          // do nothing
        }
      }
    }
    ws['!cols'] = result
  }

  /* add worksheet to workbook */
  // 特殊处理，备货录入的导入

  if (ws_sheet.length) {
    // debugger
    for (const sheet of ws_sheet) {
      if (typeof sheet === 'string') {
        wb.SheetNames.push(sheet)
        wb.Sheets[sheet] = ws
      } else {
        // debugger
        wb.SheetNames.push(sheet.name)
        wb.Sheets[sheet.name] = sheet_from_array_of_arrays([sheet.header, ...sheet.data])
      }
    }
  } else {
    wb.SheetNames.push(ws_name)
    wb.Sheets[ws_name] = ws
  }
  const wbout = XLSX.write(wb, {
    bookType,
    bookSST: false,
    type: 'binary'
  })

  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream'
    }),
    `${filename}.${bookType}`
  )
}
