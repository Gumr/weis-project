
import {
  defineComponent, reactive, inject, ref
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/request'

export default defineComponent({
  name: 'sales_role-management',
  setup() {
    let currentId
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const pushRoute = inject('pushRoute')

    const data = reactive({
      list: [],
      total: 0
    })
    const queryParams = reactive({
      tsrName: ''
    })
    const querys = [
      {
        component: 'el-input',
        label: '角色名称',
        key: 'tsrName',
        placeholder: '角色名称'
      },
      {
        slot: 'search'
      },
      {
        slot: 'create'
      }
    ]
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号'
      },
      {
        label: '角色名称',
        prop: 'tsrName'
      },
      {
        label: '类型',
        prop: 'tsrTypeDesc'
      },
      {
        label: '关联人数',
        prop: 'unionNum'
      },
      {
        label: '创建时间',
        prop: 'tsrCtime'
      }
    ]
    const roleDialog = reactive({
      visible: false,
      title: '添加角色'
    })
    const roleName = ref('')

    const getList = () => {
      http('sale.SaleRole/querySaleRolePage', {
        ...page,
        ...queryParams
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record
            data.total = res.dataPage.totalRecordCount
          }
        })
    }
    const updateRole = () => http('sale.SaleRole/updateSaleRole', {
      tsrId: currentId,
      tsrName: roleName.value
    })

    const handleDialogConfirm = () => {
      if (roleName.value.length <= 0) {
        ElMessage.error('请输入角色名称')
        return
      }
      updateRole()
        .thenwrap((err) => {
          if (!err) {
            getList()
          }
        })

      roleDialog.visible = false
    }
    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div className="query-bar">
          {/* <QueryComponents queryList={querys} v-model={queryParams} v-slots={querySlots} action={false}></QueryComponents> */}
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-model={[page.pageNo, 'current-page']}
          v-model={[page.pageSize, 'page-size']}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.map((col, index) => <el-table-column {...col} key={index}></el-table-column>)
          }
          <el-table-column label="操作" align="center" v-slots={
            {
              default: ({ row }) => (
                <>
                  <span class="table-action-label" onClick={() => pushRoute('detail', {
                    query: {
                      id: row.tsrId
                    }
                  })}>详情</span>
                </>
              )
            }
          }>
          </el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={roleDialog.visible} title={roleDialog.title} onOnConfirm={handleDialogConfirm} auto-confirm={false} center>
          <div class="flex-items-center">
            <span class="nowrap">角色名称：</span>
            <el-input v-model={roleName.value}></el-input>
          </div>
        </ConfirmDialog>
      </div>
    )
  }
})
