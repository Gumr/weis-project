import { defineComponent, inject, ComputedRef, reactive } from 'vue'
import { requestFactor } from '@/utils/request'
import dayjs from 'dayjs'
import exportExcel from '@/utils/export-excel'
const { request, http } = requestFactor('data.RePurchase', true)

export default defineComponent({
  name: 'ffinance_user-remain-analysis',
  setup() {
    const loading = inject<ComputedRef<boolean>>('vloading')

    const table = reactive({
      camp: [],
      campTotal: 0
    })

    const queryValue = reactive({
      camp: {
        date: [new Date(), new Date()],
        days: '7',
        type: '00'
      }
    })

    const queryList = [
      {
        label: '日期区间',
        key: 'date',
        component: 'el-date-picker',
        props: {
          type: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        }
      },
      {
        label: '周期复购',
        key: 'days',
        component: 'BaseSelect',
        props: {
          filterable: true,
          allowCreate: true,
          defaultFirstOption: true,
          options: [
            {
              label: '次日',
              value: '1'
            },
            {
              label: '7日',
              value: '7'
            },
            {
              label: '15日',
              value: '15'
            },
            {
              label: '30日',
              value: '30'
            },
            {
              label: '60日',
              value: '60'
            },
            {
              label: '90日',
              value: '90'
            }
          ]
        }
      },
      {
        label: '用户',
        key: 'type',
        component: 'BaseSelect',
        props: {
          options: [
            {
              label: '全部',
              value: '00'
            },
            {
              label: '新用户',
              value: '01'
            },
            {
              label: '老用户',
              value: '02'
            }
          ]
        }
      }
    ]

    const columns = {
      camp: [
        {
          label: '序号',
          type: 'index',
          width: 60
        },
        {
          label: '日期',
          prop: 'date'
        },
        {
          label: '当日用餐',
          prop: 'mealUserNum'
        },
        {
          label: '复购',
          prop: 'reMealUserNum'
        },
        {
          label: '比例',
          prop: 'reMealRatio',
          formatter: (row: any) => `${row.reMealRatio}%`
        },
        {
          label: '1餐',
          prop: 'oneMealNum'
        },
        {
          label: '比例',
          prop: 'oneMealRatio',
          formatter: (row: any) => `${row.oneMealRatio}%`
        },
        {
          label: '2餐',
          prop: 'twoMealNum'
        },
        {
          label: '比例',
          prop: 'twoMealRatio',
          formatter: (row: any) => `${row.twoMealRatio}%`
        },
        {
          label: '3餐',
          prop: 'threeMealNum'
        },
        {
          label: '比例',
          prop: 'threeMealRatio',
          formatter: (row: any) => `${row.threeMealRatio}%`
        },
        {
          label: '4餐',
          prop: 'fourMealNum'
        },
        {
          label: '比例',
          prop: 'fourMealRatio',
          formatter: (row: any) => `${row.fourMealRatio}%`
        },
        {
          label: '5餐',
          prop: 'fiveMealNum'
        },
        {
          label: '比例',
          prop: 'fiveMealRatio',
          formatter: (row: any) => `${row.fiveMealRatio}%`
        },
        {
          label: '5餐以上',
          prop: 'gtFiveMealNum'
        },
        {
          label: '比例',
          prop: 'gtFiveMealRatio',
          formatter: (row: any) => `${row.gtFiveMealRatio}%`
        }
      ]
    }

    function handleQuery(parm: typeof queryValue.camp) {
      const res: {
        [prop: string]: any
      } = {
        ...parm
      }
      if (res.date?.length >= 2) {
        res.startDate = dayjs(res.date[0]).format('YYYYMMDD')
        res.endDate = dayjs(res.date[1]).format('YYYYMMDD')
      }
      delete res.date
      return res
    }

    function getList() {
      console.log(queryValue.camp.days, 'days')
      http('queryRePurchase', handleQuery(queryValue.camp)).thenwrap((err, data) => {
        if (!err) {
          table.camp = data
        }
      })
    }

    function exportClick() {
      request('queryRePurchase', handleQuery(queryValue.camp)).thenwrap((err, data) => {
        if (!err) {
          exportExcel({
            data,
            columns: columns.camp
          })
        }
      })
    }

    const querySlots = {
      action: () => (
        <>
          <el-button type="primary" onClick={getList}>搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>
      )
    }
    // getList()
    return () => (
      <div class="padding-20">
        <div class="query-bar">
          <QueryComponents span={4} v-model={queryValue.camp} query-list={queryList} v-slots={querySlots} semi/>
        </div>
        <BasePageTable
          visible={false}
          v-loading={loading && loading.value}
          total={table.campTotal}
          data={table.camp}
          columns={columns.camp}
          onCurrentPageChange={getList}
          onSizeChange={getList}
        ></BasePageTable>
      </div>
    )
  }
})