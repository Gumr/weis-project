import { getCurrentInstance, defineComponent, inject, ComputedRef, reactive, ref } from 'vue'
import { requestFactor } from '@/utils/request'
import ButtonTabs from '@/components/ButtonTabs.vue'
import dayjs from 'dayjs'
import exportExcel from '@/utils/export-excel'
const { request, http } = requestFactor('marketing.data.OnlineCamp', true)

export default defineComponent({
  name: 'product_camp-analysis',
  setup() {
    const loading = inject<ComputedRef<boolean>>('vloading')  
    const pushRoute = inject('pushRoute')
    const table = reactive({
      camp: [],
      person: [],
      campTotal: 0,
      personTotal: 0,
      campPage: {
        pageNo: 1,
        pageSize: 20
      },
      personPage: {
        pageNo: 1,
        pageSize: 20
      }
    })
    const tabs = {
      modelValue: ref(0),
      list: [
        {
          label: '减脂营分析',
          value: 0
        },
        {
          label: '人均参营分析',
          value: 1
        }
      ]
    }

    const queryValue = reactive({
      camp: {
        date: [],
        startDate: '',
        endDate: '',
        activityName: ''
      },
      person: {
        date: [],
        startDate: '',
        endDate: '',
        activityName: '',
        uphone: ''
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
        label: '减脂营',
        key: 'activityName',
        component: 'el-input',
        placeholder: '输入减脂营名称',
        props: {
          clearable: true
        }
      }
    ]

    const personQueryList = [
      ...queryList,
      {
        label: '用户手机',
        key: 'uphone',
        component: 'NumberInput',
        placeholder: '输入用户手机',
        props: {
          clearable: true
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
          label: '开营时间',
          prop: 'startTime',
          formatter(row: any) {
            return row.startTime.slice(0, 8)
          }
        },
        {
          label: '减脂营',
          prop: 'activityName'
        },
        {
          label: '餐单总数',
          prop: 'orderNum'
        },
        {
          label: '参营人数',
          prop: 'joinPeopleNum'
        },
        {
          label: '人均餐单数',
          prop: 'averageOrderNum'
        },
        {
          label: '消费总额',
          prop: 'consumeSum'
        },
        {
          label: '拉新注册人数',
          prop: 'inviteRegisterNum'
        },
        {
          label: '拉新入营人数',
          prop: 'inviteJoinNum'
        },
        {
          label: '操作',
          slots: {
            default: ({ row }: { row: any }) => (<span class="table-action-label" onClick={() => detailClick(row)}>订单详情</span>)
          }
        }

      ],
      person: [
        {
          label: '序号',
          type: 'index',
          width: 60
        },
        {
          label: '用户ID',
          prop: 'uid'
        },
        {
          label: '手机号',
          prop: 'phone'
        },
        {
          label: '用户名称',
          prop: 'uname'
        },
        {
          label: '参营次数',
          prop: 'joinNum'
        },
        {
          label: '减脂营餐单合计',
          prop: 'joinOrderNum'
        },
        {
          label: '非减脂营餐单合计',
          prop: 'notJoinOrderNum'
        }
      ]
    }
    function detailClick(row) { 
      pushRoute('orderList', {
        query: {
          activityId: row.activityId
        }
      })


    }

    function handleQuery(parm: typeof queryValue.camp) {
      const res = {
        ...parm
      }
      if (res.date?.length >= 2) {
        res.startDate = dayjs(res.date[0]).format('YYYYMMDD')
        res.endDate = dayjs(res.date[1]).format('YYYYMMDD')
      }
      return res
    }

    function operationData() {
      http('operationData', {
        ...table.campPage,
        ...handleQuery(queryValue.camp)
      }).thenwrap((err, data) => {
        if (!err) {
          table.camp = data.record
          table.campTotal = data.totalRecordCount
        }
      })
    }

    function joinCampData() {
      http('joinCampData', {
        ...table.personPage,
        ...handleQuery(queryValue.person)
      }).thenwrap((err, data) => {
        if (!err) {
          table.person = data.record
          table.personTotal = data.totalRecordCount
        }
      })
    }

    function searchClick() {
      switch (tabs.modelValue.value) {
        case 0:
          operationData()
          break
        case 1:
          joinCampData()
          break
      }
    }

    function exportClick() {
      switch (tabs.modelValue.value) {
        case 0:
          request('operationData', {
            pageNo: 1,
            pageSize: table.campTotal,
            ...handleQuery(queryValue.camp)
          }).thenwrap((err, data) => {
            if (!err) {
              exportExcel({
                data: data.record,
                columns: columns.camp
              })
            }
          })
          break
        case 1:
          request('joinCampData', {
            pageNo: 1,
            pageSize: table.personTotal,
            ...handleQuery(queryValue.person)
          }).thenwrap((err, data) => {
            if (!err) {
              exportExcel({
                data: data.record,
                columns: columns.person
              })
            }
          })
          break
      }
    }

    const querySlots = {
      action: () => (
        <>
          <el-button type="primary" onClick={searchClick}>搜索</el-button>
          <el-button onClick={exportClick}>导出</el-button>
        </>
      )
    }
    // operationData()
    // joinCampData()

    return () => (
      <div class="padding-20">
        <ButtonTabs v-model={tabs.modelValue.value} tabs={tabs.list} />
        <div v-show={tabs.modelValue.value === 0}>
          <div class="query-bar">
            <QueryComponents v-model={queryValue.camp} queryList={queryList} v-slots={querySlots} semi />
          </div>
          <BasePageTable
            v-loading={loading!.value}
            v-models={[
              [table.campPage.pageSize, 'page-size'],
              [table.campPage.pageNo, 'current-page']
            ]}
            total={table.campTotal}
            data={table.camp}
            // columns={columns.camp}
            onCurrentPageChange={operationData}
            onSizeChange={operationData}
          >
            {columns.camp.map((col, index) => (
              <el-table-column {...col} key={index} v-slots={col.slots}></el-table-column>
            ))}


          </BasePageTable>
        </div>
        <div v-show={tabs.modelValue.value === 1}>
          <div class="query-bar">
            <QueryComponents v-model={queryValue.person} span={4} queryList={personQueryList} v-slots={querySlots} semi />
          </div>
          <BasePageTable
            v-loading={loading!.value}
            v-models={[
              [table.personPage.pageSize, 'page-size'],
              [table.personPage.pageNo, 'current-page']
            ]}
            total={table.personTotal}
            data={table.person}
            columns={columns.person}
            onCurrentPageChange={joinCampData}
            onSizeChange={joinCampData}
          ></BasePageTable>
        </div>
      </div>
    )
  }
})