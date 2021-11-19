import { defineComponent, reactive } from 'vue'
import exportExcel from '@/utils/export-excel'
import request from '@/utils/request'
export default defineComponent({
  name: 'product_order-comments',
  setup() {
    const table = reactive({
      list: [],
      total: 0
    })
    const page = reactive({
      pageNo: 1,
      pageSize: 10
    })
    const queryValue = reactive({
      ctime: '',
      type: '',
      uphone: ''
    })
    const columns = [
      {
        type: 'index',
        label: '序号'
      },
      {
        label: '配送单ID',
        prop: 'shipOid'
      },
      {
        label: '餐单ID',
        prop: 'orderOid'
      },
      {
        label: '评价星级',
        prop: 'evaluate',
        slot: {
          default: ({ row }: {row:any}) => <el-rate model-value={Number(row.evaluate)} disabled/>
        }
      },
      {
        label: '评价内容',
        prop: 'econtent'
      },
      {
        label: '评价类型',
        prop: 'typeStr'
      },
      {
        label: '评价人昵称',
        prop: 'uname'
      },
      {
        label: '评价人手机',
        prop: 'uphone'
      },
      {
        label: '评价时间',
        prop: 'ctime'
      }
    ]

    function exportClick() {
      getList({
        pageNo: 1,
        pageSize: table.total
      }).then(data => {
        exportExcel({
          data,
          columns
        })
      })
    }

    function getList(pages = page) {
      return request('OrderEvaluate/getOrderEvaluate', {
        ...pages,
        ...queryValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            table.list = res.record
            table.total = res.totalRecordCount
          }
          return err ? [] : res.record
        })

    }
    const queryList = [
      {
        label: '评价时间',
        component: 'el-date-picker',
        key: 'ctime',
        placeholder: '请选择评价时间',
        props: {
          clearable: true
        }
      },
      {
        label: '手机号',
        component: 'NumberInput',
        key: 'uphone',
        placeholder: '请输入手机号',
        props: {
          clearable: true
        }
      },
      {
        label: '评价类型',
        component: 'BaseSelect',
        key: 'type',
        placeholder: '请选择评价类型',
        props: {
          options: [
            {
              label: '菜品评价',
              value: '00'
            },
            {
              label: '配送评价',
              value: '01'
            }
          ],
          clearable: true
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
    getList()
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryList} span={5} action={false}/>
        </div>
        <BasePageTable v-models={[
          [page.pageNo, 'current-page'],
          [page.pageSize, 'page-size']
        ]} data={table.list} total={table.total} max-height={window.innerHeight - 240} onPageChange={() => getList()} border stripe>
          {
            columns.map(col => <el-table-column {...col} key={col.prop} v-slots={col.slot}></el-table-column>)
          }
        </BasePageTable>
      </div>
    )
  }
})