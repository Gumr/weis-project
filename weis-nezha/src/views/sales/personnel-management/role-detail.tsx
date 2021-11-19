import {
  defineComponent,
  reactive,
  inject,
  ref,
  computed,
  nextTick,
  onActivated,
  Ref,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import request, { requestFactor } from '@/utils/request'
import dayjs from 'dayjs'
import { getKeys, objectForeach } from '@/utils/common'
import exportExcel from '@/utils/export-excel'
import { ElMessage, ElForm } from 'element-plus'
import UploadImage from '@/components/UploadImage'
import SelectTree from '@/components/SelectTree.vue'
const { request: requestMethod, http } = requestFactor('sale.SaleEmployee')

export default defineComponent({
  name: 'sales_personnel-management_role-detail',
  setup() {
    const route = useRoute()
    const EditRef = ref({}) as Ref<typeof ElForm>
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const TableRef = ref({})
    const pushRoute = inject('pushRoute')
    const loading = inject('vloading') as Ref<boolean>
    const nikeName = ref('')
    const RoleMap = reactive({}) as Record<string, unknown>
    // const formDomain = ref([])
    const initForm = () => ({
      tseId: '', // 人员ID 有则更新 无则新增
      tseRoleId: [] as string[], // 角色id
      // tseDepartmentId: [], // 部门id
      tseDepartmentId: '', // 所属上级id
      tseType: '02', // 人员类型 01：外部 02：内部
      tsePhone: '', // 手机
      tseName: '', // 名称
      tseDepartmentName: '', // 部门名称
      tseRoleName: '', // 角色名称
      tseQrcodeUrl: '',//渠道码
      // tseIdCard: '', // 身份证号
      // tseEmail: '', // 邮箱
      // tseBankCard: '', // 银行卡号
      // tseBankName: '', // 银行名称
      // tseBankBranch: '', // 银行支行
      // tseAccountName: '', // 开户人
      // tseTaxpayerType: '', // 纳税人类型
      // tseChannelType: '', // 渠道类别
      tseChannelRate: '', // 渠道提成比
      // tseGoal: '' // 服务领域 多个逗号隔开
      tseProperty: '',//人员属性
    })
    const form = reactive(initForm())
    // const cascaderProps = {
    //   checkStrictly: true,
    //   label: 'name',
    //   value: 'id'
    // }
    const dialogVisible = reactive({ // 控制弹窗可见 集合
      create: false,
      edit: false,
      detail: false,
      relative: false // 关联项目
    })
    const data = reactive({
      list: [],
      total: 0
    })

    // const cascaderValue = reactive({
    //   department: ''
    // })
    const typeOptions = [
      {
        label: '内部',
        value: '02'
      },
      {
        label: '外部',
        value: '01'
      }
    ]
    const consociationOption = [
      {
        label: '对公',
        value: '10'
      },
      {
        label: '个人',
        value: '20'
      }
    ]
    type RoleItem = {
      tsrId: string
      tsrName: string
      tsrType: string
    }
    const options = reactive({
      sourceRole: [] as RoleItem[],
      role: [] as RoleItem[],
      department: [],
      domain: [],
      parent: [],
      employeeList: [],
    })
    const addInfo = ref([]) as Ref<EmployeeForm[]>
    const formRules = computed(() => {
      const rules: Record<string, unknown> = {
        tseRoleId: {
          type: 'array', message: '请选择角色', required: true, trigger: 'change'
        },
        tseDepartmentId: {
          type: 'string', message: '请选择部门', required: true, trigger: 'change'
        },
        tsePhone: {
          type: 'string', message: '请输入手机号', required: true, trigger: 'blur'
        },
        tseName: {
          type: 'string', message: '请输入名称', required: true, trigger: 'blur'
        },
        tseProperty:{
          type: 'string', message: '请选择人员属性', required: true, trigger: 'change'
        }
      }

      return rules
    })



    function getList() {
      http('querySaleEmployeePageByPhone', {
        ...page,
        phone: route.query.phone
      })
        .thenwrap((err, { dataPage }) => {
          if (!err) {
            data.list = dataPage.record
            data.total = dataPage.totalRecordCount
          }
        })
    }

    function updateSaleEmployee() {
      const params = {
        tseId: form.tseId,
        ...addInfo.value[0]
      }
      delete params.$roleName
      // params.tseDepartmentId = cascaderValue.department

      return requestMethod('updateSaleEmployee', params)
    }
    function getNickName() {
      request('Customer/queryCustomerByPhone', {
        phone: form.tsePhone
      }).thenwrap((err, res) => {
        if (!err) {
          nikeName.value = res.uname
        } else {
          nikeName.value = ''
        }
      })
    }

    function batchAddSaleEmployee() {
      return requestMethod('batchAddSaleEmployee', {
        addInfo: addInfo.value
      })
    }

    function checkAddInfo() {
      // debugger
      let index2 = 0
      const index = addInfo.value
        .filter(item => RoleMap[item.tseRoleId] !== '2B拓展经理'&& RoleMap[item.tseRoleId] !== '主管')
        .findIndex(item => {
          if (item.$roleName == '客户经理(内部)') {
            index2 = 1
            return true
          }
          for (const key of getKeys(item)) {
            const value = item[key]
            if (Array.isArray(value) ? value.length <= 0 : !Boolean(value)) return true
          }
          return false
        })

      return index !== -1  && index2 != 1 ? `第${index + 1}项角色信息未填写完整` : null
    }

    function appendForm() {
      addInfo.value.forEach(i => {
        i.tsePhone = form.tsePhone
        i.tseName = form.tseName
        i.tseDepartmentId = form.tseDepartmentId
        i.tseProperty =form.tseProperty 
      })
    }

    function handleEditDialogConfirm() {
      EditRef.value.validate((valid: boolean) => {
        if (valid) {
          appendForm()
          const msg = checkAddInfo()
          if (msg) {
            ElMessage.error(msg)
            return
          }
          updateSaleEmployee()
            .thenwrap((err) => {
              if (!err) {
                getList()
                ElMessage.success('修改成功')
                dialogVisible.edit = false
              } else {
                ElMessage.error(err.errMsg)
              }
            })
        }
      })
    }

    function handlePhoneBlur() {
      if (form.tsePhone.length > 0) {
        getNickName()
      } else {
        nikeName.value = ''
      }
    }

    function updateSaleEmployeeStt(id: string, type: string) {
      requestMethod('updateSaleEmployeeStt', {
        tseId: id,
        type
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('更改成功')
          getList()
        } else {
          ElMessage.error(err.errMsg)
        }
      })
    }
    function querySaleEmployeeInfo(row: any) {
      return requestMethod('querySaleEmployeeInfo', {
        tseId: row.tseId
      }).thenwrap((err, data) => {
        if (!err) {
          getKeys(form)
            .forEach((key) => {

              form[key] = data[key]
            })
        }
        return err ? null : data
      })
    }
    function parseUrl(urls: string) {
      return urls
        ? JSON.parse(urls).map(({ imageUrl }: { imageUrl: string }) => imageUrl)
        : []
    }

    async function editClick(row: any) {
      const res = await querySaleEmployeeInfo(row)
      if (res) {

        form.tseType = res.tseRoleType

        getNickName()

        form.tseRoleId = [res.tseRoleId]
        const addInfoItem = addInfo.value[0]
        if (addInfoItem) {
          objectForeach(addInfoItem, (_, key) => {
            addInfoItem[key] = res[key]
          })
         
          addInfoItem.$roleName = res.tseRoleName
          
          if (specialEmployee.includes(res.tseRoleId)) {
            addInfoItem.qualificationImageUrl = parseUrl(res.qualificationImageUrl)
            addInfoItem.coachImageUrl = parseUrl(res.coachImageUrl)
            addInfoItem.wxQrcodeUrl = parseUrl(res.wxQrcodeUrl)
            addInfoItem.tseQrcodeUrl = res.tseQrcodeUrl.length > 0 ? res.tseQrcodeUrl[0] : null
          }
        }
        SaleEmployeeList()
        dialogVisible.edit = true
      }
    }
    const unionList = ref([]) // 关联项目列表
    function detailClick(row: any) {
      switch (RoleMap[row.tseRoleId]) {
        case '2B拓展经理':
          querySaleEmployeeInfo(row)
            .then((res) => {
              form.tseType = res.tseRoleType
              form.tseChannelRate = Number(res.tseChannelRate).toFixed(2)
              if (Array.isArray(res.unionList)) {
                unionList.value = res.unionList
              }
              getNickName()
              dialogVisible.detail = true
            })
          break
        case '客户经理(内部)':
        case '客户经理(外部)':
          pushRoute('/sales/personnel-management/consultant-detail', {
            query: {
              id: row.tseId,
              roleId: row.tseRoleId
            }
          })
          break
        case '充值类渠道':
        case '消耗类渠道':
          pushRoute('/sales/personnel-management/channel-detail', {
            query: {
              id: row.tseId
            }
          })
          break
      }
    }

    function subClick(row: any) {
      querySaleEmployeeInfo(row)
        .then((res) => {
          if (Array.isArray(res.unionList)) {
            unionList.value = res.unionList
          }
          dialogVisible.relative = true
        })
      // pushRoute('channel-supervisor-detail', {
      //   query: {
      //     id: row.tseId
      //   }
      // })
    }
    // type 01 外部 02 内部
    function getColsByRole(roleId?: string) {

      let cols: {
        label: string,
        prop: string,
        formatter?: unknown
      }[] = [
          {
            label: '员工昵称',
            prop: 'tseName'
          },
          {
            label: '手机号',
            prop: 'tsePhone'
          },
          {
            label: '角色',
            prop: 'tseRoleName'
          },
          {
            label: '所在部门',
            prop: 'tseDepartmentName'
          },
          {
            label: '创建时间',
            prop: 'tseCtime'
          }
        ]

      return [
        {
          width: '60px',
          align: 'center',
          type: 'index',
          label: '序号'
        },
        ...cols,
        {
          label: '操作',
          align: 'center',
          slots: {
            default: ({ row }) => (
              <>
                <>
                  <span
                    v-show={RoleMap[row.tseRoleId] !== '客户经理(内部)' && RoleMap[row.tseRoleId] !== '客户经理(外部)'}
                    class="table-action-label"
                    style="margin-right: 8px;"
                    onClick={() => editClick(row)}>编辑</span>

                  <span v-show={RoleMap[row.tseRoleId] === '消耗类渠道'} class="table-action-label">
                    <span class="table-action-label" style="margin-right: 8px;" onClick={() => subClick(row)}>关联项目</span>
                  </span>
                  <span v-show={RoleMap[row.tseRoleId] === '客户经理(内部)' || RoleMap[row.tseRoleId] === '客户经理(外部)'}>
                    <span class="table-action-label" style="margin-right: 8px;" onClick={() => pushRoute('/sales/personnel-management/supervisor-assign', {
                      query: {
                        name: row.tseName,
                        id: row.tseId,
                        roleId: row.tseRoleId,
                        type: row.tseType
                      }
                    })}>转移</span>
                    {
                      row.tseStt === '00'
                        ? <span class="table-action-label" onClick={() => updateSaleEmployeeStt(row.tseId, '01')} style="margin-right: 8px;">启动</span>
                        : <span class="table-action-label" onClick={() => updateSaleEmployeeStt(row.tseId, '00')} style="margin-right: 8px;">失效</span>
                    }
                  </span>
                  <span v-show={RoleMap[row.tseRoleId] !== '主管'} class="table-action-label" onClick={() => detailClick(row)}>详情</span>
                </>
              </>
            )
          }
        }
      ]
    }

    const tableColumns = ref(getColsByRole())


    type EmployeeForm = {
      tsePhone: string //手机
      $roleName?: string // 角色名
      tseName: string //名称
      tseDepartmentId: string //部门id
      tseRoleId: string //角色id
      tseRatio: string //提成比
      wxNumber?: string // 微信号
      coachPhone?: string // 教练手机号
      introduce?: string // 个人介绍?: string //
      qualificationImageUrl?: string[] // 专业证书
      coachImageUrl?: string[] // 教练照片
      wxQrcodeUrl?: string[] //微信二维码
      tseQrcodeUrl?: string

      tseExpandId?: string // 拓展经理ID
      consociationType?: string
      tseProperty?:string
    }

    const specialEmployee = ['100003', '100004', '100005'] // 特殊的需要填写照片的人员
    function createEmployee(role: RoleItem): EmployeeForm {

      return specialEmployee.includes(role.tsrId)
        ? {
          $roleName: role.tsrName,
          tsePhone: '', //手机
          tseName: '', //名称
          tseDepartmentId: '', //部门id
          tseRoleId: role.tsrId, //角色id
          tseRatio: '', //提成比
          wxNumber: '', // 微信号
          coachPhone: '', // 教练手机号
          introduce: '', // 个人介绍?: '', //
          qualificationImageUrl: [], // 专业证书
          coachImageUrl: [], // 教练照片
          wxQrcodeUrl: [], //微信二维码
          tseExpandId: '',
          consociationType: '10',
          tseProperty:'',
        }
        : {
          $roleName: role.tsrName,
          tsePhone: '', //手机
          tseName: '', //名称
          tseDepartmentId: '', //部门id
          tseRoleId: role.tsrId, //角色id
          tseRatio: '', //提成比
          tseExpandId: '',
          tseProperty:'',
        }
    }

    watch(() => form.tseType, (type) => {
      options.role = options.sourceRole.filter(i => i.tsrType === type)
      form.tseRoleId = []
    }, {
      flush: 'sync'
    })
    watch(() => [...form.tseRoleId], (values: string[]) => {
      const newAddInfo = addInfo.value.filter(i => values.includes(i.tseRoleId))
      values.forEach(v => {
        if (newAddInfo.findIndex(i => i.tseRoleId === v) === -1) {
          const role = options.role.find(i => i.tsrId === v)
          if (role) {
            newAddInfo.push(createEmployee(role))
          }
        }
      })
      addInfo.value = newAddInfo
    }, {
      flush: 'sync'
    })
    const RoleFormItems = (props: {
      'v-model': EmployeeForm[]
      modelValue?: EmployeeForm[]
    }) => {
      const rules = {
        tseRatio: { trigger: 'blur', message: '请输入提成比例', type: 'string' }
      }
      return (
        <div style="padding: 0 16px;">
          {
            (props.modelValue || [])
              // .filter(item => RoleMap[item.tseRoleId] !== '2B拓展经理')
              .map(item => (
                <div style="margin-bottom: 12px; padding: 12px; border: 1px solid #DCDFE6; border-radius: 12px;">
                  <p>{item.$roleName}</p>
                  <div style="padding-left: 16px; margin-bottom: 8px;">
                    <el-form model={item} rules={rules} label-width={'100px'}>
                      <el-form-item label="提成比例" required>
                        <NumberInput style="width: 200px" v-model={item.tseRatio} precision={2} mode="digit" />%
                      </el-form-item>

                      {
                        item.$roleName == '消耗类渠道' ? (<><el-form-item key="tseType" label="合作类型" prop="tseType" >
                          <el-radio-group disabled={props.type === 'edit'} v-model={item.consociationType}>
                            {
                              consociationOption.map(opt => <el-radio label={opt.value}>{opt.label}</el-radio>)
                            }
                          </el-radio-group>

                        </el-form-item></>) : null
                      }
                      {
                        item.$roleName == '充值类渠道' ? (<el-form-item label="关联维士销售" required>
                          <el-select
                            key={form.tseDepartmentId}
                            v-model={item.tseExpandId}
                            onClick={SaleEmployeeList}
                            clearable
                            filterable
                            placeholder="选择关联维士销售"
                            class="txt"
                          >
                            {
                              options.employeeList.length > 0
                                ? options.employeeList.map((opt) => <el-option label={opt.tseRoleName+'--'+opt.tseName} value={opt.tseId} key={opt.tseId}></el-option>)
                                : null
                            }
                          </el-select>

                        </el-form-item>) : null
                      }


                      {
                        specialEmployee.includes(item.tseRoleId)
                          ? (
                            <>
                              <el-form-item label="微信号" required>
                                <el-input style="width: 200px" v-model={item.wxNumber} />
                              </el-form-item>
                              <el-form-item label="手机号" required>
                                <NumberInput style="width: 200px" v-model={item.coachPhone!} precision={11} />
                              </el-form-item>
                              <el-form-item label="个人介绍" required>
                                <el-input style="width: 200px" v-model={item.introduce} type="textarea" rows={4} />
                              </el-form-item>
                              <el-form-item label="微信二维码" required>
                                <UploadImage style="width: 200px" v-model={item.wxQrcodeUrl} type="list" limit={Infinity} />
                              </el-form-item>
                              <el-form-item label="专业证书" required>
                                <UploadImage style="width: 200px" v-model={item.qualificationImageUrl} type="list" limit={Infinity} />
                              </el-form-item>
                              <el-form-item label="照片" required>
                                <UploadImage style="width: 200px" v-model={item.coachImageUrl} type="list" limit={Infinity} />
                              </el-form-item>
                              <el-form-item label="关联维士销售" required>
                                <el-select
                                  v-model={item.tseExpandId}
                                  clearable
                                  filterable
                                  placeholder="选择关联维士销售"
                                  class="txt"
                                >
                                  {
                                    options.employeeList.length > 0
                                      ? options.employeeList.map((opt) => <el-option label={opt.tseRoleName +'--' +opt.tseName} value={opt.tseId} key={opt.tseId}></el-option>)
                                      : null
                                  }
                                </el-select>

                              </el-form-item>
                            </>
                          )
                          : null
                      }
                    </el-form>
                  </div>
                </div>
              ))
          }
        </div>
      )
    }

    const Form = props => (
      <>
        <el-form-item label="手机" prop="tsePhone">
          <number-input v-model={form.tsePhone} precision={11} clearable onBlur={handlePhoneBlur}></number-input>
        </el-form-item>
        <el-form-item label="昵称">
          <span>{nikeName.value}</span>
        </el-form-item>
        <el-form-item label="名称" prop="tseName">
          <el-input v-model={form.tseName} clearable></el-input>
        </el-form-item>
        <el-form-item label="选择部门" prop="tseDepartmentId">
          <SelectTree
            style="width: 240px"
            width="240px"
            value-key="id"
            disabled={props.type === 'edit'}
            onNodeClick={(node: any) => {
              form.tseDepartmentId = node.id
              EditRef.value.validateField('tseDepartmentId')
            }}
            v-model={form.tseDepartmentId}
            options={options.department}
            defaultProps={{ label: 'name' }}
            clearable></SelectTree>
        </el-form-item>
        <el-form-item key="tseType" label="角色类型" prop="tseType">
          <el-radio-group disabled={props.type === 'edit'} v-model={form.tseType}>
            {
              typeOptions.map(opt => <el-radio label={opt.value}>{opt.label}</el-radio>)
            }
          </el-radio-group>
        </el-form-item>
        {
          form.tseType === '01' ? <el-form-item label="人员属性" prop="tseProperty">
            <el-radio-group v-model={form.tseProperty}>
              <el-radio label='10'>koc</el-radio>
              <el-radio label='20'>教练</el-radio>
              <el-radio label='30'>其他</el-radio>
            </el-radio-group>
          </el-form-item> : ''
        }

        <el-form-item label="选择角色" prop="tseRoleId" >
          {
            form.tseType === '02'
              ? <el-checkbox-group v-model={form.tseRoleId} disabled={props.type === 'edit'} >
                {
                  options.role.map((opt) => <el-checkbox label={opt.tsrId}>{opt.tsrName}</el-checkbox>)
                }
              </el-checkbox-group>
              : <el-radio-group model-value={form.tseRoleId[0]} {...{
                'onUpdate:modelValue': (v: string) => {
                  console.log(v, 'vvv')
                  form.tseRoleId[0] = v
                }
              }} disabled={props.type === 'edit'} >
                {
                  options.role.map((opt) => <el-radio label={opt.tsrId}>{opt.tsrName}</el-radio>)
                }
              </el-radio-group>
          }

        </el-form-item>

        <RoleFormItems v-model={addInfo.value} />
      </>
    )
    const UnionColumns = () => (
      <>
        <el-table-column label="项目类型" prop="unionType" center></el-table-column>
        <el-table-column label="项目名称" prop="unionName" center></el-table-column>
        <el-table-column label="提成比例" prop="unionRatio" formatter={(row: any) => `${row.unionRatio}%`} center></el-table-column>
        <el-table-column label="加入时间" prop="unionTime" formatter={(row: any) => dayjs(Number(row.unionTime)).format('YYYY-MM-DD HH:mm:ss')} center></el-table-column>
      </>
    )
    request('sale.SaleRole/querySaleRoleList', {})
      .thenwrap((err, res) => {
        if (!err) {
          res.forEach((i: any) => {
            RoleMap[i.tsrId] = i.tsrName
          })
          options.sourceRole = res
          const { tseType } = form
          options.role = res.filter((i: RoleItem) => i.tsrType === tseType)
        }
      })
    function SaleEmployeeList() {
      request('sale.SaleEmployee/querySaleEmployeeList', {
        tseRoleId: "100002,100003",
        tseStt: '01',
        tseDepartmentId: form.tseDepartmentId
      })
        .thenwrap((err, res) => {
          if (!err) {
            // console.log(res, 'SaleEmployeeList')
            options.employeeList = res.slice();
            console.log(options.employeeList, 'set employee')

          }
        })

    }
    request('sale.SaleDepartment/querySaleDepartmentTree', {})
      .thenwrap((err, res) => {
        if (!err) {
          // eslint-disable-next-line
          options.department = res as never[];
        }
      })
    getList();
    return () => (
      <div class="page-container" style="padding: 20px">
        <BasePageTable
          ref={TableRef}
          v-loading={loading.value}
          v-models={
            [
              [page.pageNo, 'current-page'],
              [page.pageSize, 'page-size']
            ]
          }
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        >
          {
            tableColumns.value.map(col => <el-table-column {...col} v-slots={col.slots} key={col.prop}></el-table-column>)
          }
        </BasePageTable>
        {/* <ConfirmDialog v-model={dialogVisible.create} title="添加人员" auto-confirm={false} center onOnConfirm={handleCreateDialogConfirm} async-confirm>
          <el-form validate-on-rule-change={false} ref={CreateRef} model={form} rules={formRules.value} label-width="100px">
            <Form type="create" />
          </el-form>
        </ConfirmDialog> */}
        <ConfirmDialog v-model={dialogVisible.edit} title="编辑人员" auto-confirm={false} center onOnConfirm={handleEditDialogConfirm}>
          <el-form validate-on-rule-change={false} ref={EditRef} model={form} rules={formRules.value} label-width="100px">
            <Form type="edit" />
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.detail} title="详情" center>
          <el-form>
            <el-form-item label="手机">
              <span>{form.tsePhone}</span>
            </el-form-item>
            <el-form-item label="昵称">
              <span>{nikeName.value}</span>
            </el-form-item>
            <el-form-item label="名称">
              <span>{form.tseName}</span>
            </el-form-item>
            <el-form-item label="部门名称">
              <span>{form.tseDepartmentName}</span>
            </el-form-item>
            <el-form-item key="tseType" label="角色类型" prop="tseType">
              <el-radio-group disabled v-model={form.tseType}>
                {
                  typeOptions.map(opt => <el-radio label={opt.value}>{opt.label}</el-radio>)
                }
              </el-radio-group>
            </el-form-item>
            <el-form-item key="tseType" label="提成比例" prop="tseType">
              {
                <span>{form.tseChannelRate}%</span>
              }
            </el-form-item>
            <el-form-item key="tseType" label="二维码" prop="tseType">
              <el-image style="max-height: 50px;max-width: 50px;" src={form.tseQrcodeUrl}></el-image>
            </el-form-item>

            <el-form-item label="选择角色">
              <span>{form.tseRoleName}</span>
            </el-form-item>
            <el-form-item label="关联项目">
              <el-table data={unionList.value} border stripe>
                <UnionColumns />
              </el-table>
            </el-form-item>
          </el-form>
        </ConfirmDialog>
        <ConfirmDialog v-model={dialogVisible.relative} title="关联项目" center>
          <el-table data={unionList.value} border stripe>
            <UnionColumns />
          </el-table>
        </ConfirmDialog>
      </div>
    )
  }
})
