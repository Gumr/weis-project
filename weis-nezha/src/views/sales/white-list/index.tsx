import { defineComponent, reactive, inject, ref, Ref, nextTick, computed } from 'vue'
import requestMethod, { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ElMessage, ElForm } from 'element-plus'
import { useRouter } from 'vue-router'
const { http, request } = requestFactor('sale.SaleCorp', true)

export default defineComponent({
  name: 'sales_white-list-2b',
  setup() {
    let tscId: string
    const loading = inject('vloading') as Ref<boolean>
    const router = useRouter()
    const queryValue = reactive({
      tscEmpId: '',
      tscUphone: '',
      tscName: ''
    })
    const formRef = {
      create: ref({}) as Ref<typeof ElForm>,
      edit: ref({}) as Ref<typeof ElForm>
    }
    const dialogs = reactive({
      create: false,
      edit: false,
      detail: false
    })
    const options = reactive({
      employee: []
    })

    function createForm() {
      return {
        tscName: '', // 分组名称
        tscEmpId: '', // 2B拓展经理ID
        tscRatio: '' // 提成比例
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
        tscName: { required: true, message: '请输入分组名称', trigger: 'blur' },
        tscEmpId: { required: true, message: '请选择拓展经理', trigger: 'change' },
        tscRatio: { required: true, message: '请输入提成比例', trigger: 'blur' }
      }

      return rules
    })

    function getList(page = table.page) {
      return http('querySaleCorpPage', {
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

    function createClick() {
      Object.assign(form, createForm())
      dialogs.create = true
      nextTick(formRef.create.value.resetFields)
    }

    function editClick(row: any) {
      tscId = row.tscId
      Object.assign(form, row)
      dialogs.edit = true
    }

    function detailClick(row: any) {
      router.push({
        name: 'sales_white-list-2b_detail',
        query: {
          tscId: row.tscId
        }
      })
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
        label: '2B拓展经理',
        component: 'BaseSelect',
        key: 'tscEmpId',
        placeholder: '请选择拓展客户经理',
        props: {
          clearable: true,
          props: { label: 'tseName', value: 'tseId' },
          options: options.employee
        }
      },
      {
        slot: () => (<el-button type="primary" onClick={getList}>搜索</el-button>)
      },
      {
        slot: () => (<div></div>)
      },
      {
        slot: () => (
          <div style="text-align: right">
            <el-button type="success" onClick={createClick}>添加项目</el-button>
          </div>
        )
      }
    ])

    const tableColumns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '分组名称',
        prop: 'tscName'
      },
      {
        label: '人员人数',
        prop: 'userNum'
      },
      {
        label: '2B拓展经理',
        prop: 'tscEmpName'
      },
      {
        label: '提成比例',
        prop: 'tscRatio',
        formatter: (row: any) => `${row.tscRatio}%`
      },
      {
        label: '创建时间',
        prop: 'tscCtime'
      },
      {
        label: '操作',
        width: 180,
        align: 'center',
        slot: {
          default: ({ row }: { row: any }) =>
            <>
              <div>
                <el-button size="small" type="primary" onClick={() => editClick(row)}>编辑</el-button >
                <el-button size="small" onClick={() => detailClick(row)}>详情</el-button >
              </div>
            </>
        }
      }
    ]

    async function saveClick(type: 'create' | 'edit', done: () => any) {
      formRef[type].value.validate(async (valid: boolean) => {
        if (valid) {
          try {
            const params: Record<string, any> = { ...form }
            params.tscId = type === 'edit' ? tscId : undefined
            const res = await request('updateSaleCorp', params)

            if (res.data.errCode !== 0) {
              ElMessage.error(res.data.errMsg)
            } else {
              ElMessage.success('保存成功')
              dialogs.create = false
              dialogs.edit = false
              getList()
            }
          } catch (e) {
            console.log(e, 'error')
          }
        }
        done()
      })
    }

    const FormItems = () => (<>
      <el-form-item label="分组名称" prop="tscName">
        <el-input v-model={form.tscName} placeholder="请输入分组名称"></el-input>
      </el-form-item>
      <el-form-item label="关联2B拓展经理" prop="tscEmpId">
        <BaseSelect v-model={form.tscEmpId} placeholder="请选择拓展经理" options={options.employee} props={{ label: 'tseName', value: 'tseId' }} />
      </el-form-item>
      <el-form-item label="2B拓展经理提成比例" prop="tscRatio">
        <NumberInput v-model={form.tscRatio} mode="digit" precision={2} placeholder="请输入提成比例" style="width: 200px"></NumberInput>%
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
          <QueryComponents v-model={queryValue} label-width={90} query-list={queryComponents.value} action={false} span={queryComponents.value.length} semi></QueryComponents>
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
            <FormItems />
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})