import dayjs from 'dayjs'
import {
  getLodop
} from './LodopFuncs.js'
import store from '@/store/index'
// import { categoryMap } from '@/utils/data-map'
class LodopPrinter {
  constructor() {
    this.top = 0
    this.lodop = getLodop()
    this.lodop.PRINT_INIT('')
    this.lodop.SET_PRINT_PAGESIZE(0, 0, 0, "")
  }
  text(label, position = {}, style = {}) {

    const $position = Object.assign({
      top: 0,
      left: 0,
      width: 60,
      height: 34,
      type: 0,
    }, position)

    const $style = Object.assign({
      FontSize: 10
    }, style)
    this.top += $position.top
    this.lodop.ADD_PRINT_TEXT(`${this.top}mm`, `${$position.left}mm`, `${$position.width}mm`, `${$position.height}mm`, label)
    if ($position.type == '32' || $position.type == '34') {
      this.lodop.ADD_PRINT_LINE(`${this.top + 2}mm`, 0, `${this.top + 2}mm`, '30mm', 0, 1)
    }
    const styleKeys = Object.keys($style)
    for (const key of styleKeys) {
      // fix todo: 打印在设置了bold但是未设置FontName的时候有一定几率出现打印空白
      if (key === 'Bold' && !styleKeys.includes('FontName')) continue
      this.lodop.SET_PRINT_STYLEA(0, key, $style[key])
    }
  }
  image(type, position = {}, ) { //生成客服图片
    const $position = Object.assign({
      top: 0,
      left: 0,
    }, position)

    if (type == 'smartFood') {
      this.lodop.ADD_PRINT_BARCODE(`${this.top + 10}mm`, `${$position.left}mm`, `40mm`, `40mm`, 'QRCode', 'https://work.weixin.qq.com/ct/wcde67d92a24cadbad2bee749643f405740b');
    } else {
      this.lodop.ADD_PRINT_BARCODE(`${this.top + 6}mm`, `${$position.left}mm`, `40mm`, `40mm`, 'QRCode', 'https://work.weixin.qq.com/ct/wcde2a1174b4a821cff16bb1dd98a6b7ed83');
    }
  }
  /**sku统一处理 */
  skuList(skus, config = {}) {
    let total = 0
    skus = Array.isArray(skus) ? skus : []
    skus.sort((a, b) => a.isTableware - b.isTableware)
    skus.forEach(sku => {
      if (sku.isTableware == '00') {
        this.text(sku.skuName, {
          top: 5,
          width: 48
        })
        if (config.type == '02') this.lodop.ADD_PRINT_LINE(`${this.top + 2}mm`, 0, `${this.top + 2}mm`, '30mm', 0, 1)
        this.text(`${sku.quality} * ${sku.amount}`, {
          top: 4,
          width: 40
        }, {
          FontSize: 11
        })
        if (config.showAmount) {
          this.text(sku.price, {
            left: 38,
            width: 30
          })
        }
        total += Number(sku.amount)
      } else {
        this.text(`${sku.skuName} * ${sku.amount}`, {
          top: 4,
          width: 48
        })
        if (config.showAmount) {
          this.text(sku.price, {
            left: 38,
            width: 30
          })
        }
        if (config.type == '02') this.lodop.ADD_PRINT_LINE(`${this.top + 2}mm`, 0, `${this.top + 2}mm`, '30mm', 0, 1)
      }
    })

    return {
      total
    }
  }
  /**分拣联货道sku */
  shopskuList(skus, config = {}) {
    skus = Array.isArray(skus) ? skus : []
    for (let index = 0; index < skus.length; index++) {
      this.text(skus[index].skuname, {
        top: Math.floor((index > 0 ? skus[index - 1].aisleCode.length + 10 : 5) / 12 * 5) + 2,
        width: 48
      })
      if (config.type == '02') this.lodop.ADD_PRINT_LINE(`${this.top + 2}mm`, 0, `${this.top + 2}mm`, '30mm', 0, 1)
      this.text(`${skus[index].speci} `, {
        top: 4,
        width: 40
      }, {
        FontSize: 11
      })

      this.text(skus[index].aisleCode, {
        top: 5,
        width: 48
      }, {
        // FontSize: 16,
        // Bold: 1
      })

    }

  }
  /**打印 */
  print(type) {
    if (process.env.NODE_ENV === 'production') {
      switch (type) {
        case 'meituan':
          this.lodop.SET_PRINTER_INDEX('GP-5830 Series'); // 指定打印机打印
          this.lodop.PRINT()
          break
        default:
          let isprint = this.lodop.SET_PRINTER_INDEX('GP-58MB Series');
          let isprint2 = this.lodop.SET_PRINTER_INDEX('GP-5830 Series');
          /**小程序打印 两个都没有使用默认打印机 */
          if (isprint) {
            this.lodop.SET_PRINTER_INDEX('GP-58MB Series');
          } else if (isprint2) {
            this.lodop.SET_PRINTER_INDEX('GP-5830 Series');
          }
          this.lodop.PRINT()
          break
      }
      return
    }
    this.lodop.PRINT()
    // this.lodop.PREVIEW()
  }


}
/**拼单sku统一处理 */
function printSkuList(skus, {
  showAmount,
  LODOP,
  height,
  type
}) {
  const initHeight = height
  let total = 0
  skus.sort((a, b) => a.isTableware - b.isTableware)
  skus.forEach((sku) => {
    if (sku.isTableware == '00') {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', `${sku.skuName}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      if (type == '02') LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
      height += 4
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '40mm', '34mm', `${sku.quality} * ${sku.amount}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      if (showAmount) {
        LODOP.ADD_PRINT_TEXT(`${height}mm`, '38mm', '30mm', '34mm', sku.price)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      }
      total += Number(sku.amount)
    } else {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', `（${sku.skuName}） * ${sku.amount}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      if (showAmount) {
        LODOP.ADD_PRINT_TEXT(`${height}mm`, '38mm', '30mm', '34mm', sku.price)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      }
      if (type == '02') LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
    }
  })

  return {
    total,
    height: height - initHeight // 求差值
  }
}

