
import {
  defineComponent, reactive, inject, computed, Ref
} from 'vue'
import { requestFactor } from '@/utils/request'
import dayjs from 'dayjs'

const { http } = requestFactor('data.DialogData', true)

export default defineComponent({
  name: 'data_dialog-data',
  setup() {
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading') as Ref<boolean>
    const data = reactive({
      list: [],
      total: 0
    })

    const queryParams = reactive({
      title: '',
      date: [],
      startDate: '',
      endDate: ''
    })

    const querys = computed(() => ([
      {
        component: 'el-input',
        label: '标题',
        key: 'title',
        placeholder: '请输入标题',
        props: {
          clearable: true
        },
      },
      {
        component: 'el-date-picker',
        label: '日期',
        key: 'date',
        props: {
          type: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        },
        listeners: {
          change(dates: Date[]) {
            queryParams.startDate = dates ? dayjs(dates[0]).format('YYYYMMDD') : ''
            queryParams.endDate = dates ? dayjs(dates[1]).format('YYYYMMDD') : ''
          }
        }
      }, {
        slot: () => <el-button type="primary" onClick={getList}>搜索</el-button>
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
        label: '标题',
        prop: 'tddTitle'
      },
      {
        label: '类型',
        prop: 'tddTypeDesc'
      },
      {
        label: '曝光人数',
        prop: 'showUserNum'
      },
      {
        label: '曝光次数',
        prop: 'showNum'
      },
      {
        label: '点击人数',
        prop: 'clickUserNum'
      },
      {
        label: '点击次数',
        prop: 'clickNum'
      },
      {
        label: '关闭人数',
        prop: 'closeUserNum'
      },
      {
        label: '关闭次数',
        prop: 'closeNum'
      }
    ]

    const getList = () => {
      http('queryDialogDataList', queryParams)
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res
            // data.total = res.totalRecordCount
          }
        })
    }

    // function exportClick(done: () => void) {
    //   http('queryDialogDataList', requestParams)
    //     .thenwrap((err, res) => {
    //       if (!err) {
    //         exportExcel({
    //           data: res.record,
    //           columns: tableColumns
    //         })
    //       }
    //       done()
    //     })
    //     .catch(done)
    // }

    // getList()

    return () => (
      <div class="page-container padding-0-20">
        <div class="query-bar">
          <QueryComponents query-list={querys.value} v-model={queryParams} action={false} semi></QueryComponents>
        </div>
        <BasePageTable
          v-loading={loading.value}
          v-models={[
            [page.pageNo, 'current-page'],
            [page.pageSize, 'page-size']
          ]}
          data={data.list}
          total={data.total}
          onCurrentPageChange={getList}
          onSizeChange={getList}
          visible={false}
        >
          {
            tableColumns.map((col, index) => <el-table-column {...col} key={index}></el-table-column>)
          }
        </BasePageTable>
      </div>
    )
  }
})
