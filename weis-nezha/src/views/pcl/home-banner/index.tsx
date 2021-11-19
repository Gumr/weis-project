import { defineComponent, reactive, inject, ref, Ref, nextTick, computed } from 'vue'
import { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UploadImage from '@/components/UploadImage'
import { ElMessage, ElForm, ElMessageBox } from 'element-plus'
import { ExtractOptionsValues } from '@/utils/data-map'
import dayjs from 'dayjs'
import { cloneDeep, objectForeach } from '@/utils/common'
import exportExcel from '@/utils/export-excel'
import ImportExcel from '@/components/ImportExcel.vue'

const { http, request } = requestFactor('discover.DiscoverCarousel', true)
const { http: http_article } = requestFactor('article.DietDialog', true)

export default defineComponent({
  name: 'pcl_home-banner',
  setup() {
    const loading = inject('vloading') as Ref<boolean>
    const queryValue = reactive({
      type:'00',
      title: '',
      date: [],
      startDate: '',
      endDate: '', // 结束日期
      location: '',
      stt: '' // 01:上线 00:下线
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
    // const importTable = ref([])
    const importTableColumns = [
      {
        type: 'index',
        label: '序号'
      },
      {
        label: '昵称',
        prop: 'uname'
      },
      {
        label: '微信手机号',
        prop: 'phone'
      },
      {
        label: '操作',
        slot: {
          default: ({ $index }: { $index: number }) => <el-button type="danger" size="small" onClick={() => form.tdcUids.splice($index, 1)}>删除</el-button>
        }
      }
    ]
    const contentTypeOptions = [
      {
        label: '不跳转',
        value: '00'
      },
      {
        label: 'H5外链',
        value: '02'
      },
      {
        label: '小程序路径',
        value: '01'
      },
      {
        label: '图片',
        value: '03'
      }
    ] as const
    const importLoading = ref(false)
    const targetOptions = [
      {
        label: '健身',
        value: '01'
      },
      {
        label: '慢病',
        value: '02'
      },
      {
        label: '企业',
        value: '03'
      },
      {
        label: '少儿',
        value: '04'
      }
    ] as const

    interface User {
      uid: string
      uname: string
      phone: string
    }
    let tdcId: string
    function createForm() {
      return {
        date: [] as Date[],
        tdcTitle: '', // 标题
        tdcImgUrl: '', // 封面图
        tdcLinkType: '00', // 内容类型 01:小程序路径 02:链接 03:图片
        tdcLink: '', // 内容链接
        tdcStartDate: '', // 有效期开始
        tdcEndDate: '', // 有效期结束
        tdcLocation: '01', // 排序
        // tdcTarget: '',
        tdcCrowd: '01',
        tdcSort: '',
        tdcAppid: '',
        tdcMiniType: '',
        tdcUids: [] as User[],
        heatingPoint: [],
        type:'00'
      }
    }

    function showLink(type: string): boolean {
      return type !== '00'
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
      const rules: Record<string, any> = {
        tdcTitle: { required: true, message: '请输入标题', trigger: 'blur' },
        tdcImgUrl: { required: true, message: '请输入封面图', trigger: 'change' },
        date: { required: true, type: 'array', message: '请输入有效期', trigger: 'blur' },
        tdcSort: { required: true, message: '请输入排序', trigger: 'blur' },
        tdcCrowd: {
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value === '02') {
              if (form.tdcUids.length <= 0) {
                callback('自定义用户，导入用户名单不能为空')
                return
              }
            }
            callback()
          }
        },
        tdcLocation: {
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value !== '02'&&value !== '05') {
              // if (!form.tdcTarget) {
                callback('请选择展示位置')
                return
              // }
            }
            callback()
          }
        },
        tdcLink: {
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (showLink(form.tdcLinkType)) {
              console.log('check modelvalue', form.tdcLink)
              if (!value) {
                callback('请输入跳转链接')
                return
              }
            }
            callback()
          }
        }
      }

      return rules
    })
    function minitypeChange(value: string) {
      // if (value === '02') {
      form.tdcAppid = ''
      // }
    }

    let innitHp: []
    function initialData() {
      http_article('initialData', {
      })
        .thenwrap((err, data) => {
          if (!err) {
            innitHp = data.heatingPoint
            renderHp.hp = cloneDeep(innitHp)
          }
        })
    }

    function getList(page = table.page) {
      return http('queryDiscoverCarouselPage', {
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

    function createCamper() {
      Object.assign(form, createForm())
      dialogs.create = true
      renderHp.hp = []
      nextTick(formRef.create.value.resetFields)
    }
    // const isAllCheck = reactive({
    //   val: [false]
    // })
    let allCheck = ref(true)
    function handleCheckAllChange(e) {
      form.heatingPoint = allCheck.value ? renderHp.hp.map(item => item.value) : []
      // if (form.heatingPoint.length === renderHp.hp.length) form.heatingPoint = []
      // if (allCheck) form.heatingPoint = renderHp.hp.map(item => item.value)
    }

    function handleCheckChange(value) {
      allCheck.value = form.heatingPoint.length === renderHp.hp.length
    }

    function handleTypeChange(value: ExtractOptionsValues<typeof contentTypeOptions>) {
      // if (!showLink(value)) {
      form.tdcLink = ''
      // }
    }

    let renderHp = reactive({
      hp: []
    })
    function handleLocationChange(value: string) {
      if (value === '02') {
        renderHp.hp = cloneDeep(innitHp)
        if (dialogs.create) {
          allCheck.value = true
          form.heatingPoint = renderHp.hp.map(item => item.value)
          return
        }
        allCheck.value = form.heatingPoint.length == renderHp.hp.length
      } else {
        renderHp.hp = []
        // form.heatingPoint = []
      }
    }

    async function editClick(row: any) {
      tdcId = row.tdcId
      const res = (await request('queryDiscoverCarouselById', { tdcId: row.tdcId })).data.obj
      let { heatingPoint = [] } = res
      heatingPoint = heatingPoint.map(hp => String(hp))
      res.heatingPoint = heatingPoint
      renderHp.hp = heatingPoint.length > 0 ? cloneDeep(innitHp) : []
      allCheck.value = heatingPoint.length === renderHp.hp.length
      objectForeach(form, (_, key) => {
        form[key] = res[key]
      })

      form.tdcUids = res.tdcUids || []
      form.date = [new Date(dayjs(res.tdcStartDate).valueOf()), new Date(dayjs(res.tdcEndDate).valueOf())]
      dialogs.edit = true
    }

    async function detailClick(row: any) {
      const res = (await request('queryDiscoverCarouselById', { tdcId: row.tdcId })).data.obj
      let { heatingPoint = [] } = res
      heatingPoint = heatingPoint.map(hp => String(hp))
      res.heatingPoint = heatingPoint
      renderHp.hp = heatingPoint.length > 0 ? cloneDeep(innitHp) : []
      objectForeach(form, (_, key) => {
        form[key] = res[key]
      })
      form.tdcUids = res.tdcUids || []
      form.date = [new Date(dayjs(form.tdcStartDate).valueOf()), new Date(dayjs(form.tdcEndDate).valueOf())]
      dialogs.detail = true
    }

    const queryComponents = [
      {
        label: '内容标题',
        component: 'el-input',
        key: 'title',
        placeholder: '请输入内容标题',
        props: {
          clearable: true
        }
      },
      {
        label: '有效日期',
        component: 'el-date-picker',
        key: 'date',
        props: {
          startPlaceholder: '开始时间',
          endPlaceholder: '结束时间',
          type: 'daterange',
        },
        listeners: {
          change(value: Date[]) {
            queryValue.startDate = value ? dayjs(value[0]).format('YYYYMMDD') : ''
            queryValue.endDate = value ? dayjs(value[1]).format('YYYYMMDD') : ''
          }
        }
      },
      {
        label: '位置',
        component: 'BaseSelect',
        key: 'location',
        props: {
          options: [
            {
              label: '点餐页',
              value: '02'
            },
            {
              label: '福利社',
              value: '05'
            },
            // {
            //   label: '健身',
            //   value: '01-01'
            // },
            // {
            //   label: '慢病',
            //   value: '01-02'
            // },
            // {
            //   label: '企业',
            //   value: '01-03'
            // },
            // {
            //   label: '少儿',
            //   value: '01-04'
            // }
          ],
          clearable: true
        }
      },
      {
        label: '状态',
        component: 'BaseSelect',
        key: 'stt',
        props: {
          options: [
            {
              label: '上线',
              value: '01'
            },
            {
              label: '下线',
              value: '00'
            }
          ],
          clearable: true
        }
      },
      {
        slot: () => (
          <>
            <el-button onClick={getList} type="primary">搜索</el-button>
          </>
        )
      },
      {
        slot: () => (
          <div style="text-align: right">
            <el-button type="success" onClick={createCamper}>新建Banner</el-button>
          </div>
        )
      }
    ]

    // function deleteBanner(row: any) {
    //   ElMessageBox.confirm('是否删除该Banner？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     request('deleteBanner', {
    //       tdcId: row.tdcId
    //     }).thenwrap((err) => {
    //       if (!err) {
    //         ElMessage.success('删除成功')
    //         getList()
    //       } else {
    //         ElMessage.error(err.errMsg)
    //       }
    //     })
    //   })
    // }

    function updateStatusClick(status: string, id: string) {
      request('updateDiscoverCarouselState', {
        opType: status,
        tdcId: id
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('修改状态成功')
          getList()
        }
      })
    }

    const tableColumns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '标题',
        prop: 'tdcTitle'
      },
      {
        label: '封面',
        prop: 'tdcImgUrl',
        slot: {
          default: ({ row }: { row: any }) => (
            <el-image src={row.tdcImgUrl} preview-src-list={[row.tdcImgUrl]} />
          )
        }
      },
      {
        label: '跳转',
        prop: 'tdcLinkTypeDesc',
        slot: {
          default: ({ row }: { row: any }) => (
            row.tdcLinkType === '03'
              ? <el-image style="max-height: 50px;max-width: 50px;" src={row.tdcLink} preview-src-list={[row.tdcLink]}></el-image>
              : <span>{row.tdcLinkTypeDesc}</span>
          )
        }
      },
      {
        label: '展示位置',
        prop: 'tdcLocationDesc'
      },
      {
        label: '有效期',
        prop: 'tdcDate'
      },
      {
        label: '展示人群',
        prop: 'tdcCrowdDesc'
      },
      {
        label: '排序',
        prop: 'tdcSort'
      },
      {
        label: '状态',
        prop: 'tdcSttDesc'
      },
      {
        label: '最后操作人',
        prop: 'tdcUpdator'
      },
      {
        label: '最后操作时间',
        prop: 'tdcUtime'
      },
      {
        label: '操作',
        width: 100,
        align: 'center',
        slot: {
          default: ({ row }: { row: any }) =>
            <>
              <div>
                <el-button size="small" type="primary" onClick={() => editClick(row)}>编辑</el-button >
              </div>
              <div style="margin: 8px 0">
                {
                  row.tdcStt === '01'
                    ? <el-button size="small" type="warning" onClick={() => updateStatusClick('00', row.tdcId)}>下线</el-button >
                    : <el-button size="small" type="warning" onClick={() => updateStatusClick('01', row.tdcId)}>上线</el-button >
                }
              </div>
              <div>
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
            params.tdcStartDate = dayjs(params.date[0]).format('YYYYMMDD')
            params.tdcEndDate = dayjs(params.date[1]).format('YYYYMMDD')
            if (type === 'edit') {
              params.tdcId = tdcId
            }
            const res = await request('updateDiscoverCarousel', params)

            if (res.data.errCode !== 0) {
              ElMessage.error(res.data.errMsg)
            } else {
              ElMessage.success('保存成功')
              dialogs.create = false
              dialogs.edit = false
              getList()
            }
          } catch (e) { }
        }
        done()
      })
    }

    function downloadTemplateClick() {
      exportExcel({
        data: [],
        columns: [
          {
            prop: 'phone',
            label: '微信手机号'
          }
        ],
        filename: 'banner用户导入模板'
      })
    }

    function handleImport(importData: any[]) {
      importLoading.value = true
      request('queryUserListByPhone', {
        phones: importData.map(item => item['微信手机号'])
      }).thenwrap((err, res) => {
        if (!err) {
          form.tdcUids = res
          if (formRef.create.value.validateField) formRef.create.value.validateField('tdcCrowd')
          if (formRef.edit.value.validateField) formRef.edit.value.validateField('tdcCrowd')
        } else {
          ElMessage.error(err.errMsg)
        }
      }).finally(() => importLoading.value = false)
    }

    const FormItems = () => (<>
      <el-form-item label="内容标题" prop="tdcTitle">
        <el-input v-model={form.tdcTitle} placeholder="请输入内容标题"></el-input>
      </el-form-item>
      <el-form-item label="内容封面" prop="tdcImgUrl">
        <UploadImage v-model={form.tdcImgUrl} />
      </el-form-item>
      <el-form-item label="跳转链接" prop="tdcLink">
        <el-radio-group v-model={form.tdcLinkType} onChange={handleTypeChange}>
          {
            contentTypeOptions.map(item => <el-radio key={item.value} label={item.value}>{item.label}</el-radio>)
          }
        </el-radio-group>
        {
          form.tdcLinkType == '01' || form.tdcMiniType ?
            <el-form-item>
              <el-radio-group onChange={minitypeChange} v-model={form.tdcMiniType} >
                <el-radio label="10">Smartfood</el-radio>
                <el-radio label="20">第三方小程序</el-radio>
              </el-radio-group></el-form-item> : ''

        }
        {
          form.tdcMiniType === '20' && form.tdcLinkType != '03' ?
            <el-input v-model={form.tdcAppid} placeholder="请输入小程序APPID" ></el-input> : ''
        }
        {
          showLink(form.tdcLinkType)
            ? (form.tdcLinkType === '03'
              ? <UploadImage v-model={form.tdcLink} />
              : <el-input v-model={form.tdcLink} placeholder="请输入跳转链接"></el-input>)
            : null
        }
      </el-form-item>

      <el-form-item label="展示位置" prop="tdcLocation" >
        <div>
          <el-radio-group v-model={form.tdcLocation} onChange={handleLocationChange}>
            {/* <el-radio label="01">发现页</el-radio> */}
            <el-radio label="02">点餐页</el-radio>
            {/* <el-radio label="03">领券中心</el-radio> */}
            <el-radio label="05">福利社</el-radio>
          </el-radio-group>
        </div>
        <div>
          {/* {
            form.tdcLocation === '01'
              ? <el-radio-group v-model={form.tdcTarget}>
                {
                  targetOptions.map(item => <el-radio label={item.value}>{item.label}</el-radio>)
                }
              </el-radio-group>
              : null
          } */}
        </div>
      </el-form-item>
      {/* 点餐门店 */}
      <el-form-item v-show={renderHp.hp.length > 0}>
        <el-checkbox onchange={handleCheckAllChange} v-model={allCheck.value} label={true}>全选</el-checkbox>
        <el-checkbox-group v-model={form.heatingPoint} onchange={handleCheckChange}>
          {
            renderHp.hp.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
          }
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="有效期" prop="date">
        <el-date-picker v-model={form.date} start-placeholder="开始日期" end-placeholder="结束日期" type="daterange"></el-date-picker>
      </el-form-item>
      <el-form-item label="排序" prop="tdcSort">
        <NumberInput v-model={form.tdcSort} style="width: 240px;" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="展示人群" prop="tdcCrowd">
        <div>
          <el-radio-group v-model={form.tdcCrowd} onChange={() => form.tdcUids = []}>
            <el-radio label="01">全量用户</el-radio>
            <el-radio label="02">自定义用户</el-radio>
          </el-radio-group>
          {
            form.tdcCrowd === '02'
              ? <div style="margin-left: 8px; display: inline-block;">
                <ImportExcel onImport={handleImport}>
                  <el-button size="small" loading={importLoading.value}>导入名单</el-button>
                </ImportExcel>
                <span class="table-action-label" onClick={downloadTemplateClick}>下载模板</span>
              </div>
              : null
          }
        </div>
        {
          form.tdcCrowd === '02' && form.tdcUids.length > 0
            ? <div>
              <el-table data={form.tdcUids} border stripe max-height="500px">
                {
                  importTableColumns.map(item => <el-table-column v-slots={item.slot} {...item} key={item.label}></el-table-column>)
                }
              </el-table>
              <span>总计人数：{form.tdcUids.length}</span>
            </div>
            : null
        }
      </el-form-item>
    </>)

    getList()
    initialData()
    return () => (
      <div class="page-container padding-20" >
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryComponents} action={false} span={6} semi></QueryComponents>
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
        <ConfirmDialog v-model={dialogs.create} title="新建Banner" onOnConfirm={(done: () => any) => saveClick('create', done)} async-confirm center>
          <el-form ref={formRef.create} model={form} rules={formRules.value} label-width="100px" validate-on-rule-change={false}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogs.edit} title="编辑Banner" onOnConfirm={(done: () => any) => saveClick('edit', done)} async-confirm center>
          <el-form ref={formRef.edit} model={form} rules={formRules.value} label-width="100px" validate-on-rule-change={false}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <el-dialog v-model={dialogs.detail} title="Banner详情">
          <el-form label-width="80px">
            <el-form-item label="标题">
              <span>{form.tdcTitle}</span>
            </el-form-item>
            <el-form-item label="封面">
              <el-image style="max-width: 300px; max-height: 300px;" src={form.tdcImgUrl}></el-image>
            </el-form-item>
            <el-form-item label="跳转链接">
              <el-radio-group v-model={form.tdcLinkType} disabled>
                {
                  contentTypeOptions.map(item => <el-radio key={item.value} label={item.value}>{item.label}</el-radio>)
                }
              </el-radio-group>
              {
                form.tdcLinkType === '01' ?
                  //
                  <el-form-item>
                    <el-radio-group disabled v-model={form.tdcMiniType} >
                      <el-radio label="10">Smartfood</el-radio>
                      <el-radio label="20">第三方小程序</el-radio>
                    </el-radio-group></el-form-item> : ''
              }
              {
                form.tdcMiniType === '20' && form.tdcLinkType != '03' ?
                  form.tdcAppid : ''
              }
              <div>{
                form.tdcLinkType === '03'
                  ? <img src={form.tdcLink} style="max-width: 300px; max-height: 300px;" />
                  : form.tdcLink
              }</div>



            </el-form-item>
            <el-form-item label="展示位置">
              <div>
                <el-radio-group v-model={form.tdcLocation} onChange={handleLocationChange} disabled>
                  {/*<el-radio label="01">发现页</el-radio>*/}
                  <el-radio label="02">点餐页</el-radio>
                  {/*<el-radio label="03">领券中心</el-radio>*/}
                  <el-radio label="05">福利社</el-radio>
                </el-radio-group>
              </div>
              <div>
                {/* {
                  form.tdcLocation === '01'
                    ? <el-radio-group v-model={form.tdcTarget} disabled>
                      {
                        targetOptions.map(item => <el-radio label={item.value}>{item.label}</el-radio>)
                      }
                    </el-radio-group>
                    : null
                } */}
              </div>
            </el-form-item>
            {/* 点餐门店 */}
            <el-form-item>
              <el-checkbox-group v-model={form.heatingPoint} disabled>
                {
                  renderHp.hp.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                }
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="有效期">
              <span>{form.date.map(d => dayjs(d).format('YYYY-MM-DD')).join('-')}</span>
            </el-form-item>
            <el-form-item label="排序">
              <span>{form.tdcSort}</span>
            </el-form-item>
            <el-form-item label="展示人群" prop="tdcCrowd">
              <el-radio-group v-model={form.tdcCrowd} disabled>
                <el-radio label="01">全量用户</el-radio>
                <el-radio label="02">自定义用户</el-radio>
              </el-radio-group>
              {
                form.tdcCrowd === '02' && form.tdcUids.length > 0
                  ? <div>
                    <el-table data={form.tdcUids} border stripe max-height="500px">
                      {
                        importTableColumns
                          .slice(0, importTableColumns.length - 1)
                          .map(item => <el-table-column v-slots={item.slot} {...item} key={item.label}></el-table-column>)
                      }
                    </el-table>
                  </div>
                  : null
              }
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    )
  }
})