function encodePhone(phone) {
  return phone
  // return `${phone.slice(0, 3)}****${phone.slice(7)}`
}
/**自取小票模板 */
function CreateOneFormPage(dish, type) {

  const LODOP = getLodop()
  LODOP.PRINT_INIT('')
  LODOP.SET_PRINT_PAGESIZE(0, 0, 0, '')
  if (dish.orderSource != 'SmartFood+') {
    LODOP.ADD_PRINT_TEXT('0mm', '0mm', '60mm', '34mm', `（${dish.orderSource}）`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  }

  let height = 8
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '12mm', '60mm', '34mm', 'weis')
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 30)
  LODOP.SET_PRINT_STYLEA(0, 'FontName', '微软雅黑')
  LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

  height += 12
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '5mm', '60mm', '34mm', '**合理膳食 健康基石**')
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  height += 5
  const model = type == '02' ? '取消' : (type == '03' ? '变更' : dish.takeFoodModelStr)
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `${model}:${dish.takeFoodCode}(${dish.withColdStr})`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
  LODOP.SET_PRINT_STYLEA(0, 'FontName', '微软雅黑')
  LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

  height += 10
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `${dish.takeFoodModelStr}日期：${dayjs(dish.deliveredDate).format('YYYY/MM/DD')}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  if (type == '03') {
    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `原配送时间：${dish.oldDeliveredTime}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
  }

  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '20mm', '34mm', `${dish.takeFoodModelStr}时间：`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  LODOP.ADD_PRINT_TEXT(`${height}mm`, '17mm', '60mm', '34mm', `${dish.deliveredTime}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
  // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '配送单号')
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', dish.deliveredNum)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '***************************')
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  let tdodNum = 0
  if (dish.orderInfo) {
    dish.orderInfo.sort((a, b) => a.isTableware - b.isTableware)

    const breakfast = dish.orderInfo.filter(item => item.categoryStr == '早餐')
    const lunch = dish.orderInfo.filter(item => item.categoryStr == '午餐')
    const dinner = dish.orderInfo.filter(item => item.categoryStr == '晚餐')
    const extra = dish.orderInfo.filter(item => item.categoryStr == '加餐')
    const empty = dish.orderInfo.filter(item => item.categoryStr == '')
    if (breakfast.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', '早餐')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
    }
    const breakfastPrint = printSkuList(breakfast, {
      showAmount: dish.showAmountFlag,
      height,
      LODOP,
      type
    })

    height += breakfastPrint.height
    tdodNum += breakfastPrint.total

    if (breakfast.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    }

    if (lunch.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', '午餐')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
    }
    const lunchPrint = printSkuList(lunch, {
      showAmount: dish.showAmountFlag,
      height,
      LODOP,
      type
    })

    height += lunchPrint.height
    tdodNum += lunchPrint.total

    if (lunch.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    }

    if (dinner.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', '晚餐')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
    }
    const dinnerPrint = printSkuList(dinner, {
      showAmount: dish.showAmountFlag,
      height,
      LODOP,
      type
    })

    height += dinnerPrint.height
    tdodNum += dinnerPrint.total

    if (dinner.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    }

    if (extra.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', '加餐')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);
    }

    const extraPrint = printSkuList(extra, {
      showAmount: dish.showAmountFlag,
      height,
      LODOP,
      type
    })

    height += extraPrint.height
    tdodNum += extraPrint.total

    if (extra.length) {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    }

    if (empty.length) {
      const emptyPrint = printSkuList(empty, {
        showAmount: dish.showAmountFlag,
        height,
        LODOP,
        type
      })

      height += emptyPrint.height
      tdodNum += emptyPrint.total

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    }

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `合计：${tdodNum}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `制作日期：${dayjs().format('YYYY/MM/DD HH:mm')}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    if (dish.showAmountFlag) {
      height += 3
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '***************************')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `订单金额：${dish.orderPrice}元`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `折扣：${dish.discountPrice}元`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `优惠券：${dish.discountCoupon}元`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `配送费：${dish.deliveredPrice}元`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `实际支付：${dish.actualPrice}元`)

      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    }

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '***************************')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  }

  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `收货人：${dish.consignee}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm',
    `联系电话：${encodePhone(dish.consigneePhone)}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  height += 5
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '50mm', '34mm', `收货地址：${dish.receiveAddress}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

  height += 20
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '有任何问题请及时联系我们呦')
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
  height += 5
  LODOP.ADD_PRINT_BARCODE(`${height}mm`, `10mm`, `40mm`, `40mm`, 'QRCode', 'https://work.weixin.qq.com/ct/wcde67d92a24cadbad2bee749643f405740b');
  height += 30
  LODOP.ADD_PRINT_TEXT(`${height}mm`, '10mm', '60mm', '34mm',
    `TEL：${dish.shopPhone}`)
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  // height += 6
  // LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '48mm', '34mm', '为保证新鲜，请答应我，再忙也要尽快食用哦')
  // LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
  // LODOP.SET_PRINT_STYLEA(0, 'FontName', '微软雅黑')
  // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
  if (dish.sortingInfo && type != '02') {
    height += 30
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '-------------------------------')

    height += 20
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '12mm', '60mm', '34mm', '分拣单')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'FontName', '微软雅黑')
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
    height += 8
    const model = type == '02' ? '取消' : (type == '03' ? '变更' : dish.takeFoodModelStr)
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `${model}:${dish.takeFoodCode}(${dish.withColdStr})`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
    LODOP.SET_PRINT_STYLEA(0, 'FontName', '微软雅黑')
    LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

    height += 10
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `${dish.takeFoodModelStr}日期：${dayjs(dish.deliveredDate).format('YYYY/MM/DD')}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    if (type == '03') {
      height += 5
      LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `原配送时间：${dish.oldDeliveredTime}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
    }

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '20mm', '34mm', `${dish.takeFoodModelStr}时间：`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    LODOP.ADD_PRINT_TEXT(`${height}mm`, '17mm', '60mm', '34mm', `${dish.deliveredTime}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
    // LODOP.SET_PRINT_STYLEA(0, 'Bold', 1);

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '配送单号')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', dish.deliveredNum)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '***************************')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    for (const order of dish.sortingInfo) {
      order.sortingData.forEach(sku => {
        height += 8
        LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', `${sku.skuname} `)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        height += 5
        LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', sku.speci)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

        height += 5
        LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '45mm', '34mm', sku.aisleCode)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
        if (type == '02') LODOP.ADD_PRINT_LINE(`${height + 2}mm`, 0, `${height + 2}mm`, '30mm', 0, 1)
      })

    }
    height += 10
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '***************************')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', `收货人：${dish.consignee}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm',
      `联系电话：${encodePhone(dish.consigneePhone)}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    height += 5
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '50mm', '34mm', `收货地址：${dish.receiveAddress}`)
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)

    height += dish.receiveAddress.length
    LODOP.ADD_PRINT_TEXT(`${height}mm`, '0mm', '60mm', '34mm', '---------------------------')
    LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
    height += 8
    if (dish.sortingQrCode) {
      LODOP.ADD_PRINT_BARCODE(`${height }mm`, `4mm`, `238mm`, `44mm`, 'QRCode', dish.sortingQrCode);
    }
    // }

  }
  // LODOP.PREVIEW()


  // if (store.getters.printMode === 'preview') {
  //   LODOP.PREVIEW()
  // } else {
  LODOP.PRINT()
  // }
}

/**配送模板 */
function printOrder(dish, type) {
  const printer = new LodopPrinter()
  if (dish.orderSource && dish.orderSource != 'SmartFood+') {
    printer.text(`（${dish.orderSource}）`, {
      top: 0,
      width: 60
    })
  }
  printer.text('weis', {
    top: 8,
    left: 12,
    width: 60
  }, {
    FontSize: 30,
    FontName: '微软雅黑',
    Bold: 1
  })

  printer.text('**合理膳食 健康基石**', {
    top: 12,
    left: 5,
    width: 60
  })

  const model = type == '02' ? '取消' : dish.distributionModeStr
  printer.text(`${model}:${dish.takeMealCode}(${dish.shipWithColdStr})`, {
    top: 5,
    width: 60
  }, {
    FontSize: 20,
    FontName: '微软雅黑',
    Bold: 1
  })

  printer.text(`${dish.distributionModeStr}日期：${dayjs(dish.shipDate).format('YYYY/MM/DD')}`, {
    top: 10,
    width: 60
  })

  printer.text(`${dish.distributionModeStr}时间：`, {
    top: 5,
    width: 20
  })

  printer.text(`${dish.shipTime}`, {
    top: 0,
    width: 60,
    left: 17
  }, {
    FontSize: 11
  })

  printer.text('配送单号', {
    top: 5
  })

  printer.text(dish.shipOid, {
    top: 5
  })

  printer.text('***************************', {
    top: 5
  })
  const orderInfo = dish.orderInfo.sort((a, b) => a.category - b.category)

  for (const order of orderInfo) {
    printer.text(order.categoryStr, {
      top: 7,
      width: 45
    })

    printer.skuList(order.skuInfo, {
      type,
      showAmount: dish.showAmountFlag
    })

    printer.text('---------------------------', {
      top: 5
    })
  }

  printer.text(`合计：${dish.skuTotal}`, {
    top: 5,
    width: 60
  })

  printer.text(`制作日期：${dayjs().format('YYYY/MM/DD HH:mm')}`, {
    top: 5,
    width: 60
  })
  if (dish.showAmountFlag) {
    printer.text(`订单金额：${dish.orderPrice}元`, {
      top: 5,
      width: 60
    })

    printer.text(`折扣：${dish.discountPrice}元`, {
      top: 5,
      width: 60
    })

    printer.text(`优惠券：${dish.couponPrice}元`, {
      top: 5,
      width: 60
    })

    printer.text(`配送费：${dish.freighPrice}元`, {
      top: 5,
      width: 60
    })

    printer.text(`实际支付：${dish.actualPrice}元`, {
      top: 5,
      width: 60
    })
  }

  printer.text('***************************', {
    top: 5,
    width: 60
  })

  printer.text(`收货人：${dish.takeUname || ''}`, {
    top: 5,
    width: 60
  })

  printer.text(`联系电话：${encodePhone(dish.takeUphone)}`, {
    top: 5,
    width: 60
  })

  printer.text(`收货地址：${dish.receivingAddress}`, {
    top: 5,
    width: 50
  })

  printer.text('有任何问题请及时联系我们呦', {
    top: Math.floor((dish.receivingAddress.length + 8) / 12 * 5) + 2,
    width: 48,
    // left: 2
  }, {
    FontName: '微软雅黑',
    Bold: 1
  })
  printer.image('smartFood', {
    top: 5,
    left: 10,
  })

  printer.text(`TEL:${dish.shopPhone}`, {
    top: 40,
    left: 12
  }, {
    Bold: 1
  })

  printer.text('----------------------------', {
    top: 40,
    width: 60
  })

  if (dish.sortingInfo && type != '02') {
    printer.text(`分拣联`, {
      top: 12,
      left: 12,
      width: 60
    }, {
      FontSize: 20,
      FontName: '微软雅黑',
      Bold: 1
    })
    const model2 = type == '02' ? '取消' : dish.distributionModeStr
    printer.text(`${model2}:${dish.takeMealCode}(${dish.shipWithColdStr})`, {
      top: 14,
      width: 60
    }, {
      FontSize: 20,
      FontName: '微软雅黑',
      Bold: 1
    })
    printer.text(`${dish.distributionModeStr}日期：${dayjs(dish.shipDate).format('YYYY/MM/DD')}`, {
      top: 10,
      width: 60
    })

    printer.text(`${dish.distributionModeStr}时间：`, {
      top: 5,
      width: 20
    })

    printer.text(`${dish.shipTime}`, {
      top: 0,
      width: 60,
      left: 17
    }, {
      FontSize: 11
    })

    printer.text('配送单号', {
      top: 5
    })

    printer.text(dish.shipOid, {
      top: 5
    })

    printer.text('***************************', {
      top: 5
    })

    const orderInfo2 = dish.sortingInfo
    for (const order of orderInfo2) {
      printer.shopskuList(order.sortingInfo, {
        type,
        showAmount: dish.showAmountFlag
      })
    }
    printer.text('---------------------------', {
      top: orderInfo2[orderInfo2.length - 1].sortingInfo[orderInfo2[orderInfo2.length - 1].sortingInfo.length - 1].aisleCode.length + 8
    })
    printer.text(`合计：${dish.skuTotal}`, {
      top: 5,
      width: 60
    })
    printer.text(`收货人：${dish.takeUname || ''}`, {
      top: 5,
      width: 60
    })

    printer.text(`联系电话：${encodePhone(dish.takeUphone)}`, {
      top: 5,
      width: 60
    })

    printer.text(`收货地址：${dish.receivingAddress}`, {
      top: 5,
      width: 50
    })

  }


  printer.print(store.getters.printMode)
  // printer.print('preview')
}
/**拼单模板 */
function printSpellOrder(data) {

  const printer = new LodopPrinter()
  const orderInfoLength = data.orderInfo.length
  data.orderInfo.forEach((order, index) => {
    printer.text('weis', {
      top: 7,
      left: 12,
      width: 60
    }, {
      FontSize: 30,
      FontName: '微软雅黑',
      Bold: 1
    })

    printer.text('**合理膳食 健康基石**', {
      top: 14,
      left: 5,
      width: 60
    })

    printer.text(`${data.distributionModeStr}:${data.takeMealCode}(${data.shipWithColdStr})`, {
      top: 8,
      width: 60
    }, {
      FontSize: 20,
      FontName: '微软雅黑',
      Bold: 1
    })

    printer.text(`拼(${index + 1}/${orderInfoLength})`, {
      top: 8,
      left: 14,
      width: 60
    }, {
      FontSize: 16,
      FontName: '微软雅黑',
      Bold: 1
    })

    printer.text(`${data.distributionModeStr}日期：${dayjs(data.shipDate).format('YYYY/MM/DD')}`, {
      top: 10,
      width: 60
    })

    printer.text(`${data.distributionModeStr}时间：`, {
      top: 5
    })

    printer.text(`${data.shipTime}`, {
      left: 17,
      width: 60
    })

    printer.text('配送单号：', {
      top: 5
    })

    printer.text(data.shipOid, {
      top: 5
    })

    printer.text('***************************', {
      top: 6
    })

    printer.text(order.categoryStr, {
      top: 6
    })
    printer.skuList(order.skuInfo, {
      showAmount: data.showAmountFlag
    })

    printer.text('---------------------------', {
      top: 5
    })

    printer.text(`合计: ${order.skuTotal}`, {
      top: 5
    })
    printer.text(`订单金额: ${order.orderPrice}元`, {
      top: 5
    })
    printer.text(`折扣: ${order.discountPrice} 元`, {
      top: 5
    })
    printer.text(`优惠券: ${order.couponPrice} 元`, {
      top: 5
    })
    printer.text(`配送费: ${order.distributionPrice}元`, {
      top: 5
    })
    printer.text(`实际支付: ${order.actualPrice}元`, {
      top: 5
    })

    printer.text('***************************', {
      top: 5
    })

    printer.text(`用户:${order.uname}`, {
      top: 7,
      width: 60
    })

    printer.text(`用户手机号:${encodePhone(order.uphone)}`, {
      top: 5,
      width: 60
    })

    printer.text('订单编码:', {
      top: 5,
      width: 60
    })

    printer.text(order.orderId, {
      top: 5,
      width: 60
    })

    printer.text(`收货人：${data.takeUname || ''}`, {
      top: 5,
      width: 60
    })

    printer.text(`联系电话：${encodePhone(data.takeUphone)}`, {
      top: 5,
      width: 60
    })

    printer.text('收货地址：', {
      top: 5,
      width: 50
    })

    printer.text(data.receivingAddress, {
      top: 5,
      width: 50
    })

    printer.text('有任何问题请及时联系我们呦', {
      top: Math.floor((data.receivingAddress.length + 8) / 12 * 5) + 2,
      width: 48,
      // left: 2
    }, {
      FontName: '微软雅黑',
      Bold: 1
    })
    printer.image('smartFood', {
      top: 5,
      left: 10,
    })

    printer.text(`TEL:${data.shopPhone}`, {
      top: 40,
      left: 12
    }, {
      Bold: 1
    })

    // printer.text('为保证新鲜，请答应我，再忙也要尽快食用哦', {
    //   top: 14,
    //   width: 48
    // }, {
    //   FontName: '微软雅黑',
    //   Bold: 1
    // })

    printer.text('---------------------------', {
      top: 20
    }, {
      Bold: 1.6
    })
  })



  if (data.sortingInfo) {
    printer.text('----------------------------', {
      top: 40,
      width: 60
    })

    printer.text(`分拣联`, {
      top: 8,
      left: 12,
      width: 60
    }, {
      FontSize: 20,
      FontName: '微软雅黑',
      Bold: 1
    })
    data.sortingInfo.forEach((order, index) => {
      printer.text(`${data.distributionModeStr}:${data.takeMealCode}(${data.shipWithColdStr})`, {
        top: 8,
        width: 60
      }, {
        FontSize: 20,
        FontName: '微软雅黑',
        Bold: 1
      })

      printer.text(`拼(${index + 1}/${orderInfoLength})`, {
        top: 8,
        left: 14,
        width: 60
      }, {
        FontSize: 16,
        FontName: '微软雅黑',
        Bold: 1
      })
      printer.text(`${data.distributionModeStr}日期：${dayjs(data.shipDate).format('YYYY/MM/DD')}`, {
        top: 10,
        width: 60
      })

      printer.text(`${data.distributionModeStr}时间：`, {
        top: 5
      })

      printer.text(`${data.shipTime}`, {
        left: 17,
        width: 60
      })

      printer.text('配送单号：', {
        top: 5
      })

      printer.text(data.shipOid, {
        top: 5
      })

      printer.text('***************************', {
        top: 6
      })
      printer.shopskuList(order.sortingInfo)

      printer.text('---------------------------', {
        top: 40
      })
      printer.text(`合计: ${order.skuTotal}`, {
        top: 5
      })

      printer.text(`用户:${order.uname}`, {
        top: 7,
        width: 60
      })

      printer.text(`用户手机号:${encodePhone(order.uphone)}`, {
        top: 5,
        width: 60
      })

      printer.text('订单编码:', {
        top: 5,
        width: 60
      })

      printer.text(order.orderId, {
        top: 5,
        width: 60
      })

      printer.text(`收货人：${data.takeUname || ''}`, {
        top: 5,
        width: 60
      })

      printer.text(`联系电话：${encodePhone(data.takeUphone)}`, {
        top: 5,
        width: 60
      })

      printer.text('收货地址：', {
        top: 5,
        width: 50
      })
      printer.text(data.receivingAddress, {
        top: 5,
        width: 50
      })

      printer.text('---------------------------', {
        top: 11
      }, {
        Bold: 1.6
      })



    })
  }

  // printer.print('preview')
  // console.log(store, 'store')
  printer.print(store.getters.printMode)


}
/**美团小票模板 */
function printMeiTuanOrder(dish, type) {

  const printer = new LodopPrinter()


  const model = type == '32' ? '取消单' : '配送单'



  printer.text(`${model}`, {

    width: 34,

    top: 0,

  }, {

    FontSize: 10,

    FontName: '微软雅黑',

    Bold: 1

  })



  printer.text(`*${dish.tmoWmPoiName}*`, {

    top: 15,

    left: 5,

    width: 45

  }, {

    FontSize: 10,

  })



  printer.text(`美团#${dish.tmoDaySeq}`, {

    left: 5,
    top: 8,

    // width: 40

  }, {

    FontSize: 18,

    FontName: '微软雅黑',

    Bold: 1

  })
  if (dish.tmoDeliveryTime > 0) {
    printer.text(`预订单`, {
      top: 10,
      width: 60
    }, {
      FontSize: 14,
    })

  }





  printer.text(`期望送达时间:`, {

    top: 10,

    width: 60

  }, {

    FontSize: 8,

  })

  printer.text(`${dish.tmoDeliveryTime== 0?'立即送餐': dayjs.unix(dish.tmoDeliveryTime).format('YYYY/MM/DD HH:mm:ss')}`, {

    top: 4,

    width: 60,
    // left: 17

  }, {
    FontSize: 14,
  })



  printer.text(`下单时间:${dayjs(dish.tmoCtime).format('YYYY/MM/DD HH:mm')}`, {

    top: 6,

    width: 60

  }, {

    FontSize: 8,

  })



  printer.text(`订单编号:${dish.tmoOrderId}`, {

    top: 4

  }, {

    FontSize: 8,

  })



  printer.text(`备注:(${dish.tmoCaution})`, {

    top: 5,

    width: 48

  }, {

    FontName: '微软雅黑',

    Bold: 1

  })





  printer.text('***************************', {

    top: Math.floor((dish.tmoCaution.length + 4) / 12 * 5) + 2

  })

  const orderInfo = JSON.parse(dish.tmoDetail)

  const tmoExtras = dish.tmoExtras ? JSON.parse(dish.tmoExtras) : []

  let boxPrice = 0



  for (var order = 0; order < orderInfo.length; order++) {

    boxPrice += orderInfo[order].box_price * orderInfo[order].box_num

    let baselength = orderInfo[order > 0 ? order - 1 : 0].food_name + (orderInfo[order > 0 ? order - 1 : 0].app_food_code == '01090008' ? `(${orderInfo[order>0?order-1:0].food_property})` : '')

    let orderName = orderInfo[order].food_name + (orderInfo[order].app_food_code == '01090008' ? `(${orderInfo[order].food_property})` : '')



    if (orderInfo[order].cart_id != orderInfo[order > 0 ? order - 1 : 0].cart_id || order == 0) {

      printer.text(`----------${orderInfo[order].cart_id+1}号口袋-----------`, {

        top: order == 0 ? 5 : 18,

      })

    }



    let top = 5
    if (order == 0) {

      top = 5

    } else if (baselength.length < 7) {

      top = 8

    } else if (baselength.length > 7) {

      top = baselength.length + 4

    }

    if (orderInfo[order > 0 ? order - 1 : 0].detail_extra.cate == '套餐') {
      top = 7
    }



    printer.text(orderName, {

      top: top,

      width: orderInfo[order].box_num >= 2 ? 24 : 32,

      type: type,

    }, {

      FontSize: 11,

      FontName: '宋体',

      Bold: 1

    })

    printer.text(`${orderInfo[order].box_num>=2 ?'[*'+orderInfo[order].quantity+']':'*'+orderInfo[order].quantity}  ${(orderInfo[order].price*orderInfo[order].box_num).toFixed(2)}`, {

      left: orderInfo[order].box_num >= 2 ? 20 : 28,

      // width: 50,

    }, {

      FontSize: 11,

      FontName: '宋体',

      Bold: orderInfo[order].box_num >= 2 ? 1 : 0



    })
   
    //套餐内的单品
    const packageDetail = orderInfo[order].weisPackageDetail
    const paclen = orderName.length
    const basebold = orderInfo[order].box_num >= 2?8:0
    if (packageDetail && packageDetail.length > 0) {
      for (let index = 0; index < packageDetail.length; index++) {
        printer.text(`${packageDetail[index].tfsSkuname} *${orderInfo[order].quantity *Number(packageDetail[index].tmfdSkuNum)}`, {
          top: index == 0 && paclen >= 21 ? paclen +basebold: index == 0 && paclen >= 17 ? paclen : index == 0 && paclen >= 15 ? paclen : 5,
        },{       
            FontSize: 8         
        })
      }
    }

  }

  printer.text('---------------------------', {

    top: orderInfo[orderInfo.length - 1].food_name.length > 10 ? orderInfo[orderInfo.length - 1].food_name.length + 6 : orderInfo[orderInfo.length - 1].food_name.length + 4

  })
  if (tmoExtras[0].remark && tmoExtras.length > 0) {

    for (var item = 0; item < tmoExtras.length; item++) {

      let baseLength = tmoExtras[item == 0 ? 0 : item - 1].remark.length

      if (tmoExtras[item].remark) {

        printer.text(`[${tmoExtras[item].remark}]`, {

          top: item == 0 ? 5 : Math.floor((baseLength > 20 & baseLength < 34 ? 18 : baseLength >= 34 ? 28 : 8) / 12 * 5),

          width: 54,

        }, {

          FontSize: 8,

        })



      }

    }

  }

  printer.text(`配送费：¥ ${dish.tmoShippingFee}`, {

    top: tmoExtras.length + 6,

    width: 60,

  }, {

    FontSize: 8,

  })

  printer.text(`餐盒费: ¥ ${boxPrice}`, {

    top: 5,

    width: 60,



  }, {

    FontSize: 8,

  })

  printer.text(`原价：¥ ${dish.tmoOriginalPrice}`, {

    top: 5,

    width: 60,

  }, {

    FontSize: 8,

  })



  printer.text(`实付：¥ ${dish.tmoTotal}`, {

    top: 5,

    width: 60,



  }, {

    FontSize: 8,

    FontName: '微软雅黑',

    Bold: 1

  })

  printer.text('***************************', {

    top: 7,

    width: 60

  })



  printer.text(`收货人：${dish.tmoRecipientName || ''}`, {

    top: 5,

    width: 60

  })



  printer.text(`联系电话：${encodePhone(dish.tmoRecipientPhone)}`, {

    top: 5,

    width: 60

  })

  printer.text(`备用隐私号: ${dish.tmoBackupRecipientPhone}`, {

    top: 5,

    width: 45

  })



  printer.text(`收货地址：${dish.tmoRecipientAddress}`, {

    top: Math.floor((dish.tmoBackupRecipientPhone.length + 6) / 12 * 5) + 2,

    width: 50

  }, {

    // FontSize: 11,

    // FontName: '宋体',

  })

  // printer.text('有任何问题请及时联系我们呦', {

  //   top: Math.floor((dish.tmoRecipientAddress.length + 20) / 12 * 5) + 2,

  //   width: 48,

  //   // left: 2

  // }, {

  //   FontName: '微软雅黑',

  //   Bold: 1

  // })

  // printer.image('meituan', {

  //   top: 8,

  //   left: 10,

  // })



  printer.text(`联系我们:${dish.tmoWmPoiPhone}`, {

    top: Math.floor((dish.tmoRecipientAddress.length + 20) / 12 * 5) + 2,

    // left: 12

  }, {})

  printer.text('---------------------------', {
    top: 20
  })



  printer.print('meituan')

}


