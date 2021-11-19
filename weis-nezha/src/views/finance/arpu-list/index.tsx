import { defineComponent, reactive } from 'vue'
import exportExcel from '@/utils/export-excel'
import request from '@/utils/request'
export default defineComponent({
  name: 'finance_arpu-list',
  setup() {
    const table = reactive({
      list: []
    })

    const columns = [
      {
        type: 'index',
        label: '序号'
      },
      {
        label: '订单数量',
        prop: 'orderNumTypeName'
      },
      {
        label: '消费菜品总金额(RMB)',
        prop: 'orderPrice'
      },
      {
        label: '消费订单数',
        prop: 'orderNum'
      },
      {
        label: '消费ID数量',
        prop: 'orderUserNum'
      },
      {
        label: 'ARPU菜品',
        prop: 'avgPrice'
      },
      {
        label: '收客户运费',
        prop: 'freightPrice'
      },
      {
        label: 'ARPU-(菜品+运费)',
        prop: 'avgFreightPrice'
      }
    ]

    function exportClick() {
      exportExcel({
        data: table.list,
        columns
      })
    }

    request('data.OrderStats/queryOrderStats', {})
      .thenwrap((err, data) => {
        if (!err) {
          table.list = data
        }
      })
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <el-button type="primary" onClick={exportClick}>导出</el-button>
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