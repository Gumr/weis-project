import { defineComponent, reactive, inject, ref, Ref, nextTick, computed } from 'vue'
import req, { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UploadImage from '@/components/UploadImage'
import { ElMessage, ElForm, ElMessageBox } from 'element-plus'
import { ExtractOptionsValues } from '@/utils/data-map'
import dayjs from 'dayjs'
import { objectForeach } from '@/utils/common'
import exportExcel from '@/utils/export-excel'
import ImportExcel from '@/components/ImportExcel.vue'
import { createLogger } from '_vite@2.1.2@vite'

const { http, request } = requestFactor('article.DietDialog', true)

export default defineComponent({
  name: 'pcl_dialog-list',
  setup() {
    const loading = inject('vloading') as Ref<boolean>
    const page = reactive({
      pageNo: 1,
      pageSize: 10
    })
    const queryValue = reactive({
      title: '',
      date: [],
      startDate: '',
      endDate: '', // 结束日期
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
          default: ({ $index }: { $index: number }) => <el-button type="danger" size="small" onClick={() => form.tddUids.splice($index, 1)}>删除</el-button>
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
      }
    ] as const
    const importLoading = ref(false)
    // const targetOptions = [
    //   {
    //     label: '健身',
    //     value: '01'
    //   },
    //   {
    //     label: '慢病',
    //     value: '02'
    //   },
    //   {
    //     label: '企业',
    //     value: '03'
    //   },
    //   {
    //     label: '少儿',
    //     value: '04'
    //   }
    // ] as const
    const typeOptions = [
      {
        label: '开盒有礼',
        value: '01'
      },
      {
        label: '自定义弹窗',
        value: '10'
      }
    ]
    const locationOptions = [
      {
        label: '发现页',
        value: '01'
      },
      {
        label: '点餐页',
        value: '02'
      },
      {
        label: '数据页',
        value: '03'
      },
      // {
      //   label: '方案页',
      //   value: '04'
      // }
      {
        label: '福利社',
        value: '05'
      }
    ] as const
    const frequencyOptions = [
      {
        label: '只弹一次',
        value: '01'
      },
      {
        label: '一天弹一次',
        value: '02'
      }
    ] as const

    interface User {
      uid: string
      uname: string
      phone: string
    }
    let tddId: string
    let innitData: []
    function createForm() {
      return {
        date: [] as Date[],
        tddType: '10',
        tddTitle: '', // 标题
        // tddType: '01',
        // tddTitle: '开盒有礼', // 标题
        tddImgUrl: '', // 封面图
        tddLinkType: '00', // 内容类型 01:小程序路径 02:链接 03:图片
        tddLink: '', // 内容链接
        tddStartDate: '', // 有效期开始
        tddEndDate: '', // 有效期结束
        tddLocation: '01',
        tddCrowd: '01',
        // tddSort: '',
        tddFrequency: '01',
        tddUids: [] as User[],
        tddAppid: '',
        tddMiniType: '',
        userScreen: {
          registerDate: '0',
          orderFrequencyDay: '',
          orderFrequencyB: '',
          orderFrequencyE: '',
          newOldUser: [],
          eatMethod: [],
          member: [],
          sex: [],
          recharge: [],
          heatingPoint: []
        }
      }
    }

    function showLink(type: string): boolean {
      return type !== '00'
    }
    const form = reactive(createForm())
    const table = reactive({
      data: [],
      total: 0,
      // page: {
      //   pageNo: 1,
      //   pageSize: 10
      // }
    })

    const formRules = computed(() => {
      const rules: Record<string, any> = {
        tddType: { required: true, message: '请选择类型', trigger: 'change' },
        date: { required: true, type: 'array', message: '请输入有效期', trigger: 'blur' },
        tddFrequency: { required: true, message: '请选择频次', trigger: 'change' },
        tddCrowd: {
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value === '02') {
              if (form.tddUids.length <= 0) {
                callback('自定义用户，导入用户名单不能为空')
                return
              }
            }
            callback()
          }
        },
        tddLocation: { required: true, message: '请选择展示位置', trigger: 'change' },
        'userScreen.orderFrequencyDay': { required: true, message: '请选择类型', trigger: 'blur' },
      }

      if (form.tddType === '10') {
        rules.tddLink = {
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (showLink(form.tddLinkType)) {
              if (!value) {
                callback('请输入跳转链接')
                return
              }
            }
            callback()
          }
        }
        rules.tddImgUrl = { required: true, message: '请输入封面图', trigger: 'change' }
        rules.tddTitle = { required: true, message: '请输入标题', trigger: 'blur' }
      }

      return rules
    })
    function initialData() {
      http('initialData', {
      })
        .thenwrap((err, data) => {
          if (!err) {
            innitData = data
            form.userScreen.heatingPoint = innitData.heatingPoint.map(item => item.value)
          }
        })
    }
    function getList() {
      return http('queryDietDialogPage', {
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
      form.userScreen.heatingPoint = innitData.heatingPoint.map(item => item.value)
      dialogs.create = true
      allCheck.value = true
      nextTick(formRef.create.value.resetFields)
    }

    let allCheck = ref(false)
    function handleCheckAllChange() {
      const { heatingPoint: initHp } = innitData
      const { userScreen: { heatingPoint } } = form
      form.userScreen.heatingPoint = allCheck.value ? initHp.map(item => item.value) : []
    }

    function handleLinkTypeChange(value: ExtractOptionsValues<typeof contentTypeOptions>) {
      // if (!showLink(value)) {
      form.tddLink = ''
      // }
    }

    function minitypeChange(value: string) {
      // if (value === '02') {
      form.tddAppid = ''
      // }
    }

    // function handleLocationChange(value: string) {
    //   if (value === '02') {
    //     form.tddTarget = ''
    //   }
    // }

    async function editClick(row: any) {
      tddId = row.tddId
      const res = (await request('queryDietDialogInfo', { tddId: row.tddId })).data.obj
      if (res.userScreen) {
        let { heatingPoint = [] } = res.userScreen
        heatingPoint = heatingPoint.map(hp => String(hp))
        res.userScreen.heatingPoint = heatingPoint
        allCheck.value = heatingPoint.length === innitData.heatingPoint.length
      }
      objectForeach(form, (_, key) => {
        form[key] = res[key]
      })
      form.tddLocation = res.tddLocation[0]
      form.tddUids = res.tddUids || []
      form.date = [new Date(dayjs(res.tddStartDate).valueOf()), new Date(dayjs(res.tddEndDate).valueOf())]
      if (form.userScreen) {
        form.userScreen.registerDate = String(form.userScreen.registerDate)
      } else {
        form.userScreen = {
          registerDate: '',
          orderFrequencyB: '',
          orderFrequencyE: '',
          newOldUser: [],
          eatMethod: [],
          member: [],
          sex: [],
          recharge: [],
          heatingPoint: []
        }

      }

      dialogs.edit = true
    }

    async function detailClick(row: any) {
      const res = (await request('queryDietDialogInfo', { tddId: row.tddId })).data.obj
      if (res.userScreen) {
        let { heatingPoint = [] } = res.userScreen
        heatingPoint = heatingPoint.map(hp => String(hp))
        res.userScreen.heatingPoint = heatingPoint
        allCheck.value = heatingPoint.length === innitData.heatingPoint.length
      }

      objectForeach(form, (_, key) => {
        form[key] = res[key]
      })
      form.tddLocation = res.tddLocation[0]
      form.tddUids = res.tddUids || []
      form.date = [new Date(dayjs(form.tddStartDate).valueOf()), new Date(dayjs(form.tddEndDate).valueOf())]
      if (form.userScreen) {
        form.userScreen.registerDate = String(form.userScreen.registerDate)
      } else {
        form.userScreen = {
          registerDate: '',
          orderFrequencyB: '',
          orderFrequencyE: '',
          newOldUser: [],
          eatMethod: [],
          member: [],
          sex: [],
          recharge: []
        }

      }
      dialogs.detail = true
    }

    const queryComponents = [
      {
        label: '标题',
        component: 'el-input',
        key: 'title',
        placeholder: '请输入标题',
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
            <el-button type="success" onClick={createCamper}>新建弹窗</el-button>
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
    //       tddId: row.tddId
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
      request('updateDietDialogState', {
        opType: status,
        tddId: id
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('修改状态成功')
          getList()
        } else {
          ElMessage.error(err.errMsg)
        }
      })
    }

    const tableColumns = [
      {
        label: '序号',
        type: 'index'
      },
      {
        label: '类型',
        prop: 'tddTypeDesc'
      },
      {
        label: '标题',
        prop: 'tddTitle'
      },
      {
        label: '封面',
        prop: 'tddImgUrl',
        slot: {
          default: ({ row }: { row: any }) => (
            row.tddImgUrl ? <el-image src={row.tddImgUrl} preview-src-list={[row.tddImgUrl]} /> : null
          )
        }
      },
      {
        label: '跳转链接',
        prop: 'tddLinkTypeDesc',
        // slot: {
        //   default: ({ row }: { row: any }) => (
        //     row.tddLinkType === '03'
        //       ? <el-image style="max-height: 50px;max-width: 50px;" src={row.tddLink} preview-list={[row.tddLink]}></el-image>
        //       : <span>{row.tddLinkTypeDesc}</span>
        //   )
        // }
      },
      {
        label: '展示位置',
        prop: 'tddLocationDesc'
      },
      {
        label: '弹窗频次',
        prop: 'tddFrequencyDesc'
      },
      {
        label: '有效期',
        prop: 'tddDate'
      },
      {
        label: '展示人群',
        prop: 'tddCrowdDesc'
      },
      {
        label: '状态',
        prop: 'tddSttDesc'
      },
      {
        label: '最后操作人',
        prop: 'tddUpdator'
      },
      {
        label: '最后操作时间',
        prop: 'tddUtime'
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
                  row.tddStt === '01'
                    ? <el-button size="small" type="warning" onClick={() => updateStatusClick('00', row.tddId)}>下线</el-button >
                    : <el-button size="small" type="warning" onClick={() => updateStatusClick('01', row.tddId)}>上线</el-button >
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
            params.tddLocation = [params.tddLocation]
            params.tddStartDate = dayjs(params.date[0]).format('YYYYMMDD')
            params.tddEndDate = dayjs(params.date[1]).format('YYYYMMDD')
            if (params.userScreen.orderFrequencyDay && (!params.userScreen.orderFrequencyB || !params.userScreen.orderFrequencyE)) {
              ElMessage.error('订餐频次不能为空')
              done()
              return
            }
            if (type === 'edit') {
              params.tddId = tddId
            }
            const res = await request('updateDietDialog', params)

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
      req('discover.DiscoverCarousel/queryUserListByPhone', {
        phones: importData.map(item => item['微信手机号'])
      }).thenwrap((err, res) => {
        if (!err) {
          form.tddUids = res
          if (formRef.create.value.validateField) formRef.create.value.validateField('tddCrowd')
          if (formRef.edit.value.validateField) formRef.edit.value.validateField('tddCrowd')
        } else {
          ElMessage.error(err.errMsg)
        }
      }).finally(() => importLoading.value = false)
    }

    const FormItems = (props: { detail?: boolean }) => (<>
      <el-form-item label="类型" prop="tddType">
        <BaseSelect v-model={form.tddType} options={typeOptions} disabled={props.detail} onChange={(type: string) => form.tddTitle = type === '01' ? '开盒有礼' : ''}></BaseSelect>
      </el-form-item>
      {
        form.tddType === '10'
          ? <>
            <el-form-item label="标题" prop="tddTitle">

              <el-input v-model={form.tddTitle} placeholder="请输入内容标题" disabled={props.detail}></el-input>
            </el-form-item>
            <el-form-item label="封面" prop="tddImgUrl">
              {
                props.detail
                  ? <img style="max-width: 300px; max-height: 300px;" src={form.tddImgUrl} />
                  : <UploadImage v-model={form.tddImgUrl} />
              }
              <span>（尺寸：600 * 800）</span>
            </el-form-item>
            <el-form-item label="跳转链接" prop="tddLink">
              <el-radio-group v-model={form.tddLinkType} onChange={handleLinkTypeChange} disabled={props.detail}>
                {
                  contentTypeOptions.map(item => <el-radio key={item.value} label={item.value}>{item.label}</el-radio>)
                }
              </el-radio-group>


              {
                form.tddLinkType === '01' ?
                  //
                  <el-form-item>
                    <el-radio-group onChange={minitypeChange} disabled={props.detail} v-model={form.tddMiniType} >
                      <el-radio label="10">Smartfood</el-radio>
                      <el-radio label="20">第三方小程序</el-radio>
                    </el-radio-group></el-form-item> : ''
              }
              {
                form.tddMiniType === '20' && form.tddLinkType != '03' ?
                  <el-input disabled={props.detail} v-model={form.tddAppid} placeholder="请输入小程序APPID" ></el-input> : ''
              }
              {
                showLink(form.tddLinkType)
                  ? (form.tddLinkType === '03'
                    ? (props.detail ? <img style="max-width: 300px; max-height: 300px;" src={form.tddLink} /> : <UploadImage v-model={form.tddLink} />)
                    : <el-input v-model={form.tddLink} placeholder="请输入跳转链接" disabled={props.detail}></el-input>)
                  : null
              }
            </el-form-item>
          </>
          : <el-form-item label="标题" prop="tddTitle">
            <span>{form.tddTitle}</span>
          </el-form-item>
      }
      <el-form-item label="展示位置" prop="tddLocation" >
        <div>
          <el-radio-group v-model={form.tddLocation} disabled={props.detail}>
            {
              locationOptions.map(item => <el-radio label={item.value}>{item.label}</el-radio>)
            }
          </el-radio-group>
        </div>
      </el-form-item>
      <el-form-item label="弹窗频次" prop="tddFrequency">
        <el-radio-group v-model={form.tddFrequency} disabled={props.detail}>
          {
            frequencyOptions.map(item => <el-radio label={item.value}>{item.label}</el-radio>)
          }
        </el-radio-group>
      </el-form-item>
      <el-form-item label="有效期" prop="date">
        <el-date-picker disabled={props.detail} v-model={form.date} start-placeholder="开始日期" end-placeholder="结束日期" type="daterange"></el-date-picker>
      </el-form-item>
      <el-form-item label="展示人群" prop="tddCrowd">
        <div>
          <el-radio-group v-model={form.tddCrowd} onChange={() => form.tddUids = []} disabled={props.detail}>
            <el-radio label="01">全量用户</el-radio>
            <el-radio label="03">用户筛选</el-radio>
            <el-radio label="02">自定义用户</el-radio>
          </el-radio-group>
          {
            (form.tddCrowd === '02' && !props.detail)
              ? <div style="margin-left: 8px; display: inline-block;">
                <ImportExcel onImport={handleImport}>
                  <el-button size="small" loading={importLoading.value}>导入名单</el-button>
                </ImportExcel>
                <span class="table-action-label" onClick={downloadTemplateClick}>下载模板</span>
              </div>
              : (form.tddCrowd === '03')
                ? <div>
                  <h3>注册时间</h3>
                  <el-radio-group v-model={form.userScreen.registerDate} disabled={props.detail}>
                    {
                      innitData.registerDate.map(item => <el-radio key={item.value} label={item.value}>{item.label}</el-radio>)
                    }
                  </el-radio-group>
                  <h3>订餐频次</h3>
                  <div>近<NumberInput style="width: 100px;" v-model={form.userScreen.orderFrequencyDay} disabled={props.detail} />天，用餐 <NumberInput style="width: 250px;" disabled={props.detail} v-model={form.userScreen.orderFrequencyB} /> -- <NumberInput style="width: 250px;" v-model={form.userScreen.orderFrequencyE} disabled={props.detail} /> 次</div>
                  <h3>用户标签</h3>
                  <div>新/老用户</div>
                  <el-checkbox-group v-model={form.userScreen.newOldUser} disabled={props.detail}>
                    {
                      innitData.newOldUser.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                    }
                  </el-checkbox-group >
                  <div>吃法</div>
                  <el-checkbox-group v-model={form.userScreen.eatMethod} disabled={props.detail}>
                    {
                      innitData.eatMethod.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                    }
                  </el-checkbox-group>
                  <div>会员 </div>
                  <el-checkbox-group v-model={form.userScreen.member} disabled={props.detail}>
                    {
                      innitData.member.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                    }
                  </el-checkbox-group>
                  <div>性别 </div>
                  <el-checkbox-group v-model={form.userScreen.sex} disabled={props.detail}>
                    {
                      innitData.sex.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                    }
                  </el-checkbox-group>
                  <div>充值</div>
                  <el-checkbox-group v-model={form.userScreen.recharge} disabled={props.detail}>
                    {
                      innitData.recharge.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                    }
                  </el-checkbox-group>
                  {/* 点餐页才显示门店 */}
                  {form.tddLocation === '02' ? <div className="shop-box">
                    <div>门店</div>
                    <el-checkbox onchange={handleCheckAllChange} v-model={allCheck.value} label={true}>全选</el-checkbox>
                    <el-checkbox-group v-model={form.userScreen.heatingPoint} disabled={props.detail}>
                      {
                        innitData.heatingPoint.map(item => <el-checkbox label={item.value}>{item.label}</el-checkbox>)
                      }
                    </el-checkbox-group>
                  </div> : null}
                </div>
                : null
          }
        </div>
        {
          form.tddCrowd === '02' && form.tddUids.length > 0
            ? <div>
              <el-table data={form.tddUids} border stripe max-height="500px">
                {
                  (props.detail ? importTableColumns.slice(0, importTableColumns.length - 1) : importTableColumns).map(item => <el-table-column v-slots={item.slot} {...item} key={item.label}></el-table-column>)
                }
              </el-table>
              <span v-show={!props.detail}>总计人数：{form.tddUids.length}</span>
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
          data={table.data}
          total={table.total}
          v-models={[
            [page.pageNo, 'current-page'],
            [page.pageSize, 'page-size']
          ]}
          onPageChange={getList}
        >
          {
            tableColumns.map(col => <el-table-column {...col} key={col.prop} v-slots={col.slot}></el-table-column>)
          }
        </BasePageTable>
        <ConfirmDialog v-model={dialogs.create} title="新建弹窗" onOnConfirm={(done: () => any) => saveClick('create', done)} async-confirm center>
          <el-form ref={formRef.create} model={form} rules={formRules.value} label-width="100px" validate-on-rule-change={false}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogs.edit} title="编辑弹窗" onOnConfirm={(done: () => any) => saveClick('edit', done)} async-confirm center>
          <el-form ref={formRef.edit} model={form} rules={formRules.value} label-width="100px" validate-on-rule-change={false}>
            <FormItems />
          </el-form>
        </ConfirmDialog>
        <el-dialog v-model={dialogs.detail} title="弹窗详情">
          <el-form label-width="80px">
            <FormItems detail />
          </el-form>
        </el-dialog>
      </div>
    )
  }
})
