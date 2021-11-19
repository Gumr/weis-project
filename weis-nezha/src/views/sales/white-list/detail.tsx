import { defineComponent, reactive, inject, Ref, ref, computed } from 'vue'
import { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useRoute } from 'vue-router'
import exportExcel from '@/utils/export-excel'
import { queryUserByPhone } from '@/utils/data-getter'
import { ElMessageBox, ElMessage } from 'element-plus'
const { http, request } = requestFactor('sale.SaleCorp', true)

export default defineComponent({
  name: 'sales_white-list-2b_detail',
  setup() {
    const loading = inject('vloading') as Ref<boolean>
    const route = useRoute()
    const tscId = route.query.tscId
    const phone = ref('')
    const nickName = ref('')
    const queryValue = reactive({
      tscPhone: ''
    })
    // const formRef = {
    //   create: ref({}) as Ref<typeof ElForm>,
    //   edit: ref({}) as Ref<typeof ElForm>
    // }
    const dialogs = reactive({
      create: false,
      edit: false,
      detail: false
    })
    // const options = reactive({
    //   employee: []
    // })

    // function createForm() {
    //   return {
    //     tscName: '', // 分组名称
    //     tscEmpId: '', // 2B拓展经理ID
    //     tscRatio: '' // 提成比例
    //   }
    // }
    const table = reactive({
      data: [],
      total: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      }
    })

    function getList(page = table.page) {
      return http('querySaleCorpUserPage', {
        tscId,
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

    function removeClick(row: any) {
      ElMessageBox.confirm('是否删除该用户？', '提示')
        .then(() => {
          request('removeSaleCorpUser', {
            tscId,
            tscuIds: [row.tscuId ]
          }).thenwrap((err) => {
            if (!err) {
              ElMessage.success('删除成功')
              getList()
            }
          })
        })
    }
    function createClick() {
      phone.value = ''
      nickName.value = ''
      dialogs.create = true
    }

    function exportClick() {
      getList({
        pageNo: 1,
        pageSize: table.total
      })
        .then((data) => {
          exportExcel({
            data,
            columns: tableColumns
          })

        })
    }

    function handleCreateConfirm(done: () => void) {
      if (phone.value.length <= 0) {
        ElMessage.error('请输入手机号')
        done()
        return
      }
      request('addSaleCorpUser', {
        tscId,
        tscuPhone: phone.value
      }).thenwrap((err) => {
        if (!err) {
          ElMessage.success('添加成功')
          getList()
          dialogs.create = false
        }
      }).finally(done)
    }

    function handlePhoneBlur() {
      if (phone.value.length > 0) {
        queryUserByPhone(phone.value)
          .thenwrap((err, data) => {
            if (!err) {
              nickName.value = data.uname
            } else {
              ElMessage.error(err.errMsg)
              nickName.value = ''
            }
          })
      } else {
        nickName.value = ''
      }
    }
    const queryComponents = computed(() => [
      {
        label: '用户手机号',
        component: 'el-input',
        key: 'tscUphone',
        placeholder: '请输入手机号',
        props: {
          clearable: true
        }
      },
      {
        slot: () => (
          <div style="text-align: right">
            <el-button type="primary" onClick={getList}>搜索</el-button>
            <el-button  onClick={exportClick}>导出</el-button>
          </div>
        )
      },
      {
        slot: () => (
          <div style="text-align: right">
            <el-button  onClick={createClick}>添加用户</el-button>
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
        label: '用户昵称',
        prop: 'tscuUname'
      },
      {
        label: '用户手机',
        prop: 'tscuPhone'
      },
      {
        label: '加入日期',
        prop: 'tscuDate'
      },
      {
        label: '操作',
        width: 100,
        align: 'center',
        slot: {
          default: ({ row } : {row:any}) =>
            <>
              <div>
                <el-button size="small" type="primary" onClick={() => removeClick(row)}>移除</el-button >
              </div>
            </>
        }
      }
    ]

    getList()
    return () => (
      <div class="page-container padding-20" >
        <div class="query-bar">
          <QueryComponents v-model={queryValue} query-list={queryComponents.value} action={false} span={queryComponents.value.length} semi></QueryComponents>
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
        <ConfirmDialog v-model={dialogs.create} title="添加用户" onOnConfirm={(done: () => void) => handleCreateConfirm(done)} async-confirm center>
          <div class="nowrap" style="margin-bottom: 12px">
            <span style="width: 100px; display: inline-block; text-align: right;">用户手机：</span>
            <NumberInput v-model={phone.value} style="width: 300px" precision={11} onBlur={handlePhoneBlur}></NumberInput>
          </div>
          <div class="nowrap">
            <span style="width: 100px; display: inline-block; text-align: right;">昵称：</span>
            <span>{nickName.value}</span>
          </div>
        </ConfirmDialog>
      </div>
    )
  }
})