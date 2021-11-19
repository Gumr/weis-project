
import {
  defineComponent, reactive, inject, ref, computed
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/request'

export default defineComponent({
  name: 'sales_department-management_detail2',
  setup() {
    const route = useRoute()

    const { id, name } = route.query
    const router = useRouter()
    const departmentNums = Number(route.query.nums)
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const department = reactive({
      tsdPid: '', // 部门上级ID
      tsdId: '', // 部门ID
      tsdName: '' // 部门名称
    })
    const form = reactive({
      tsdPid: '',
      tsdName: ''
    })
    const eidtDepartment = ref('')
    const data = reactive({
      list: [],
      total: 0
    })
    const subdialog = reactive({
      visible: false
    })
    const dialog = reactive({
      visible: false
    })
    function createClick() {
      form.tsdPid = ''
      form.tsdName = ''
      dialog.visible = true
    }
    const departmentName = computed(() => {
      const result = name ? `${name}-${department.tsdName}` : department.tsdName
      return result
    })
    function createSubClick(row) {
      form.tsdPid = row.tsdId
      form.tsdName = ''
      eidtDepartment.value = row.tsdName
      subdialog.visible = true
    }
    const tableColumns = departmentNums > 0
      ? [
        {
          width: '60px',
          align: 'center',
          type: 'index',
          label: '序号'
        },
        {
          label: '部门ID',
          prop: 'tsdId'
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
        },
        {
          align: 'center',
          label: '操作',
          slots: {
            default: ({ row }) => (
              <>
                {/* <span class="table-action-label" style="margin-right: 8px;" onClick={() => createSubClick(row)}>添加子部门</span> */}
                <span class="table-action-label" onClick={() => router.push({
                  path: '/sales/department-management/detail',
                  query: {
                    name: departmentName.value,
                    id: row.tsdId,
                    nums: row.lowerNum
                  }
                })}>详情</span>
              </>
            )
          }
        }
      ]
      : [
        {
          width: '60px',
          align: 'center',
          type: 'index',
          label: '序号'
        },
        {
          label: '员工昵称',
          prop: 'tseName'
        },
        {
          label: '手机号',
          prop: 'tsePhone'
        },
        {
          label: '类型',
          prop: 'tseTypeDesc'
        },
        {
          label: '角色',
          prop: 'tseRoleName'
        }
      ]

    const queryProps = departmentNums > 0
      ? {
        modelValue: reactive({
          tsdName: ''
        }),
        queryList: [
          {
            component: 'el-input',
            label: '部门名称：',
            key: 'tsdName',
            placeholder: '输入部门名称'
          },
          {
            slot: 'search'
          },
          {
            slot: 'create'
          }
        ]
      }
      : {
        modelValue: reactive({
          tsePhone: ''
        }),
        queryList: [
          {
            component: 'el-input',
            label: '手机号：',
            key: 'tsePhone',
            placeholder: '输入手机号'
          },
          {
            slot: 'search'
          }
        ]
      }

    function querySaleDepartmentPage() {
      http('sale.SaleDepartment/querySaleDepartmentPage', {
        tsdPid: id,
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

    function querySaleDepartmentEmployeePage() {
      http('sale.SaleDepartment/querySaleDepartmentEmployeePage', {
        tsdPid: id,
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

    const getList = departmentNums > 0
      ? querySaleDepartmentPage
      : querySaleDepartmentEmployeePage

    function updateSaleDepartment() {
      return http('sale.SaleDepartment/updateSaleDepartment', {
        ...form,
        tsdPid: form.tsdPid || id
      })
    }

    function handleDialogConfirm() {
      if (form.tsdName.length <= 0) {
        ElMessage.error('请输入部门名称')
        return
      }
      updateSaleDepartment()
        .thenwrap((err) => {
          if (!err) {
            getList()
            dialog.visible = false
            subdialog.visible = false
          }
        })
    }
    function querySaleDepartmentInfo() {
      return http('sale.SaleDepartment/querySaleDepartmentInfo', {
        tsdId: id
      }).thenwrap((err, res) => {
        if (!err) {
          Object.keys(department)
            .forEach((key) => {
              department[key] = res[key]
            })
        }
      })
    }
    queryProps.slots = departmentNums > 0
      ? {
        search: () => <el-button onClick={getList}>搜索</el-button>
        // create: () => (
        //   <div style="text-align: right;">
        //     <el-button type="primary" onClick={createClick}>添加部门</el-button>
        //   </div>
        // )
      }
      : {
        search: () => <el-button onClick={getList}>搜索</el-button>
      }

    querySaleDepartmentInfo()
    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryProps.queryList} v-model={queryProps.modelValue} v-slots={queryProps.slots} action={false}></QueryComponents>
        </div>
        <div style="margin-bottom: 20px;">上级部门：{departmentName.value}</div>
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
            tableColumns.map((col, index) => <el-table-column {...col} key={index} v-slots={col.slots}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialog.visible} title="添加部门" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <div class="flex-items-center">
            <span style="display: inline-block; width: 80px">部门名称</span>
            <el-input v-model={form.tsdName}></el-input>
          </div>
        </ConfirmDialog>
        <ConfirmDialog v-model={subdialog.visible} title="添加子部门"auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <div className="flex-items-center">
            <span style="display: inline-block; min-width: 90px; margin: 12px 0;">上级部门：</span>
            <span>{`${departmentName.value}-${eidtDepartment.value}`}</span>
          </div>
          <div class="flex-items-center">
            <span style="display: inline-block; min-width: 90px;">部门名称：</span>
            <el-input v-model={form.tsdName}></el-input>
          </div>
        </ConfirmDialog>
      </div>
    )
  }
})