function printEleOrder(dish, type) {
  // console.log('dish', dish);
  const printer = new LodopPrinter()
  const model = type == '34' ? '取消单' : '配送单'

  printer.text(`${model}`, {
    width: 34,
    top: 0,
  }, {
    FontSize: 10,
    FontName: '微软雅黑',
    Bold: 1
  })

  printer.text(`*${dish.telShopName}*`, {
    top: 20,
    left: 5,
    width: 45
  }, {
    FontSize: 10,
  })

  printer.text(`饿了么#${dish.telDaySn}`, {
    left: 10,
    top: 10,
    // width: 40
  }, {
    FontSize: 18,
    FontName: '微软雅黑',
    Bold: 1
  })
  if (dish.telDeliverTime > 0) {
    printer.text(`预订单`, {
      top: 10,
      width: 60
    }, {
      FontSize: 14,
    })

  }
  printer.text(`期望送达时间:`, {
    top: 10,
    width: 60
  }, {
    FontSize: 8,
  })
  printer.text(`${dish.telDeliverTime== 0 ? '立即送餐':dish.telDeliverTime}`, {
    top: 4,
    width: 60,
    // left: 17
  }, {
    FontSize: 14,

  })

  printer.text(`下单时间:${dayjs(dish.telCtime).format('YYYY/MM/DD HH:mm')}`, {
    top: 6,
    width: 60
  }, {
    FontSize: 8,
  })

  printer.text(`订单编号:${dish.telOrderId}`, {
    top: 4
  }, {
    FontSize: 8,
  })

  printer.text(`备注:(${dish.telDescription})`, {
    top: 5,
    width: 48
  }, {
    FontName: '微软雅黑',
    Bold: 1
  })


  printer.text('***************************', {
    top: Math.floor((dish.telDescription.length + 4) / 12 * 5) + 2
  })
  const orderInfo = JSON.parse(dish.telGroups)
  let concatPhones = JSON.parse(dish.telConsigneePhones)
  const orderActivities = JSON.parse(dish.telOrderActivities)
  let boxPrice = dish.telPackageFee // 餐盒费
  let originalPrice = dish.telOriginalPrice


  orderInfo.sort((a, b) => a.isTableware - b.isTableware)
  for (var order = 0; order < orderInfo.length; order++) {
    const item = orderInfo[order]

    const preItem = orderInfo[order > 0 ? order - 1 : 0]
    let basketLen = 0
    preItem.items.forEach(v => {
      basketLen += v.name.length
    })

    // 几号篮子
    // console.log('basketLen', basketLen);
    if (item.name != '1号篮子') {
      let top = 8
      if (preItem.items.length <= 1) {
        top = basketLen
      } else {
        top = order > 0 && basketLen >= 70 ? basketLen / 4 : order > 0 && basketLen >= 60 ? basketLen / 2.2 : order > 0 && basketLen >= 50 ?
          basketLen / 2.8 : order > 0 && basketLen >= 40 ? basketLen / 1.4 : order > 0 && basketLen >= 20 ? basketLen / 2.3 : 8
      }
      printer.text(`----------${item.name}-----------`, {
        // top: order > 0 && basketLen >= 50 ? basketLen / 3.5 : order > 0 && basketLen >= 20 ? basketLen / 2 : order > 0 && basketLen >= 10 ? basketLen / .9 : 10
        top: top
      })
    }
    // 篮子里的每一个菜品

    for (var i = 0; i < item.items.length; i++) {
      const goodInfo = item.items[i]
      const preGoodInfo = item.items[i > 0 ? i - 1 : 0]
      let baselength = preGoodInfo.name.length
      console.log(preGoodInfo.name, baselength);

      // debugger
      let sumtop = 0
      if (preGoodInfo.packageDetail && preGoodInfo.packageDetail.length > 0) {
        sumtop = 5

      } else {
        sumtop = i > 0 && baselength >= 25 ? baselength + 4 : i > 0 && baselength >= 15 ? baselength + 3 : i > 0 && baselength >= 7 ? baselength + 6 : 8
      }
      printer.text(`${goodInfo.name}`, {
        // left: 2,
        top: sumtop,
        width: goodInfo.quantity >= 2 ? 24 : 29.5,
        type: type,
      }, {
        FontSize: 11,
        FontName: '宋体',
        Bold: 1
      })

      printer.text(`${goodInfo.quantity >= 2 ?'[*'+goodInfo.quantity+']':'*' + goodInfo.quantity}  ${(goodInfo.price * goodInfo.quantity).toFixed(2)}`, {
        left: goodInfo.quantity >= 2 ? 20 : 28,
        // width: 50,
      }, {
        FontSize: 11,
        FontName: '宋体',
        Bold: goodInfo.quantity >= 2 ? 1 : 0

      })
      //套餐内的单品
    
      const packageDetail = goodInfo.weisPackageDetail
      const paclen = goodInfo.name.length
      let quantityLength = goodInfo.quantity>=2?8:0
      if (packageDetail && packageDetail.length > 0) {
        for (let index = 0; index < packageDetail.length; index++) {
          printer.text(`${packageDetail[index].tfsSkuname} *${goodInfo.quantity * Number(packageDetail[index].tmfdSkuNum) }`, {
            top: index == 0 && paclen >= 21 ? paclen+quantityLength : index == 0 && paclen >= 17 ? paclen : index == 0 && paclen >= 15 ? paclen + 2 : 5,
          },{
            FontSize: 8
          })
        }
      }
    }


    // boxPrice += orderInfo[order].box_price * orderInfo[order].box_num
    // if (orderInfo[order].cart_id != orderInfo[order > 0 ? order - 1 : 0].cart_id || order == 0) {
    //   printer.text(`----------${orderInfo[order].cart_id+1}号口袋-----------`, {
    //     top: 5,
    //   })
    // }



  }
  printer.text('---------------------------', {
    top: orderInfo[orderInfo.length - 1].name.length > 10 ? orderInfo[orderInfo.length - 1].name.length + 6 : orderInfo[orderInfo.length - 1].name.length + 4
  })

  if (orderActivities.length > 0) {
    // 活动优惠信息
    for (var item = 0; item < orderActivities.length; item++) {
      let baseLength = orderActivities[item == 0 ? 0 : item - 1].name.length
      if (orderActivities[item].name) {
        printer.text(`[${orderActivities[item].name} ${orderActivities[item].amount}元]`, {
          top: item == 0 ? 5 : Math.floor((baseLength > 20 & baseLength < 34 ? 20 : baseLength >= 34 ? 28 : 8) / 12 * 5),
          width: 54,
        }, {
          FontSize: 8,
        })

      }
    }
  }
  printer.text(`配送费：¥ ${dish.telDeliverFee}`, {
    top: orderActivities.length + 4,
    width: 60,
  }, {
    FontSize: 8,
  })
  printer.text(`餐盒费: ¥ ${boxPrice}`, {
    top: 5,
    width: 60,

  }, {
    FontSize: 8,
  })
  printer.text(`原价：¥ ${dish.telOriginalPrice}`, {
    top: 5,
    width: 60,
  }, {
    FontSize: 8,
  })

  printer.text(`实付：¥ ${dish.telTotalPrice}`, {
    top: 5,
    width: 60,

  }, {
    FontSize: 8,
    FontName: '微软雅黑',
    Bold: 1
  })
  printer.text('***************************', {
    top: 7,
    width: 60
  })

  printer.text(`收货人：${dish.telConsignee || ''}`, {
    top: 5,
    width: 60
  })

  printer.text(`联系电话：${encodePhone(concatPhones[0])}`, {
    top: 5,
    width: 60
  })
  printer.text(`备用隐私号: ${encodePhone(JSON.parse(dish.telPhoneList)[0])}`, {
    top: 5,
    width: 45
  })

  printer.text(`收货地址：${dish.telAddress}`, {
    top: Math.floor((dish.telConsigneePhones.length + 6) / 12 * 5) + 2,
    width: 50
  }, {
    // FontSize: 1,
    // FontName: '宋体',
  })
  // printer.text('有任何问题请及时联系我们呦', {
  //   top: Math.floor((dish.telAddress.length + 20) / 12 * 5) + 2,
  //   width: 48,
  //   // left: 2
  // }, {
  //   FontName: '微软雅黑',
  //   Bold: 1
  // })
  // printer.image('meituan', {
  //   top: 8,
  //   left: 10,
  // })

  // printer.text(`TEL:${dish.telConsignee}`, {
  //   top: 40,
  //   left: 12
  // }, {
  //   Bold: 1
  // })
  printer.text('---------------------------', {
    top: 20
  })

  printer.print('eleme')
}


export {
  printSpellOrder,
  printOrder,
  printMeiTuanOrder,
  printEleOrder
}
export default CreateOneFormPage