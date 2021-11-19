import { computed, defineComponent, nextTick, reactive, ref, Ref } from 'vue'
import exportExcel from '@/utils/export-excel'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import request from '@/utils/request'
import { ElForm, ElMessageBox, ElMessage } from 'element-plus'
import { objectForeach } from '@/utils/common'
export default defineComponent({
  name: 'goods_ingredient-list',
  setup() {
    function createForm() {
      return {
        ingredientName: '',
        foodType: ''
      }
    }
    let recordId: string
    const nodeRefs = {
      create: ref({}) as Ref<typeof ElForm>,
      edit: ref({}) as Ref<typeof ElForm>
    }
    const table = reactive({
      list: [],
      total: 0
    })
    const page = reactive({
      pageNo: 1,
      pageSize: 10
    })
    const dialogVisible = reactive({
      create: false,
      edit: false
    })

    const form = reactive(createForm())
    const queryValue = reactive({
      ingredientName: '',
      foodType: ''
    })

    const options = reactive({
      ingredient: []
    })

    function editClick(row: any) {
      recordId = row.recordId
      objectForeach(form, (_, key) => {
        form[key] = row[key]
      })
      dialogVisible.edit = true
    }

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
    function relevantInfo() { // 查食材类型
      request('FoodDiversity/relevantInfo', {})
        .thenwrap((err, data) => {
          if (!err) {
            options.ingredient = data.foodtype
          }
        })
    }
    function getList(pages = page) {
      return request('FoodDiversity/queryFoodDiversity', {
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

    function createClick() {
      Object.assign(form, createForm())
      dialogVisible.create = true
      nextTick(() => nodeRefs.create.value.resetFields())
    }

    function disableClick(row: any) {
      request('FoodDiversity/forbidFoodDiversity', {
        recordId: row.recordId
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('操作成功')
          getList()
        }
      })
    }

    function enableClick(row: any) {
      request('FoodDiversity/useFoodDiversity', {
        recordId: row.recordId
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('操作成功')
          getList()
        }
      })
    }

    function handleCreateCofirm(done: () => void) {
      nodeRefs.create.value.validate(async(valid: boolean) => {
        try {
          if (valid) {
            const { data } = await request('FoodDiversity/addFoodDiversity', form)
            if (data.errCode === 0) {
              ElMessage.success('添加成功')
              getList()
              dialogVisible.create = false
            }
          }
        } finally {
          done()
        }
      })
    }
    function handleEditConfirm(done: () => void) {
      nodeRefs.edit.value.validate(async(valid: boolean) => {
        try {
          if (valid) {
            const { data } = await request('FoodDiversity/editFoodDiversity', {
              recordId,
              ...form
            })
            if (data.errCode === 0) {
              ElMessage.success('编辑成功')
              dialogVisible.edit = false
              getList()
            }
          }
        } finally {
          done()
        }
      })
    }
    function deleteClick(row: any) {
      ElMessageBox.confirm('是否删除该食材？', '提示')
        .then(() => {
          request('FoodDiversity/removeFoodDiversity', {
            recordId: row.recordId
          }).thenwrap((err) => {
            if (!err) {
              getList()
            }
          })
        })
    }
    const columns = [
      {
        label: 'ID',
        prop: 'recordId'
      },
      {
        label: '食材名称',
        prop: 'ingredientName'
      },
      {
        label: '食材分类',
        prop: 'foodTypeStr'
      },
      {
        label: '状态',
        prop: 'sttStr',
        slot: {
          default: ({ row }: {row:any}) => (
            <>
              <el-tag type={row.stt === '01' ? 'danger' : 'primary'}>{row.sttStr}</el-tag>
            </>
          )
        }
      },
      {
        label: '操作人',
        prop: 'operator'
      },
      {
        label: '最后操作时间',
        prop: 'utime'
      },
      {
        label: '操作',
        align: 'center',
        slot: {
          default: ({ row }: {row:any}) => (
            <>
              <span class="table-action-label" style="margin-right: 8px" onClick={() => editClick(row)}>编辑</span>
              <span v-show={row.stt === '01'} class="table-action-label" style="margin-right: 8px" onClick={() => enableClick(row)}>启用</span>
              <span v-show={row.stt === '00'} class="table-action-label" style="margin-right: 8px" onClick={() => disableClick(row)}>禁用</span>
              <span class="table-action-label" onClick={() => deleteClick(row)}>删除</span>
            </>
          )
        }
      }
    ]
    const queryList = computed(() => [
      {
        label: '食材名称',
        component: 'el-input',
        key: 'ingredientName',
        placeholder: '请输入食材名称',
        props: {
          clearable: true
        }
      },
      {
        label: '食材类型',
        component: 'BaseSelect',
        key: 'foodType',
        placeholder: '请选择食材类型',
        props: {
          options: options.ingredient,
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
      },
      {
        slot: () => (<div style="text-align: right;">
          <el-button type="primary" onClick={createClick}>添加食材</el-button>
        </div>)
      }
    ])

    const formRule = {
      ingredientName: { required: true, message: '请输入食材名称', trigger: 'blur' },
      foodType: { required: true, message: '请选择食材类型', trigger: 'change' }
    }
    const FormItems = () => (
      <>
        <el-form-item label="食材名称" prop="ingredientName">
          <el-input v-model={form.ingredientName}></el-input>
        </el-form-item>
        <el-form-item label="食材类型" prop="foodType">
          <BaseSelect v-model={form.foodType} options={options.ingredient}></BaseSelect>
        </el-form-item>
      </>

    )

    relevantInfo()
    getList()
    return () => (
      <div class="page-container padding-20">
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryList.value} action={false} span={4}/>
        </div>
        <BasePageTable v-models={[
          [page.pageNo, 'current-page'],
          [page.pageSize, 'page-size']
        ]} data={table.list} total={table.total} max-height={window.innerHeight - 240} onPageChange={() => getList()} border stripe>
          {
            columns.map(col => <el-table-column {...col} key={col.prop} v-slots={col.slot}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.create} align="center" title="新增食材" async-confirm onOnConfirm={handleCreateCofirm}>
          <el-form label-width="100px" ref={nodeRefs.create} model={form} rules={formRule}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.edit} align="center" title="编辑食材" async-confirm onOnConfirm={handleEditConfirm}>
          <el-form label-width="100px" ref={nodeRefs.edit} model={form} rules={formRule}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})