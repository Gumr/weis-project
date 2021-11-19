
import {
  defineComponent, reactive, inject
} from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/utils/request'
import exportExcel from '@/utils/export-excel'
export default defineComponent({
  name: 'sales_role-management_detail',
  setup() {
    const route = useRoute()
    const { id } = route.query
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号'
      },
      {
        label: '人员名称',
        prop: 'tseName'
      },
      {
        label: '手机号',
        prop: 'tsePhone'
      },
      {
        label: '部门名称',
        prop: 'tseDepartmentName'
      },
      {
        label: '加入时间',
        prop: 'tseCtime'
      }
    ]
    const data = reactive({
      list: [],
      total: 0
    })
    const queryProps = {
      modelValue: reactive({
        tseName: '',
        tsePhone: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '人员名称',
          key: 'tseName',
          placeholder: '人员名称',
          props: {
            clearable: true
          }
        },
        {
          component: 'NumberInput',
          label: '手机号',
          key: 'tsePhone',
          placeholder: '输入手机号',
          props: {
            clearable: true
          }
        }
      ]
    }
    function getList(pages = page) {
      return http('sale.SaleRole/querySaleRoleEmployeePage', {
        tsrId: id,
        ...pages,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record
            data.total = res.dataPage.totalRecordCount
          }
          return !err ? res.dataPage.record : []
        })
    }

    function exportClick() {
      getList({
        pageNo: 1,
        pageSize: data.total
      }).then(data => {
        exportExcel({
          data,
          columns: tableColumns
        })
      })
    }

    queryProps.slots = {
      action: () => (
        <>
          <el-button type="primary" onClick={getList}>搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>

      )
    }

    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents semi queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={queryProps.slots} ></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-model={[page.pageNo, 'current-page']}
          v-model={[page.pageSize, 'page-size']}
          data={data.list}
          total={data.total}
          onCurrentPageChange={() => getList()}
          onSizeChange={() => getList()}
        >
          {
            tableColumns.map((col, index) => <el-table-column {...col} key={index}></el-table-column>)
          }
        </BasePageTable>
      </div>
    )
  }
})
