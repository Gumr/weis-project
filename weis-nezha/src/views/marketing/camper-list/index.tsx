import { defineComponent, reactive, inject, ref, Ref, nextTick } from 'vue'
import { requestFactor } from '@/utils/request'
import exportExcel from '@/utils/export-excel'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UploadImage from '@/components/UploadImage'
import SubmitButton from '@/components/SubmitButton.vue'
import { ElMessage, ElForm } from 'element-plus'
const { http, request } = requestFactor('marketing.activity.Principal', true)

export default defineComponent({
  name: 'om_camper-list',
  setup() {
    const loading = inject('vloading') as Ref<boolean>
    const queryValue = reactive({
      phone: '',
      name: ''
    })
    const formRef = {
      create: ref({}) as Ref<typeof ElForm>,
      edit: ref({}) as Ref<typeof ElForm>
    }
    const dialogs = reactive({
      create: false,
      edit: false
    })
    let cid: number
    function createForm() {
      return {
        cphone: '',//注册手机
        name: '',//名称
        wechat: '',//微信号
        phone: '',//手机
        introduce: '',//个人介绍
        wqrcode: '',//微信二维码
        certificate: '',//专业证书
        picture: ''//个人照片
      }
    }
    const nickname = ref('')
    const form = reactive(createForm())
    const table = reactive({
      data: [],
      total: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      }
    })

    const formRules = {
      cphone: { required: true, message: '请输入注册手机号', trigger: 'blur' },
      name: { required: true, message: '请输入名称', trigger: 'blur'   },
      wechat: { required: true, message: '请输入微信号', trigger: 'blur'   },
      phone: { required: true, message: '请输入手机号', trigger: 'blur'   },
      introduce: { required: true, message: '请输入个人介绍', trigger: 'blur'   },
      wqrcode: { required: true, message: '请上传微信二维码', trigger: 'change'   }
    }

    function getList(page = table.page) {
      return http('queryPrincipals', {
        ...queryValue,
        ...page
      })
        .thenwrap((err, res) => {
          if (!err) {
            table.data = res.record
            table.total = res.totalRecordCount
          }
          return (res?.record || []) as any[]
        })
    }

    function createCamper() {
      Object.assign(form, createForm())
      nickname.value = ''
      dialogs.create = true
      nextTick(formRef.create.value.resetFields)
    }

    function editClick(row: any) {
      cid = row.cid
      Object.assign(form, row)
      getUserUname(form.cphone)
      dialogs.edit = true
    }

    function exportClick() {
      getList({
        pageNo: 1,
        pageSize: table.total
      }).then((data) => {
        exportExcel({
          data,
          columns: tableColumns
        })
      })
    }

    const queryComponents = [
      {
        label: '注册手机号',
        component: 'NumberInput',
        key: 'phone'
      },
      {
        label: '名称',
        component: 'el-input',
        key: 'name'
      },
      {
        slot: () => (
          <>
            <el-button type="primary" onClick={() => getList()}>搜索</el-button>
            <el-button onClick={exportClick}>导出</el-button>
          </>
        )
      },
      {
        slot: () => (
          <div style="text-align: right">
            <el-button type="success" onClick={createCamper}>新建营长</el-button>
          </div>
        )
      }
    ]

    const tableColumns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '微信昵称',
        prop: 'nickname'
      },
      {
        label: '注册手机号',
        prop: 'cphone'
      },
      {
        label: '名称',
        prop: 'name'
      },
      {
        label: '微信号',
        prop: 'wechat'
      },
      {
        label: '手机号',
        prop: 'phone'
      },
      {
        label: '操作',
        slot: {
          default: ({ row } : {row:any}) => <span class="table-action-label" onClick={() => editClick(row)}>编辑</span>
        }
      }
    ]
    function getUserUname(cphone: string) {
      request('getUserUname', {
        phone: cphone
      }).thenwrap((err, res) => {
        if (!err) {
          nickname.value = res
        } else {
          nickname.value = ''
          ElMessage.error(err.errMsg)
        }
      })
    }
    function handleCphoneBlur() {
      const { cphone } = form
      if (cphone.length <= 0) {
        nickname.value = ''
      } else {
        getUserUname(cphone)
      }
    }

    async function saveClick(type: 'create'|'edit', done: () => any) {
      formRef[type].value.validate(async (valid: boolean) => {
        if (valid) {
          try {
            const res = type === 'create'
              ? await request('addPrincipal', form)
              : await request('editPrincipal', {
                ...form,
                cid
              })

            if (res.data.errCode !== 0) {
              ElMessage.error(res.data.errMsg)
            } else {
              dialogs.create = false
              dialogs.edit = false
              getList()
            }
          } catch(e) {}
        }
        done()
      })
    }

    const FormItems = (props: { edit?: boolean }) => (<>
      <el-form-item label="注册手机号" prop="cphone">
        <NumberInput disabled={props.edit} v-model={form.cphone} precision={11} placeholder="请输入注册手机号" onBlur={handleCphoneBlur}></NumberInput>
      </el-form-item>
      <el-form-item label="昵称">
        <span>{nickname.value}</span>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model={form.name} placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="微信号" prop="wechat">
        <el-input v-model={form.wechat} precision={11} placeholder="请输入微信号"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <NumberInput v-model={form.phone} precision={11} placeholder="请输入手机号"></NumberInput>
      </el-form-item>
      <el-form-item label="个人介绍" prop="introduce">
        <el-input v-model={form.introduce} rows={4} placeholder="请输入个人介绍" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="微信二维码" prop="wqrcode">
        <UploadImage v-model={form.wqrcode} />
      </el-form-item>
      <el-form-item label="专业证书" prop="certificate">
        <UploadImage v-model={form.certificate} />
      </el-form-item>
      <el-form-item label="照片" prop="picture">
        <UploadImage v-model={form.picture} />
      </el-form-item>
    </>)

    getList()
    return () => (
      <div class="page-container padding-20" >
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryComponents} action={false} span={4} semi></QueryComponents>
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
        <ConfirmDialog v-model={dialogs.create} title="新建营长" v-slots={{
          footer: () => (<SubmitButton onSubmit={(done: () => any) => saveClick('create', done)}>保存</SubmitButton>)
        }} center>
          <el-form ref={formRef.create} model={form} rules={formRules} label-width="100px">
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogs.edit} title="编辑营长" v-slots={{
          footer: () => (<SubmitButton onSubmit={(done: () => any) => saveClick('edit', done)}>保存</SubmitButton>)
        }} center>
          <el-form ref={formRef.edit} model={form} rules={formRules} label-width="100px">
            <FormItems edit={true}/>
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})