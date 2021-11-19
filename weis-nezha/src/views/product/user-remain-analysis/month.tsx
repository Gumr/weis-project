import { defineComponent, reactive, inject, Ref } from 'vue'
import exportExcel, { Column } from '@/utils/export-excel'
import request, { http } from '@/utils/request'
import { ElMessage } from 'element-plus'
export default defineComponent({
  name: 'product_month-user-remain-stat',
  setup() {
    const table = reactive({
      list: []
    })
    const vloading = inject('vloading') as Ref<boolean>
    function downloadClick(row: any) {
      const cols: Column[] = [
        'uname:用户名',
        'phone:手机号',
        'market:注册端口',
        'firstTime:首单时间',
        'firstMonth:首单月份',
        // 'userNum:用户数',
        'totalNum:总单数',
        // 'capitaNum:人均单数',
        // 'indexType:指标',
        'rebuyThree:三日复购',
        'rebuySeven:七日复购',
        'rebuyFifteen:十五日复购',
        'rebuyThirty:三十日复购',
        'rebuySixty:六十日复购',
        'rebuyNinety:九十日复购',
        'rebuyHundredTwenty:一百二十日复购',
        'rebuyHundredFifty:一百五十日复购',
        'rebuyHundredEighty:一百八十日复购',
        'rebuyTwohundredTen:二百一十日复购',
        'rebuyTwohundredForty:二百四十日复购',
        'rebuyTwohundredSeventy:二百七十日复购',
        'rebuyThreehundred:三百日复购',
        'rebuyThreehundredThirty:三百三十日复购',
        'rebuyThreehundredSixty:三百三十日复购',
        'rebuyThreehundredNinety:三百三十日复购'

      ].map(str => {
        const [prop, label] = str.split(':')
        return {
          prop,
          // filename: `月用户复购统计-导出`,
          label
        }
      })
      cols.unshift({
        type: 'index',
        label: '序号'
      })

       const cols2: Column[] = [
        'soid:支付单编号',
        'orderId:订单编号',
        'shipOid:配送单编号',
        'market:下单来源端口',
        'uid:用户ID',
        'phone:用户手机号',
        'uname:用户名',
        'receivingAddress:收货地址',
        'consignee:收货人',
        'contactNumber:收货电话号码',
        'shipWithCold:热食或冷链',
        'distributionMode:配送或自取',
        'payWay:支付方式',
        'payTime:支付日期',
        'date:用餐日期',
        'mealTakingTime:预计配送时间',
        'receivingTime:实际配送时间',
        'orderStt:订单状态',
        'hpName:加热点名称',
        'skuInfo:菜品详情'
      ].map(str => {
        const [prop, label] = str.split(':') 
        return {
          prop,
          // filename: `月用户复购导出`,
          label
        }
      })
      cols2.unshift({
        type: 'index',
        label: '序号'
      })
    Promise.all([
      request('data.RePurchase/queryRePurchaseDetailsByMonth', { 
        firstMonth: row.firstTime
      }),
      request('data.RePurchase/queryRePurchaseOrderDetailsByMonth', {
        firstMonth: row.firstTime
      })
    ]).then(([res1, res2]) => {
      // console.log(res1, )
      const sheetArr=[
        { name: ['复购数'],columns:cols,data: res1.data.obj },
        { name: ['复购数详情'],columns:cols2,data: res2.data.obj }
      ]

      exportExcel({
        data: [],
        columns:cols,
        sheetArr
      })
    })
    }

    const columns = [
      {
        type: 'index',
        label: '序号'
      },
      {
        label: '首单时间',
        prop: 'firstTime'
      },
      {
        label: '用户数',
        prop: 'userNum'
      },
      {
        label: '操作',
        slots: {
          default: ({ row }: { row: any }) => {
            return row.totalNum
              ? (
                <span class="table-action-label" onClick={() => downloadClick(row)}>下载</span>
              )
              : null
          }
        }
      },
      {
        label: '统计期内总单数',
        prop: 'totalNum'
      },
      {
        label: '用户消费单数',
        prop: 'capitaNum'
      },
      {
        label: '指标',
        prop: 'indexType',
        formatter: (row: any) => ({
          '01': '消费订单数',
          '02': '订单比例',
          '03': '消费客户数',
          '04': '客户活跃数',
          '05': '户均消费单数'
        }[row.indexType as string])
      },
      {
        label: '3日内复购',
        prop: 'rebuyThree'
      },
      {
        label: '7日内复购',
        prop: 'rebuySeven'
      },
      {
        label: '30日内复购',
        prop: 'rebuyThirty'
      },
      {
        label: '60日内复购',
        prop: 'rebuySixty'
      },
      {
        label: '90日内复购',
        prop: 'rebuyNinety'
      },
      {
        label: '120日内复购',
        prop: 'rebuyHundredTwenty'
      },
      {
        label: '150日内复购',
        prop: 'rebuyHundredFifty'
      },
      {
        label: '180日内复购',
        prop: 'rebuyHundredEighty'
      },
      {
        label: '210日内复购',
        prop: 'rebuyTwohundredTen'
      },
      {
        label: '240日内复购',
        prop: 'rebuyTwohundredForty'
      },
      {
        label: '270日内复购',
        prop: 'rebuyTwohundredSeventy'
      },
      {
        label: '300日内复购',
        prop: 'rebuyThreehundred'
      },
      {
        label: '330日内复购',
        prop: 'rebuyThreehundredThirty'
      },
      {
        label: '360日内复购',
        prop: 'rebuyThreehundredSixty'
      },
      {
        label: '390日内复购',
        prop: 'rebuyThreehundredNinety'
      },

    ]

    function exportClick() {
      exportExcel({
        data: table.list,
        columns
      })
    }
    vloading.value = true
    http('data.RePurchase/queryRePurchaseByMonth', {})
      .thenwrap((err, data) => {
        if (!err) {
          table.list = data
        }
        vloading.value = false
      })
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <el-button type="primary" onClick={exportClick}>导出</el-button>
        </div>
        <el-table v-loading={vloading.value} data={table.list} max-height={window.innerHeight - 240} border stripe>
          {
            columns.map(col => <el-table-column {...col} key={col.prop} v-slots={col.slots}></el-table-column>)
          }
        </el-table>
      </div>
    )
  }
})