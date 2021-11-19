
import {
  defineComponent, reactive, inject, ref
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ElMessage } from 'element-plus'
import request, { http } from '@/utils/request'
import SelectTree from '@/components/SelectTree.vue'

export default defineComponent({
  name: 'sales_department-management',
  setup() {
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const pushRoute = inject('pushRoute')
    const loading = inject('vloading')
    const subdialog = reactive({
      visible: false
    })
    const dialog = reactive({
      visible: false
    })
    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号'
      },
      {
        label: '部门名称',
        prop: 'tsdName'
      },
      {
        label: '下级部门数量',
        prop: 'lowerNum'
      },
      {
        label: '员工人数',
        prop: 'employeeNum'
      },
      {
        label: '创建时间',
        prop: 'tsdCtime'
      }
    ]

    // const superDepartment = ref('')
    const departmentTree =ref([])
    const data = reactive({
      list: [],
      total: 0
    })
    const createForm = () => ({
      tsdPid: null,
      tsdName: ''
    })
    const form = reactive(createForm())
    const queryProps = {
      modelValue: reactive({
        tsdName: ''
      }),
      queryList: [
        {
          component: 'el-input',
          label: '部门名称',
          key: 'tsdName',
          placeholder: '请输入部门名称',
          props: {
            clearable: true
          }
        },
        {
          slot: 'search'
        },
        {
          slot: 'create'
        }
      ]
    }
    function createClick() {
      querySaleDepartmentTree()
      Object.assign(form, createForm())
      dialog.visible = true
    }

    function getList() {
      http('sale.SaleDepartment/querySaleDepartmentPage', {
        ...page,
        ...queryProps.modelValue
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record
            data.total = res.dataPage.totalRecordCount
          }
        })
    }
    queryProps.slots = {
      search: () => (
        <el-button onClick={getList}>搜索</el-button>
      ),
      create: () => (
        <div style="text-align: right;">
          <el-button type="primary" onClick={createClick}>添加部门</el-button>
        </div>
      )
    }

    function updateSaleDepartment() {
      const params = { ...form }
      if (!params.tsdPid) params.tsdPid = undefined
      return http('sale.SaleDepartment/updateSaleDepartment', params)
    }

    function handleDialogConfirm(done) {
      if (form.tsdName.length <= 0) {
        ElMessage.error('请输入部门名称')
        done()
        return
      }
      updateSaleDepartment()
        .thenwrap((err) => {
          if (!err) {
            ElMessage.success('添加成功')
            getList()
            dialog.visible = false
            subdialog.visible = false
          }
        })
        .finally(done)
    }
    function handleNodeClick(node) {
      form.tsdPid = node.id
    }

    function querySaleDepartmentTree() {
      request('sale.SaleDepartment/querySaleDepartmentTree', {})
        .thenwrap((err, data) => {
          if (!err) {
            departmentTree.value = data
          }
        })
    }

    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={queryProps.slots} action={false}></QueryComponents>
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
            tableColumns.map((col, index) => <el-table-column {...col} v-slots={col.slots} key={index}></el-table-column>)
          }
          <el-table-column label="操作" align="center" v-slots={{
            default: ({ row }) => (
              <>

                <span class="table-action-label" onClick={() => pushRoute('detail', {
                  query: {
                    id: row.tsdId,
                    nums: row.lowerNum
                  }
                })}>详情</span>
              </>
            )
          }}></el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialog.visible} title="添加部门" auto-confirm={false} center onOnConfirm={handleDialogConfirm} async-confirm>
          <div class="flex-items-center">
            <span style="display: inline-block; width: 80px">上级部门</span>
            <SelectTree onNodeClick={handleNodeClick} v-model={form.tsdPid} options={departmentTree.value} defaultProps={{ label: 'name' }} clearable></SelectTree>
          </div>
          <div class="flex-items-center" style="margin-top: 12px">
            <span class="asterisk" style="display: inline-block; width: 80px">部门名称</span>
            <el-input v-model={form.tsdName}></el-input>
          </div>
        </ConfirmDialog>
        {/* <ConfirmDialog v-model={subdialog.visible} title="添加子部门" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <div className="flex-items-center">
            <span style="display: inline-block; min-width: 90px; margin: 12px 0;">上级部门：</span>
            <span>{superDepartment.value}</span>
          </div>
          <div class="flex-items-center">
            <span class="asterisk" style="display: inline-block; min-width: 90px; margin: 12px 0;">部门名称：</span>
            <el-input v-model={form.tsdName}></el-input>
          </div>
        </ConfirmDialog> */}
      </div>
    )
  }
})
