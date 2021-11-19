
import {
  defineComponent, reactive, inject, ref, nextTick
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { requestFactor } from '@/utils/request'
import exportExcel from '@/utils/export-excel'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImportExcel from '@/components/ImportExcel.vue'

const { http, request } = requestFactor('groupmeal.ChildUser', true)

export default defineComponent({
  name: 'fast-foods_company_account-list',
  setup() {
    let uid
    const tgcaId = useRoute().query.id
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const dialogVisible = reactive({
      add: false,
      edit: false,
      batch: false
    })
    const allergenList = ref([])
    const data = reactive({
      list: [],
      total: 0
    })
    const createForm = () => ({
      uname: '',
      sex: '',
      age: '',
      height: '',
      weight: '',
      motion: '',
      goal: '13',
      allergen: [],
      masterPhone: ''
    })
    const FormRef = ref(null)
    const EditFormRef = ref(null)
    const form = reactive(createForm())
    const formRules = {
      uname: {
        type: 'string', required: true, message: '请输入昵称', trigger: 'blur'
      },
      sex: {
        type: 'string', required: true, message: '请选择性别'
      },
      age: {
        type: 'string', required: true, message: '请输入年龄', trigger: 'blur'
      },
      height: {
        type: 'string', required: true, message: '请输入身高', trigger: 'blur'
      },
      weight: {
        type: 'string', required: true, message: '请输入体重', trigger: 'blur'
      },
      motion: {
        type: 'string', required: true, message: '请选择活动强度'
      },
      goal: {
        type: 'string', required: true, message: '请选择目标'
      }
      // masterPhone: {
      //   type: 'string', required: true, message: '请输入电话', trigger: 'blur'
      // }
    }
    const options = {
      group: [
        {
          label: '2岁',
          value: '01'
        },
        {
          label: '3-4岁',
          value: '02'
        },
        {
          label: '5-6岁',
          value: '03'
        }
      ],
      sex: [
        {
          label: '男',
          value: '1'
        },
        {
          label: '女',
          value: '2'
        }
      ],
      motion: [
        {
          label: '久坐',
          value: '01'
        },
        {
          label: '轻体力活动',
          value: '02'
        },
        {
          label: '中体力活动',
          value: '03'
        }
      ],
      goal: [
        {
          label: '2-6岁',
          value: '13'
        }
      ]
    }
    const queryParams = reactive({
      phone: '',
      age: '',
      group: ''
    })

    const importData = reactive({
      // errorMsg: '',
      // importNum: '',
      // params: [],
      // repetitionPhone: '',
      // successNum: '',
      // unregisteredPhone: ''
    })

    const querys = [
      {
        component: 'NumberInput',
        label: '家长手机',
        key: 'phone',
        placeholder: '家长手机',
        props: {
          precision: 11,
          clearable: true
        }
      },
      {
        component: 'NumberInput',
        label: '年龄',
        key: 'age',
        placeholder: '年龄',
        props: {
          precision: 3,
          clearable: true
        }
      },
      {
        component: 'BaseSelect',
        label: '组别',
        key: 'group',
        placeholder: '年龄',
        props: {
          options: options.group,
          clearable: true
        }
      },
      {
        slot: 'search'
      },
      {
        slot: 'actions'
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
        label: '昵称',
        prop: 'uname'
      },
      {
        label: '性别',
        prop: 'sexDesc'
      },
      {
        label: '年龄',
        prop: 'age'
      },
      {
        label: '身高(cm)',
        prop: 'height'
      },
      {
        label: '体重(斤)',
        prop: 'weight'
      },
      {
        label: '活动强度',
        prop: 'motionDesc'
      },
      {
        label: '目标',
        prop: 'goalDesc'
      },
      {
        label: '过敏原',
        prop: 'allergenDesc'
      },
      {
        label: '家长昵称',
        prop: 'masterUname'
      },
      {
        label: '家长手机号',
        prop: 'masterPhone'
      },
      {
        label: '组别',
        prop: 'groupDesc'
      }
    ]

    function getList() {
      http('queryChildUserPage', {
        tgcaId,
        ...page,
        ...queryParams
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record
            data.total = res.totalRecordCount
          }
        })
    }

    function editClick(row) {
      uid = row.uid
      dialogVisible.edit = true
      nextTick(() => {
        EditFormRef.value.resetFields()
        Object.keys(form).forEach((k) => {
          form[k] = row[k]
        })
        form.allergen = row.allergen ? row.allergen.split(',') : []
        form.goal = '13'
      })
    }

    function deleteClick(row) {
      ElMessageBox.confirm('是否删除该账号？', '提示')
        .then(() => {
          request('deleteChildUser', {
            uid: row.uid
          }).thenwrap((err) => {
            if (!err) {
              getList()
              ElMessage.success('删除成功')
            } else {
              ElMessage.error(err.errMsg)
            }
          })
        })

    }

    function exportClick() {
      http('queryChildUserPage', {
        tgcaId,
        pageNo: 1,
        pageSize: 9999,
        ...queryParams
      })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.record,
              columns: tableColumns
            })
          }
        })
    }
    function addClick() {
      dialogVisible.add = true
      Object.assign(form, createForm())
      nextTick(() => {
        FormRef.value.resetFields()
      })
    }
    function downloadTemplateClick() {
      exportExcel({
        columns: [
          {
            label: '序号',
            type: 'index'
          },
          { label: '昵称', prop: '' },
          { label: '性别', prop: '' },
          { label: '年龄', prop: '' },
          { label: '身高', prop: '' },
          { label: '体重', prop: '' },
          { label: '活动强度', prop: '' },
          { label: '家长手机号', prop: '' }
        ].concat(allergenList.value.map(item => ({
          label: `${item.name}过敏`,
          prop: ''
        }))),
        filename: '企业-账号导入模板',
        data: []
      })
    }

    function updateChildUser(u) {
      return request('updateChildUser', {
        tgcaId,
        uid: u,
        ...form,
        allergen: form.allergen.join(',')
      }).then((res) => {
        if (res.data.errCode !== 0) {
          ElMessage.error(res.data.errMsg)
        }
        return res
      })
    }

    function handleAddConfirm(done) {
      FormRef.value.validate(async (valid) => {
        if (valid) {
          const res = (await updateChildUser()).data
          if (res.errCode === 0) {
            getList()
            dialogVisible.add = false
          } else {
            ElMessage.error(res.errMsg)
          }
        }
        done()
      })
    }

    async function handleBatchConfirm(done) {
      try {
        const res = (await request('batchChildUser', {
          tgcaId,
          data: importData.params
        })).data
        if (res.errCode === 0) {
          dialogVisible.batch = false
          getList()
        } else {
          ElMessage.error(res.errMsg)
        }
      } catch {
        // do nothing
      }
      done()
    }

    function handleFileImport(file) {
      const formData = new FormData()
      formData.append('file', file)
      axios.post('/import/excel/cn.nezha.impl.groupmeal.ChildUserImpl/childUserImport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: sessionStorage.getItem('token')
        }
      }).then((res) => {
        const resData = res.data
        if (resData.errCode !== 0 || resData.obj.errorMsg) {
          ElMessage.error(resData.errMsg || resData.obj.errorMsg)
          return
        }
        Object.assign(importData, resData.obj)

        dialogVisible.batch = true
      })
    }

    function handleEditConfirm(done) {
      EditFormRef.value.validate(async (valid) => {
        if (valid) {
          const res = (await updateChildUser(uid)).data
          if (res.errCode === 0) {
            getList()
            dialogVisible.edit = false
          } else {
            ElMessage.error(res.errMsg)
          }
        }
        done()
      })
    }

    const querySlots = {
      search: () => (
        <>
          <el-button onClick={getList} type="primary">搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>
      ),
      actions: () => (
        <>
          <el-button size="small" onClick={addClick} type="primary">手动添加</el-button>
          <ImportExcel onFile={handleFileImport}>
            <el-button size="small" >批量添加</el-button>
          </ImportExcel>
          <el-tag style="margin-left: 8px" class="cursor-pointer" onClick={downloadTemplateClick}>下载模板</el-tag>
        </>
      )
    }

    const FormItems = (props) => (
      <>
        <el-form-item label="昵称" prop="uname">
          <el-input v-model={form.uname} />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <BaseSelect v-model={form.sex} options={options.sex} />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <NumberInput v-model={form.age} precision={3}></NumberInput>
        </el-form-item>
        <el-form-item label="身高(cm)" prop="height">
          <NumberInput v-model={form.height} mode="digit"></NumberInput>
        </el-form-item>
        <el-form-item label="体重(斤)" prop="weight">
          <NumberInput v-model={form.weight} mode="digit"></NumberInput>
        </el-form-item>
        <el-form-item label="运动强度" prop="motion">
          <BaseSelect v-model={form.motion} options={options.motion} />
        </el-form-item>
        <el-form-item label="过敏原" prop="allergen">
          <el-checkbox-group v-model={form.allergen}>
            {
              allergenList.value.map(item => <el-checkbox label={item.id} key={item.id}>{item.name}</el-checkbox>)
            }
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="目标" prop="goal">
          <BaseSelect v-model={form.goal} options={options.goal} disabled />
        </el-form-item>
        <el-form-item label="家长手机号" prop="masterPhone">
          <NumberInput v-model={form.masterPhone} precision={11}></NumberInput>
        </el-form-item>
      </>
    )

    request('getAllergenList', {})
      .thenwrap((err, res) => {
        if (!err) {
          allergenList.value = res
        }
      })

    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div className="query-bar">
          <QueryComponents span={4} queryList={querys} v-model={queryParams} v-slots={querySlots} action={false}></QueryComponents>
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
                  <span class="table-action-label" style="margin-right: 8px;" onClick={() => editClick(row)}>编辑</span>
                  <span className="table-action-label" onClick={() => deleteClick(row)}>删除</span>
                </>
              )
            }
          }>
          </el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.add} onOnConfirm={handleAddConfirm} async-confirm auto-confirm={false} center>
          <el-form ref={FormRef} model={form} rules={formRules} label-width="120px">
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.edit} onOnConfirm={handleEditConfirm} async-confirm auto-confirm={false} center>
          <el-form ref={EditFormRef} model={form} rules={formRules} label-width="120px">
            <FormItems edit />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.batch} onOnConfirm={handleBatchConfirm} async-confirm confirm-text="确认导入" center>
          <div>
            <div>本次导入：{importData.importNum}人</div>
            <div>账号重复：{importData.repetitionPhone || '无'}</div>
            <div>账号未注册：{importData.unregisteredPhone || '无'}</div>
            <div>可导入：{importData.successNum}</div>
          </div>
        </ConfirmDialog>
      </div>
    )
  }
})
