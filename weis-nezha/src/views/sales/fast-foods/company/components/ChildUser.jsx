
import {
  defineComponent, reactive, inject, computed, ref, nextTick
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useRoute } from 'vue-router'
import requestMethod, { requestFactor } from '@/utils/request'
import { ElMessage } from 'element-plus'
import exportExcel from '../../../../../utils/export-excel'

const { http, request } = requestFactor('groupmeal.ChildUser', true)

export default defineComponent({
  setup() {
    let tgcaId
    const tgcId = useRoute().query.id
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const pushRoute = inject('pushRoute')
    const dialogVisible = ref(false)
    const data = reactive({
      list: [],
      total: 0
    })
    const FormRef = ref(null)
    const form = reactive({
      afterEmpId: ''
      // tgcaContact: '',
      // tgcaContactNumber: ''
    })
    const formRules = {
      afterEmpId: { type: 'string', required: true, message: '请选择校区接口人' },
      tgcaContact: {
        type: 'string', required: true, message: '请输入联系人', trigger: 'blur'
      },
      tgcaContactNumber: {
        type: 'string', required: true, message: '请输入联系电话', trigger: 'blur'
      }
    }
    const options = reactive({
      address: [],
      queryInterface: [],
      // counselor: [],
      interface: []
    })
    const queryParams = reactive({
      tgcaId: '',
      employeeId: ''
    })

    const querys = computed(() => ([
      {
        component: 'BaseSelect',
        label: '地址',
        key: 'tgcaId',
        placeholder: '地址',
        props: {
          options: options.address,
          clearable: true,
          props: {
            label: 'tgcaName',
            value: 'tgcaId'
          }
        }
      },
      {
        component: 'BaseSelect',
        label: '校区接口人',
        key: 'employeeId',
        placeholder: '校区接口人',
        props: {
          options: options.queryInterface,
          clearable: true,
          props: { label: 'tgeName', value: 'tgeId' }
        }
      },
      {
        slot: 'search'
      }
    ]))

    const tableColumns = [
      {
        width: '60px',
        align: 'center',
        type: 'index',
        label: '序号'
      },
      {
        label: '地址',
        prop: 'tgcaName'
      },
      {
        label: '子账号数量',
        prop: 'childUserNum'
      },
      {
        label: '校区接口人',
        prop: 'employeeName'
      },
      {
        label: '校区接口人手机号',
        prop: 'employeePhone'
      }
      // {
      //   label: '收货人手机号',
      //   prop: 'tgcaContactNumber'
      // }
    ]

    const getList = () => {
      http('queryAddressPage', {
        tgcId,
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

    function exportClick() {
      http('queryAddressPage', {
        tgcId,
        ...queryParams,
        pageNo: 1,
        pageSize: 9999
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

    function selectClick(row) {
      tgcaId = row.tgcaId

      dialogVisible.value = true
      nextTick(() => {
        FormRef.value.resetFields()
        // form.tgcaContact = row.tgcaContact
        // form.tgcaContactNumber = row.tgcaContactNumber
      })
    }

    // function editClick(row) {
    //   tgcaId = row.tgcaId

    //   dialogVisible.value = true
    //   nextTick(() => {
    //     FormRef.value.resetFields()
    //     Object.keys(form)
    //       .forEach((key) => {
    //         form[key] = row[key]
    //       })
    //     form.afterEmpId = row.employeeId
    //   })
    // }

    function handleConfirm(done) {
      FormRef.value.validate(async (valid) => {
        if (valid) {
          const res = (await requestMethod('groupmeal.Corp/editCorpChildUser', {
            addressId: tgcaId,
            ...form
          })).data
          if (res.errCode === 0) {
            getList()
            dialogVisible.value = false
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
          <el-button onClick={getList}>搜索</el-button>
          <el-button type="primary" onClick={exportClick}>导出</el-button>
        </>
      )

    }
    function queryEmployeeList() {
      requestMethod('groupmeal.CorpAddress/getCorpEmpByAddress', {
        tgcId
      }).thenwrap((err, data) => {
        if (!err) {
          options.interface = data.res.map(item => {
            item.$label = `${item.tgeName}（${item.tgePhone}）`
            return item
          })
          // console.log(options.interface, 'options.interface')
        }
      })
    }
    requestMethod('groupmeal.Corp/getEmployeeByChild', {
      corpId: tgcId
    }).thenwrap((err, data) => {
      if (!err) {
        options.queryInterface = data
      }
    })
    queryEmployeeList()
    getList()

    request('getAddressList', {
      tgcId
    }).thenwrap((err, res) => {
      if (!err) {
        options.address = res
      }
    })

    return () => (
      <div class="page-container padding-0-20">
        <div className="query-bar">
          <QueryComponents queryList={querys.value} v-model={queryParams} v-slots={querySlots} action={false}></QueryComponents>
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
                  <span class="table-action-label" style="margin-right: 8px;" onClick={() => selectClick(row)}>选择校区接口人</span>
                  {/* <span v-show={row.employeeId} class="table-action-label" style="margin-right: 8px;" onClick={() => editClick(row)}>编辑</span> */}
                  <span v-show={row.employeeId} class="table-action-label" onClick={() => pushRoute('/sales/fast-foods/company/account-list', {
                    query: {
                      id: row.tgcaId
                    }
                  })}>账号管理</span>
                </>
              )
            }
          }>
          </el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.value} onOnConfirm={handleConfirm} async-confirm auto-confirm={false} center>
          <el-form ref={FormRef} model={form} rules={formRules} label-width="120px">
            <el-form-item label="选择校区接口人" prop="afterEmpId">
              <BaseSelect v-model={form.afterEmpId} options={options.interface} props={{ label: '$label', value: 'tgeId' }} />
            </el-form-item>
            {/* <el-form-item label="收货人姓名" prop="tgcaContact">
              <el-input v-model={form.tgcaContact}></el-input>
            </el-form-item>
            <el-form-item label="收货人手机号" prop="tgcaContactNumber">
              <NumberInput v-model={form.tgcaContactNumber} precision={11}></NumberInput>
            </el-form-item> */}
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})
