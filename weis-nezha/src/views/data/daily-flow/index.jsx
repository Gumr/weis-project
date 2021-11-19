
import {
  defineComponent, reactive, inject, computed
} from 'vue'
import { requestFactor } from '@/utils/request'
import dayjs from 'dayjs'
import exportExcel from '@/utils/export-excel'
import SubmitButton from '@/components/SubmitButton.vue'

const { http } = requestFactor('data.DailyFlow', true)

export default defineComponent({
  name: 'data_daily-flow',
  setup() {
    const page = reactive({
      pageNo: 1,
      pageSize: 20
    })
    const loading = inject('vloading')
    const data = reactive({
      list: [],
      total: 0
    })

    const queryParams = reactive({
      date: []
    })

    const requestParams = {
      startDate: '',
      endDate: ''
    }

    const querys = computed(() => ([
      {
        component: 'el-date-picker',
        label: '时间',
        key: 'date',
        placeholder: '地址',
        props: {
          type: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        },
        listeners: {
          change(dates) {
            requestParams.startDate = dayjs(dates[0]).format('YYYYMMDD')
            requestParams.endDate = dayjs(dates[1]).format('YYYYMMDD')
          }
        }
      },
      {
        slot: 'motion'
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
        label: '日期',
        prop: 'date'
      },
      {
        label: '注册用户数',
        prop: 'registerNum'
      },
      {
        label: '访问用户数',
        prop: 'visitNum'
      },
      {
        label: '下单用户数',
        prop: 'orderPeopleNum'
      },
      {
        label: '充值用户数',
        prop: 'rechargeNum'
      },
      {
        label: '购买会员数量',
        prop: 'vipNum'
      },
      {
        label: '用餐用户数',
        prop: 'haveMealsNum'
      },
      {
        label: '小程序2B用餐单数',
        prop: 'tbNum'
      },
      {
        label: '小程序2C用餐单数',
        prop: 'tcNum'
      },
      {
        label: '美团用餐单数',
        prop: 'meituanMealNum'
      },

      {
        label: '饿了么用餐单数',
        prop: 'elemeMealNum'
      },
      {
        label: '用餐单数',
        prop: 'totalMealNum'
      }
    ]

    const getList = () => {
      http('queryDailyFlow', {
        ...page,
        ...requestParams
      })
        .thenwrap((err, res) => {
          if (!err) {
            data.list = res.record
            data.total = res.totalRecordCount
          }
        })
    }

    function exportClick(done) {
      http('queryDailyFlow', {
        ...requestParams,
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
          done()
        })
        .catch(done)
    }

    const querySlots = {
      motion: () => (
        <>
          <el-button onClick={getList}>搜索</el-button>
          <SubmitButton type="primary" onClick={exportClick}>导出</SubmitButton>
        </>
      )
    }

    // getList()

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
        </BasePageTable>
      </div>
    )
  }
})
