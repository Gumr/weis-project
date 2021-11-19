
import {
  defineComponent, reactive, inject, ref, computed, nextTick
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import req, { requestFactor } from '@/utils/request'
import UploadImage from '@/components/UploadImage'
import { ElMessage } from 'element-plus';
import { cloneDeep } from '@/utils/common'
import exportExcel from '@/utils/export-excel'

const { http, request } = requestFactor('discover.DiscoverContent', true);

export default defineComponent({
  name: 'om_discover_discover-content',
  setup() {
    const FormRef = ref(null);
    const EditFormRef = ref(null);
    const loading = inject('vloading');
    const initForm = {
      tdcId: '', // 内容ID 有则更新，无则新增
      tdcHeadline: '', // 主标题
      tdcSubheading: '', // 副标题
      tdcImgUrl: '', // 封面
      tdcTarget: [], // 所属目标
      tdcCatalogue: [], // 所属目录
      tdcLink: '', // 链接
      tdcSort: '', // 排序
    }
    const form = reactive(cloneDeep(initForm))
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const dialogVisible = reactive({
      create: false,
      edit: false,
      detail: false
    })

    const data = reactive({
      list: [],
      total: 0
    })

    const options = reactive({
      target: [],
      catalogue: [{
        label: '营养与膳食',
        value: '100001'
      }, {
        label: '营养与疾病',
        value: '100002'
      }, {
        label: '营养与生活',
        value: '100003'
      }],
      status: [
        {
          label: '上架',
          value: '01'
        },
        {
          label: '下架',
          value: '00'
        }
      ]
    })

    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号',
      },
      {
        label: '板块',
        prop: 'tdcTargetDesc'
      },
      {
        label: '目录',
        prop: 'tdcCatalogue',
        formatter(row) {
          let str = ''
          if (row.tdcCatalogue) {
            row.tdcCatalogue.forEach(item => {
              const curr = options.catalogue.find(cg => cg.value == item)
              str += `${curr.label}、`
            })
          }
          row.tdcCatalogueStr = str.slice(0, str.length - 1)
          return row.tdcCatalogueStr
        }
      },
      {
        label: '内容封面',
        prop: 'tdcImgUrl',
        slots: {
          default: ({ row }) => <el-image src={row.tdcImgUrl} preview-src-list={[row.tdcImgUrl]} />
        }
      },
      {
        label: '主标题',
        prop: 'tdcHeadline'
      },
      {
        label: '副标题',
        prop: 'tdcSubheading'
      },
      {
        label: '外链地址',
        prop: 'tdcSubheading'
      },

      {
        label: '状态',
        prop: 'tdcSttDesc'
      },
      {
        label: '排序',
        prop: 'tdcSort'
      },
      {
        label: '最后编辑时间',
        prop: 'tdcUtime'
      },
      {
        label: '编辑人',
        prop: 'tdcUpdatorName'
      }
    ]

    const formRules = computed(() => (
      {
        tdcHeadline: {
          type: 'string', message: '请输入主标题', required: true, trigger: 'blur'
        },
        tdcSubheading: {
          type: 'string', message: '请输入副标题', required: true, trigger: 'blur'
        },
        tdcImgUrl: {
          type: 'string', message: '请选择图片作为封面', required: true, trigger: 'change'
        },
        tdcTarget: {
          type: dialogVisible.edit ? 'string' : 'array', message: '请选择目标板块', required: true, trigger: 'change'
        },
        tdcCatalogue: {
          required: form.tdcTarget == '05' ? true : false, trigger: 'change', message: '请选择目录'
        },
        tdcLink: {
          type: 'string', message: '请输入链接', required: true, trigger: 'blur'
        },
        tdcSort: {
          type: 'string', message: '请输入排序', required: true, trigger: 'blur'
        },
      }
    ))

    const queryValue = reactive({
      title: '',
      stt: '',
      target: ''
    })

    const queryList = computed(() => ([
      {
        component: 'el-input',
        label: '主标题名称',
        key: 'title',
        placeholder: '主标题名称',
        props: {
          clearable: true
        }
      },
      {
        component: 'BaseSelect',
        label: '内容板块',
        key: 'target',
        props: {
          clearable: true,
          options: options.target
        }
      },
      {
        component: 'BaseSelect',
        label: '状态',
        key: 'stt',
        props: {
          clearable: true,
          options: options.status
        }
      },
      {
        slot: 'actions'
      },
      {
        slot: 'create'
      }
    ]))

    function createClick() {
      Object.assign(form, cloneDeep(initForm))
      dialogVisible.create = true
      nextTick(() => {
        FormRef.value.resetFields()
      })
    }

    function editClick(row) {
      dialogVisible.edit = true
      nextTick(() => {
        EditFormRef.value.resetFields()
        Object.keys(form).forEach((key) => {
          form[key] = row[key]
          if (key === 'tdcCatalogue') {
            form[key] = row[key] ? row[key] : []
          }
        })
      })
    }

    function detailClick(row) {
      Object.keys(form).forEach((key) => {
        form[key] = row[key]
      })
      form.tdcTargetDesc = row.tdcTargetDesc
      form.tdcCatalogueStr = row.tdcCatalogueStr
      dialogVisible.detail = true
    }

    function exportClick() {
      http('queryDiscoverContentPage', { pageNo: 1, pageSize: data.total, ...queryValue })
        .thenwrap((err, res) => {
          if (!err) {
            exportExcel({
              data: res.dataPage.record,
              columns: tableColumns
            })
          }
        })
    }

    function getList() {
      http('queryDiscoverContentPage', { ...page, ...queryValue })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.dataPage.record
            data.total = res.dataPage.totalRecordCount
          }
        })
    }
    const querySlots = {
      actions: () => (
        <>
          <el-button onClick={getList} type="warning">搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>
      ),
      create: () => (
        <div style="text-align: right;">
          <el-button type="primary" onClick={createClick}>新建内容</el-button>
        </div>
      )
    }
    function updateDiscoverContent() {
      const params = { ...form }
      if (!params.tdcTarget.includes('05')) {
        delete params.tdcCatalogue
      }
      // if (Array.isArray(params.tdcCatalogue)) {
      //   params.tdcCatalogue = params.tdcCatalogue.join(',')
      // }
      if (Array.isArray(params.tdcTarget)) {
        params.tdcTarget = params.tdcTarget.join(',')
      }

      return request('updateDiscoverContent', params)
    }

    function handleDialogConfirm() {
      FormRef.value.validate((valid) => {
        if (valid) {
          updateDiscoverContent().thenwrap((err) => {
            if (!err) {
              ElMessage.success('新建成功')
              getList()
              dialogVisible.create = false
            } else {
              ElMessage.error(err.errMsg)
            }
          });
        }
      })
    }

    function handleEditDialogConfirm() {
      EditFormRef.value.validate((valid) => {
        if (valid) {
          updateDiscoverContent().thenwrap((err) => {
            if (!err) {
              ElMessage.success('编辑成功')
              getList()
              dialogVisible.edit = false
            } else {
              ElMessage.error(err.errMsg)
            }
          });
        }
      })
    }

    function updateDiscoverContentState(id, type) {
      request('updateDiscoverContentState', {
        tdcId: id,
        opType: type,
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('修改成功')
          getList()
        } else {
          ElMessage.error(err.errMsg)
        }
      })
    }

    const Form = props => (
      <>
        <el-form-item label="选择板块" prop="tdcTarget">
          {
            props.edit
              ? (<el-radio-group v-model={form.tdcTarget}>
                {
                  options.target.map(it => <el-radio label={it.value}>{it.label}</el-radio>)
                }
              </el-radio-group>)
              : (<el-checkbox-group v-model={form.tdcTarget}>
                {
                  options.target.map(it => <el-checkbox label={it.value}>{it.label}</el-checkbox>)
                }
              </el-checkbox-group>)
          }
        </el-form-item>
        <el-form-item v-show={form.tdcTarget.includes('05')} label="选择目录" prop="tdcCatalogue">
          <el-checkbox-group v-model={form.tdcCatalogue}>
            {
              options.catalogue.map(it => <el-checkbox label={it.value}>{it.label}</el-checkbox>)
            }
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="排序" prop="tdcSort">
          <NumberInput v-model={form.tdcSort} />
        </el-form-item>
        <el-form-item label="封面" prop="tdcImgUrl">
          <UploadImage v-model={form.tdcImgUrl} limit={1} />
          <span>推荐：750*750</span>
        </el-form-item>
        <el-form-item label="主标题" prop="tdcHeadline" >
          <el-input v-model={form.tdcHeadline}></el-input>
        </el-form-item>
        <el-form-item label="副标题" prop="tdcSubheading">
          <el-input v-model={form.tdcSubheading} type="textarea" rows={4}></el-input>
        </el-form-item>
        <el-form-item label="外链地址" prop="tdcLink">
          <el-input v-model={form.tdcLink}></el-input>
        </el-form-item>
      </>
    )

    async function getTarget() {
      const res = (await req('discover.DiscoverLabel/queryTargetList', {})).data;
      if (res.errCode === 0) {
        options.target = res.obj
      }
    }
    getTarget()
    getList()
    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents queryList={queryList.value} v-model={queryValue} span={5} v-slots={querySlots} action={false} semi></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          data={data.list}
          v-model={[page.pageNo, 'current-page']}
          v-model={[page.pageSize, 'page-size']}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.map(col => <el-table-column {...col} v-slots={col.slots} key={col.prop}></el-table-column>)
          }
          <el-table-column label="操作" v-slots={{
            default: ({ row }) => (
              <>
                <span className="table-action-label" onClick={() => editClick(row)}>编辑</span>
                {
                  row.tdcStt === '01'
                    ? <span className="table-action-label" style="margin-left: 8px" onClick={() => updateDiscoverContentState(row.tdcId, '00')}>下架</span>
                    : <span className="table-action-label" style="margin-left: 8px" onClick={() => updateDiscoverContentState(row.tdcId, '01')}>上架</span>
                }
                <span className="table-action-label" style="margin-left: 8px" onClick={() => detailClick(row)}>详情</span>
              </>
            )
          }}>

          </el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.create} title="新建内容" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
          <el-form ref={FormRef} model={form} rules={formRules.value} validate-on-rule-change={false} label-width="100px">
            <Form />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.edit} title="编辑内容" auto-confirm={false} center onOnConfirm={handleEditDialogConfirm}>
          <el-form ref={EditFormRef} model={form} rules={formRules.value} validate-on-rule-change={false} label-width="100px">
            <Form edit />
          </el-form>
        </ConfirmDialog>
        <el-dialog v-model={dialogVisible.detail} title="内容详情" center>
          <div style="margin: 12px 0">
            <span>选择板块：{form.tdcTargetDesc}</span>
          </div>
          <div style="margin: 12px 0">
            <span>排序：{form.tdcSort}</span>
          </div>
          <div style="margin: 12px 0">
            <span>目录：{form.tdcCatalogueStr}</span>
          </div>
          <div style="margin: 12px 0">
            <span style="vertical-align: top">封面：</span>
            <el-image style="width: 200px; height: 200px" fit="contain" src={form.tdcImgUrl} preview-src-list={[form.tdcImgUrl]}></el-image>
          </div>
          <div style="margin: 12px 0">
            <span>主标题：{form.tdcHeadline}</span>
          </div>
          <div style="margin: 12px 0">
            <span>副标题：{form.tdcSubheading}</span>
          </div>

          <div style="margin: 12px 0">
            <span>外链地址：{form.tdcLink}</span>
          </div>
        </el-dialog>
      </div>
    )
  }
})
