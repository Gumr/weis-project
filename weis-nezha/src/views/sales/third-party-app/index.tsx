import { defineComponent, reactive, inject, ref, Ref, nextTick, computed } from 'vue'
import requestMethod, { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ElMessage, ElForm } from 'element-plus'
const { http, request } = requestFactor('sale.SaleApp', true)

export default defineComponent({
  name: 'sales_third-party-app',
  setup() {
    const loading = inject('vloading') as Ref<boolean>

    const queryValue = reactive({
      tscEmpId: '',
      tscUphone: '',
      tscName: ''
    })
    const formRef = {
      create: ref({}) as Ref<typeof ElForm>,
      edit: ref({}) as Ref<typeof ElForm>
    }
    const options = reactive({
      employee: []
    })
    const dialogs = reactive({
      create: false,
      edit: false,
      detail: false
    })

    function createForm() {
      return {
        tsaId: '',
        tsaName: '', // 分组名称
        tsaEmpId: '', // 2B拓展经理ID
        tsaRatio: '' // 提成比例
      }
    }
    const form = reactive(createForm())
    const table = reactive({
      data: [],
      total: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      }
    })

    const formRules = computed(() => {
      const rules = {
        tsaName: { required: true, message: '请输入分组名称', trigger: 'blur' },
        tsaEmpId: { required: true, message: '请选择拓展经理', trigger: 'change'   },
        tsaRatio: { required: true,  message: '请输入提成比例', trigger: 'blur'   }
      }

      return rules
    })

    function getList(page = table.page) {
      return http('querySaleAppPage', {
        ...queryValue,
        ...page
      })
        .thenwrap((err, { dataPage }) => {
          if (!err) {
            table.data = dataPage.record
            table.total = dataPage.totalRecordCount
          }
          return (dataPage?.record || []) as any[]
        })
    }

    function editClick(row: any) {
      Object.assign(form, createForm(), row)
      dialogs.edit = true
    }

    const queryComponents = computed(() => [
      {
        label: '项目名称',
        component: 'el-input',
        key: 'tscName',
        placeholder: '请输入项目名称',
        props: {
          clearable: true
        }
      },
      {
        label: '用户手机号',
        component: 'el-input',
        key: 'tscUphone',
        placeholder: '请输入用户手机号',
        props: {
          clearable: true
        }
      },
      {
        slot: () => (<el-button type="primary" onClick={getList}>搜索</el-button>)
      }
    ])

    const tableColumns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '项目名称',
        prop: 'tsaName'
      },
      {
        label: '2B拓展经理',
        prop: 'tsaEmpName'
      },
      {
        label: '手机号',
        prop: 'tsaEmpPhone'
      },
      {
        label: '提成比例',
        prop: 'tsaRatio',
        formatter: (row: any) => `${row.tsaRatio}%`
      },
      {
        label: '创建时间',
        prop: 'tsaCtime'
      },
      {
        label: '操作',
        width: 100,
        align: 'center',
        slot: {
          default: ({ row } : {row:any}) =>
            <>
              <div>
                <el-button size="small" type="primary" onClick={() => editClick(row)}>编辑</el-button >
              </div>
            </>
        }
      }
    ]

    async function saveClick(type: 'create'|'edit', done: () => any) {
      formRef[type].value.validate(async (valid: boolean) => {
        if (valid) {
          try {
            const params: Record<string, any> = { ...form }
            const res = await request('updateSaleApp', params)
            if (res.data.errCode !== 0) {
              ElMessage.error(res.data.errMsg)
            } else {
              ElMessage.success('保存成功')
              dialogs.create = false
              dialogs.edit = false
              getList()
            }
          } catch(e) {}
        }
        done()
      })
    }

    const FormItems = () => (<>
      <el-form-item label="分组名称" prop="tsaName">
        <el-input v-model={form.tsaName} placeholder="请输入分组名称"></el-input>
      </el-form-item>
      <el-form-item label="关联2B拓展经理" prop="tsaEmpId">
        <BaseSelect v-model={form.tsaEmpId} placeholder="请选择拓展经理" options={options.employee}  props={{ label: 'tseName', value: 'tseId' }} />
      </el-form-item>
      <el-form-item label="2B拓展经理提成比例" prop="tsaRatio">
        <NumberInput v-model={form.tsaRatio} mode="digit" precision={2} placeholder="请输入提成比例" style="width: 200px"></NumberInput>%
      </el-form-item>
    </>)
    requestMethod('sale.SaleEmployee/querySaleEmployeeList', {
      tseRoleId: "100002,100003",
      tseStt:'01',
    }).thenwrap((err, data) => {
      if (!err) {
        options.employee = data
      }
    })
    getList()
    return () => (
      <div class="page-container padding-20" >
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryComponents.value} action={false} span={5} semi></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-models={[
            [table.page.pageNo, 'current-page'],
            [table.page.pageSize, 'page-size']
          ]}
          data={table.data}
          total={table.total}
          onPageChange={() => getList()}>
          {
            tableColumns.map(col => <el-table-column {...col} key={col.prop} v-slots={col.slot}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialogs.create} title="新建分组" onOnConfirm={(done: () => any) => saveClick('create', done)} async-confirm center>
          <el-form ref={formRef.create} model={form} rules={formRules.value} label-width="160px">
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogs.edit} title="编辑分组" onOnConfirm={(done: () => any) => saveClick('edit', done)} async-confirm center>
          <el-form ref={formRef.edit} model={form} rules={formRules.value} label-width="160px">
            <FormItems/>
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})