import { defineComponent, reactive } from 'vue'
import exportExcel from '@/utils/export-excel'
import request from '@/utils/request'
import dayjs from 'dayjs'
export default defineComponent({
  name: 'finance_arpu-list',
  setup() {
    const table = reactive({
      list: []
    })
    const queryValue = reactive({
      date: [new Date(), new Date()]
    })

    const columns = [
      {
        label: '日期',
        prop: 'orderTime'
      },
      {
        label: '下单用户数',
        prop: 'orderUserNum'
      },
      {
        label: '菜品收入 RMB 元',
        prop: 'orderPrice'
      },
      {
        label: '运费收入 RMB 元',
        prop: 'freightPrice'
      },
      {
        label: '收入合计 RMB 元',
        prop: 'totalOrderPrice'
      },
      {
        label: 'ARPU',
        prop: 'totalAvgPrice'
      }
    ]

    function exportClick() {
      exportExcel({
        data: table.list,
        columns
      })
    }

    function getList() {
      const params: Record<string, string> = {}
      const { date } = queryValue
      if (date.length) {
        params.startDate = dayjs(date[0]).format('YYYYMM')
        params.endDate = dayjs(date[1]).format('YYYYMM')
      }
      request('data.OrderStats/queryOrderStatsByMonth', params)
        .thenwrap((err, data) => {
          if (!err) {
            table.list = data
          }
        })
    }
    const queryList = [
      {
        label: '日期',
        component: 'el-date-picker',
        key: 'date',
        props: {
          type: 'monthrange',
          clearable: true,
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        }
      },
      {
        slot: () => (
          <>
            <el-button type="primary" onClick={getList}>搜索</el-button>
            <el-button onClick={exportClick}>导出</el-button>
          </>
        )
      }
    ]
    // getList()
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryList} action={false}/>
        </div>
        <el-table data={table.list} max-height={window.innerHeight - 240} border stripe>
          {
            columns.map(col => <el-table-column {...col} key={col.prop}></el-table-column>)
          }
        </el-table>
      </div>
    )
  }
})