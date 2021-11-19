
import {
  defineComponent, reactive, inject, computed, ref, nextTick, onActivated
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import dayjs from 'dayjs'
import req, { requestFactor } from '@/utils/request'
import { useRouter } from 'vue-router'
// import { ElMessage } from 'element-plus';
import exportExcel from '@/utils/export-excel';
import { orderStatusOptions } from '@/utils/data-map'
import { cloneDeep } from '@/utils/common'
import { ElMessage } from 'element-plus'

const { http, request } = requestFactor('groupmeal.CounselorOrder', true)

export default defineComponent({
  name: 'sales_fast-foods_counselor-help-order',
  setup() {
    const router = useRouter()
    const page = reactive({
      pageNo: 1,
      pageSize: 20,
    })
    const loading = inject('vloading');
    const pushRoute = inject('pushRoute');
    const dialogVisible = ref(false)
    const data = reactive({
      list: [],
      total: 0
    })
    const FormRef = ref(null)
    const initForm = {
      tgePhone: '', // 顾问id
      tgcId: '', // 企业id
      address: [], // 地址列表
      group: [], // 选择人群
      category: '', // 餐别
      date: '', // 日期
      deliveryTime: '' // 配送时间
    }
    const form = reactive(cloneDeep(initForm))
    const formRules = {
      tgePhone: {
        type: 'string', required: true, message: '请选择接口人', trigger: 'change'
      },
      tgcId: {
        type: 'string', required: true, message: '请选择企业', trigger: 'change'
      },
      address: {
        type: 'array', required: true, message: '请选择地址列表', trigger: 'change'
      },
      group: {
        type: 'array', required: true, message: '请选择人群', trigger: 'change'
      },
      date: {
        type: 'date', required: true, message: '请选择日期', trigger: 'change'
      },
      category: {
        type: 'string', required: true, message: '请选择餐别', trigger: 'change'
      },
      deliveryTime: {
        type: 'string', required: true, message: '请选择配送时间', trigger: 'change'
      },
    }
    function getDeliveryTimeOptions() {
      const temp = dayjs().startOf('day')
      let start = temp.set('hour', 6)
      const end = temp.set('hour', 23)
      const options = []
      while (start < end) {
        const after20Minute = start.add(20, 'minute')
        options.push(`${start.format('HH:mm')}-${after20Minute.format('HH:mm')}`)
        start = after20Minute
      }

      return options.map(time => ({ label: time, value: time }))
    }
    const groupOptions = [
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
    ]

    const categoryOptions = [
      {
        label: '早餐',
        value: '01'
      },
      {
        label: '午餐',
        value: '02'
      },
      {
        label: '晚餐',
        value: '03'
      }
    ]

    const deliveryTimeOptions = getDeliveryTimeOptions()
    const options = reactive({
      corp: [],
      counselor: [],
      orderCorp: [], // 代点餐企业
      address: []
    })
    const queryParams = reactive({
      date: '',
      phone: '',
      corpId: '',
      stt: ''
    })

    const querys = computed(() => ([
      {
        component: 'el-date-picker',
        label: '配送时间',
        key: 'date',
        placeholder: '请选择配送时间',
        props: {
          clearable: true,
        }
      },
      {
        component: 'NumberInput',
        label: '下单人手机',
        key: 'phone',
        placeholder: '下单人手机',
        props: {
          precision: 11,
          clearable: true,
        }
      },
      {
        component: 'BaseSelect',
        label: '企业',
        key: 'corpId',
        placeholder: '企业',
        props: {
          options: options.corp,
          clearable: true,
          props: {
            label: 'tgcName',
            value: 'tgcId'
          }
        }
      },
      {
        component: 'BaseSelect',
        label: '订单状态',
        key: 'stt',
        placeholder: '订单状态',
        props: {
          options: orderStatusOptions,
          clearable: true,
        }
      },
      {
        slot: 'search'
      },
      {
        slot: 'order'
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
        label: '订单编码',
        prop: 'tcoShipOid'
      },
      {
        label: '订单内容',
        prop: 'tcoContent'
      },
      {
        label: '人数',
        prop: 'tcoNum'
      },
      {
        label: '地址',
        prop: 'tcoAddressName'
      },
      {
        label: '企业',
        prop: 'tcoCorpName'
      },
      {
        label: '订单原价',
        prop: 'tcoOrderPrice'
      },
      {
        label: '实付价格',
        prop: 'tcoActualPrice'
      },
      {
        label: '下单人姓名',
        prop: 'tcoUname'
      },
      {
        label: '下单人手机',
        prop: 'tcoPhone'
      },
      {
        label: '下单时间',
        prop: 'tcoCtime'
      },
      {
        label: '配送时间',
        prop: 'tcoDate'
      },
      {
        label: '订单状态',
        prop: 'tcoSttDesc'
      }
    ]

    const getList = () => {
      http('queryChildUserPage', {
        ...page,
        ...queryParams
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record
            data.total = res.totalRecordCount;
          }
        })
    }

    function getCorpList() {
      request('getCorpListByEmp', {
        tgePhone: form.tgePhone
      }).thenwrap((err, res) => {
        if (!err) {
          form.tgcId = ''
          options.orderCorp = res
        }
      })
    }

    function getCorpAddressList() {
      request('getCorpAddressListByEmp', {
        tgePhone: form.tgePhone,
        tgcId: form.tgcId
      }).thenwrap((err, res) => {
        if (!err) {
          form.address = []
          options.address = res
        }
      })
    }

    function exportClick() {
      http('queryChildUserPage', {
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
      pushRoute('edit-order', {
        query: {
          id: row.tcoId
        }
      })
    }

    function detailClick(row) {
      pushRoute('detail-order', {
        query: {
          id: row.tcoId
        }
      })
    }

    function helpOrderClick() {
      Object.assign(form, cloneDeep(initForm))

      options.address = []
      dialogVisible.value = true
      nextTick(() => {
        options.orderCorp = []
        FormRef.value.resetFields()
      })
    }
    function handleFormChange(key) {
      switch (key) {
        case 'tgePhone':
          form.tgePhone && getCorpList()
          break
        case 'tgcId':
          form.tgcId && getCorpAddressList()
          break
      }
    }

    function cancelClick(tcoId) {
      request('cancelOrder', {
        tcoId
      }).thenwrap((err) => {
        if (err) {
          ElMessage.error(err.errMsg)
        } else {
          ElMessage.success('取消成功')
        }
      })
    }

    function handleConfirm() {
      FormRef.value.validate(async (valid) => {
        if (valid) {
          const params = { ...form }
          params.date = dayjs(form.date).format('YYYYMMDD')
          router.push({
            name: 'sales_fast-foods_counselor-help-order_order',
            params
          })
          dialogVisible.value = false
        }
      })
    }

    const querySlots = {
      search: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <el-button type="primary" onClick={exportClick}>导出</el-button>
        </>
      ),
      order: () => <el-button type="primary" style="width: 100%" onClick={helpOrderClick}>代点餐</el-button>
    }
    const today = dayjs().startOf('day').valueOf()
    function disabledDate(date) {
      return date.valueOf() <= today
    }
    onActivated(getList)
    req('groupmeal.Corp/queryCorpAllList', {})
      .thenwrap((err, res) => {
        if (!err) {
          options.corp = res
        }
      })
    request('getIntefacePersonList', {}).thenwrap((err, res) => {
      if (!err) {
        options.counselor = res
      }
    })
    const DialogSlots = {
      footer: () => <el-button onClick={handleConfirm} type="primary">去点餐</el-button>
    }
    return () => (
      <div class="page-container padding-0-20">
        <div className="query-bar">
          <QueryComponents span={5} queryList={querys.value} v-model={queryParams} v-slots={querySlots} action={false}></QueryComponents>
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
          <el-table-column fixed="right" width="120" label="操作" align="center" v-slots={
            {
              default: ({ row }) => (
                <>
                  <span v-show={row.stt === '10'} class="table-action-label" style="margin-right: 8px;" onClick={() => selectClick(row)}>编辑</span>
                  <span v-show={row.stt === '10'} class="table-action-label" style="margin-right: 8px;" onClick={() => cancelClick(row.tcoId)}>取消订单</span>
                  <span class="table-action-label" onClick={() => detailClick(row)}>详情</span>
                </>
              )
            }
          }>
          </el-table-column>
        </BasePageTable>
        <ConfirmDialog v-model={dialogVisible.value} v-slots={DialogSlots} center>
          <el-form ref={FormRef} model={form} rules={formRules} label-width="120px">
            <el-form-item label="选择接口人" prop="tgePhone">
              <BaseSelect v-model={form.tgePhone} options={options.counselor} props={{
                label: 'tgeName',
                value: 'tgePhone'
              }} onChange={() => handleFormChange('tgePhone')}/>
            </el-form-item>
            <el-form-item label="选择企业" prop="tgcId">
              <BaseSelect v-model={form.tgcId} options={options.orderCorp} props={{
                label: 'tgcName',
                value: 'tgcId'
              }} onChange={() => handleFormChange('tgcId')}/>
            </el-form-item>
            <el-form-item label="选择地址" prop="address">
              <el-checkbox-group v-model={form.address}>
                {
                  options.address.map(it => <el-checkbox key={it.tgcaId} label={it.tgcaId}>{it.tgcaName}</el-checkbox>)
                }
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="选择人群" prop="group">
              <el-checkbox-group v-model={form.group}>
                {
                  groupOptions.map(it => <el-checkbox key={it.value} label={it.value}>{it.label}</el-checkbox>)
                }
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="日期" prop="date">
              <el-date-picker v-model={form.date} disabled-date={disabledDate}></el-date-picker>
            </el-form-item>
            <el-form-item label="餐别" prop="category">
              <BaseSelect v-model={form.category} options={categoryOptions}/>
            </el-form-item>
            <el-form-item label="配送时间" prop="deliveryTime">
              <BaseSelect v-model={form.deliveryTime} options={deliveryTimeOptions}/>
            </el-form-item>
          </el-form>
        </ConfirmDialog>
      </div>
    )
  }
})
